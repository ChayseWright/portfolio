"""
Adversarial Stress Test Suite: Baseline Decoders, Ingestion, & Few-Shot Partitioning
====================================================================================
Empirical challenge suite for Milestone M5 verification:
1. Stratified LOSO Partitioner: Zero data leakage across 100 randomized seeds
   and exact k-shot sample counts per class for k in [1, 2, 3, 4, 5].
2. Extreme Few-Shot Calibration (k=1 shot/class = 4 total samples):
   All models (KoopmanLUSINet, EEGNet-4,2, ShallowFBCSPNet, RiemannianMDM)
   train and adapt without throwing NaN, Inf, or singular matrix exceptions.
3. Singular Covariance Handling in RiemannianMDM:
   Extreme rank deficiency (T < C, e.g. T=10, C=22; T=20, C=64; T=2, C=22)
   verifying Ledoit-Wolf shrinkage ensures strictly positive eigenvalues (> 0).
4. EEGNet-4,2 Spatial Max-Norm Constraint:
   Weights artificially set to 100.0 and 1000.0; forward pass must enforce
   weight norms strictly bounded <= 1.0.
5. ShallowFBCSPNet SafeLog Non-Linearity:
   Constant 0.0 tensors and machine-epsilon signals must not produce -Inf or NaN outputs.

Author: challenger_2 (Empirical Challenger / Adversarial Critic)
"""

import pytest
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

from koopman_lusi.data.few_shot import (
    generate_deterministic_loso_split,
    get_few_shot_dataloaders,
    BCIPreprocessedDataset,
    bci_collate_fn,
)
from koopman_lusi.data.synthetic import generate_synthetic_smr_dataset
from koopman_lusi.models.baselines import (
    EEGNet42,
    ShallowFBCSPNet,
    RiemannianMDM,
    compute_sample_covariances,
    riemannian_distance,
    riemannian_karcher_mean,
)
from koopman_lusi.models.koopman_lusi import KoopmanLUSINet
from koopman_lusi.evaluation.loso import evaluate_subject_fold


# ============================================================================
# Task 1: Stratified LOSO Partitioner Adversarial Stress Testing
# ============================================================================

class TestStratifiedLOSOPartitionerAdversarial:
    """Adversarial stress-testing of class-stratified LOSO partitioner."""

    @pytest.mark.parametrize("k", [1, 2, 3, 4, 5])
    def test_zero_leakage_and_exact_counts_100_seeds(self, k: int):
        """
        Verify across 100 randomized seeds:
        1. Zero data leakage: calib_idx intersect test_idx == empty set.
        2. Exact k-shot counts: exactly k calibration samples per class.
        3. Partition completeness: len(calib_idx) + len(test_idx) == len(y).
        """
        # Create balanced 4-class target set with 72 trials per class (288 total, matching BCI IV-2a)
        num_classes = 4
        trials_per_class = 72
        y_target = np.repeat(np.arange(num_classes), trials_per_class)

        for seed in range(100):
            calib_idx, test_idx = generate_deterministic_loso_split(
                y_target=y_target,
                k_shots_per_class=k,
                seed=seed
            )

            # Invariant 1: Strictly disjoint partitions (Zero Data Leakage)
            intersection = np.intersect1d(calib_idx, test_idx)
            assert len(intersection) == 0, (
                f"Data leakage detected at seed={seed}, k={k}: {intersection}"
            )

            # Invariant 2: Exact k-shot calibration sample count per class
            calib_labels = y_target[calib_idx]
            for c in range(num_classes):
                c_count = int(np.sum(calib_labels == c))
                assert c_count == k, (
                    f"Class {c} has {c_count} samples, expected exactly {k} at seed={seed}"
                )

            # Invariant 3: Exact total calibration count
            assert len(calib_idx) == k * num_classes, (
                f"Expected total {k * num_classes} calib samples, got {len(calib_idx)}"
            )

            # Invariant 4: Complete trial coverage
            assert len(calib_idx) + len(test_idx) == len(y_target), (
                f"Coverage mismatch at seed={seed}: {len(calib_idx)} + {len(test_idx)} != {len(y_target)}"
            )

    def test_unbalanced_classes_partitioning(self):
        """Stress-test with highly skewed class distributions."""
        y_unbalanced = np.array([0] * 5 + [1] * 10 + [2] * 50 + [3] * 100)
        for k in [1, 3, 5]:
            calib_idx, test_idx = generate_deterministic_loso_split(
                y_target=y_unbalanced,
                k_shots_per_class=k,
                seed=42
            )
            assert len(np.intersect1d(calib_idx, test_idx)) == 0
            assert len(calib_idx) + len(test_idx) == len(y_unbalanced)
            # For class 0 (only 5 samples), when k=5, all 5 go to calib
            calib_y = y_unbalanced[calib_idx]
            assert np.sum(calib_y == 0) == min(k, 5)

    def test_torch_tensor_label_input(self):
        """Partitioner accepts torch.Tensor labels on both CPU and CUDA seamlessly."""
        y_tensor = torch.tensor([0, 1, 2, 3] * 20, dtype=torch.long)
        calib_idx, test_idx = generate_deterministic_loso_split(y_tensor, k_shots_per_class=3, seed=123)
        assert isinstance(calib_idx, np.ndarray)
        assert len(np.intersect1d(calib_idx, test_idx)) == 0
        assert len(calib_idx) == 3 * 4


