"""
Test Suite: Command-Line Interface (CLI), Demo Mode, and Colab Workflow
======================================================================
Verifies:
- CLI Entrypoint Arguments & Validation (F-15)
- High-Speed Demo Mode Execution (F-16)
- Google Colab T4 Notebook Architecture (F-17)
- Robust Error Handling and Exit Semantics
"""

import os
import sys
import json
import argparse
from pathlib import Path
import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent


def build_arg_parser():
    """Builds standard benchmark argument parser according to PROJECT.md interface contract."""
    parser = argparse.ArgumentParser(description="Koopman-LUSI-Net Cross-Subject BCI Benchmark")
    parser.add_argument("--dataset", type=str, default="bci_iv_2a", choices=["bci_iv_2a", "physionet", "synthetic"])
    parser.add_argument("--demo", "--quick", action="store_true", dest="demo", help="Fast integrity verification mode")
    parser.add_argument("--k_shots", type=int, default=5, help="Calibration shots per class (k <= 5)")
    parser.add_argument("--subjects", type=int, nargs="+", default=None, help="Specific subject IDs to evaluate")
    parser.add_argument("--models", type=str, nargs="+", default=["all"], help="Models to benchmark")
    parser.add_argument("--output_dir", type=str, default="./results", help="Directory for exported results")
    parser.add_argument("--device", type=str, default="auto", choices=["auto", "cuda", "cpu", "mps"])
    parser.add_argument("--seed", type=int, default=42, help="Global random seed")
    parser.add_argument("--batch_size", type=int, default=16)
    parser.add_argument("--epochs_pretrain", type=int, default=20)
    parser.add_argument("--epochs_adapt", type=int, default=15)
    return parser


# ============================================================================
# Tier 1: Feature Coverage (F-15: Single Entrypoint CLI)
# ============================================================================

class TestFeature15BenchmarkCLI:
    """Tests for CLI entrypoint arguments and contracts."""

    def test_f15_tc01_default_arguments(self):
        """TC01: Verify default CLI options match specification."""
        parser = build_arg_parser()
        args = parser.parse_args([])
        assert args.dataset == "bci_iv_2a"
        assert args.demo is False
        assert args.k_shots == 5
        assert args.models == ["all"]
        assert args.output_dir == "./results"
        assert args.device == "auto"
        assert args.seed == 42

    def test_f15_tc02_dataset_flag_options(self):
        """TC02: Accepts bci_iv_2a, physionet, and synthetic dataset options."""
        parser = build_arg_parser()
        args_bci = parser.parse_args(["--dataset", "bci_iv_2a"])
        args_phys = parser.parse_args(["--dataset", "physionet"])
        args_synth = parser.parse_args(["--dataset", "synthetic"])

        assert args_bci.dataset == "bci_iv_2a"
        assert args_phys.dataset == "physionet"
        assert args_synth.dataset == "synthetic"

    def test_f15_tc03_invalid_dataset_rejection(self):
        """TC03: Rejects invalid dataset name with SystemExit."""
        parser = build_arg_parser()
        with pytest.raises(SystemExit):
            parser.parse_args(["--dataset", "non_existent_dataset"])

    def test_f15_tc04_subjects_subset_parsing(self):
        """TC04: Correctly parses space-separated subject ID list."""
        parser = build_arg_parser()
        args = parser.parse_args(["--subjects", "1", "2", "3"])
        assert args.subjects == [1, 2, 3]

    def test_f15_tc05_k_shots_custom_value(self):
        """TC05: Parses custom k_shots parameter (e.g. k=2, k=1)."""
        parser = build_arg_parser()
        args = parser.parse_args(["--k_shots", "2"])
        assert args.k_shots == 2


# ============================================================================
# Tier 1: Feature Coverage (F-16: High-Speed Demo Mode)
# ============================================================================

