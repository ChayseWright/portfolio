"""
BCI Engine: Koopman-LUSI-Net for Few-Shot Cross-Subject Motor Imagery Decoding.
Combines Deep Koopman Operator dynamics, Vapnik's Learning Using Statistical Invariants (LUSI),
and Biophysical PINN Volume Conduction Constraints.
"""

from .models.koopman_lusi import KoopmanLUSINet, DeepKoopmanOperator, LUSIRegularizer

__all__ = ["KoopmanLUSINet", "DeepKoopmanOperator", "LUSIRegularizer"]