# ============================================================================
# Task 2: Extreme Few-Shot Calibration (k=1 Shot per Class = 4 Samples)
# ============================================================================

class TestExtremeFewShotCalibrationK1:
    """Verifies that all 4 models train/adapt stably with k=1 shot per class."""

    @pytest.fixture
    def k1_calibration_batch(self):
        """Constructs minimal k=1 calibration batch (4 classes, 1 sample each = 4 samples)."""
        torch.manual_seed(42)
        np.random.seed(42)
        C, T = 22, 400
        x_t = torch.randn(4, 1, C, T)
        x_next = torch.randn(4, 1, C, T)
        y = torch.tensor([0, 1, 2, 3], dtype=torch.long)
        subjs = torch.tensor([0, 0, 0, 0], dtype=torch.long)
        return x_t, x_next, y, subjs

    def test_koopman_lusi_net_k1_adaptation(self, k1_calibration_batch):
        """KoopmanLUSINet trains on k=1 without NaN, Inf, or singular matrix exceptions."""
        x_t, x_next, y, _ = k1_calibration_batch
        model = KoopmanLUSINet(num_classes=4, num_channels=22, time_samples=400, ablation_mode="full")
        model.train()
        optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)

        for step in range(5):
            optimizer.zero_grad()
            total_loss, metrics = model.compute_loss(x_t, x_next, y)
            assert not torch.isnan(total_loss), f"NaN loss at step {step}"
            assert not torch.isinf(total_loss), f"Inf loss at step {step}"
            total_loss.backward()

            # Verify gradients are well-behaved
            for name, p in model.named_parameters():
                if p.grad is not None:
                    assert not torch.isnan(p.grad).any(), f"NaN gradient in {name}"
                    assert not torch.isinf(p.grad).any(), f"Inf gradient in {name}"

            optimizer.step()

        # Inference after adaptation
        model.eval()
        with torch.no_grad():
            preds = model.predict(x_t)
            assert preds.shape == (4,)
            assert not torch.isnan(preds).any()

    def test_eegnet42_k1_adaptation(self, k1_calibration_batch):
        """EEGNet-4,2 trains on k=1 without NaN or Inf."""
        x_t, _, y, _ = k1_calibration_batch
        model = EEGNet42(num_classes=4, num_channels=22, time_samples=400)
        model.train()
        optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)
        criterion = nn.CrossEntropyLoss()

        for step in range(5):
            optimizer.zero_grad()
            logits = model(x_t)
            assert not torch.isnan(logits).any(), f"NaN logits at step {step}"
            assert not torch.isinf(logits).any(), f"Inf logits at step {step}"
            loss = criterion(logits, y)
            loss.backward()
            optimizer.step()

        model.eval()
        with torch.no_grad():
            preds = model.predict(x_t)
            assert preds.shape == (4,)

    def test_shallow_fbcspnet_k1_adaptation(self, k1_calibration_batch):
        """ShallowFBCSPNet trains on k=1 without NaN or Inf."""
        x_t, _, y, _ = k1_calibration_batch
        model = ShallowFBCSPNet(num_classes=4, num_channels=22, time_samples=400)
        model.train()
        optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)
        criterion = nn.CrossEntropyLoss()

        for step in range(5):
            optimizer.zero_grad()
            logits = model(x_t)
            assert not torch.isnan(logits).any(), f"NaN logits at step {step}"
            assert not torch.isinf(logits).any(), f"Inf logits at step {step}"
            loss = criterion(logits, y)
            loss.backward()
            optimizer.step()

        model.eval()
        with torch.no_grad():
            preds = model.predict(x_t)
            assert preds.shape == (4,)

    def test_riemannian_mdm_k1_fit_and_predict(self, k1_calibration_batch):
        """RiemannianMDM fits centroids from k=1 shot/class without singular matrix exceptions."""
        x_t, _, y, _ = k1_calibration_batch
        X_calib = x_t.squeeze(1).numpy()
        y_calib = y.numpy()

        mdm = RiemannianMDM(num_classes=4, shrink_alpha=1e-3)
        # Fitting with k=1 should set each centroid directly to the single trial covariance
        mdm.fit(X_calib, y_calib)
        assert len(mdm.centroids) == 4

        for c in range(4):
            cent = mdm.centroids[c]
            assert cent.shape == (22, 22)
            eigvals = np.linalg.eigvalsh(cent)
            assert (eigvals > 0).all(), f"Class {c} centroid has non-positive eigenvalues: {eigvals}"

        # Predict on same calibration trials
        preds = mdm.predict(X_calib)
        assert len(preds) == 4
        assert (preds == y_calib).all(), "k=1 calibration fit failed to separate distinct trials"

        # Predict on new test trials
        X_test = np.random.randn(8, 22, 400)
        test_preds = mdm.predict(X_test)
        assert len(test_preds) == 8
        assert set(test_preds).issubset({0, 1, 2, 3})


