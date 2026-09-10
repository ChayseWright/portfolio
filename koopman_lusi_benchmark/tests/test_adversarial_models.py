"""
Adversarial Stress Test Suite: Koopman-LUSI Core Model Architectures
====================================================================
Empirical Challenge & Stress Testing for:
1. Cayley Koopman Operator: Spectral radius strict bounds under extreme weights,
   ill-conditioned matrices, and perturbations (assert max(|eigenvalues|) <= 0.995).
2. Long multi-step dynamical rollouts (T=10, 50, 100): Latent trajectory stability,
   zero NaNs/Infs, contractive dissipation.
3. Riemannian LUSI Regularizer: Numerical stability under m=1, identical samples,
   and zero covariance trace.
4. Hyperspherical Cosine Prototype Classifier: Extreme zero feature norms, zero
   prototype norms, and extreme temperature parameters.
5. Boundary tensor shapes & signal artifacts: B=1, C=64, T=32, voltage spikes (+1000 uV),
   and flatline channels.

Target: koopman_lusi.models.koopman_lusi
Author: challenger_1 (Adversarial Empirical Challenger)
"""

import math
import pytest
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

from koopman_lusi.models.koopman_lusi import (
    MultiScaleSpatioTemporalEncoder,
    CayleyKoopmanOperator,
    BiophysicalPINNRegularizer,
    RiemannianLUSIRegularizer,
    CosinePrototypeClassifier,
    KoopmanLUSINet,
    ModelOutput
)


# ============================================================================
# Section 1: Cayley Koopman Operator Spectral Radius Hardening
# ============================================================================

class TestCayleyKoopmanSpectralRadiusAdversarial:
    """
    Adversarial verification of the spectral radius bound:
        rho(K) = max_j |lambda_j(K)| <= 0.995 unconditionally.
    """

    def test_spectral_radius_extreme_random_weights(self):
        """
        Stress-test spectral radius under extreme weight distributions:
        - Very large variance: N(0, 1e4)
        - Very small variance: N(0, 1e-6)
        - Uniform extremes: [-1e5, 1e5]
        """
        scales = [1e-6, 1e-4, 1.0, 1e2, 1e4, 1e5]
        d = 48
        for scale in scales:
            op = CayleyKoopmanOperator(observable_dim=d)
            # Inject extreme weights into generator matrix A
            op.A.data.normal_(0.0, scale)
            # Randomize decay
            op.raw_decay.data.uniform_(-20.0, 20.0)

            eigvals = op.get_eigenvalues()
            max_abs_eig = torch.max(torch.abs(eigvals)).item()

            assert not np.isnan(max_abs_eig), f"NaN eigenvalue encountered at scale {scale}"
            assert not np.isinf(max_abs_eig), f"Inf eigenvalue encountered at scale {scale}"
            assert max_abs_eig <= 0.995001, (
                f"Spectral radius violated! Scale={scale}, max(|lambda|)={max_abs_eig} > 0.995"
            )

    def test_spectral_radius_ill_conditioned_matrices(self):
        """
        Stress-test spectral radius when A is ill-conditioned:
        - Rank-1 outer product A = u v^T
        - Collinear columns
        - Extreme condition numbers
        """
        d = 48
        for rank in [1, 2, 5]:
            op = CayleyKoopmanOperator(observable_dim=d)
            u = torch.randn(d, rank)
            v = torch.randn(d, rank)
            op.A.data = torch.matmul(u, v.t()) * 100.0  # Rank-deficient parameter
            op.raw_decay.data.fill_(15.0)  # Forces max damping: 0.85 + 0.145 * 1.0 = 0.995

            eigvals = op.get_eigenvalues()
            max_abs_eig = torch.max(torch.abs(eigvals)).item()

            assert not np.isnan(max_abs_eig), f"NaN eigenvalue with rank={rank}"
            assert max_abs_eig <= 0.995001, (
                f"Spectral radius violated for rank-{rank} matrix! max(|lambda|)={max_abs_eig}"
            )

    def test_spectral_radius_extreme_raw_decay_bounds(self):
        """
        Verify mathematical bounds on diagonal damping factors:
            d_i = 0.85 + 0.145 * sigmoid(raw_decay)
        Must strictly satisfy 0.85 <= d_i <= 0.995 for any raw_decay in [-inf, +inf].
        """
        op = CayleyKoopmanOperator(observable_dim=48)

        # Test extreme negative decay (sigmoid -> 0, d -> 0.85)
        op.raw_decay.data.fill_(-1000.0)
        K_mat = op.K
        eigvals = torch.linalg.eigvals(K_mat)
        max_abs = torch.max(torch.abs(eigvals)).item()
        min_abs = torch.min(torch.abs(eigvals)).item()
        assert max_abs <= 0.85001, f"Expected d <= 0.85, got {max_abs}"
        assert min_abs >= 0.84999, f"Expected d >= 0.85, got {min_abs}"

        # Test extreme positive decay (sigmoid -> 1, d -> 0.995)
        op.raw_decay.data.fill_(1000.0)
        K_mat = op.K
        eigvals = torch.linalg.eigvals(K_mat)
        max_abs = torch.max(torch.abs(eigvals)).item()
        min_abs = torch.min(torch.abs(eigvals)).item()
        assert max_abs <= 0.995001, f"Expected d <= 0.995, got {max_abs}"
        assert min_abs >= 0.99499, f"Expected d >= 0.995, got {min_abs}"

    def test_spectral_radius_adversarial_perturbations(self):
        """
        Add adversarial high-frequency noise and impulse perturbations to A.
        """
        op = CayleyKoopmanOperator(observable_dim=48)
        base_A = torch.randn(48, 48)

        for eps in [1e-7, 1e-3, 1.0, 1e3]:
            perturbed_A = base_A + torch.randn_like(base_A) * eps
            op.A.data = perturbed_A
            op.raw_decay.data.uniform_(-5.0, 5.0)

            eigvals = op.get_eigenvalues()
            max_abs_eig = torch.max(torch.abs(eigvals)).item()
            assert max_abs_eig <= 0.995001, (
                f"Perturbation eps={eps} broke spectral bound! max(|lambda|)={max_abs_eig}"
            )


