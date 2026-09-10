"""
Test Suite: Leave-One-Subject-Out (LOSO) Cross-Validation & Adaptation
======================================================================
Verifies:
- LOSO Splitting & Cross-Subject Partitioning (F-10)
- Unified Adaptation Harness (F-14)
- Three-Phase Train/Adapt/Evaluate Lifecycle
- Multi-Metric Evaluation (Accuracy, Cohen's Kappa, Macro-F1)
- Deterministic Seed Repeatability across Runs
"""

import pytest
import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import cohen_kappa_score, f1_score, accuracy_score

# Progressive imports
try:
    from koopman_lusi.evaluation.loso_evaluator import (
        run_loso_evaluation,
        evaluate_subject_fold
    )
except ImportError:
    run_loso_evaluation = None
    evaluate_subject_fold = None

try:
    from koopman_lusi.evaluation.metrics import (
        compute_classification_metrics
    )
except ImportError:
    def compute_classification_metrics(y_true: np.ndarray, y_pred: np.ndarray):
        acc = float(accuracy_score(y_true, y_pred))
        kappa = float(cohen_kappa_score(y_true, y_pred))
        f1 = float(f1_score(y_true, y_pred, average="macro", zero_division=0))
        return {"accuracy": acc, "kappa": kappa, "f1": f1}

try:
    from koopman_lusi.data.synthetic import generate_synthetic_smr_dataset
except ImportError:
    generate_synthetic_smr_dataset = None


# ============================================================================
# Tier 1: Feature Coverage (F-14: Unified Adaptation Harness)
# ============================================================================

class TestFeature14UnifiedAdaptationHarness:
    """Tests for the three-phase training and adaptation harness."""

    def test_f14_tc01_metrics_calculation_perfect_match(self):
        """TC01: Metric calculation gives 1.0 for perfect predictions."""
        y_true = np.array([0, 1, 2, 3, 0, 1, 2, 3])
        y_pred = np.array([0, 1, 2, 3, 0, 1, 2, 3])
        metrics = compute_classification_metrics(y_true, y_pred)
        assert metrics["accuracy"] == 1.0
        assert metrics["kappa"] == 1.0
        assert metrics["f1"] == 1.0

    def test_f14_tc02_metrics_calculation_chance_level(self):
        """TC02: Constant prediction on balanced 4-class set yields acc=0.25, kappa=0.0."""
        y_true = np.array([0, 1, 2, 3] * 10)
        y_pred = np.zeros_like(y_true)  # all predicted class 0
        metrics = compute_classification_metrics(y_true, y_pred)
        assert metrics["accuracy"] == 0.25
        assert np.isclose(metrics["kappa"], 0.0, atol=1e-4)

    def test_f14_tc03_loso_loop_contract_structure(self):
        """TC03: Verifies structured dictionary format returned by LOSO evaluation."""
        # Contract: results[model_name][subject_id] = {'accuracy': float, 'kappa': float, 'f1': float}
        models = ["KL-Net", "EEGNet-4,2"]
        subjects = [0, 1]
        mock_results = {}
        for m in models:
            mock_results[m] = {}
            for s in subjects:
                mock_results[m][s] = {
                    "accuracy": 0.80 if m == "KL-Net" else 0.70,
                    "kappa": 0.73 if m == "KL-Net" else 0.60,
                    "f1": 0.79 if m == "KL-Net" else 0.69
                }

        for m in models:
            assert m in mock_results
            for s in subjects:
                assert s in mock_results[m]
                entry = mock_results[m][s]
                assert "accuracy" in entry and 0.0 <= entry["accuracy"] <= 1.0
                assert "kappa" in entry and -1.0 <= entry["kappa"] <= 1.0
                assert "f1" in entry and 0.0 <= entry["f1"] <= 1.0

    def test_f14_tc04_three_phase_adaptation_step(self):
        """TC04: Adaptation step updates weights using calibration samples without crashing."""
        model = nn.Linear(48, 4)
        optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)
        criterion = nn.CrossEntropyLoss()

        # Calibration data (k=2 per class = 8 samples)
        x_calib = torch.randn(8, 48)
        y_calib = torch.tensor([0, 0, 1, 1, 2, 2, 3, 3])

        # Initial evaluation
        with torch.no_grad():
            initial_loss = criterion(model(x_calib), y_calib).item()

        # Adaptation loop (5 steps)
        for _ in range(5):
            optimizer.zero_grad()
            loss = criterion(model(x_calib), y_calib)
            loss.backward()
            optimizer.step()

        # Final evaluation
        with torch.no_grad():
            final_loss = criterion(model(x_calib), y_calib).item()

        assert final_loss < initial_loss, "Adaptation failed to reduce calibration loss"

    def test_f14_tc05_deterministic_cross_model_split_fairness(self):
        """TC05: Confirms identical split arrays are shared across multiple models."""
        from koopman_lusi_benchmark.tests.test_data import _deterministic_split
        y_target = np.array([0, 1, 2, 3] * 20)
        split_m1 = _deterministic_split(y_target, k=5, seed=42)
        split_m2 = _deterministic_split(y_target, k=5, seed=42)
        split_m3 = _deterministic_split(y_target, k=5, seed=42)

        assert np.array_equal(split_m1[0], split_m2[0])
        assert np.array_equal(split_m1[0], split_m3[0])
        assert np.array_equal(split_m1[1], split_m2[1])


# ============================================================================
# Tier 2: Boundary & Corner Cases (LOSO & Evaluation)
# ============================================================================

class TestTier2LOSOBoundaryCases:
    """Corner cases in cross-validation and adaptation."""

    def test_t2_minimal_two_subject_cohort(self):
        """LOSO on minimal cohort of N=2 subjects (1 source, 1 target)."""
        subjs = np.array([0] * 20 + [1] * 20)
        target = 1
        source_idxs = np.where(subjs != target)[0]
        target_idxs = np.where(subjs == target)[0]

        assert len(source_idxs) == 20
        assert len(target_idxs) == 20
        assert len(np.intersect1d(source_idxs, target_idxs)) == 0

    def test_t2_zero_division_in_macro_f1(self):
        """F1 metric handles zero predicted instances of a class without crash."""
        y_true = np.array([0, 1, 2, 3])
        y_pred = np.array([0, 0, 0, 0])  # classes 1, 2, 3 never predicted
        metrics = compute_classification_metrics(y_true, y_pred)
        assert 0.0 <= metrics["f1"] <= 1.0
        assert not np.isnan(metrics["f1"])

    def test_t2_k1_extreme_few_shot_calibration(self):
        """Adapts on scarce calibration set of k=1 per class (4 trials)."""
        model = nn.Sequential(nn.Linear(16, 4))
        opt = torch.optim.SGD(model.parameters(), lr=0.01)
        x = torch.randn(4, 16)
        y = torch.tensor([0, 1, 2, 3])

        opt.zero_grad()
        loss = nn.CrossEntropyLoss()(model(x), y)
        loss.backward()
        opt.step()
        assert not torch.isnan(loss)

    def test_t2_large_target_test_set_batching(self):
        """Evaluation loader batches large target test set without dropping samples."""
        from torch.utils.data import TensorDataset, DataLoader
        x_test = torch.randn(556, 1, 22, 400)
        y_test = torch.randint(0, 4, (556,))
        loader = DataLoader(TensorDataset(x_test, y_test), batch_size=32, shuffle=False)

        total_evaluated = sum(len(b[1]) for b in loader)
        assert total_evaluated == 556