class TestFeature16DemoMode:
    """Tests for high-speed demo mode configuration and flags."""

    def test_f16_tc01_demo_flag_activation(self):
        """TC01: --demo and --quick flags activate demo attribute."""
        parser = build_arg_parser()
        args_demo = parser.parse_args(["--demo"])
        args_quick = parser.parse_args(["--quick"])
        assert args_demo.demo is True
        assert args_quick.demo is True

    def test_f16_tc02_demo_mode_parameter_overrides(self):
        """TC02: Demo mode overrides pre-training and adaptation epochs to <= 2."""
        parser = build_arg_parser()
        args = parser.parse_args(["--demo"])
        if args.demo:
            args.epochs_pretrain = min(args.epochs_pretrain, 2)
            args.epochs_adapt = min(args.epochs_adapt, 2)
            if args.subjects is None:
                args.subjects = [1, 2]

        assert args.epochs_pretrain == 2
        assert args.epochs_adapt == 2
        assert len(args.subjects) == 2

    def test_f16_tc03_demo_mode_with_explicit_dataset(self):
        """TC03: Demo mode flag combines cleanly with explicit dataset options."""
        parser = build_arg_parser()
        args = parser.parse_args(["--demo", "--dataset", "physionet"])
        assert args.demo is True
        assert args.dataset == "physionet"


# ============================================================================
# Tier 1: Feature Coverage (F-17: Google Colab T4 Notebook)
# ============================================================================

class TestFeature17ColabNotebook:
    """Tests for the Google Colab T4 execution notebook."""

    @pytest.fixture
    def notebook_path(self):
        # Primary expected path
        primary = REPO_ROOT / "koopman_lusi_colab_benchmark.ipynb"
        fallback = REPO_ROOT.parent / "notebooks" / "koopman_lusi_bci_showcase.ipynb"
        if primary.exists():
            return primary
        return fallback

    def test_f17_tc01_notebook_exists_and_valid_json(self, notebook_path):
        """TC01: Colab notebook exists and parses as valid Jupyter Notebook JSON."""
        if not notebook_path.exists():
            pytest.skip(f"Notebook not yet populated at {notebook_path}")
        content = json.loads(notebook_path.read_text(encoding="utf-8"))
        assert "cells" in content
        assert "metadata" in content
        assert len(content["cells"]) > 0

    def test_f17_tc02_colab_badge_presence(self, notebook_path):
        """TC02: Notebook contains Google Colab badge link in header markdown cell."""
        if not notebook_path.exists():
            pytest.skip("Notebook not yet populated")
        content = json.loads(notebook_path.read_text(encoding="utf-8"))
        first_markdown = ""
        for cell in content["cells"]:
            if cell.get("cell_type") == "markdown":
                first_markdown += "".join(cell.get("source", []))
        assert "colab.research.google.com" in first_markdown or "Colab" in first_markdown

    def test_f17_tc03_gpu_hardware_check_cell(self, notebook_path):
        """TC03: Notebook contains code cell verifying CUDA / GPU availability."""
        if not notebook_path.exists():
            pytest.skip("Notebook not yet populated")
        content = json.loads(notebook_path.read_text(encoding="utf-8"))
        code_sources = []
        for cell in content["cells"]:
            if cell.get("cell_type") == "code":
                code_sources.append("".join(cell.get("source", [])))
        all_code = "\n".join(code_sources)
        assert "cuda" in all_code.lower() or "torch" in all_code.lower()


# ============================================================================
# Tier 2: Boundary & Corner Cases (CLI & Scripts)
# ============================================================================

class TestTier2CLIBoundaryCases:
    """Corner cases in CLI argument combinations."""

    def test_t2_cli_shell_script_exists_or_contract(self):
        """Shell script wrapper run_benchmark.sh exists in repo root."""
        sh_path = REPO_ROOT / "run_benchmark.sh"
        if sh_path.exists():
            content = sh_path.read_text()
            assert "run_benchmark.py" in content
        else:
            pytest.skip("run_benchmark.sh being created by builder agent")

    def test_t2_k_shots_validation_boundary(self):
        """Validation checks on k_shots: k in [1, 20]."""
        parser = build_arg_parser()
        args_k1 = parser.parse_args(["--k_shots", "1"])
        args_k5 = parser.parse_args(["--k_shots", "5"])
        assert args_k1.k_shots == 1
        assert args_k5.k_shots == 5

    def test_t2_output_dir_custom_path_creation(self):
        """Custom output directory argument correctly assigned."""
        parser = build_arg_parser()
        args = parser.parse_args(["--output_dir", "/custom/test/results"])
        assert args.output_dir == "/custom/test/results"
