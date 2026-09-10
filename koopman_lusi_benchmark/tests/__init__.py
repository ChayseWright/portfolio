"""
Koopman-LUSI-Net Benchmark: Automated E2E Test Suite
===================================================
Opaque-box, contract-driven test suite verifying model architectures,
data loaders, few-shot partitioning, baseline decoders, statistical testing,
and CLI entrypoints.
"""

import os
import sys
from pathlib import Path
import pytest
import numpy as np
import torch

# Ensure repository root and parent directories are in sys.path
TEST_DIR = Path(__file__).resolve().parent
REPO_ROOT = TEST_DIR.parent
WORKSPACE_ROOT = REPO_ROOT.parent

for p in [str(REPO_ROOT), str(WORKSPACE_ROOT), str(WORKSPACE_ROOT / "src")]:
    if p not in sys.path:
        sys.path.insert(0, p)

# Global test constants
SEED = 42
NUM_CLASSES = 4
BCI_CHANNELS = 22
PHYSIONET_CHANNELS = 64
TIME_SAMPLES = 400
OBSERVABLE_DIM = 48


def set_seed(seed: int = SEED):
    """Sets deterministic random seed across numpy and torch."""
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


@pytest.fixture(autouse=True)
def deterministic_seed():
    """Fixture ensuring every test runs under fixed seed."""
    set_seed(SEED)