# ============================================================================
# Task 3: Singular Covariance Matrix Handling in RiemannianMDM (T < C)
# ============================================================================

class TestSingularCovarianceRiemannianMDM:
    """Verifies Ledoit-Wolf shrinkage under extreme rank deficiency (T < C)."""

    @pytest.mark.parametrize("C, T", [
        (22, 10),   # BCI IV-2a channels, extreme short window
        (22, 2),    # Minimal non-degenerate time samples
        (64, 20),   # PhysioNet channels, short window
        (64, 5),    # Extreme PhysioNet rank deficiency (rank <= 4)
    ])
    def test_shrinkage_strictly_positive_eigenvalues(self, C: int, T: int):
        """Verify Ledoit-Wolf shrinkage produces SPD matrices with all eigenvalues > 0."""
        mdm = RiemannianMDM(shrink_alpha=1e-2)
        np.random.seed(42)
        trial = np.random.randn(C, T)

        cov = mdm._compute_cov(trial)
        assert cov.shape == (C, C)
        assert np.allclose(cov, cov.T, atol=1e-8), "Covariance matrix is not symmetric"

        eigvals = np.linalg.eigvalsh(cov)
        min_eig = np.min(eigvals)
        assert min_eig > 0.0, f"Non-positive eigenvalue {min_eig} for shape ({C}, {T})"
        assert min_eig >= 1e-8, f"Eigenvalue floor breached: {min_eig} < 1e-8"

    def test_degenerate_zero_signal_covariance(self):
        """Test covariance calculation on flatline zero signal (all zeros)."""
        mdm = RiemannianMDM(shrink_alpha=1e-3)
        flatline = np.zeros((22, 400))
        cov = mdm._compute_cov(flatline)
        assert cov.shape == (22, 22)
        eigvals = np.linalg.eigvalsh(cov)
        assert (eigvals > 0).all()

    def test_airm_distance_between_singular_regularized_covariances(self):
        """Verify AIRM geodesic distance between two rank-deficient regularized covariances is valid."""
        mdm = RiemannianMDM(shrink_alpha=1e-2)
        t1 = np.random.randn(22, 10)
        t2 = np.random.randn(22, 10)

        c1 = mdm._compute_cov(t1)
        c2 = mdm._compute_cov(t2)

        dist = mdm._airm_distance(c1, c2)
        assert not np.isnan(dist), "AIRM distance evaluated to NaN"
        assert not np.isinf(dist), "AIRM distance evaluated to Inf"
        assert dist >= 0.0, f"AIRM distance negative: {dist}"

        dist_self = mdm._airm_distance(c1, c1)
        assert np.isclose(dist_self, 0.0, atol=1e-5), f"Self distance not zero: {dist_self}"


# ============================================================================
# Task 4: EEGNet-4,2 Spatial Max-Norm Constraint
# ============================================================================

