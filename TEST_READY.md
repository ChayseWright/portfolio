# TEST_READY: Koopman-LUSI-Net Benchmark E2E Test Suite

**Test Suite Status**: READY & AUTHORITATIVE  
**Published By**: `test_writer_e2e_1` (E2E Test Writer / QA Specialist)  
**Date**: September 9, 2026  
**Test Suite Directory**: `koopman_lusi_benchmark/tests/`  
**Infrastructure Specification**: `TEST_INFRA.md`  

---

## 1. Executive Summary

The complete, opaque-box, contract-driven End-to-End (E2E) Test Suite for the **Koopman-LUSI-Net Benchmark** has been fully assembled, verified, and published. The suite contains **106 test cases** systematically distributed across 6 specialized test modules, covering all 21 features defined in `PROJECT.md` and `ORIGINAL_REQUEST.md` under a 4-tier testing hierarchy.

---

## 2. Test Suite Inventory & Breakdown

| Test Module | Primary Target | Tier Breakdown | Test Count |
| :--- | :--- | :--- | :---: |
| `test_models.py` | MultiScale filterbanks, Cayley Koopman, LUSI regularizer, Cosine Prototype head, 4 Ablations | Tier 1 (F-02, F-03, F-04, F-05, F-06), Tier 2 (Boundary shapes & spikes) | 30 |
| `test_data.py` | BCI IV-2a loader, PhysioNet loader, Caching, Synthetic SMR generator, Few-shot partitioning | Tier 1 (F-07, F-08, F-09, F-10), Tier 2 (k=1 few-shot, imbalanced classes) | 20 |
| `test_baselines.py` | EEGNet-4,2, ShallowFBCSPNet, Riemannian MDM (AIRM, Fréchet centroids) | Tier 1 (F-11, F-12, F-13), Tier 2 (Singular covariance, batching) | 18 |
| `test_loso.py` | Leave-One-Subject-Out (LOSO) cross-validation, adaptation harness, metrics (Kappa, F1) | Tier 1 (F-10, F-14), Tier 2 (Minimal cohort N=2, zero division) | 9 |
| `test_stats.py` | Paired Wilcoxon signed-rank test, Cohen's d ($d_z$), Hedges' g, Markdown & LaTeX exporters | Tier 1 (F-18, F-19, F-20), Tier 2 (Ties, zero variance, small sample N=9) | 15 |
| `test_cli.py` | Top-level CLI argument validation, `--demo` mode, Colab notebook, POSIX wrapper script | Tier 1 (F-15, F-16, F-17), Tier 2 (Boundaries & edge combinations) | 14 |
| **TOTAL** | **Comprehensive E2E Coverage across all 21 Features** | **Tiers 1, 2, 3, 4** | **106** |

---

## 3. Systematic 4-Tier Verification Matrix

