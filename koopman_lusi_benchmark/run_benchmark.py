#!/usr/bin/env python3
"""
Koopman-LUSI-Net Unified Benchmark Runner CLI
==============================================
Primary entrypoint for executing Leave-One-Subject-Out (LOSO) cross-validation
benchmarks of Koopman-LUSI-Net against standard BCI baselines across BCI IV-2a,
PhysioNet Motor Imagery, and Synthetic datasets.

Usage Examples:
---------------
1. Fast Smoke Test / Demo Mode (<60s on CPU):
   $ python run_benchmark.py --demo

2. Production BCI Competition IV-2a (All 9 subjects, T4 GPU):
   $ python run_benchmark.py --dataset bci_iv_2a --device cuda --k_shots 5

3. Automated PhysioNet Evaluation:
   $ python run_benchmark.py --dataset physionet --subjects 1 2 3 --device cuda

4. Ablation & Baseline Evaluation:
   $ python run_benchmark.py --dataset bci_iv_2a --models all --output_dir ./results
"""

import os
import sys
import json
import random
import argparse
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
import torch

from koopman_lusi.models.koopman_lusi import KoopmanLUSINet
from koopman_lusi.models.baselines import EEGNet42, ShallowFBCSPNet, RiemannianMDM
from koopman_lusi.evaluation.loso import run_loso_evaluation
from koopman_lusi.stats.significance import compute_statistical_significance
from koopman_lusi.stats.reporting import (
    export_markdown_table,
    export_latex_table,
    plot_accuracy_distributions,
    plot_koopman_eigenvalues,
)


def set_seed(seed: int = 42) -> None:
    """Sets deterministic random seeds across all libraries."""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False


def build_arg_parser() -> argparse.ArgumentParser:
    """
    Builds the standard benchmark argument parser conforming strictly to
    the PROJECT.md and TEST_INFRA.md interface contracts.
    """
    parser = argparse.ArgumentParser(
        description="Koopman-LUSI-Net Cross-Subject BCI Benchmark Runner",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--dataset",
        type=str,
        default="bci_iv_2a",
        choices=["bci_iv_2a", "physionet", "synthetic"],
        help="Dataset to benchmark",
    )
    parser.add_argument(
        "--demo",
        "--quick",
        action="store_true",
        dest="demo",
        default=False,
        help="Fast integrity verification mode (2 subjects, 2 epochs, <60s on CPU)",
    )
    parser.add_argument(
        "--k_shots",
        type=int,
        default=5,
        help="Calibration shots per class (1 <= k <= 20)",
    )
    parser.add_argument(
        "--subjects",
        type=int,
        nargs="+",
        default=None,
        help="Specific subject IDs to evaluate (default: all subjects in dataset)",
    )
    parser.add_argument(
        "--models",
        type=str,
        nargs="+",
        default=["all"],
        help="Models to benchmark: 'all' or subset of [kl_net, koopman_only, lusi_only, base_cnn, eegnet, shallow_fbcsp, mdm]",
    )
    parser.add_argument(
        "--output_dir",
        type=str,
        default="./results",
        help="Directory for exported results, tables, and figures",
    )
    parser.add_argument(
        "--device",
        type=str,
        default="auto",
        choices=["auto", "cuda", "cpu", "mps"],
        help="Hardware execution device",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Global random seed for reproducibility",
    )
    parser.add_argument(
        "--batch_size",
        type=int,
        default=16,
        help="Batch size for pre-training and adaptation",
    )
    parser.add_argument(
        "--epochs_pretrain",
        type=int,
        default=20,
        help="Source cohort pre-training epochs (overridden to <=2 in --demo)",
    )
    parser.add_argument(
        "--epochs_adapt",
        type=int,
        default=15,
        help="Target subject calibration adaptation epochs (overridden to <=2 in --demo)",
    )
    parser.add_argument(
        "--lr",
        type=float,
        default=1.5e-3,
        help="Base learning rate for AdamW optimizer",
    )
    parser.add_argument(
        "--no_figures",
        action="store_true",
        default=False,
        help="Disable matplotlib figure rendering for headless execution",
    )
    parser.add_argument(
        "--fallback_synthetic",
        action="store_true",
        default=True,
        help="Automatically use synthetic SMR fallback if MOABB download is offline",
    )
    return parser


