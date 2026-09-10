"""
Evaluation and Cross-Validation Package
=======================================
Provides Leave-One-Subject-Out (LOSO) few-shot cross-validation protocols,
adaptation harnesses, and multi-metric BCI performance evaluation.
"""

from koopman_lusi.evaluation.metrics import (
    accuracy_score,
    cohen_kappa_score,
    macro_f1_score,
    compute_confusion_matrix,
    compute_classification_metrics,
)
from koopman_lusi.evaluation.loso import (
    generate_deterministic_loso_split,
    get_few_shot_dataloaders,
    evaluate_subject_fold,
    run_loso_evaluation,
)

__all__ = [
    "accuracy_score",
    "cohen_kappa_score",
    "macro_f1_score",
    "compute_confusion_matrix",
    "compute_classification_metrics",
    "generate_deterministic_loso_split",
    "get_few_shot_dataloaders",
    "evaluate_subject_fold",
    "run_loso_evaluation",
]