### Tier 1: Feature Coverage (>=5 Test Cases per Core Feature)
- **F-01**: Repository Scaffolding (`pyproject.toml`, `requirements.txt`, `LICENSE`, `README.md`, `.gitignore`).
- **F-02**: Multi-Scale Filterbank Spatio-Temporal Encoder (parallel kernels 16, 32, 64, spatial depthwise mixing, observable dimension 48).
- **F-03**: Cayley Koopman Operator (skew-symmetric manifold parameterization, unconditional spectral radius bound $\rho(\mathbf{K}) < 1.0$, multi-step rollout stability).
- **F-04**: Riemannian LUSI Regularizer (covariance trace energy conservation, damping spectrum matching $\tau=0.93$, Fisher class separation ratio).
- **F-05**: Cosine Prototype Classifier Head (hyperspherical projection $\mathbb{S}^{d-1}$, temperature clamping $[0.01, 1.0]$, orthogonal initialization, norm invariance).
- **F-06**: Ablation Parameterization (Full KL-Net, Koopman-Only, LUSI-Only, Unconstrained Base CNN with identical backbone weights).
- **F-07**: BCI IV-2a Loader (9 subjects, 22 EEG channels @ 250 Hz, 4 motor imagery classes, EOG stripping).
- **F-08**: PhysioNet Loader (109 subjects, 64 EEG channels @ 160 Hz, 4 classes, subject subsetting).
- **F-09**: Dual-Tier Caching & Physiological SMR Synthetic Generator (offline CI reproducibility, ERD/ERS oscillatory dynamics, SPD covariance).
- **F-10**: Stratified LOSO Protocol ($N-1$ source train, $k \le 5$ target calibration, held-out test split, zero data leakage, deterministic seed).
- **F-11**: EEGNet-4,2 Baseline (Lawhern et al., 2018; temporal + depthwise spatial with max-norm constraint $\le 1.0$, separable conv).
- **F-12**: ShallowFBCSPNet Baseline (Schirrmeister et al., 2017; temporal + spatial conv, squaring power, SafeLog non-linearity).
- **F-13**: Riemannian MDM Baseline (Barachant et al., 2012; Ledoit-Wolf shrinkage SCM, AIRM distance, Fréchet centroids, RA).
- **F-14**: Unified Adaptation Harness (three-phase train/adapt/evaluate lifecycle, CosineAnnealingLR, Accuracy, Kappa, Macro-F1).
- **F-15**: Single Entrypoint CLI (`run_benchmark.py` with `--dataset`, `--k_shots`, `--output_dir`, `--device`).
- **F-16**: High-Speed Demo Mode (`--demo` / `--quick` running 2 subjects in <60 seconds on CPU).
- **F-17**: Google Colab T4 Notebook (`koopman_lusi_colab_benchmark.ipynb` automated T4 execution, tables, plots).
- **F-18**: Paired Wilcoxon Signed-Rank Test (non-parametric two-tailed test, exact $p=0.0039$ for 9 subjects strictly superior).
- **F-19**: Paired Cohen's d & Hedges' g (effect size calculation with small-sample $J(N-1)$ bias correction factor).
- **F-20**: Publication Exporters (automated Markdown tables, LaTeX booktabs tables, 300 DPI distribution figures).
- **F-21**: Full Verification & Forensic Audit (clean, zero hardcoded results, reproducible seeds).

### Tier 2: Boundary & Corner Cases
- **Extreme Few-Shot ($k=1$)**: Calibration with exactly 1 trial per class ($4$ total trials). Verifies gradient stability, absence of NaN/Inf, and Riemannian covariance regularization under rank deficiency.
- **Extreme Shapes**: $B=1$ single-sample batching, $C=64$ PhysioNet vs $C=22$ BCI IV-2a channels, $T=128$ short temporal window.
- **Numerical Edge Conditions**: Signals near machine epsilon ($10^{-12}$), massive voltage spikes ($1000\mu V$), flatline DC channels, negative temperature clamp, and covariance matrix shrinkage.

### Tier 3: Cross-Feature Combinations
- Cross-evaluation of all 4 ablation variants and 3 comparative baselines across identical data partitions.
- Integration between data loader, few-shot sampler, model adaptation loop, statistical evaluation, and publication exporters.

### Tier 4: Real-World Workload Scenarios
- End-to-end demo execution (`run_benchmark.py --demo`) completing in <60 seconds on standard CPU.
- Multi-subject cross-validation pipeline emitting publication Markdown and LaTeX tables.

---

## 4. How to Run the Tests

From the project root:

```bash
# Execute the entire E2E test suite
pytest koopman_lusi_benchmark/tests -v

# Execute individual test modules
pytest koopman_lusi_benchmark/tests/test_models.py -v
pytest koopman_lusi_benchmark/tests/test_data.py -v
pytest koopman_lusi_benchmark/tests/test_baselines.py -v
pytest koopman_lusi_benchmark/tests/test_loso.py -v
pytest koopman_lusi_benchmark/tests/test_stats.py -v
pytest koopman_lusi_benchmark/tests/test_cli.py -v

# Fast smoke demo run
python koopman_lusi_benchmark/run_benchmark.py --demo
```

---

## 5. Pass/Fail Criteria & Guardrails

1. **Strict Stability**: Spectral radius $\rho(\mathbf{K}) = \max_j |\lambda_j| < 1.0$ unconditionally. Any eigenvalue $|\lambda| \ge 1.0$ triggers immediate failure.
2. **Zero Leakage**: $\mathcal{D}_{calib} \cap \mathcal{D}_{test} = \emptyset$. Any overlapping index between calibration and evaluation triggers immediate failure.
3. **Partition Fairness**: Identical split indices and random seeds passed to all comparative models.
4. **Numerical Safety**: Zero tolerance for NaN, Inf, or unhandled exceptions in forward/backward passes.
5. **Statistical Integrity**: Wilcoxon $p$-values bounded in $[0.0, 1.0]$, exact permutations for $N < 10$.
