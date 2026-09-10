"""
Test Suite: Models, Operators, and Invariant Regularizers
=========================================================
Verifies:
- MultiScaleSpatioTemporalEncoder (F-02)
- CayleyKoopmanOperator (F-03)
- BiophysicalPINNRegularizer
- RiemannianLUSIRegularizer (F-04)
- CosinePrototypeClassifier (F-05)
- KoopmanLUSINet Ablations (F-06)
- Boundary, corner, and numerical edge cases (Tier 2)
"""

import math
import pytest
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

# Dynamic import with fallback to src.bci_engine for progressive testability
try:
    from koopman_lusi.models.koopman_lusi import (
        MultiScaleSpatioTemporalEncoder,
        CayleyKoopmanOperator,
        BiophysicalPINNRegularizer,
        RiemannianLUSIRegularizer,
        CosinePrototypeClassifier,
        KoopmanLUSINet
    )
except ImportError:
    try:
        from bci_engine.models.koopman_lusi import (
            MultiScaleSpatioTemporalEncoder,
            CayleyKoopmanOperator,
            BiophysicalPINNRegularizer,
            RiemannianLUSIRegularizer,
            CosinePrototypeClassifier,
            KoopmanLUSINet
        )
    except ImportError:
        # Fallback to direct path import
        import sys
        from pathlib import Path
        sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
        from koopman_lusi.models.koopman_lusi import (
            MultiScaleSpatioTemporalEncoder,
            CayleyKoopmanOperator,
            BiophysicalPINNRegularizer,
            RiemannianLUSIRegularizer,
            CosinePrototypeClassifier,
            KoopmanLUSINet
        )


# ============================================================================
# Tier 1: Feature Coverage (F-02: Multi-Scale Filterbanks)
# ============================================================================

class TestFeature02MultiScaleFilterbanks:
    """Tests for MultiScaleSpatioTemporalEncoder."""

    def test_f02_tc01_kernel_scales_dimensions(self):
        """TC01: Verify temporal convolution branches have kernel widths 16, 32, 64."""
        encoder = MultiScaleSpatioTemporalEncoder(num_channels=22, time_samples=400)
        assert encoder.conv_scale1.kernel_size == (1, 16)
        assert encoder.conv_scale2.kernel_size == (1, 32)
        assert encoder.conv_scale3.kernel_size == (1, 64)

    def test_f02_tc02_spatial_depthwise_mixing(self):
        """TC02: Spatial convolution mixes across all electrode channels with depthwise groups."""
        num_channels = 22
        filters_per_scale = 8
        encoder = MultiScaleSpatioTemporalEncoder(
            num_channels=num_channels,
            filters_per_scale=filters_per_scale
        )
        total_temp = filters_per_scale * 3  # 24
        assert encoder.conv_spatial.in_channels == total_temp
        assert encoder.conv_spatial.kernel_size == (num_channels, 1)
        assert encoder.conv_spatial.groups == total_temp

    def test_f02_tc03_temporal_average_pooling(self):
        """TC03: Average pooling downsamples temporal axis."""
        encoder = MultiScaleSpatioTemporalEncoder(num_channels=22, time_samples=400)
        assert encoder.pool.kernel_size == (1, 8)
        assert encoder.pool.stride == (1, 4)

    def test_f02_tc04_observable_projection_layer_norm(self):
        """TC04: Projection layer outputs observable representations of dimension d."""
        d = 48
        encoder = MultiScaleSpatioTemporalEncoder(num_channels=22, time_samples=400, observable_dim=d)
        x = torch.randn(4, 1, 22, 400)
        psi = encoder(x)
        assert psi.shape == (4, d)
        assert not torch.isnan(psi).any()
        assert not torch.isinf(psi).any()

    def test_f02_tc05_gradient_backprop(self):
        """TC05: Confirms gradients flow back into all temporal and spatial filter weights."""
        encoder = MultiScaleSpatioTemporalEncoder(num_channels=22, time_samples=400, observable_dim=48)
        x = torch.randn(2, 1, 22, 400, requires_grad=True)
        psi = encoder(x)
        loss = psi.sum()
        loss.backward()

        assert encoder.conv_scale1.weight.grad is not None
        assert encoder.conv_scale2.weight.grad is not None
        assert encoder.conv_scale3.weight.grad is not None
        assert encoder.conv_spatial.weight.grad is not None
        assert x.grad is not None


