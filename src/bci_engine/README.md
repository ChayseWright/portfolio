# Koopman-LUSI-Net (KL-Net) BCI Engine
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChayseWright/portfolio/blob/main/notebooks/koopman_lusi_bci_showcase.ipynb)
[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](https://opensource.org/licenses/MIT)

A PyTorch architecture designed for **low-data, calibration-free cross-subject Motor Imagery (MI) Brain-Computer Interfaces**. KL-Net unites **Deep Koopman Operator Theory**, **Vapnik's Learning Using Statistical Invariants (LUSI)**, and **Physics-Informed Neural Network (PINN)** volume conduction constraints.

---

## Key Highlights (KL-Net v2 Enhancements)

1. **Multi-Scale Filterbank Temporal Convolutions**:
   Parallel temporal receptive fields (kernels 16, 32, 64) explicitly targeting upper $\beta$ (20–35 Hz), lower $\beta$ (13–20 Hz), and $\mu$ (8–12 Hz) rhythms prior to depthwise spatial mixing.
2. **Cayley-Parameterized Strictly Stable Koopman Operator**:
   Constructs the transition operator via the Cayley transform $\mathbf{K} = \text{diag}(\mathbf{d}) (\mathbf{I} - \mathbf{S})(\mathbf{I} + \mathbf{S})^{-1}$ from an unconstrained skew-symmetric generator $\mathbf{S} = -\mathbf{S}^T$. The spectral radius is **strictly guaranteed by construction** to satisfy $|\lambda_j| \le 1$, eliminating explosive eigenvalue drift.
3. **Riemannian Manifold & Class Separation LUSI Invariants**:
   Constrains the few-shot search space using empirical expectation predicates for between-class to within-class dispersion and observable covariance energy conservation under Vapnik's statistical invariant framework.
4. **Temperature-Scaled Cosine Prototype Classifier Head**:
   Replaces standard dense projections with angular cosine prototype classification ($\cos(\mathbf{\psi}, \mathbf{w}_c) / \tau$), eliminating weight norm blow-up during few-shot calibration ($k \le 5$ trials).

---

## Directory Structure

```
├── notebooks/
│   └── koopman_lusi_bci_showcase.ipynb   # Complete Google Colab GPU/TPU Showcase Notebook
├── src/bci_engine/
│   ├── models/
│   │   └── koopman_lusi.py               # PyTorch models (KL-Net, Koopman Operator, LUSI)
│   ├── data/
│   │   └── moabb_loader.py               # MOABB & physiological synthetic EEG generator
│   └── evaluation/
│       └── benchmark.py                  # Benchmarking engine vs. standard CNNs
```

---

## Running on Google Colab (GPU / TPU)

Click the **Open in Colab** badge at the top, or navigate to:
[Colab Link](https://colab.research.google.com/github/ChayseWright/portfolio/blob/main/notebooks/koopman_lusi_bci_showcase.ipynb)

Select **Runtime > Change runtime type** and choose **T4 GPU** or **TPU v2/v3** for hardware acceleration.
