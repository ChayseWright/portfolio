"""
Reporting and Publication Artifacts Exporter Module
===================================================
Formats publication-quality statistical summaries and scientific figures:
- Markdown benchmark summary tables
- LaTeX booktabs benchmark summary tables
- 300 DPI distribution boxplots / strip charts
- 300 DPI Koopman eigenvalue spectrum polar plots
"""

import builtins
import os
import shutil
builtins.shutil = shutil
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import numpy as np

# Ensure headless matplotlib backend
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt


def export_markdown_table(stats: Dict[str, Dict[str, Any]], output_path: str) -> None:
    """
    Exports a publication-quality Markdown table summarizing benchmark results:
    Model Architecture, Mean ± SEM (%), Wilcoxon W, p-value, Hedges' g, Significance.

    Parameters
    ----------
    stats : dict
        Output from compute_statistical_significance().
    output_path : str
        File path to save the generated Markdown table.
    """
    lines = [
        "| Model Architecture | Mean ± SEM (%) | Wilcoxon W | p-value | Hedges' g | Significance |",
        "|---|---|---|---|---|---|"
    ]

    for model_name, data in stats.items():
        mean_pct = data["mean_acc"] * 100.0
        sem_pct = data["std_err"] * 100.0
        mean_str = f"{mean_pct:.2f}% ± {sem_pct:.2f}%"

        pval = data["p_value"]
        if pval < 0.001:
            pval_str = f"{pval:.4f} ***"
            sig_str = "p < 0.001 ***"
        elif pval < 0.01:
            pval_str = f"{pval:.4f} **"
            sig_str = "p < 0.01 **"
        elif pval < 0.05:
            pval_str = f"{pval:.4f} *"
            sig_str = "p < 0.05 *"
        else:
            pval_str = f"{pval:.4f}"
            sig_str = "Not Significant"

        g_val = data.get("hedges_g", 0.0)
        g_str = f"{g_val:+.2f}" if not np.isinf(g_val) else ("+inf" if g_val > 0 else "-inf")
        w_stat = data.get("wilcoxon_stat", 0.0)

        lines.append(
            f"| {model_name} | {mean_str} | {w_stat} | {pval_str} | {g_str} | {sig_str} |"
        )

    out_p = Path(output_path)
    out_p.parent.mkdir(parents=True, exist_ok=True)
    with open(out_p, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def export_latex_table(stats: Dict[str, Dict[str, Any]], output_path: str) -> None:
    """
    Exports a publication-quality LaTeX table in booktabs format.

    Parameters
    ----------
    stats : dict
        Output from compute_statistical_significance().
    output_path : str
        File path to save the generated LaTeX file (.tex).
    """
    lines = [
        "\\begin{table*}[t]",
        "\\centering",
        "\\caption{Leave-One-Subject-Out Few-Shot Cross-Validation Benchmark. "
        "Statistical significance evaluated via two-tailed paired Wilcoxon signed-rank test against baseline.}",
        "\\label{tab:koopman_lusi_benchmark}",
        "\\begin{tabular}{lcccc}",
        "\\toprule",
        "Model & Mean $\\pm$ SEM (\\%) & $W$ & $p$-value & Hedges' $g$ \\\\",
        "\\midrule"
    ]

    for model_name, data in stats.items():
        mean_pct = data["mean_acc"] * 100.0
        sem_pct = data["std_err"] * 100.0
        w_stat = data.get("wilcoxon_stat", 0.0)
        pval = data.get("p_value", 1.0)
        g_val = data.get("hedges_g", 0.0)
        g_str = f"{g_val:+.2f}" if not np.isinf(g_val) else ("+\\infty" if g_val > 0 else "-\\infty")

        # Format asterisks for latex
        if pval < 0.001:
            p_str = f"{pval:.4f}^{{***}}"
        elif pval < 0.01:
            p_str = f"{pval:.4f}^{{**}}"
        elif pval < 0.05:
            p_str = f"{pval:.4f}^{{*}}"
        else:
            p_str = f"{pval:.4f}"

        # Bold top-performing model if KL-Net
        clean_name = model_name.replace("_", "\\_")
        lines.append(
            f"{clean_name} & {mean_pct:.2f} $\\pm$ {sem_pct:.2f} & {w_stat} & {p_str} & {g_str} \\\\"
        )

    lines.extend([
        "\\bottomrule",
        "\\end{tabular}",
        "\\end{table*}"
    ])

    out_p = Path(output_path)
    out_p.parent.mkdir(parents=True, exist_ok=True)
    with open(out_p, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def plot_accuracy_distributions(
    results_dict: Dict[str, Any],
    output_path: str,
    baseline_name: Optional[str] = "EEGNet-4,2"
) -> None:
    """
    Renders publication-quality 300 DPI distribution boxplots with overlaid
    scatter points across all evaluated subjects.

    Parameters
    ----------
    results_dict : dict
        Results mapping {model_name: {subject_id: {'accuracy': float, ...}}}
        or {model_name: [list of accuracies]}.
    output_path : str
        Target image path (.png).
    baseline_name : str, optional
        Name of reference baseline for visual annotation.
    """
    model_names: List[str] = []
    data_points: List[np.ndarray] = []

    for m_name, subjs_data in results_dict.items():
        model_names.append(m_name)
        if isinstance(subjs_data, dict):
            accs = []
            for s, metrics in sorted(subjs_data.items()):
                if isinstance(metrics, dict):
                    accs.append(metrics.get("accuracy", 0.0) * 100.0)
                else:
                    accs.append(float(metrics) * 100.0)
            data_points.append(np.array(accs))
        elif isinstance(subjs_data, (list, np.ndarray)):
            arr = np.asarray(subjs_data, dtype=float)
            if np.max(arr) <= 1.0:
                arr = arr * 100.0
            data_points.append(arr)
        else:
            data_points.append(np.array([0.0]))

    if len(model_names) == 0:
        return

    fig, ax = plt.subplots(figsize=(max(8, len(model_names) * 1.5), 6), dpi=300)

    # Color palette
    colors = plt.cm.tab10(np.linspace(0, 1, max(10, len(model_names))))

    # Boxplot
    bp = ax.boxplot(
        data_points,
        patch_artist=True,
        widths=0.5,
        medianprops=dict(color="black", linewidth=2.0),
        boxprops=dict(linewidth=1.2),
        whiskerprops=dict(linewidth=1.2),
        capprops=dict(linewidth=1.2),
        flierprops=dict(marker="o", color="gray", alpha=0.5)
    )

    for patch, color in zip(bp["boxes"], colors):
        patch.set_facecolor(color)
        patch.set_alpha(0.65)

    # Overlay jittered scatter points for individual subjects
    rng = np.random.RandomState(42)
    for idx, (pts, color) in enumerate(zip(data_points, colors)):
        jitter = rng.normal(0, 0.04, size=len(pts))
        x_pos = np.full_like(pts, idx + 1) + jitter
        ax.scatter(x_pos, pts, color=color, edgecolor="black", linewidth=0.8, s=35, alpha=0.9, zorder=4)

    # Chance level reference line (4-class MI = 25.0%)
    ax.axhline(25.0, color="gray", linestyle="--", linewidth=1.2, alpha=0.7, label="Chance Level (25%)")

    ax.set_xticks(range(1, len(model_names) + 1))
    ax.set_xticklabels(model_names, rotation=25, ha="right", fontsize=10, fontweight="bold")
    ax.set_ylabel("Classification Accuracy (%)", fontsize=12, fontweight="bold")
    ax.set_title("Cross-Subject Few-Shot Motor Imagery Accuracy Distributions", fontsize=13, fontweight="bold", pad=12)
    ax.set_ylim(0, 105)
    ax.grid(axis="y", linestyle=":", alpha=0.6)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.legend(loc="lower right", frameon=True)

    plt.tight_layout()
    out_p = Path(output_path)
    out_p.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(out_p, dpi=300, bbox_inches="tight")
    plt.close(fig)


def plot_koopman_eigenvalues(
    eigenvalues: np.ndarray,
    output_path: str,
    damping_radius: float = 0.995
) -> None:
    """
    Renders 300 DPI polar spectrum plot of Koopman operator eigenvalues,
    demonstrating strict stability within the complex unit circle |z| < 1.

    Parameters
    ----------
    eigenvalues : np.ndarray
        Complex eigenvalues of the Cayley Koopman transition matrix K.
    output_path : str
        Target image file path (.png).
    damping_radius : float, default=0.995
        Strict dissipative upper bound radius.
    """
    fig, ax = plt.subplots(figsize=(6, 6), dpi=300)

    # Plot unit circle and damping boundary
    theta = np.linspace(0, 2 * np.pi, 200)
    ax.plot(np.cos(theta), np.sin(theta), "k--", alpha=0.5, label="Unit Circle ($|z|=1.0$)")
    ax.plot(
        damping_radius * np.cos(theta),
        damping_radius * np.sin(theta),
        "r:",
        alpha=0.7,
        label=f"Damping Boundary ($r={damping_radius}$)"
    )

    # Plot eigenvalues
    real_parts = np.real(eigenvalues)
    imag_parts = np.imag(eigenvalues)
    ax.scatter(real_parts, imag_parts, c="#1f77b4", s=50, edgecolors="black", zorder=5, label="Eigenvalues $\\lambda_j$")

    ax.set_xlim(-1.2, 1.2)
    ax.set_ylim(-1.2, 1.2)
    ax.set_aspect("equal", "box")
    ax.axhline(0, color="gray", linewidth=0.8, alpha=0.5)
    ax.axvline(0, color="gray", linewidth=0.8, alpha=0.5)
    ax.set_xlabel("$\\mathrm{Re}(\\lambda)$", fontsize=11, fontweight="bold")
    ax.set_ylabel("$\\mathrm{Im}(\\lambda)$", fontsize=11, fontweight="bold")
    ax.set_title("Cayley Koopman Operator Discrete Eigenvalue Spectrum", fontsize=12, fontweight="bold", pad=10)
    ax.grid(True, linestyle=":", alpha=0.6)
    ax.legend(loc="upper right", frameon=True, fontsize=9)

    plt.tight_layout()
    out_p = Path(output_path)
    out_p.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(out_p, dpi=300, bbox_inches="tight")
    plt.close(fig)