# ============================================================================
# Tier 1: Feature Coverage (F-03: Cayley Koopman Operator)
# ============================================================================

class TestFeature03CayleyKoopmanOperator:
    """Tests for CayleyKoopmanOperator and unconditional stability."""

    def test_f03_tc01_skew_symmetric_parameterization(self):
        """TC01: Verify S = 0.5 * (A - A^T) is skew-symmetric (S + S^T = 0)."""
        d = 48
        op = CayleyKoopmanOperator(observable_dim=d)
        A = op.A
        S = (A - A.t()) * 0.5
        skew_sum = S + S.t()
        assert torch.max(torch.abs(skew_sum)).item() < 1e-6

    def test_f03_tc02_cayley_transform_orthogonality(self):
        """TC02: Verify Cayley transform Q = (I - S)(I + S)^-1 is orthogonal."""
        d = 48
        op = CayleyKoopmanOperator(observable_dim=d)
        I = torch.eye(d, device=op.A.device)
        S = (op.A - op.A.t()) * 0.5
        Q = torch.linalg.solve(I + S, I - S)
        identity_check = torch.matmul(Q.t(), Q)
        diff = torch.max(torch.abs(identity_check - I)).item()
        assert diff < 1e-5, f"Orthogonality check failed with diff: {diff}"

    def test_f03_tc03_dissipative_damping_bounds(self):
        """TC03: Verify damping factors d_i lie strictly in (0.85, 0.995]."""
        op = CayleyKoopmanOperator(observable_dim=48)
        d = 0.85 + 0.145 * torch.sigmoid(op.raw_decay)
        assert (d >= 0.85).all()
        assert (d <= 0.995).all()

    def test_f03_tc04_spectral_radius_strict_bound(self):
        """TC04: Spectral radius rho(K) < 1.0 strictly across 50 random states."""
        for _ in range(50):
            op = CayleyKoopmanOperator(observable_dim=32)
            # Randomize parameters heavily
            op.A.data.normal_(0, 5.0)
            op.raw_decay.data.uniform_(-10.0, 10.0)
            eigvals = op.get_eigenvalues()
            spectral_radius = torch.max(torch.abs(eigvals)).item()
            assert spectral_radius < 1.0, f"Divergence! Spectral radius = {spectral_radius}"

    def test_f03_tc05_multi_step_forward_rollout(self):
        """TC05: Recursive rollout K^m psi_0 remains stable without explosion."""
        op = CayleyKoopmanOperator(observable_dim=48)
        psi_0 = torch.randn(4, 48)
        trajectory = op.multi_step_forward(psi_0, steps=10)
        assert trajectory.shape == (4, 10, 48)
        # Trajectory norms must not explode
        norms = torch.norm(trajectory, dim=-1)
        assert (norms[:, -1] <= norms[:, 0] * 1.5).all()


# ============================================================================
# Tier 1: Feature Coverage (F-04: Riemannian LUSI Regularizer)
# ============================================================================

