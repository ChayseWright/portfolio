# Project: Koopman-LUSI-Net Benchmark

## Architecture
Standalone benchmark repository (`koopman_lusi_benchmark/`) implementing the complete Koopman-LUSI-Net model, comparative BCI baselines, dataset ingestion pipelines (BCI Competition IV-2a and PhysioNet), Leave-One-Subject-Out (LOSO) few-shot evaluation ($k \le 5$), statistical significance testing suite (paired Wilcoxon signed-rank test and Cohen's d), publication report generators (Markdown/LaTeX tables and distribution figures), and Google Colab T4 GPU execution notebook.

```
koopman_lusi_benchmark/
├── pyproject.toml
├── setup.py
├── requirements.txt
├── README.md
├── LICENSE
├── .gitignore
├── run_benchmark.py
├── run_benchmark.sh
├── koopman_lusi_colab_benchmark.ipynb
├── koopman_lusi/
│   ├── __init__.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── koopman_lusi.py
│   │   └── baselines.py
│   ├── data/
│   │   ├── __init__.py
│   │   ├── moabb_loader.py
│   │   └── synthetic.py
│   ├── evaluation/
│   │   ├── __init__.py
│   │   ├── loso.py
│   │   └── metrics.py
│   └── stats/
│       ├── __init__.py
│       ├── significance.py
│       └── reporting.py
└── tests/
    ├── __init__.py
    ├── test_models.py
    ├── test_data.py
    ├── test_baselines.py
    ├── test_loso.py
    ├── test_stats.py
    └── test_cli.py
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Standalone Repo Scaffolding | PEP 517/518 build packaging, requirements, gitignore, license, readme | M1 | R1, Survey |
| 2 | Multi-Scale Filterbanks | Parallel temporal convolutions (16, 32, 64) and depthwise spatial mixing | M1 | R1, R3, Survey |
| 3 | Cayley Koopman Operator | Skew-symmetric generator with strictly bounded spectral radius (<1.0) | M1 | R1, R3, Survey |
| 4 | Riemannian LUSI Regularizer | Manifold trace conservation, damping spectrum matching, Fisher ratio | M1 | R1, R3, Survey |
| 5 | Cosine Prototype Classifier | Hyperspherical metric classification head with learnable temperature | M1 | R1, R3, Survey |
| 6 | Ablation Parameterization | Full KL-Net, Koopman-Only, LUSI-Only, and Base CNN with shared backbone | M1 | R3, Survey |
| 7 | BCI IV-2a MOABB Loader | 9 subjects, 22 EEG channels @ 250 Hz, 4 motor imagery classes | M2 | R1, Survey |
| 8 | PhysioNet MOABB Loader | 109 subjects, 64 EEG channels @ 160 Hz, 4 motor imagery classes | M2 | R1, Survey |
| 9 | Dual-Tier Caching & Synthetic | Local .npz caching + sensorimotor ERD/ERS synthetic fallback for offline/CI | M2 | R1, Survey |
| 10 | Stratified LOSO Protocol | Deterministic seed partitioning: N-1 train, k<=5 calibration, test split | M2 | R1, Survey |
| 11 | EEGNet-4,2 Baseline | Standard Lawhern et al. (2018) architecture with depthwise/separable convs | M3 | R2, Survey |
| 12 | ShallowFBCSPNet Baseline | Schirrmeister et al. (2017) architecture with bandpass, squaring, SafeLog | M3 | R2, Survey |
| 13 | Riemannian MDM Baseline | Covariance estimation with Ledoit-Wolf shrinkage, AIRM, Fréchet centroids | M3 | R2, Survey |
| 14 | Unified Adaptation Harness | Three-phase train/calibrate/evaluate pipeline shared identically across all models | M3 | R2, Survey |
| 15 | Single Entrypoint CLI | `run_benchmark.py` and `run_benchmark.sh` supporting --dataset, --demo, --k_shots | M4 | R1, Acceptance, Survey |
| 16 | High-Speed Demo Mode | `--demo` / `--quick` mode executing 2 subjects in <60s for rapid CI/CD | M4 | R1, Acceptance, Survey |
| 17 | Google Colab T4 Notebook | `koopman_lusi_colab_benchmark.ipynb` automated T4 execution, tables, plots | M4 | R1, Follow-up, Survey |
| 18 | Paired Wilcoxon Signed-Rank | Non-parametric two-tailed test across subjects (p < 0.05 vs EEGNet) | M4 | R4, Acceptance, Survey |
| 19 | Paired Cohen's d / Hedges' g | Parametric effect size calculation with small-sample bias correction | M4 | R4, Survey |
| 20 | Markdown & LaTeX Exporters | Automated generation of publication tables and 300 DPI distribution figures | M4 | R4, Survey |
| 21 | Full Verification & Audit | 100% E2E test pass (Tiers 1-4), adversarial test hardening (Tier 5), forensic audit clean | M5 | Acceptance, Protocol |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Repository Scaffolding & Core Architecture | `koopman_lusi_benchmark/` packaging, core model, Cayley operator, LUSI regularizer, ablations | none | PLANNED |
| M2 | Data Ingestion & Few-Shot LOSO Protocol | MOABB BCI IV-2a & PhysioNet loaders, 2-tier cache, stratified partition generator (k<=5) | M1 | PLANNED |
| M3 | BCI Baselines & Unified Adaptation Harness | EEGNet-4,2, ShallowFBCSPNet, Riemannian MDM, shared training/calibration harness | M1, M2 | PLANNED |
| M4 | Benchmark CLI, Stats Suite, & Colab Notebook | `run_benchmark.py`, `run_benchmark.sh`, `--demo` mode, Wilcoxon/Cohen's d stats, Colab T4 notebook | M1, M2, M3 | PLANNED |
| M5 | Final Milestone: 100% E2E Test Pass & Adversarial Hardening | Pass 100% of E2E test suite (Tiers 1-4), Tier 5 adversarial hardening, forensic integrity audit | M1, M2, M3, M4, E2E Test Suite | PLANNED |

## Interface Contracts
### Data Ingestion ↔ Models
- `get_few_shot_dataloaders(dataset_name, target_subject, k_shots, seed, batch_size)` returns:
  - `source_loader`: DataLoader returning `((x_t, x_next), y, cov)` where `x_t, x_next` are `(B, 1, C, T)` and `cov` is `(B, C, C)` Riemannian covariance.
  - `calib_loader`: DataLoader returning target subject few-shot calibration samples ($k \times C_{classes}$ total samples).
  - `test_loader`: DataLoader returning target subject held-out evaluation samples.

### Models ↔ Evaluation Harness
- Model forward signature:
  - `model(x_t, x_next=None, privileged_cov=None) -> logits, loss_dict`
  - In evaluation mode: `logits = model(x_t)` or `predict(x_t) -> class_indices`.
  - For Riemannian MDM: `fit(X_train, y_train)`, `predict(X_test) -> y_pred`.

### Evaluation ↔ Statistical Suite
- `run_loso_evaluation(...)` returns a structured results dictionary:
  - `results[model_name][subject_id] = {'accuracy': float, 'kappa': float, 'f1': float}`
- `compute_statistical_significance(results, baseline_name='EEGNet-4,2')` returns:
  - `stats[model_name] = {'wilcoxon_stat': float, 'p_value': float, 'cohens_d': float, 'hedges_g': float, 'mean_acc': float, 'std_err': float}`

### Statistical Suite ↔ Exporters
- `export_markdown_table(stats, output_path)`
- `export_latex_table(stats, output_path)`
- `plot_accuracy_distributions(results, output_path)`

## Code Layout
Defined under `koopman_lusi_benchmark/`:
- `koopman_lusi_benchmark/koopman_lusi/models/`: Model architectures and ablations
- `koopman_lusi_benchmark/koopman_lusi/data/`: MOABB ingestion, preprocessing, synthetic fallbacks
- `koopman_lusi_benchmark/koopman_lusi/evaluation/`: LOSO cross-validation, metrics, adaptation loop
- `koopman_lusi_benchmark/koopman_lusi/stats/`: Wilcoxon test, Cohen's d, reporting exporters
- `koopman_lusi_benchmark/tests/`: Comprehensive test suite
- `koopman_lusi_benchmark/run_benchmark.py`: Top-level CLI entrypoint
- `koopman_lusi_benchmark/run_benchmark.sh`: Top-level shell script entrypoint
- `koopman_lusi_benchmark/koopman_lusi_colab_benchmark.ipynb`: Colab T4 GPU notebook