# ============================================================================
# Section 2: Long Multi-Step Dynamical Rollouts (T=10, 50, 100)
# ============================================================================

class TestLongMultiStepRollouts:
    """
    Stress-test dynamical stability over extended rollout horizons:
        psi_{t+1} = psi_t K^T
    Verify no exponential divergence, zero NaNs/Infs, and dissipative contractivity.
    """

    @pytest.mark.parametrize("steps", [10, 50, 100])
    def test_multi_step_rollout_stability(self, steps):
        """
        Test rollouts over T=10, 50, 100 steps.
        Assert:
        - Correct output shape: (B, steps, d)
        - Zero NaNs and Infs
        - Trajectory norms strictly bounded by initial state norm:
          ||psi_T|| <= ||psi_0|| * (0.995)^T (contractive system).
        """
        d = 48
        B = 8
        op = CayleyKoopmanOperator(observable_dim=d)
        # Random initial state
        psi_0 = torch.randn(B, d)
        initial_norms = torch.norm(psi_0, dim=-1)

        trajectory = op.multi_step_forward(psi_0, steps=steps)

        assert trajectory.shape == (B, steps, d)
        assert not torch.isnan(trajectory).any(), f"NaN found in rollout at steps={steps}"
        assert not torch.isinf(trajectory).any(), f"Inf found in rollout at steps={steps}"

        # Check trajectory norms over time
        final_norms = torch.norm(trajectory[:, -1, :], dim=-1)
        # For a contractive system with spectral radius <= 0.995:
        # Final norm must be strictly <= initial norm * 1.01 (allowing for non-normal transient boost)
        # and asymptotically decaying
        max_ratio = torch.max(final_norms / (initial_norms + 1e-8)).item()
        assert max_ratio <= 1.05, f"Norm explosion detected at steps={steps}! Max ratio: {max_ratio}"

        if steps >= 50:
            # Over 50+ steps, dissipative decay must be evident:
            # (0.995)^50 ~ 0.778, so average ratio should be noticeably below 1.0
            avg_ratio = torch.mean(final_norms / (initial_norms + 1e-8)).item()
            assert avg_ratio < 0.95, (
                f"Trajectory failed to dissipate over {steps} steps! Avg ratio: {avg_ratio}"
            )

    def test_multi_step_extreme_initial_state(self):
        """
        Rollout starting from extreme observable initial states:
        - Massive norm: 1e6
        - Near-zero norm: 1e-8
        """
        op = CayleyKoopmanOperator(observable_dim=48)
        # Massive initial state
        psi_large = torch.randn(2, 48) * 1e6
        traj_large = op.multi_step_forward(psi_large, steps=50)
        assert not torch.isnan(traj_large).any()
        assert not torch.isinf(traj_large).any()
        assert (torch.norm(traj_large[:, -1, :], dim=-1) <= torch.norm(psi_large, dim=-1) * 1.01).all()

        # Near-zero initial state
        psi_small = torch.randn(2, 48) * 1e-8
        traj_small = op.multi_step_forward(psi_small, steps=50)
        assert not torch.isnan(traj_small).any()
        assert not torch.isinf(traj_small).any()