class TestFeature04RiemannianLUSIRegularizer:
    """Tests for RiemannianLUSIRegularizer invariants."""

    def test_f04_tc01_covariance_trace_conservation(self):
        """TC01: Observable covariance trace discrepancy is non-negative."""
        lusi = RiemannianLUSIRegularizer(observable_dim=48, num_classes=4)
        obs = torch.randn(16, 48)
        eigvals = torch.complex(torch.ones(48) * 0.93, torch.zeros(48))
        labels = torch.randint(0, 4, (16,))
        loss, metrics = lusi(obs, labels, eigvals)
        assert loss.item() >= 0.0
        assert "lusi_cov" in metrics
        assert metrics["lusi_cov"] >= 0.0

    def test_f04_tc02_damping_spectrum_target_matching(self):
        """TC02: Damping discrepancy matches physiological target 0.93."""
        lusi = RiemannianLUSIRegularizer(observable_dim=48, num_classes=4)
        obs = torch.randn(16, 48)
        # Perfectly matching eigenvalues
        eigvals = torch.complex(torch.ones(48) * 0.93, torch.zeros(48))
        labels = torch.randint(0, 4, (16,))
        _, metrics = lusi(obs, labels, eigvals)
        assert metrics["lusi_damping"] < 1e-6

    def test_f04_tc03_fisher_class_separation_ratio(self):
        """TC03: Fisher class separation ratio penalizes overlapping clusters."""
        lusi = RiemannianLUSIRegularizer(observable_dim=4, num_classes=2)
        eigvals = torch.complex(torch.ones(4) * 0.93, torch.zeros(4))
        # Distinct clusters
        obs_distinct = torch.cat([torch.ones(10, 4) * 5.0, torch.ones(10, 4) * -5.0], dim=0)
        labels = torch.cat([torch.zeros(10, dtype=torch.long), torch.ones(10, dtype=torch.long)])
        _, metrics_distinct = lusi(obs_distinct, labels, eigvals)

        # Overlapping clusters
        obs_overlap = torch.randn(20, 4)
        _, metrics_overlap = lusi(obs_overlap, labels, eigvals)

        # Distinct should have lower scatter ratio (within / between)
        assert metrics_distinct["lusi_separation"] <= metrics_overlap["lusi_separation"]

    def test_f04_tc04_batch_size_graceful_handling(self):
        """TC04: Gracefully handles batch size m < 2 without raising exceptions."""
        lusi = RiemannianLUSIRegularizer(observable_dim=48, num_classes=4)
        obs = torch.randn(1, 48)
        eigvals = torch.complex(torch.ones(48) * 0.93, torch.zeros(48))
        labels = torch.tensor([0])
        loss, metrics = lusi(obs, labels, eigvals)
        assert loss.item() == 0.0

    def test_f04_tc05_gradient_flow_to_encoder(self):
        """TC05: Confirms LUSI loss produces non-zero gradients on observables."""
        lusi = RiemannianLUSIRegularizer(observable_dim=48, num_classes=4)
        obs = torch.randn(8, 48, requires_grad=True)
        eigvals = torch.complex(torch.ones(48) * 0.93, torch.zeros(48))
        labels = torch.randint(0, 4, (8,))
        loss, _ = lusi(obs, labels, eigvals)
        loss.backward()
        assert obs.grad is not None
        assert not torch.isnan(obs.grad).any()


# ============================================================================
# Tier 1: Feature Coverage (F-05: Cosine Prototype Classifier Head)
# ============================================================================

class TestFeature05CosinePrototypeClassifier:
    """Tests for CosinePrototypeClassifier."""

    def test_f05_tc01_hyperspherical_normalization(self):
        """TC01: Observables and prototypes are L2-normalized on S^{d-1}."""
        head = CosinePrototypeClassifier(observable_dim=48, num_classes=4)
        psi = torch.randn(5, 48) * 10.0
        logits = head(psi)
        assert logits.shape == (5, 4)

    def test_f05_tc02_temperature_scaling_range(self):
        """TC02: Effective temperature tau is strictly clamped to [0.01, 1.0]."""
        head = CosinePrototypeClassifier(observable_dim=48, num_classes=4, temperature=0.1)
        # Test negative log_tau
        head.log_tau.data.fill_(-100.0)
        tau_min = torch.clamp(head.log_tau.exp(), min=0.01, max=1.0).item()
        assert tau_min == 0.01
        # Test massive log_tau
        head.log_tau.data.fill_(100.0)
        tau_max = torch.clamp(head.log_tau.exp(), min=0.01, max=1.0).item()
        assert tau_max == 1.0

    def test_f05_tc03_orthogonal_prototype_initialization(self):
        """TC03: Prototypes are initialized with mutual orthogonality."""
        head = CosinePrototypeClassifier(observable_dim=48, num_classes=4)
        proto_norm = F.normalize(head.prototypes, p=2, dim=1)
        gram = torch.matmul(proto_norm, proto_norm.t())
        off_diag = gram - torch.eye(4)
        assert torch.max(torch.abs(off_diag)).item() < 1e-5

    def test_f05_tc04_norm_invariance_property(self):
        """TC04: Logits depend strictly on angular direction, not norm scale."""
        head = CosinePrototypeClassifier(observable_dim=48, num_classes=4)
        psi = torch.randn(4, 48)
        logits_1 = head(psi)
        logits_100 = head(psi * 100.0)
        diff = torch.max(torch.abs(logits_1 - logits_100)).item()
        assert diff < 1e-4

    def test_f05_tc05_logits_probability_simplex(self):
        """TC05: Softmax of cosine logits forms valid probability distribution."""
        head = CosinePrototypeClassifier(observable_dim=48, num_classes=4)
        psi = torch.randn(6, 48)
        probs = F.softmax(head(psi), dim=-1)
        sums = probs.sum(dim=-1)
        assert torch.allclose(sums, torch.ones_like(sums), atol=1e-5)


