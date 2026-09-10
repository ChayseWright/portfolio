"""
Koopman-LUSI-Net Models Subpackage
"""

from .koopman_lusi import (
    MultiScaleSpatioTemporalEncoder,
    CayleyKoopmanOperator,
    BiophysicalPINNRegularizer,
    RiemannianLUSIRegularizer,
    CosinePrototypeClassifier,
    ModelOutput,
    KoopmanLUSINet,
)

from .baselines import (
    Conv2dWithConstraint,
    EEGNet42,
    EEGNet,
    ShallowFBCSPNet,
    RiemannianMDM,
    compute_sample_covariances,
    riemannian_distance,
    riemannian_karcher_mean,
    riemannian_alignment,
)

__all__ = [
    # Core Koopman-LUSI-Net architecture
    "MultiScaleSpatioTemporalEncoder",
    "CayleyKoopmanOperator",
    "BiophysicalPINNRegularizer",
    "RiemannianLUSIRegularizer",
    "CosinePrototypeClassifier",
    "ModelOutput",
    "KoopmanLUSINet",
    # Baseline decoders
    "Conv2dWithConstraint",
    "EEGNet42",
    "EEGNet",
    "ShallowFBCSPNet",
    "RiemannianMDM",
    "compute_sample_covariances",
    "riemannian_distance",
    "riemannian_karcher_mean",
    "riemannian_alignment",
]
