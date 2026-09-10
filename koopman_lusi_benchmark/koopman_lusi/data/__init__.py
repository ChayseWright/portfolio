"""
Data Ingestion, Caching, and Partitioning Package
================================================
Provides dataset pipelines for BCI Competition IV-2a and PhysioNet Motor Imagery,
high-fidelity physiological SMR synthetic fallback generators, local disk caching,
and class-stratified Leave-One-Subject-Out few-shot partitioners.
"""

from koopman_lusi.data.synthetic import (
    compute_sample_covariances,
    generate_synthetic_smr_dataset,
    generate_synthetic_motor_imagery,
)
from koopman_lusi.data.moabb_loader import (
    load_bci_iv_2a,
    load_physionet_mi,
)
from koopman_lusi.data.few_shot import (
    generate_deterministic_loso_split,
    get_few_shot_dataloaders,
    BCIPreprocessedDataset,
    Batch,
)

__all__ = [
    "compute_sample_covariances",
    "generate_synthetic_smr_dataset",
    "generate_synthetic_motor_imagery",
    "load_bci_iv_2a",
    "load_physionet_mi",
    "generate_deterministic_loso_split",
    "get_few_shot_dataloaders",
    "BCIPreprocessedDataset",
    "Batch",
]