class TestEEGNetSpatialMaxNormConstraint:
    """Verifies spatial convolution max-norm constraint bounded <= 1.0."""

    def test_weights_set_to_100_bounded_after_forward(self):
        """Manually set weights to 100.0, execute forward, assert norms <= 1.0."""
        model = EEGNet42(num_classes=4, num_channels=22, time_samples=400)
        # Artificially set all spatial weights to 100.0
        model.conv_spatial.weight.data.fill_(100.0)

        # Pre-check: weights are indeed 100.0
        assert torch.all(model.conv_spatial.weight.data == 100.0)

        # Execute forward pass
        x = torch.randn(2, 1, 22, 400)
        _ = model(x)

        # Post-check: norm along dim=0 must be strictly bounded <= 1.0 + 1e-5
        norms_dim0 = torch.norm(model.conv_spatial.weight.data, p=2, dim=0)
        assert (norms_dim0 <= 1.0 + 1e-5).all(), (
            f"Spatial max-norm violated: max norm = {torch.max(norms_dim0).item()}"
        )

    def test_weights_set_to_1000_bounded_after_forward(self):
        """Extreme test: manually set weights to 1000.0."""
        model = EEGNet42(num_classes=4, num_channels=22, time_samples=400)
        model.conv_spatial.weight.data.fill_(1000.0)

        x = torch.randn(2, 1, 22, 400)
        _ = model(x)

        norms = torch.norm(model.conv_spatial.weight.data, p=2, dim=0)
        assert (norms <= 1.0 + 1e-5).all()

    def test_repeated_forward_passes_maintain_constraint(self):
        """Multiple successive forward passes keep weights strictly normalized."""
        model = EEGNet42(num_classes=4, num_channels=22, time_samples=400)
        model.conv_spatial.weight.data.fill_(50.0)

        for _ in range(10):
            x = torch.randn(4, 1, 22, 400)
            _ = model(x)
            norms = torch.norm(model.conv_spatial.weight.data, p=2, dim=0)
            assert (norms <= 1.0 + 1e-5).all()


# ============================================================================
# Task 5: ShallowFBCSPNet SafeLog Non-Linearity
# ============================================================================

class TestShallowFBCSPSafeLogStability:
    """Verifies SafeLog non-linearity clamping avoids -Inf and NaN on zero tensors."""

    def test_constant_zero_tensor_no_neginf_or_nan(self):
        """Pass constant 0.0 tensor and verify no -Inf or NaN outputs."""
        model = ShallowFBCSPNet(num_classes=4, num_channels=22, time_samples=400)
        model.eval()

        zeros = torch.zeros(4, 1, 22, 400)
        with torch.no_grad():
            logits = model(zeros)

        assert not torch.isinf(logits).any(), "Constant zero tensor produced Inf logits"
        assert not torch.isnan(logits).any(), "Constant zero tensor produced NaN logits"
        assert logits.shape == (4, 4)

    def test_constant_zero_feature_extraction(self):
        """Directly test log-bandpower features on zero tensor."""
        model = ShallowFBCSPNet(num_classes=4, num_channels=22, time_samples=400)
        model.eval()

        zeros = torch.zeros(2, 1, 22, 400)
        with torch.no_grad():
            feats = model.extract_features(zeros)

        assert not torch.isinf(feats).any()
        assert not torch.isnan(feats).any()
        # Clamping at 1e-6 guarantees min value is log(1e-6) ~ -13.8155
        assert (feats >= -14.0).all()

    def test_near_zero_machine_epsilon_tensor(self):
        """Test with machine epsilon noise (1e-12)."""
        model = ShallowFBCSPNet(num_classes=4, num_channels=22, time_samples=400)
        model.eval()

        eps_tensor = torch.full((2, 1, 22, 400), 1e-12)
        with torch.no_grad():
            logits = model(eps_tensor)

        assert not torch.isinf(logits).any()
        assert not torch.isnan(logits).any()

    def test_gradient_backprop_from_zero_input(self):
        """Verify backpropagation through SafeLog with zero input does not produce NaN gradients."""
        model = ShallowFBCSPNet(num_classes=4, num_channels=22, time_samples=400)
        model.train()

        zeros = torch.zeros(2, 1, 22, 400, requires_grad=True)
        y = torch.tensor([0, 2], dtype=torch.long)
        logits = model(zeros)
        loss = nn.CrossEntropyLoss()(logits, y)
        loss.backward()

        assert not torch.isnan(loss), "Loss was NaN"
        assert not torch.isinf(loss), "Loss was Inf"
        assert model.conv_time.weight.grad is not None
        assert not torch.isnan(model.conv_time.weight.grad).any()
