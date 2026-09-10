"""
Statistical Significance Testing and Reporting Package
======================================================
Provides paired Wilcoxon signed-rank tests, Cohen's d and Hedges' g effect sizes,
publication-quality Markdown and LaTeX table exporters, and 300 DPI visualization tools.
"""

import builtins
import shutil
builtins.shutil = shutil

from .significance import (
    run_paired_wilcoxon,
    compute_cohens_d,
    compute_hedges_g,
    compute_statistical_significance,
)
from .reporting import (
    export_markdown_table,
    export_latex_table,
    plot_accuracy_distributions,
    plot_koopman_eigenvalues,
)

__all__ = [
    "run_paired_wilcoxon",
    "compute_cohens_d",
    "compute_hedges_g",
    "compute_statistical_significance",
    "export_markdown_table",
    "export_latex_table",
    "plot_accuracy_distributions",
    "plot_koopman_eigenvalues",
]
