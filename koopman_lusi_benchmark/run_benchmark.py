#!/usr/bin/env python3
"""
Koopman-LUSI-Net Unified Benchmark Runner CLI
==============================================
Primary entrypoint for executing Leave-One-Subject-Out (LOSO) cross-validation
benchmarks of Koopman-LUSI-Net against standard BCI baselines across BCI IV-2a,
PhysioNet Motor Imagery, and Synthetic datasets.

Features:
- Fast Demo Mode (<60s on CPU): --demo
- Subject-by-Subject / Batched Execution: --subjects 1 2 3
- Incremental Checkpointing & Automatic Resume: --resume
- Standalone Checkpoint Parser & Report Aggregator: --aggregate
"""

import os
import sys
import json
import random
import argparse
from pathlib import Path
from typing import Any, Dict, List, Optional


def set_seed(seed: int = 42) -> None:
    """Sets deterministic random seeds across all libraries."""
    random.seed(seed)
    try:
        import numpy as np
        np.random.seed(seed)
    except ImportError:
        pass
    try:
        import torch
        torch.manual_seed(seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(seed)
            torch.backends.cudnn.deterministic = True
            torch.backends.cudnn.benchmark = False
    except ImportError:
        pass


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
        "--subject_batch",
        type=int,
        nargs="+",
        default=None,
        help="Alias for --subjects to run a specific batch of subjects",
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
    parser.add_argument(
        "--resume",
        action="store_true",
        default=True,
        help="Automatically resume from existing subject checkpoints in output_dir",
    )
    parser.add_argument(
        "--no_resume",
        action="store_false",
        dest="resume",
        help="Force re-evaluation of all subjects, ignoring existing checkpoints",
    )
    parser.add_argument(
        "--aggregate",
        "--parse",
        action="store_true",
        dest="aggregate",
        default=False,
        help="Aggregate and parse all saved subject checkpoints to generate publication tables and figures without training",
    )
    return parser


def validate_args(args: argparse.Namespace) -> None:
    """Validates CLI arguments and enforces contract boundaries."""
    if args.k_shots < 1 or args.k_shots > 20:
        sys.stderr.write(f"[ERROR] Invalid --k_shots: {args.k_shots}. Must satisfy 1 <= k <= 20.\n")
        sys.exit(2)


def resolve_device(device_choice: str) -> str:
    """Resolves 'auto' hardware accelerator choice to concrete device."""
    try:
        import torch
        if device_choice == "auto":
            if torch.cuda.is_available():
                return "cuda"
            elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
                return "mps"
            return "cpu"
        elif device_choice == "cuda":
            return "cuda" if torch.cuda.is_available() else "cpu"
    except ImportError:
        return "cpu"
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
    from koopman_lusi.models.koopman_lusi import KoopmanLUSINet
    from koopman_lusi.models.baselines import EEGNet42, ShallowFBCSPNet, RiemannianMDM

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
        "ShallowFBCSP": lambda: ShallowFBCSPNet(
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
        selected["KL-Net"] = registry["KL-Net"]
        selected["EEGNet-4,2"] = registry["EEGNet-4,2"]

    return selected


def main(argv: Optional[List[str]] = None) -> int:
    """Main execution function."""
    parser = build_arg_parser()
    args = parser.parse_args(argv)
    validate_args(args)

    # Resolve alias
    if args.subject_batch is not None and args.subjects is None:
        args.subjects = args.subject_batch

    # 1. Standalone Aggregate & Parse Mode
    if args.aggregate:
        print("=" * 78)
        print("  KOOPMAN-LUSI-NET RESULT AGGREGATOR & PARSER")
        print(f"  Scanning subject checkpoints in: {args.output_dir}")
        print("=" * 78)
        from koopman_lusi.evaluation.aggregate import aggregate_and_report
        results, stats = aggregate_and_report(
            output_dir=args.output_dir,
            baseline_name="EEGNet-4,2",
            no_figures=args.no_figures,
        )
        return 0

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
    print(f"  Subjects: {args.subjects if args.subjects else 'All Cohort'} | Resume: {args.resume}")
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
    checkpoints_dir = out_dir / "checkpoints"
    raw_dir.mkdir(parents=True, exist_ok=True)
    tables_dir.mkdir(parents=True, exist_ok=True)
    figures_dir.mkdir(parents=True, exist_ok=True)
    checkpoints_dir.mkdir(parents=True, exist_ok=True)

    # Execute LOSO Cross-Validation with Checkpoints & Resume
    print("[INFO] Starting Leave-One-Subject-Out few-shot adaptation loop...")
    from koopman_lusi.evaluation.loso import run_loso_evaluation
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
        output_dir=args.output_dir,
        resume=args.resume,
    )
    print("[INFO] Evaluation execution completed.")

    # Aggregate all completed checkpoints and generate publication artifacts
    print("\n[INFO] Aggregating all subject checkpoints and exporting publication artifacts...")
    from koopman_lusi.evaluation.aggregate import aggregate_and_report
    baseline_ref = "EEGNet-4,2" if "EEGNet-4,2" in models_dict else list(models_dict.keys())[-1]
    aggregate_and_report(
        output_dir=args.output_dir,
        baseline_name=baseline_ref,
        no_figures=args.no_figures,
        models_dict=models_dict,
    )

    return 0


if __name__ == "__main__":
    sys.exit(main())