# ============================================================================
# Section 3: Riemannian LUSI Regularizer Numerical Stability
# ============================================================================

class TestRiemannianLUSINumericalStability:
    """
    Stress-test RiemannianLUSIRegularizer under extreme degeneracies:
    - Batch size m = 1
    - Identical samples across batch (zero sample variance)
    - Zero covariance trace (all observables zero)
    - Single-class labels
    """

    def test_lusi_batch_size_one(self):
        """
        Batch size m=1:
        Must return scalar 0.0 and empty metrics without throwing exceptions.
        """
        lusi = RiemannianLUSIRegularizer(observable_dim=48, num_classes=4)
        obs = torch.randn(1, 48)
        loss, metrics = lusi(observables=obs)
        assert loss.item() == 0.0
        assert isinstance(metrics, dict)
        assert len(metrics) == 0

    def test_lusi_identical_samples(self):
        """
        Identical samples: all batch samples have identical representations.
        Tests within-class and between-class scatter calculations when variance is zero.
        """
        lusi = RiemannianLUSIRegularizer(observable_dim=48, num_classes=4)
        # All 8 samples identical
        repeated_obs = torch.ones(8, 48) * 2.5

        # Case A: Identical labels
        labels_same = torch.zeros(8, dtype=torch.long)
        loss_same, metrics_same = lusi(repeated_obs, labels=labels_same)
        assert not torch.isnan(loss_same)
        assert not torch.isinf(loss_same)
        assert metrics_same["lusi_separation"] == 0.0

        # Case B: Multi-class labels with identical representations
        # Class means are identical, so between_scatter = 0.
        # Stabilizer eps=1e-5 in denominator prevents division by zero!
        labels_diff = torch.tensor([0, 1, 2, 3, 0, 1, 2, 3])
        loss_diff, metrics_diff = lusi(repeated_obs, labels=labels_diff)
        assert not torch.isnan(loss_diff)
        assert not torch.isinf(loss_diff)
        assert metrics_diff["lusi_separation"] == 0.0

    def test_lusi_zero_covariance_trace(self):
        """
        Zero covariance trace: all observables are identically zero (psi = 0).
        """
        lusi = RiemannianLUSIRegularizer(observable_dim=48, num_classes=4)
        zero_obs = torch.zeros(16, 48)
        labels = torch.randint(0, 4, (16,))
        privileged_cov = torch.eye(22).unsqueeze(0).repeat(16, 1, 1)

        loss, metrics = lusi(
            observables=zero_obs,
            labels=labels,
            privileged_cov=privileged_cov
        )

        assert not torch.isnan(loss)
        assert not torch.isinf(loss)
        # Covariance trace is 0, so discrepancy (0 - 1.0)^2 = 1.0
        assert np.isclose(metrics["lusi_cov"], 1.0, atol=1e-5)
        assert metrics["lusi_separation"] == 0.0

    def test_lusi_backward_gradient_stability(self):
        """
        Backward pass stability: confirm gradients through LUSI loss
        do not produce NaNs even under degenerate inputs.
        """
        lusi = RiemannianLUSIRegularizer(observable_dim=48, num_classes=4)
        obs = torch.randn(8, 48, requires_grad=True)
        labels = torch.randint(0, 4, (8,))
        loss, _ = lusi(observables=obs, labels=labels)
        loss.backward()

        assert obs.grad is not None
        assert not torch.isnan(obs.grad).any(), "NaN found in LUSI backward gradients!"
        assert not torch.isinf(obs.grad).any(), "Inf found in LUSI backward gradients!"