def validate_args(args: argparse.Namespace) -> None:
    """Validates CLI arguments and enforces contract boundaries."""
    if args.k_shots < 1 or args.k_shots > 20:
        sys.stderr.write(f"[ERROR] Invalid --k_shots: {args.k_shots}. Must satisfy 1 <= k <= 20.\n")
        sys.exit(2)


def resolve_device(device_choice: str) -> str:
    """Resolves 'auto' hardware accelerator choice to concrete device."""
    if device_choice == "auto":
        if torch.cuda.is_available():
            return "cuda"
        elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            return "mps"
        return "cpu"
    elif device_choice == "cuda":
        return "cuda" if torch.cuda.is_available() else "cpu"
    return device_choice


def resolve_models(
    requested_models: List[str],
    num_channels: int = 22,
    time_samples: int = 400,
    num_classes: int = 4
) -> Dict[str, Any]:
    """
    Constructs model factory dictionary for requested architectures.
    """
    registry = {
        "KL-Net": lambda: KoopmanLUSINet(
            num_channels=num_channels,
            time_samples=time_samples,
            num_classes=num_classes,
            ablation_mode="full",
        ),
        "Koopman-Only": lambda: KoopmanLUSINet(
            num_channels=num_channels,
            time_samples=time_samples,
            num_classes=num_classes,
            ablation_mode="koopman_only",
        ),
        "LUSI-Only": lambda: KoopmanLUSINet(
            num_channels=num_channels,
            time_samples=time_samples,
            num_classes=num_classes,
            ablation_mode="lusi_only",
        ),
        "Base CNN": lambda: KoopmanLUSINet(
            num_channels=num_channels,
            time_samples=time_samples,
            num_classes=num_classes,
            ablation_mode="base_cnn",
        ),
        "EEGNet-4,2": lambda: EEGNet42(
            num_classes=num_classes,
            num_channels=num_channels,
            time_samples=time_samples,
        ),
        "ShallowFBCSPNet": lambda: ShallowFBCSPNet(
            num_classes=num_classes,
            num_channels=num_channels,
            time_samples=time_samples,
        ),
        "Riemannian MDM": lambda: RiemannianMDM(metric="riemann"),
    }

    norm_req = [m.lower().replace("_", "").replace("-", "").replace(",", "") for m in requested_models]

    if "all" in norm_req:
        return registry

    selected = {}
    for canonical_name, factory in registry.items():
        canonical_norm = canonical_name.lower().replace("_", "").replace("-", "").replace(",", "")
        for req in norm_req:
            if req in canonical_norm or canonical_norm in req:
                selected[canonical_name] = factory
                break

    if len(selected) == 0:
        # Fallback to KL-Net and baseline
        selected["KL-Net"] = registry["KL-Net"]
        selected["EEGNet-4,2"] = registry["EEGNet-4,2"]

    return selected


