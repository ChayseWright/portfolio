"""
Classification Metrics Suite
============================
Provides standard Brain-Computer Interface evaluation metrics:
- Top-1 Classification Accuracy
- Cohen's Kappa Coefficient (chance-adjusted agreement)
- Macro-Averaged F1-Score (zero-division safe)
- Confusion Matrix
"""

from typing import Any, Dict, Optional, Union
import numpy as np
import torch

try:
    from sklearn.metrics import (
        accuracy_score as sk_acc,
        cohen_kappa_score as sk_kappa,
        confusion_matrix as sk_cm,
        f1_score as sk_f1,
    )
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


def _to_numpy(x: Union[np.ndarray, torch.Tensor, list]) -> np.ndarray:
    """Converts torch Tensor, list, or array-like to a 1D int64 numpy array."""
    if isinstance(x, torch.Tensor):
        return x.detach().cpu().numpy().astype(np.int64).flatten()
    return np.asarray(x, dtype=np.int64).flatten()


def accuracy_score(y_true: Union[np.ndarray, torch.Tensor], y_pred: Union[np.ndarray, torch.Tensor]) -> float:
    """Computes Top-1 classification accuracy in [0.0, 1.0]."""
    yt = _to_numpy(y_true)
    yp = _to_numpy(y_pred)
    if len(yt) == 0:
        return 0.0
    if SKLEARN_AVAILABLE:
        return float(sk_acc(yt, yp))
    return float(np.mean(yt == yp))


def cohen_kappa_score(y_true: Union[np.ndarray, torch.Tensor], y_pred: Union[np.ndarray, torch.Tensor]) -> float:
    """
    Computes Cohen's Kappa coefficient.
    kappa = (P_o - P_e) / (1 - P_e)
    Accounts for chance agreement in multi-class classification.
    """
    yt = _to_numpy(y_true)
    yp = _to_numpy(y_pred)
    if len(yt) == 0:
        return 0.0
    if SKLEARN_AVAILABLE:
        return float(sk_kappa(yt, yp))

    n = len(yt)
    p_o = float(np.mean(yt == yp))
    classes = np.unique(np.concatenate([yt, yp]))
    p_e = 0.0
    for c in classes:
        p_true_c = float(np.sum(yt == c)) / n
        p_pred_c = float(np.sum(yp == c)) / n
        p_e += p_true_c * p_pred_c

    if np.isclose(1.0 - p_e, 0.0):
        return 1.0 if np.isclose(p_o, 1.0) else 0.0
    return float((p_o - p_e) / (1.0 - p_e))


def macro_f1_score(y_true: Union[np.ndarray, torch.Tensor], y_pred: Union[np.ndarray, torch.Tensor]) -> float:
    """
    Computes macro-averaged F1-score across all classes.
    Handles zero division gracefully by assigning 0.0 precision/recall.
    """
    yt = _to_numpy(y_true)
    yp = _to_numpy(y_pred)
    if len(yt) == 0:
        return 0.0
    if SKLEARN_AVAILABLE:
        return float(sk_f1(yt, yp, average="macro", zero_division=0))

    classes = np.unique(np.concatenate([yt, yp]))
    if len(classes) == 0:
        return 0.0

    f1_list = []
    for c in classes:
        tp = np.sum((yt == c) & (yp == c))
        fp = np.sum((yt != c) & (yp == c))
        fn = np.sum((yt == c) & (yp != c))

        prec = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
        rec = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
        f1_c = float(2 * prec * rec / (prec + rec)) if (prec + rec) > 0 else 0.0
        f1_list.append(f1_c)

    return float(np.mean(f1_list))


def compute_confusion_matrix(
    y_true: Union[np.ndarray, torch.Tensor],
    y_pred: Union[np.ndarray, torch.Tensor],
    num_classes: Optional[int] = None
) -> np.ndarray:
    """
    Computes confusion matrix where entry (i, j) is the number of observations
    known to be in group i and predicted to be in group j.
    """
    yt = _to_numpy(y_true)
    yp = _to_numpy(y_pred)
    if SKLEARN_AVAILABLE and num_classes is None:
        return sk_cm(yt, yp)

    if num_classes is None:
        classes = np.unique(np.concatenate([yt, yp]))
        num_classes = int(np.max(classes)) + 1 if len(classes) > 0 else 0

    cm = np.zeros((num_classes, num_classes), dtype=np.int64)
    for t_val, p_val in zip(yt, yp):
        if 0 <= t_val < num_classes and 0 <= p_val < num_classes:
            cm[t_val, p_val] += 1
    return cm


def compute_classification_metrics(
    y_true: Union[np.ndarray, torch.Tensor],
    y_pred: Union[np.ndarray, torch.Tensor]
) -> Dict[str, Any]:
    """
    Computes all standard BCI classification metrics simultaneously.

    Parameters
    ----------
    y_true : np.ndarray or torch.Tensor
        Ground truth class labels.
    y_pred : np.ndarray or torch.Tensor
        Predicted class labels.

    Returns
    -------
    dict
        - 'accuracy': float in [0.0, 1.0]
        - 'kappa': float in [-1.0, 1.0]
        - 'f1': float in [0.0, 1.0]
        - 'confusion_matrix': np.ndarray of shape (num_classes, num_classes)
    """
    yt = _to_numpy(y_true)
    yp = _to_numpy(y_pred)

    acc = accuracy_score(yt, yp)
    kappa = cohen_kappa_score(yt, yp)
    f1 = macro_f1_score(yt, yp)
    cm = compute_confusion_matrix(yt, yp)

    return {
        "accuracy": acc,
        "kappa": kappa,
        "f1": f1,
        "confusion_matrix": cm
    }