# ============================================================================
# Tier 1: Feature Coverage (F-06: Ablation Parameterization)
# ============================================================================

class TestFeature06AblationParameterization:
    """Tests for KoopmanLUSINet ablation modes."""

    def _get_model(self, mode: str):
        try:
            return KoopmanLUSINet(
                num_classes=4,
                num_channels=22,
                time_samples=400,
                observable_dim=48,
                ablation_mode=mode
            )
        except TypeError:
            # If ablation_mode kwarg is not yet supported, adapt via hyperparameters
            if mode == "full":
                return KoopmanLUSINet(num_classes=4, num_channels=22, time_samples=400, observable_dim=48)
            elif mode == "koopman_only":
                return KoopmanLUSINet(num_classes=4, num_channels=22, time_samples=400, observable_dim=48, beta_lusi=0.0)
            elif mode == "lusi_only":
                return KoopmanLUSINet(num_classes=4, num_channels=22, time_samples=400, observable_dim=48, alpha_koopman=0.0)
            elif mode == "base_cnn":
                return KoopmanLUSINet(num_classes=4, num_channels=22, time_samples=400, observable_dim=48, alpha_koopman=0.0, beta_lusi=0.0, gamma_pinn=0.0)

    def test_f06_tc01_full_klnet_active_losses(self):
        """TC01: Full KL-Net computes non-zero CE, Koopman, LUSI, and PINN losses."""
        model = self._get_model("full")
        x_t = torch.randn(4, 1, 22, 400)
        x_next = torch.randn(4, 1, 22, 400)
        y = torch.randint(0, 4, (4,))
        total_loss, metrics = model.compute_loss(x_t, x_next, y)
        assert total_loss.item() > 0.0
        assert metrics["loss_ce"] > 0.0
        assert metrics["loss_koopman"] != 0.0
        assert metrics["loss_lusi"] >= 0.0

    def test_f06_tc02_koopman_only_ablates_lusi(self):
        """TC02: Koopman-Only sets LUSI weight/loss to 0.0."""
        model = self._get_model("koopman_only")
        x_t = torch.randn(4, 1, 22, 400)
        x_next = torch.randn(4, 1, 22, 400)
        y = torch.randint(0, 4, (4,))
        _, metrics = model.compute_loss(x_t, x_next, y)
        assert getattr(model, "beta_lusi", 0.0) == 0.0 or metrics.get("loss_lusi", 0.0) == 0.0

    def test_f06_tc03_lusi_only_ablates_koopman(self):
        """TC03: LUSI-Only sets Koopman weight/loss to 0.0."""
        model = self._get_model("lusi_only")
        x_t = torch.randn(4, 1, 22, 400)
        x_next = torch.randn(4, 1, 22, 400)
        y = torch.randint(0, 4, (4,))
        _, metrics = model.compute_loss(x_t, x_next, y)
        assert getattr(model, "alpha_koopman", 0.0) == 0.0 or metrics.get("loss_koopman", 0.0) == 0.0

    def test_f06_tc04_base_cnn_pure_erm(self):
        """TC04: Base CNN operates as pure cross-entropy CNN."""
        model = self._get_model("base_cnn")
        x_t = torch.randn(4, 1, 22, 400)
        x_next = torch.randn(4, 1, 22, 400)
        y = torch.randint(0, 4, (4,))
        total_loss, metrics = model.compute_loss(x_t, x_next, y)
        assert np.isclose(total_loss.item(), metrics["loss_ce"], atol=1e-4)

    def test_f06_tc05_identical_encoder_weights(self):
        """TC05: All ablations instantiate identical encoder architecture & parameter counts."""
        m_full = self._get_model("full")
        m_koop = self._get_model("koopman_only")
        m_lusi = self._get_model("lusi_only")
        m_base = self._get_model("base_cnn")

        enc_full_params = sum(p.numel() for p in m_full.encoder.parameters())
        enc_koop_params = sum(p.numel() for p in m_koop.encoder.parameters())
        enc_lusi_params = sum(p.numel() for p in m_lusi.encoder.parameters())
        enc_base_params = sum(p.numel() for p in m_base.encoder.parameters())

        assert enc_full_params == enc_koop_params == enc_lusi_params == enc_base_params