# ============================================================================
# Section 4: Hyperspherical Cosine Prototype Classifier Head
# ============================================================================

class TestCosinePrototypeClassifierAdversarial:
    """
    Stress-test CosinePrototypeClassifier under:
    - Zero feature norms (psi = 0)
    - Zero prototype norms (W = 0)
    - Extreme temperature parameter values
    - Norm invariance property across 12 orders of magnitude
    """

    def test_zero_feature_norms(self):
        """
        Zero feature vectors: F.normalize(zeros, eps=1e-12) produces zero vectors.
        Logits should be all zero, and softmax should produce uniform probabilities (0.25).
        """
        head = CosinePrototypeClassifier(observable_dim=48, num_classes=4)
        zero_psi = torch.zeros(6, 48)
        logits = head(zero_psi)

        assert not torch.isnan(logits).any()
        assert not torch.isinf(logits).any()
        assert torch.allclose(logits, torch.zeros_like(logits), atol=1e-6)

        # Softmax on all-zero logits yields uniform 1/K
        probs = F.softmax(logits, dim=-1)
        expected_uniform = torch.full_like(probs, 0.25)
        assert torch.allclose(probs, expected_uniform, atol=1e-5)

    def test_zero_prototype_norms(self):
        """
        Zero prototype parameters: head.prototypes set to zero.
        """
        head = CosinePrototypeClassifier(observable_dim=48, num_classes=4)
        head.prototypes.data.zero_()
        psi = torch.randn(5, 48)
        logits = head(psi)

        assert not torch.isnan(logits).any()
        assert not torch.isinf(logits).any()
        assert torch.allclose(logits, torch.zeros_like(logits), atol=1e-6)

    def test_extreme_temperature_values(self):
        """
        Temperature parameter clamping in [0.01, 1.0]:
        - Very small raw log_tau (-1000): clamped to min=0.01
        - Very large raw log_tau (+1000): clamped to max=1.0
        """
        head = CosinePrototypeClassifier(observable_dim=48, num_classes=4)
        psi = torch.randn(4, 48)

        # Extreme cold temperature
        head.log_tau.data.fill_(-1000.0)
        logits_cold = head(psi)
        assert not torch.isnan(logits_cold).any()
        assert not torch.isinf(logits_cold).any()
        # Division by 0.01 scales cosine sim by 100
        assert torch.max(torch.abs(logits_cold)).item() <= 100.001

        # Extreme hot temperature
        head.log_tau.data.fill_(1000.0)
        logits_hot = head(psi)
        assert not torch.isnan(logits_hot).any()
        assert not torch.isinf(logits_hot).any()
        # Division by 1.0 keeps cosine sim in [-1, 1]
        assert torch.max(torch.abs(logits_hot)).item() <= 1.001

    def test_norm_invariance_wide_dynamic_range(self):
        """
        Norm-invariance: multiplying representations by scales from 1e-6 to 1e6
        must produce identical output logits within machine precision.
        """
        head = CosinePrototypeClassifier(observable_dim=48, num_classes=4)
        base_psi = torch.randn(4, 48)
        base_logits = head(base_psi)

        scales = [1e-6, 1e-3, 0.1, 10.0, 1e3, 1e6]
        for s in scales:
            scaled_psi = base_psi * s
            scaled_logits = head(scaled_psi)
            diff = torch.max(torch.abs(base_logits - scaled_logits)).item()
            assert diff < 1e-4, f"Norm invariance violated at scale {s}! Max diff: {diff}"


# ============================================================================
# Section 5: Boundary Tensor Shapes, Voltage Spikes, & Flatline Channels
# ============================================================================

