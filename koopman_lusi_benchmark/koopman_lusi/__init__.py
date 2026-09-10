"""
Koopman-LUSI Benchmark Package
==============================
A Physics-Informed, Statistical-Invariant Neural Architecture for
Few-Shot and Cross-Subject Motor Imagery Brain-Computer Interfaces.
"""

__version__ = "0.1.0"
__author__ = "Chayse Wright"

from .models.koopman_lusi import (
    MultiScaleSpatioTemporalEncoder,
    CayleyKoopmanOperator,
    BiophysicalPINNRegularizer,
    RiemannianLUSIRegularizer,
    CosinePrototypeClassifier,
    ModelOutput,
    KoopmanLUSINet,
)

__all__ = [
    "MultiScaleSpatioTemporalEncoder",
    "CayleyKoopmanOperator",
    "BiophysicalPINNRegularizer",
    "RiemannianLUSIRegularizer",
    "CosinePrototypeClassifier",
    "ModelOutput",
    "KoopmanLUSINet",
]