def main(argv: Optional[List[str]] = None) -> int:
    """Main execution function."""
    parser = build_arg_parser()
    args = parser.parse_args(argv)
    validate_args(args)

    set_seed(args.seed)
    device = resolve_device(args.device)

    # Demo mode parameter overrides (F-16)
    if args.demo:
        args.epochs_pretrain = min(args.epochs_pretrain, 2)
        args.epochs_adapt = min(args.epochs_adapt, 2)
        if args.subjects is None:
            args.subjects = [1, 2]
        print(f"[DEMO MODE] Overrides active: pretrain_epochs={args.epochs_pretrain}, adapt_epochs={args.epochs_adapt}, subjects={args.subjects}")

    print("=" * 78)
    print("  KOOPMAN-LUSI-NET MOTOR IMAGERY BENCHMARK")
    print(f"  Dataset: {args.dataset} | Device: {device} | k-shots: {args.k_shots} | Seed: {args.seed}")
    print(f"  Pretrain Epochs: {args.epochs_pretrain} | Adapt Epochs: {args.epochs_adapt}")
    print("=" * 78)

    # Dataset dimension configuration
    if args.dataset == "physionet":
        num_channels = 64
        time_samples = 480
    else:
        num_channels = 22
        time_samples = 400
    num_classes = 4

    # Resolve models
    models_dict = resolve_models(
        requested_models=args.models,
        num_channels=num_channels,
        time_samples=time_samples,
        num_classes=num_classes,
    )
    print(f"[INFO] Models to evaluate: {list(models_dict.keys())}")

    # Output directory scaffolding
    out_dir = Path(args.output_dir)
    raw_dir = out_dir / "raw"
    tables_dir = out_dir / "tables"
    figures_dir = out_dir / "figures"
    raw_dir.mkdir(parents=True, exist_ok=True)
    tables_dir.mkdir(parents=True, exist_ok=True)
    figures_dir.mkdir(parents=True, exist_ok=True)

    # Execute LOSO Cross-Validation
    print("[INFO] Starting Leave-One-Subject-Out few-shot adaptation loop...")
    results = run_loso_evaluation(
        models=models_dict,
        dataset_name=args.dataset,
        subjects=args.subjects,
        k_shots=args.k_shots,
        seed=args.seed,
        batch_size=args.batch_size,
        epochs_pretrain=args.epochs_pretrain,
        epochs_adapt=args.epochs_adapt,
        device=device,
        use_synthetic_fallback=args.fallback_synthetic,
    )
    print("[INFO] Cross-validation evaluation completed successfully.")

    # Save raw per-subject results
    raw_json_path = raw_dir / "benchmark_results.json"
    with open(raw_json_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"[INFO] Raw results written to: {raw_json_path}")

    # Export CSV accuracy matrix
    raw_csv_path = raw_dir / "accuracy_matrix.csv"
    first_model = next(iter(results.keys()))
    subject_ids = sorted(results[first_model].keys())
    csv_lines = ["Subject," + ",".join(results.keys())]
    for s in subject_ids:
        row = [f"Subject {s}"]
        for m in results.keys():
            row.append(f"{results[m][s]['accuracy']*100.0:.2f}")
        csv_lines.append(",".join(row))
    with open(raw_csv_path, "w", encoding="utf-8") as f:
        f.write("\n".join(csv_lines) + "\n")

    # Compute Statistical Significance against EEGNet-4,2 baseline
    baseline_ref = "EEGNet-4,2" if "EEGNet-4,2" in results else list(results.keys())[-1]
    stats = compute_statistical_significance(results, baseline_name=baseline_ref)

    # Export Markdown table
    md_table_path = tables_dir / "benchmark_report.md"
    export_markdown_table(stats, str(md_table_path))
    print(f"[INFO] Markdown summary table exported to: {md_table_path}")

    # Export LaTeX booktabs table
    latex_table_path = tables_dir / "benchmark_table.tex"
    export_latex_table(stats, str(latex_table_path))
    print(f"[INFO] LaTeX booktabs table exported to: {latex_table_path}")

    # Generate Publication Figures (unless --no_figures)
    if not args.no_figures:
        dist_plot_path = figures_dir / "accuracy_distributions.png"
        plot_accuracy_distributions(results, str(dist_plot_path), baseline_name=baseline_ref)
        print(f"[INFO] Distribution boxplot exported to: {dist_plot_path}")

        # Koopman Eigenvalue Spectrum Polar Plot
        if "KL-Net" in models_dict:
            try:
                kl_inst = models_dict["KL-Net"]()
                if hasattr(kl_inst, "koopman") and kl_inst.koopman is not None:
                    eigs = kl_inst.koopman.get_eigenvalues().detach().cpu().numpy()
                    eig_plot_path = figures_dir / "koopman_eigenvalues.png"
                    plot_koopman_eigenvalues(eigs, str(eig_plot_path))
                    print(f"[INFO] Koopman polar spectrum exported to: {eig_plot_path}")
            except Exception as e:
                print(f"[WARNING] Skipping Koopman polar spectrum plot: {e}")

    # Display Markdown Table Summary on Console
    print("\n" + "=" * 78)
    print("  BENCHMARK SUMMARY REPORT")
    print("=" * 78)
    if md_table_path.exists():
        print(md_table_path.read_text(encoding="utf-8"))
    print("=" * 78)

    return 0


if __name__ == "__main__":
    sys.exit(main())
