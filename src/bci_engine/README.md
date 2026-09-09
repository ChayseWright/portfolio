# Koopman-LUSI-Net (KL-Net) BCI Engine
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChayseWright/portfolio/blob/main/notebooks/koopman_lusi_bci_showcase.ipynb)
[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](https://opensource.org/licenses/MIT)

A PyTorch architecture designed for **low-data, calibration-free cross-subject Motor Imagery (MI) Brain-Computer Interfaces**. KL-Net unites **Deep Koopman Operator Theory**, **Vapnik's Learning Using Statistical Invariants (LUSI)**, and **Physics-Informed Neural Network (PINN)** volume conduction constraints.

---

## Key Highlights

1. **Overcoming the Calibration Tax**:
   Standard BCI decoders degrade drastically when evaluated across novel human subjects without extensive calibration. KL-Net achieves robust cross-subject intent classification with as few as **2 to 5 calibration trials per class**.
2. **Deep Koopman Linearization**:
   Instead of treating non-stationary EEG as arbitrary images, KL-Net learns a spatio-temporal observable dictionary $\psi_\theta(\mathbf{x}) \in \mathbb{R}^K$ whose temporal state evolution is strictly linear:
   $$\psi_\theta(\mathbf{x}_{t+1}) \approx \mathbf{K} \psi_\theta(\mathbf{x}_t)$$
   Stable dissipative eigenvalues ($|\lambda_j| \le 1$) isolate natural sensorimotor oscillatory modes ($\mu \in [8, 12]\text{ Hz}$, $\beta \in [13, 30]\text{ Hz}$).
3. **Vapnik's Statistical Invariants (LUSI)**:
   Penalizes divergence between target sample empirical expectations and population invariant predicates derived from source subjects (covariance energy conservation and spectral damping ratios).
4. **PINN Scalp Current Source Density (CSD)**:
   Quasi-static Poisson volume conduction constraints enforce physical spatial smoothness across electrode topographies.

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