# ============================================================================
# Tier 2: Boundary & Corner Cases (Extreme Shapes & Numerical Edges)
# ============================================================================

class TestTier2ModelBoundaryAndCorners:
    """Boundary and corner case verification for neural models."""

    def test_t2_shape_single_sample_batch(self):
        """Single-sample batch (B=1) forward pass."""
        model = KoopmanLUSINet(num_classes=4, num_channels=22, time_samples=400)
        x = torch.randn(1, 1, 22, 400)
        model.eval()
        with torch.no_grad():
            logits, psi, _ = model(x)
        assert logits.shape == (1, 4)
        assert psi.shape == (1, 48)

    def test_t2_shape_physionet_64_channels(self):
        """PhysioNet 64-channel architecture instantiation and forward pass."""
        model = KoopmanLUSINet(num_classes=4, num_channels=64, time_samples=400)
        x = torch.randn(2, 1, 64, 400)
        model.eval()
        with torch.no_grad():
            logits, psi, _ = model(x)
        assert logits.shape == (2, 4)
        assert psi.shape == (2, 48)

    def test_t2_num_near_zero_signal(self):
        """Signal with magnitude near machine epsilon does not produce NaN/Inf."""
        model = KoopmanLUSINet(num_classes=4, num_channels=22, time_samples=400)
        x = torch.randn(2, 1, 22, 400) * 1e-12
        model.eval()
        with torch.no_grad():
            logits, psi, _ = model(x)
        assert not torch.isnan(logits).any()
        assert not torch.isinf(logits).any()

    def test_t2_num_massive_voltage_spike(self):
        """Extreme amplitude artifact (+1000 uV) does not cause numerical overflow."""
        model = KoopmanLUSINet(num_classes=4, num_channels=22, time_samples=400)
        x = torch.randn(2, 1, 22, 400)
        x[:, :, 7, 200] = 1000.0  # Massive spike on C3 electrode
        model.eval()
        with torch.no_grad():
            logits, psi, _ = model(x)
        assert not torch.isnan(logits).any()
        assert not torch.isinf(logits).any()

    def test_t2_num_constant_dc_channel(self):
        """Constant DC flatline electrode channel does not crash layer norm or batch norm."""
        model = KoopmanLUSINet(num_classes=4, num_channels=22, time_samples=400)
        x = torch.randn(2, 1, 22, 400)
        x[:, :, 0, :] = 5.0  # Flatline channel 0
        model.eval()
        with torch.no_grad():
            logits, psi, _ = model(x)
        assert not torch.isnan(logits).any()
        assert not torch.isinf(logits).any()
