"""
Evaluation and Cross-Validation Package
=======================================
Provides Leave-One-Subject-Out (LOSO) few-shot cross-validation protocols,
adaptation harnesses, per-subject checkpointing, and multi-metric aggregation.
"""

try:
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
    from koopman_lusi.evaluation.aggregate import (
        aggregate_and_report,
        load_checkpoints_from_dir,
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
        "aggregate_and_report",
        "load_checkpoints_from_dir",
    ]
except ImportError:
    __all__ = []
