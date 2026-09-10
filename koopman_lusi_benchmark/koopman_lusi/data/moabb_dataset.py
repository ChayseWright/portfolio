"""
MOABB Dataset Module (Alias to moabb_loader)
===========================================
Exposes load_bci_iv_2a and load_physionet_mi for interface compatibility.
"""

from koopman_lusi.data.moabb_loader import (
    load_bci_iv_2a,
    load_physionet_mi,
    compute_sample_covariances,
)

__all__ = [
    "load_bci_iv_2a",
    "load_physionet_mi",
    "compute_sample_covariances",
]
