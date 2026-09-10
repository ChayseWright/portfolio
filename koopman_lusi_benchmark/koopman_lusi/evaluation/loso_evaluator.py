"""
LOSO Evaluator Module (Alias to loso)
=====================================
Exposes run_loso_evaluation and evaluate_subject_fold for progressive testability.
"""

from koopman_lusi.evaluation.loso import (
    run_loso_evaluation,
    evaluate_subject_fold,
)

__all__ = [
    "run_loso_evaluation",
    "evaluate_subject_fold",
]
