# Koopman-LUSI-Net: Physics-Informed, Statistical-Invariant Neural Architecture for Few-Shot Cross-Subject BCI

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/ChayseWright/koopman_lusi_benchmark/blob/main/koopman_lusi_colab_benchmark.ipynb)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![PyTorch 2.0+](https://img.shields.io/badge/pytorch-2.0+-ee4c2c.svg)](https://pytorch.org/)
[![MOABB Compatible](https://img.shields.io/badge/MOABB-1.0+-green.svg)](https://github.com/NeuroTechX/moabb)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 1. Executive Summary

Electroencephalography (EEG)-based Brain-Computer Interfaces (BCIs) suffer from severe inter-subject variability, non-stationarity, and volume conduction artifacts. Practical deployment requires calibration with minimal target trials ($k \le 5$ trials per class). Standard deep learning models overfit drastically in this scarce-data regime, while classical spatial filtering techniques fail to model underlying dynamical state transitions.

**Koopman-LUSI-Net (KL-Net)** unifies three rigorous mathematical disciplines to overcome these fundamental bottlenecks:
1. **Deep Koopman Operator Theory**: Transforms nonlinear neural phase transitions into a linear, strictly stable infinite-dimensional Hilbert space representation via a Lie-algebraic Cayley transform parameterization ($\rho(\mathbf{K}) \le 0.995 < 1.0$).
2. **Vapnik's Learning Using Statistical Invariants (LUSI)**: Regularizes the few-shot hypothesis space by constraining observable energy conservation, damping modes, and Fisher manifold scatter ratios against population priors and privileged Riemannian geometry.
3. **Hyperspherical Metric Classification**: Projects latent observables onto a unit hypersphere $\mathbb{S}^{d-1}$ with orthogonal prototype initialization and learnable temperature scaling, eliminating gradient-driven weight norm inflation.

This repository provides an end-to-end, automated Leave-One-Subject-Out (LOSO) few-shot cross-validation benchmark comparing KL-Net against standard BCI baselines (**EEGNet-4,2**, **ShallowFBCSPNet**, and **Riemannian MDM**) across all 9 subjects of **BCI Competition IV-2a** and 109 subjects of the **PhysioNet Motor Imagery** dataset.

---

## 2. Mathematical Foundations & Architecture

```
+--------------------------------------------------------------------------------------------------+
|                                    Raw EEG Trial: X_t in R^{C x T}                               |
+--------------------------------------------------------------------------------------------------+
                                                 |
                                                 v
+--------------------------------------------------------------------------------------------------+
| Multi-Scale Temporal Filterbanks (Parallel 1D Convolutions):                                     |
|   Scale 1 (Kernel 16 ~ 64 ms): High-Beta (20-35 Hz) Transient Bursts                             |
|   Scale 2 (Kernel 32 ~ 128 ms): Low-Beta (13-20 Hz) Rhythms                                      |
|   Scale 3 (Kernel 64 ~ 256 ms): Sensorimotor Mu (8-12 Hz) Desynchronization                      |
+--------------------------------------------------------------------------------------------------+
                                                 |
                                                 v
+--------------------------------------------------------------------------------------------------+
| Depthwise Spatial Mixing across C Channels + ELU + Temporal Average Pooling                      |
| Linear Observable Projection + LayerNorm                                                         |
| ==> Latent Observable Representation: \psi(X_t) in R^d                                           |
+--------------------------------------------------------------------------------------------------+
                                                 |
                        +------------------------+------------------------+
                        |                                                 |
                        v                                                 v
+------------------------------------------------+  +-----------------------------------------------+
| Cayley Koopman Dynamics Operator:              |  | Vapnik Riemannian LUSI Regularizer:           |
|   S = 0.5 * (A - A^T) in Lie algebra so(d)     |  |   1. Trace Energy Conservation                |
|   Q = (I - S)(I + S)^-1 in SO(d) (Orthogonal)  |  |   2. Koopman Damping Mode Matching            |
|   K = diag(d) * Q,  d_i in [0.85, 0.995]       |  |   3. Manifold Fisher Class Scatter Ratio      |
|   Loss: ||\psi(X_{t+1}) - K \psi(X_t)||^2      |  |   4. Privileged Covariance RSA Alignment      |
+------------------------------------------------+  +-----------------------------------------------+
                        |                                                 |
                        +------------------------+------------------------+
                                                 |
                                                 v
+--------------------------------------------------------------------------------------------------+
| Hyperspherical Cosine Prototype Classifier:                                                      |
|   z_c = cos(\psi(X_t), w_c) / \tau,  ||w_c||_2 = 1, ||\psi||_2 = 1                               |
|   Posterior: P(y = c | X_t) = softmax(z_c)                                                       |
+--------------------------------------------------------------------------------------------------+
```

### 2.1 Multi-Scale Spatio-Temporal Feature Encoder
Motor imagery modulates sensorimotor rhythms at distinct frequencies: $\mu$ desynchronization ($8 - 12\text{ Hz}$) and $\beta$ oscillations ($13 - 35\text{ Hz}$). The multi-scale temporal filterbank executes parallel temporal convolutions:
$$\mathbf{H}_1 = \text{Conv2D}_{1 \times 16}(\mathbf{X}), \quad \mathbf{H}_2 = \text{Conv2D}_{1 \times 32}(\mathbf{X}), \quad \mathbf{H}_3 = \text{Conv2D}_{1 \times 64}(\mathbf{X})$$
Concatenated temporal features are mixed across electrodes using depthwise spatial convolution:
$$\mathbf{H}_{\text{spatial}} = \text{Conv2D}_{C \times 1, \text{groups}=24}\left(\text{BatchNorm}([\mathbf{H}_1, \mathbf{H}_2, \mathbf{H}_3])\right)$$
Followed by ELU activation, temporal average pooling, and LayerNorm projection:
$$\mathbf{\psi}_\theta(\mathbf{x}) = \text{LayerNorm}\left(\mathbf{W}_{\text{proj}} \text{vec}(\mathbf{H}_{\text{pooled}}) + \mathbf{b}_{\text{proj}}\right) \in \mathbb{R}^d$$

### 2.2 Cayley-Parameterized Strictly Stable Koopman Dynamics Operator
Unconstrained linear operators $\mathbf{K}$ in latent space suffer from spectral instability: if $|\lambda(\mathbf{K})| > 1$, iterative multi-step forward rollouts explode exponentially. Conversely, pure unitary operators ($|\lambda| = 1$) ignore biophysical dissipation.

KL-Net resolves this via the **Cayley transform** from Lie group theory:
1. Skew-symmetric Lie algebra projection:
   $$\mathbf{S} = \frac{1}{2}(\mathbf{A} - \mathbf{A}^T) \implies \mathbf{S}^T = -\mathbf{S}$$
2. Cayley transform mapping $\mathfrak{so}(d) \to \mathbb{SO}(d)$:
   $$\mathbf{Q} = (\mathbf{I} - \mathbf{S})(\mathbf{I} + \mathbf{S})^{-1}$$
   Because $\lambda_k(\mathbf{S}) = i\omega_k$, $(\mathbf{I} + \mathbf{S})$ is unconditionally invertible, and $|\lambda_k(\mathbf{Q})| = 1$.
3. Learnable bounded dissipative damping:
   $$d_i = 0.85 + 0.145 \cdot \sigma(w_i) \in [0.85, 0.995]$$
   $$\mathbf{K} = \text{diag}(\mathbf{d}) \mathbf{Q}$$
   **Strict Spectral Radius Guarantee**:
   $$\rho(\mathbf{K}) = \max_j |\lambda_j(\mathbf{K})| \le \max_i(d_i) \le 0.995 < 1.0$$

### 2.3 Vapnik Riemannian LUSI & Privileged Information Regularization
In low-data regimes ($k \le 5$), empirical error minimization induces high variance. LUSI regularizes training by matching predicate expectations to prior invariants:
1. **Observable Energy Conservation**:
   $$\mathcal{L}_{\text{cov}} = \left(\frac{1}{d} \text{Tr}\left(\frac{1}{m}\sum_{i=1}^m \mathbf{\psi}_i \mathbf{\psi}_i^T\right) - 1.0\right)^2$$
2. **Damping Spectrum Invariant**:
   $$\mathcal{L}_{\text{damping}} = \left(\frac{1}{d} \sum_{j=1}^d |\lambda_j(\mathbf{K})| - 0.93\right)^2$$
3. **Fisher Class Separation Ratio**:
   $$\mathcal{L}_{\text{sep}} = \frac{S_W}{S_B + 10^{-5}}, \quad S_W = \sum_c \frac{1}{|N_c|}\sum_{i \in N_c}\|\mathbf{\psi}_i - \mathbf{\mu}_c\|_2^2, \quad S_B = \frac{1}{d}\sum_j \text{Var}_c(\mu_{c, j})$$
4. **Privileged Information Alignment**:
   Aligns observable batch Gram matrices with full-trial Riemannian covariance geometry $\mathbf{\Sigma}_i \in \mathcal{S}_{++}^C$:
   $$\mathcal{L}_{\text{priv}} = \|\text{CosineSim}(\mathbf{\psi}) - \text{CosineSim}(\text{vec}(\mathbf{\Sigma}))\|_F^2$$

### 2.4 Hyperspherical Cosine Prototype Classifier
Standard linear heads suffer from weight norm inflation on scarce calibration trials. KL-Net maps observables and orthogonal prototypes $\mathbf{w}_c$ onto $\mathbb{S}^{d-1}$:
$$z_c = \frac{\mathbf{\psi} \cdot \mathbf{w}_c}{\|\mathbf{\psi}\|_2 \|\mathbf{w}_c\|_2 \cdot \tau}$$
where $\tau = \text{clamp}(\exp(\text{log\_tau}), 0.01, 1.0)$ is a learnable temperature scale.

---

## 3. Systematic Ablation Taxonomy

To isolate the exact contribution of each architectural innovation under identical parameter budgets:

| Variant | Ablation Mode Flag | Multi-Scale Encoder | Cayley Koopman Dynamics | Riemannian LUSI Invariants | PINN CSD Constraint | Classifier Head |
|:---|:---|:---:|:---:|:---:|:---:|:---:|
| **Full KL-Net** | `ablation_mode='full'` | Yes | Active ($\alpha=0.10$) | Active ($\beta=0.08$) | Active ($\gamma=0.01$) | Cosine Prototypes |
| **Koopman-Only Net** | `ablation_mode='koopman_only'` | Yes | Active ($\alpha=0.10$) | **Ablated ($\beta=0.0$)** | Active ($\gamma=0.01$) | Cosine Prototypes |
| **LUSI-Only Net** | `ablation_mode='lusi_only'` | Yes | **Ablated ($\alpha=0.0$)** | Active ($\beta=0.08$) | Active ($\gamma=0.01$) | Cosine Prototypes |
| **Unconstrained Base CNN** | `ablation_mode='base_cnn'` | Yes | **Ablated ($\alpha=0.0$)** | **Ablated ($\beta=0.0$)** | **Ablated ($\gamma=0.0$)** | Cosine Prototypes |

---

## 4. Benchmark Baselines

All models are trained and calibrated under identical Leave-One-Subject-Out partitions with $k \le 5$ trials per class:
- **EEGNet-4,2** (Lawhern et al., 2018): Temporal convs + depthwise spatial filters + separable convs.
- **ShallowFBCSPNet** (Schirrmeister et al., 2017): Bandpass temporal convs + spatial filters + square activation + log pooling.
- **Riemannian MDM** (Barachant et al., 2012): Sample covariance estimation with Ledoit-Wolf shrinkage, Affine-Invariant Riemannian Metric (AIRM), and Fréchet mean geodesic classification.

---

## 5. Installation & Setup

### Requirements
- Python >= 3.9
- PyTorch >= 2.0.0
- MOABB >= 1.0.0
- MNE >= 1.5.0
- pyriemann >= 0.5

```bash
# Clone the repository
git clone https://github.com/ChayseWright/koopman_lusi_benchmark.git
cd koopman_lusi_benchmark

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install in editable mode with dependencies
pip install -e .
```

---

## 6. Execution & Benchmark CLI

### Quick Smoke Test (< 60 seconds)
Run a rapid verification test on synthetic motor imagery data:
```bash
python run_benchmark.py --dataset synthetic --demo --k_shots 2
```

### Full BCI Competition IV-2a LOSO Evaluation (9 Subjects)
```bash
python run_benchmark.py --dataset bci_iv_2a --k_shots 5 --device cuda
```

### Automated PhysioNet Motor Imagery Evaluation (109 Subjects)
```bash
python run_benchmark.py --dataset physionet --k_shots 5 --device cuda
```

### Single Shell Wrapper
```bash
bash run_benchmark.sh --dataset bci_iv_2a --k_shots 5
```

---

## 7. Google Colab T4 GPU Execution

Click the badge above or open `koopman_lusi_colab_benchmark.ipynb` in Google Colab:
1. Set runtime to **GPU (NVIDIA T4)**.
2. Run all cells: the notebook clones the repository, checks CUDA availability, runs the comparative benchmark, executes paired Wilcoxon signed-rank tests and Cohen's $d$ effect sizes, and displays publication-ready Markdown/LaTeX tables and polar eigenvalue distribution plots.

---

## 8. Statistical Significance Testing

The evaluation engine tests whether KL-Net achieves statistically significant superior mean classification accuracy over the baseline models across all subjects:
- **Two-Tailed Paired Wilcoxon Signed-Rank Test**: Non-parametric paired ranking test ($p < 0.05$ significance threshold).
- **Cohen's $d$ / Hedges' $g$**: Paired standardized mean difference effect size with small-sample bias correction.

---

## 9. Citation & References

```bibtex
@article{wright2026koopmanlusi,
  title={Koopman-LUSI-Net: Physics-Informed, Statistical-Invariant Neural Architecture for Few-Shot Cross-Subject Brain-Computer Interfaces},
  author={Wright, Chayse},
  journal={IEEE Transactions on Biomedical Engineering},
  year={2026}
}
```

- Vapnik, V., & Izmailov, R. (2015). Learning using privileged information: similarity control and knowledge transfer. *JMLR*.
- Lawhern, V. J., et al. (2018). EEGNet: a compact convolutional neural network for EEG-based brain-computer interfaces. *Journal of Neural Engineering*.
- Schirrmeister, R. T., et al. (2017). Deep learning with convolutional neural networks for EEG decoding and visualization. *Human Brain Mapping*.
- Barachant, A., et al. (2012). Multiclass brain-computer interface classification by Riemannian geometry. *IEEE TBME*.

---

## License
MIT License. Copyright (c) 2026 Chayse Wright.
