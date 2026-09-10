"""
Benchmark Result Aggregator & Report Generator
==============================================
Parses and aggregates per-subject checkpoint files from batched or distributed
evaluations, computes statistical significance (paired Wilcoxon signed-rank,
Cohen's d, Hedges' g), and generates publication-ready Markdown/LaTeX tables
and distribution plots.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union


def load_checkpoints_from_dir(output_dir: Union[str, Path]) -> Dict[str, Dict[int, Dict[str, float]]]:
    """
    Scans output_dir / 'checkpoints' for subject_*.json files and reconstructs
    the full structured results dictionary:
        results[model_name][subject_id] = {'accuracy': float, 'kappa': float, 'f1': float}
    Also checks output_dir / 'raw' / 'benchmark_results.json' as a fallback/cache.
    """
    out = Path(output_dir)
    ckpt_dir = out / "checkpoints"
    results: Dict[str, Dict[int, Dict[str, float]]] = {}

    # 1. First scan individual checkpoints
    if ckpt_dir.exists():
        for ckpt_file in sorted(ckpt_dir.glob("subject_*.json")):
            try:
                with open(ckpt_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                s_id = int(data.get("subject_id", -1))
                if s_id < 0:
                    continue
                subj_results = data.get("results", {})
                for m_name, m_metrics in subj_results.items():
                    if m_name not in results:
                        results[m_name] = {}
                    results[m_name][s_id] = {
                        "accuracy": float(m_metrics.get("accuracy", 0.0)),
                        "kappa": float(m_metrics.get("kappa", 0.0)),
                        "f1": float(m_metrics.get("f1", 0.0)),
                    }
            except Exception as e:
                print(f"[WARNING] Failed to parse checkpoint {ckpt_file.name}: {e}")

    # 2. Check if monolithic raw json has any missing subjects
    raw_json = out / "raw" / "benchmark_results.json"
    if raw_json.exists():
        try:
            with open(raw_json, "r", encoding="utf-8") as f:
                mono_data = json.load(f)
            for m_name, s_dict in mono_data.items():
                if m_name not in results:
                    results[m_name] = {}
                for s_key, m_metrics in s_dict.items():
                    s_id = int(s_key)
                    if s_id not in results[m_name]:
                        results[m_name][s_id] = {
                            "accuracy": float(m_metrics.get("accuracy", 0.0)),
                            "kappa": float(m_metrics.get("kappa", 0.0)),
                            "f1": float(m_metrics.get("f1", 0.0)),
                        }
        except Exception:
            pass

    return results


def aggregate_and_report(
    output_dir: Union[str, Path] = "./results",
    baseline_name: str = "EEGNet-4,2",
    no_figures: bool = False,
    models_dict: Optional[Dict[str, Any]] = None,
) -> Tuple[Dict[str, Any], Optional[Dict[str, Any]]]:
    """
    Parses all saved subject checkpoints, compiles statistical summaries,
    and generates publication tables (Markdown, LaTeX) and figures.
    """
    out_dir = Path(output_dir)
    raw_dir = out_dir / "raw"
    tables_dir = out_dir / "tables"
    figures_dir = out_dir / "figures"
    raw_dir.mkdir(parents=True, exist_ok=True)
    tables_dir.mkdir(parents=True, exist_ok=True)
    figures_dir.mkdir(parents=True, exist_ok=True)

    import numpy as np
    from koopman_lusi.stats.significance import compute_statistical_significance
    from koopman_lusi.stats.reporting import (
        export_markdown_table,
        export_latex_table,
        plot_accuracy_distributions,
        plot_koopman_eigenvalues,
    )

    results = load_checkpoints_from_dir(out_dir)

    if not results or len(results) == 0:
        print(f"[WARNING] No subject checkpoints found in {out_dir / 'checkpoints'}.")
        return {}, None

    # Check available subjects
    first_model = next(iter(results.keys()))
    subject_ids = sorted(results[first_model].keys())
    print(f"[INFO] Aggregating results across {len(subject_ids)} subjects: {subject_ids}")
    print(f"[INFO] Models found: {list(results.keys())}")

    # 1. Save unified raw results JSON
    raw_json_path = raw_dir / "benchmark_results.json"
    with open(raw_json_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"[INFO] Unified raw results written to: {raw_json_path}")

    # 2. Export CSV accuracy matrix
    raw_csv_path = raw_dir / "accuracy_matrix.csv"
    csv_lines = ["Subject," + ",".join(results.keys())]
    for s in subject_ids:
        row = [f"Subject {s}"]
        for m in results.keys():
            acc = results[m].get(s, {}).get("accuracy", 0.0)
            row.append(f"{acc*100.0:.2f}")
        csv_lines.append(",".join(row))
    with open(raw_csv_path, "w", encoding="utf-8") as f:
        f.write("\n".join(csv_lines) + "\n")
    print(f"[INFO] Accuracy matrix CSV written to: {raw_csv_path}")

    # 3. Compute Statistical Significance
    baseline_ref = baseline_name if baseline_name in results else list(results.keys())[-1]
    stats = compute_statistical_significance(results, baseline_name=baseline_ref)

    # 4. Export Markdown table
    md_table_path = tables_dir / "benchmark_report.md"
    export_markdown_table(stats, str(md_table_path))
    print(f"[INFO] Markdown summary table exported to: {md_table_path}")

    # 5. Export LaTeX booktabs table
    latex_table_path = tables_dir / "benchmark_table.tex"
    export_latex_table(stats, str(latex_table_path))
    print(f"[INFO] LaTeX booktabs table exported to: {latex_table_path}")

    # 6. Generate Publication Figures
    if not no_figures:
        try:
            dist_plot_path = figures_dir / "accuracy_distributions.png"
            plot_accuracy_distributions(results, str(dist_plot_path), baseline_name=baseline_ref)
            print(f"[INFO] Distribution boxplot exported to: {dist_plot_path}")
        except Exception as e:
            print(f"[WARNING] Skipping distribution plot: {e}")

        # Koopman Eigenvalue Spectrum Polar Plot
        if models_dict is not None and "KL-Net" in models_dict:
            try:
                kl_inst = models_dict["KL-Net"]()
                if hasattr(kl_inst, "koopman") and kl_inst.koopman is not None:
                    eigs = kl_inst.koopman.get_eigenvalues().detach().cpu().numpy()
                    eig_plot_path = figures_dir / "koopman_eigenvalues.png"
                    plot_koopman_eigenvalues(eigs, str(eig_plot_path))
                    print(f"[INFO] Koopman polar spectrum exported to: {eig_plot_path}")
            except Exception as e:
                print(f"[WARNING] Skipping Koopman polar spectrum plot: {e}")

    # 7. Print Console Summary Report
    print("\n" + "=" * 78)
    print("  PARSED BENCHMARK SUMMARY REPORT")
    print("=" * 78)
    if md_table_path.exists():
        print(md_table_path.read_text(encoding="utf-8"))
    print("=" * 78)

    return results, stats