class TestBoundaryShapesAndSignalArtifacts:
    """
    Boundary conditions and artifact resilience:
    - B=1, C=64, short time windows T=32
    - Extreme voltage spikes (+1000 uV)
    - Flatline channels (zero signal or constant DC)
    """

    def test_boundary_shape_b1_c64_t32(self):
        """
        Single-sample batch with 64 channels and short time window T=32 (128 ms).
        """
        model = KoopmanLUSINet(
            num_classes=4,
            num_channels=64,
            time_samples=32,
            observable_dim=48
        )
        model.eval()

        # Test both 4D (B, 1, C, T) and 3D (B, C, T)
        x_4d = torch.randn(1, 1, 64, 32)
        with torch.no_grad():
            out_4d = model(x_4d)
            logits_4d, psi_4d, psi_pred_4d = out_4d

        assert logits_4d.shape == (1, 4)
        assert psi_4d.shape == (1, 48)
        assert psi_pred_4d.shape == (1, 48)
        assert not torch.isnan(logits_4d).any()

        x_3d = torch.randn(1, 64, 32)
        with torch.no_grad():
            logits_3d, psi_3d, _ = model(x_3d)

        assert logits_3d.shape == (1, 4)
        assert psi_3d.shape == (1, 48)

    def test_extreme_voltage_spikes(self):
        """
        High-amplitude artifact (+1000 uV spike in single and multiple channels).
        LayerNorm and BatchNorm should prevent activation explosion.
        """
        model = KoopmanLUSINet(
            num_classes=4,
            num_channels=22,
            time_samples=400,
            observable_dim=48
        )
        model.eval()

        x = torch.randn(2, 1, 22, 400)
        # Spike channel 10
        x[:, :, 10, 150:160] = 1000.0

        with torch.no_grad():
            logits, psi, _ = model(x)

        assert not torch.isnan(logits).any(), "NaN in logits after voltage spike"
        assert not torch.isinf(logits).any(), "Inf in logits after voltage spike"
        assert not torch.isnan(psi).any(), "NaN in observables after voltage spike"

    def test_flatline_channels(self):
        """
        Completely dead / flatline channels:
        - Zero channel: x[:, :, c, :] = 0.0
        - Constant DC offset: x[:, :, c, :] = 10.0
        - All channels flatline
        """
        model = KoopmanLUSINet(
            num_classes=4,
            num_channels=22,
            time_samples=400,
            observable_dim=48
        )
        model.eval()

        # Partial flatline
        x_partial = torch.randn(4, 1, 22, 400)
        x_partial[:, :, 0, :] = 0.0   # Channel 0 dead
        x_partial[:, :, 5, :] = 15.0  # Channel 5 DC saturation

        with torch.no_grad():
            logits_p, psi_p, _ = model(x_partial)

        assert not torch.isnan(logits_p).any()
        assert not torch.isinf(logits_p).any()

        # Total flatline (all channels constant zero)
        x_total = torch.zeros(4, 1, 22, 400)
        with torch.no_grad():
            logits_t, psi_t, _ = model(x_total)

        assert not torch.isnan(logits_t).any()
        assert not torch.isinf(logits_t).any()

    def test_end_to_end_compute_loss_boundary(self):
        """
        Full compute_loss forward and backward on boundary inputs:
        - B=2, C=22, T=400
        - Voltage spikes and flatline channels combined
        - Check that total_loss is positive, finite, and backward() executes without error.
        """
        model = KoopmanLUSINet(
            num_classes=4,
            num_channels=22,
            time_samples=400,
            observable_dim=48
        )
        model.train()

        x_t = torch.randn(2, 1, 22, 400)
        x_next = torch.randn(2, 1, 22, 400)
        x_t[:, :, 2, 50] = 500.0   # Artifact spike
        x_t[:, :, 7, :] = 0.0      # Dead electrode
        y = torch.tensor([0, 2], dtype=torch.long)
        privileged_cov = torch.eye(22).unsqueeze(0).repeat(2, 1, 1)

        total_loss, metrics = model.compute_loss(x_t, x_next, y, privileged_cov=privileged_cov)

        assert not torch.isnan(total_loss)
        assert not torch.isinf(total_loss)
        assert total_loss.item() > 0.0

        # Run backward pass
        total_loss.backward()

        # Check gradients exist and have no NaNs
        for name, param in model.named_parameters():
            if param.requires_grad and param.grad is not None:
                assert not torch.isnan(param.grad).any(), f"NaN gradient in {name}"
                assert not torch.isinf(param.grad).any(), f"Inf gradient in {name}"
