"""
Statistical Significance Testing Module
=======================================
Provides non-parametric paired significance tests and parametric effect sizes:
- Two-tailed paired Wilcoxon signed-rank test (scipy.stats.wilcoxon)
- Paired Cohen's d_z effect size with zero-variance protection
- Hedges' g small-sample bias-corrected effect size
- Multi-model comparative statistical summary against baseline (EEGNet-4,2)
"""

import builtins
import shutil
builtins.shutil = shutil

from typing import Any, Dict, Optional, Union
import numpy as np
from scipy.stats import wilcoxon


def run_paired_wilcoxon(acc_a: np.ndarray, acc_b: np.ndarray) -> Dict[str, Any]:
    """
    Executes a two-tailed paired Wilcoxon signed-rank test between two paired
    accuracy distributions (acc_a and acc_b across identical subjects).

    Parameters
    ----------
    acc_a : np.ndarray or list
        Accuracy distribution for model A.
    acc_b : np.ndarray or list
        Accuracy distribution for model B.

    Returns
    -------
    dict
        {
            "statistic": float,
            "p_value": float,
            "significant": bool  # True if p_value < 0.05
        }
    """
    a = np.asarray(acc_a, dtype=float).flatten()
    b = np.asarray(acc_b, dtype=float).flatten()

    diffs = a - b
    if np.all(diffs == 0):
        return {"statistic": 0.0, "p_value": 1.0, "significant": False}

    try:
        # Prefer exact permutation method for small samples (N < 10, e.g. N=9 BCI IV-2a)
        res = wilcoxon(a, b, alternative="two-sided", zero_method="wilcox", method="exact")
    except Exception:
        try:
            res = wilcoxon(a, b, alternative="two-sided", zero_method="wilcox", method="approx")
        except Exception:
            res = wilcoxon(a, b, alternative="two-sided")

    stat = float(res.statistic)
    pval = float(res.pvalue)
    return {
        "statistic": stat,
        "p_value": pval,
        "significant": bool(pval < 0.05),
    }


def compute_cohens_d(acc_a: np.ndarray, acc_b: np.ndarray) -> float:
    """
    Computes paired Cohen's d_z effect size:
    d_z = mean(D) / std(D, ddof=1)
    where D = acc_a - acc_b.

    Protected against zero-variance edge cases:
    - If mean(D) == 0 and std(D) == 0 -> 0.0
    - If mean(D) > 0 and std(D) == 0 -> +inf
    - If mean(D) < 0 and std(D) == 0 -> -inf

    Parameters
    ----------
    acc_a : np.ndarray or list
        Accuracy distribution for model A.
    acc_b : np.ndarray or list
        Accuracy distribution for model B.

    Returns
    -------
    float
        Cohen's d_z effect size.
    """
    a = np.asarray(acc_a, dtype=float).flatten()
    b = np.asarray(acc_b, dtype=float).flatten()
    diffs = a - b
    n = len(diffs)

    mean_d = float(np.mean(diffs))
    std_d = float(np.std(diffs, ddof=1)) if n > 1 else 0.0

    if std_d == 0.0 or np.isclose(std_d, 0.0, atol=1e-12):
        if np.isclose(mean_d, 0.0, atol=1e-12):
            return 0.0
        return float(np.inf) if mean_d > 0 else float(-np.inf)

    return float(mean_d / std_d)


def compute_hedges_g(acc_a: np.ndarray, acc_b: np.ndarray) -> float:
    """
    Computes Hedges' g small-sample bias-corrected effect size:
    J(N-1) = 1 - 3 / (4 * (N - 1) - 1)
    g = J(N-1) * d_z

    For N=9, J(8) = 1 - 3/31 ≈ 0.9032.

    Parameters
    ----------
    acc_a : np.ndarray or list
        Accuracy distribution for model A.
    acc_b : np.ndarray or list
        Accuracy distribution for model B.

    Returns
    -------
    float
        Hedges' g effect size.
    """
    d = compute_cohens_d(acc_a, acc_b)
    n = len(acc_a)
    if n <= 1 or np.isinf(d) or np.isnan(d):
        return float(d)

    j = 1.0 - (3.0 / (4.0 * (n - 1) - 1))
    return float(d * j)


def compute_statistical_significance(
    results: Dict[str, Dict[Any, Any]],
    baseline_name: str = "EEGNet-4,2"
) -> Dict[str, Dict[str, Any]]:
    """
    Computes statistical significance metrics across all models compared to
    the designated baseline model across shared evaluation subjects.

    Parameters
    ----------
    results : dict
        Mapping of model_name -> {subject_id: {'accuracy': float, ...} or float}.
    baseline_name : str, default='EEGNet-4,2'
        Name of reference baseline model.

    Returns
    -------
    dict
        stats[model_name] = {
            'mean_acc': float,
            'std_err': float,
            'wilcoxon_stat': float,
            'p_value': float,
            'significant': bool,
            'cohens_d': float,
            'hedges_g': float
        }
    """
    def _extract_acc(val: Any) -> float:
        if isinstance(val, dict):
            return float(val.get("accuracy", 0.0))
        return float(val)

    # Resolve baseline name gracefully
    resolved_baseline = None
    if baseline_name in results:
        resolved_baseline = baseline_name
    else:
        for k in results.keys():
            normalized_k = k.lower().replace("-", "").replace(",", "").replace(" ", "")
            normalized_target = baseline_name.lower().replace("-", "").replace(",", "").replace(" ", "")
            if normalized_target in normalized_k or "eegnet" in normalized_k:
                resolved_baseline = k
                break
        if resolved_baseline is None:
            resolved_baseline = list(results.keys())[0]

    baseline_subjects = sorted(results[resolved_baseline].keys())
    baseline_accs = np.array([
        _extract_acc(results[resolved_baseline][s]) for s in baseline_subjects
    ])

    stats: Dict[str, Dict[str, Any]] = {}
    for m, s_dict in results.items():
        sorted_subjs = sorted(s_dict.keys())
        m_accs = np.array([_extract_acc(s_dict[s]) for s in sorted_subjs])

        w_res = run_paired_wilcoxon(m_accs, baseline_accs)
        d_val = compute_cohens_d(m_accs, baseline_accs)
        g_val = compute_hedges_g(m_accs, baseline_accs)
        n = len(m_accs)

        mean_val = float(np.mean(m_accs)) if n > 0 else 0.0
        std_err = float(np.std(m_accs, ddof=1) / np.sqrt(n)) if n > 1 else 0.0

        stats[m] = {
            "mean_acc": mean_val,
            "std_err": std_err,
            "wilcoxon_stat": w_res["statistic"],
            "p_value": w_res["p_value"],
            "significant": w_res["significant"],
            "cohens_d": d_val,
            "hedges_g": g_val,
        }

    return stats
