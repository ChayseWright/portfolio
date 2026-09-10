# Koopman-LUSI-Net Benchmark: E2E Test Infrastructure & Quality Assurance Specification

**Document Version**: 2.0.0  
**Author**: `test_writer_e2e_1` (E2E Test Writer / QA Specialist)  
**Target Repository**: `koopman_lusi_benchmark/`  
**Date**: September 9, 2026  
**Status**: Authoritative & Active  

---

## 1. Test Philosophy & Core Principles

The Koopman-LUSI-Net (KL-Net) test framework is built on an **opaque-box (black-box), contract-driven testing methodology**. Tests verify mathematical properties, biological/physical constraints, and interface contracts derived strictly from `ORIGINAL_REQUEST.md`, `PROJECT.md`, and peer-reviewed scientific specifications, completely decoupled from private implementation details.

### 1.1 Core Axioms
1. **Mathematical Invariant Rigor**:
   - The Cayley-parameterized Koopman operator must maintain spectral radius $\rho(\mathbf{K}) = \max_j |\lambda_j(\mathbf{K})| < 1.0$ unconditionally under all parameter states.
   - The Cosine Prototype head must guarantee angular decision boundaries invariant to representation norm scaling.
   - Riemannian covariance matrices must remain symmetric positive definite (SPD) with strictly positive eigenvalues ($\lambda_i > 0$).
2. **Zero-Leakage Partition Fairness**:
   - In few-shot calibration ($k \le 5$ trials per class), calibration trials $\mathcal{D}_{calib}^{(s)}$ and held-out test trials $\mathcal{D}_{test}^{(s)}$ must be strictly disjoint ($\mathcal{D}_{calib}^{(s)} \cap \mathcal{D}_{test}^{(s)} = \emptyset$).
   - Identical partition indices and random seeds must be passed to all evaluated models (KL-Net, Koopman-Only, LUSI-Only, Base CNN, EEGNet-4,2, ShallowFBCSPNet, and Riemannian MDM) to prevent sample variance bias.
3. **Progressive Testability & Graceful Degradation**:
   - The test suite is self-contained. Tests can run against either the live implementation or contract-compliant mocks/stubs.
   - Offline tests execute using the physiological SMR synthetic generator without requiring live multi-gigabyte network downloads from BNCI or PhysioNet servers.
4. **Execution Determinism**:
   - All tests set fixed random seeds (`seed=42`) across NumPy, PyTorch, and SciPy to ensure 100% reproducible outcomes across operating systems (Linux, Windows, macOS, and Google Colab).
5. **No Facade Testing**:
   - Tests execute real tensor transformations, eigenvalue decompositions, gradient passes, and statistical tests. No vacuous or trivial tautologies (`assert True`) are permitted.

---

## 2. Feature Inventory & Verification Scope

Derived from `PROJECT.md` § Feature Inventory:

| Feature ID | Feature Name | Description | Target Module |
|---|---|---|---|
| **F-01** | Standalone Repo Scaffolding | PEP 517/518 build packaging, requirements, gitignore, license, readme | `pyproject.toml`, `setup.py`, root |
| **F-02** | Multi-Scale Filterbanks | Parallel temporal convolutions (16, 32, 64) and depthwise spatial mixing | `koopman_lusi.models.koopman_lusi` |
| **F-03** | Cayley Koopman Operator | Skew-symmetric generator with strictly bounded spectral radius (<1.0) | `koopman_lusi.models.koopman_lusi` |
| **F-04** | Riemannian LUSI Regularizer | Manifold trace conservation, damping spectrum matching, Fisher ratio | `koopman_lusi.models.koopman_lusi` |
| **F-05** | Cosine Prototype Classifier | Hyperspherical metric classification head with learnable temperature | `koopman_lusi.models.koopman_lusi` |
| **F-06** | Ablation Parameterization | Full KL-Net, Koopman-Only, LUSI-Only, and Base CNN with shared backbone | `koopman_lusi.models.koopman_lusi` / `ablations` |
| **F-07** | BCI IV-2a MOABB Loader | 9 subjects, 22 EEG channels @ 250 Hz, 4 motor imagery classes | `koopman_lusi.data.moabb_dataset` |
| **F-08** | PhysioNet MOABB Loader | 109 subjects, 64 EEG channels @ 160 Hz, 4 motor imagery classes | `koopman_lusi.data.moabb_dataset` |
| **F-09** | Dual-Tier Caching & Synthetic | Local .npz caching + sensorimotor ERD/ERS synthetic fallback for offline/CI | `koopman_lusi.data.synthetic` / cache |
| **F-10** | Stratified LOSO Protocol | Deterministic seed partitioning: N-1 train, k<=5 calibration, test split | `koopman_lusi.data.few_shot` |
| **F-11** | EEGNet-4,2 Baseline | Standard Lawhern et al. (2018) architecture with depthwise/separable convs | `koopman_lusi.models.baselines` |
| **F-12** | ShallowFBCSPNet Baseline | Schirrmeister et al. (2017) architecture with bandpass, squaring, SafeLog | `koopman_lusi.models.baselines` |
| **F-13** | Riemannian MDM Baseline | Covariance estimation with Ledoit-Wolf shrinkage, AIRM, Fréchet centroids | `koopman_lusi.models.baselines` |
| **F-14** | Unified Adaptation Harness | Three-phase train/calibrate/evaluate pipeline shared identically across all models | `koopman_lusi.evaluation.trainer` / `loso` |
| **F-15** | Single Entrypoint CLI | `run_benchmark.py` and `run_benchmark.sh` supporting --dataset, --demo, --k_shots | `run_benchmark.py`, `run_benchmark.sh` |
| **F-16** | High-Speed Demo Mode | `--demo` / `--quick` mode executing 2 subjects in <60s for rapid CI/CD | `run_benchmark.py` |
| **F-17** | Google Colab T4 Notebook | `koopman_lusi_colab_benchmark.ipynb` automated T4 execution, tables, plots | `koopman_lusi_colab_benchmark.ipynb` |
| **F-18** | Paired Wilcoxon Signed-Rank | Non-parametric two-tailed test across subjects (p < 0.05 vs EEGNet) | `koopman_lusi.stats.significance` |
| **F-19** | Paired Cohen's d / Hedges' g | Parametric effect size calculation with small-sample bias correction | `koopman_lusi.stats.significance` |
| **F-20** | Markdown & LaTeX Exporters | Automated generation of publication tables and 300 DPI distribution figures | `koopman_lusi.stats.reporting` |
| **F-21** | Full Verification & Audit | 100% E2E test pass (Tiers 1-4), adversarial test hardening, forensic audit clean | Entire repository |

---

## 3. Systematic 4-Tier Test Case Methodology

The test suite is structured into 4 distinct verification tiers:

```
+-----------------------------------------------------------------------------------------+
| Tier 4: Real-World Workload Scenarios (End-to-end runs, demo pipeline, export checks)   |
+-----------------------------------------------------------------------------------------+
                                            |
+-----------------------------------------------------------------------------------------+
| Tier 3: Cross-Feature Combinations (Pairwise models x datasets x few-shot conditions)   |
+-----------------------------------------------------------------------------------------+
                                            |
+-----------------------------------------------------------------------------------------+
| Tier 2: Boundary & Corner Cases (k=1 extreme few-shot, extreme shapes, numerical edges) |
+-----------------------------------------------------------------------------------------+
                                            |
+-----------------------------------------------------------------------------------------+
| Tier 1: Feature Coverage (>=5 test cases per feature across all 21 features = 105+ cases)|
+-----------------------------------------------------------------------------------------+
```

---

### 3.1 Tier 1: Feature Coverage Matrix (>=5 Test Cases per Feature)

#### F-01: Standalone Repo Scaffolding
- `test_f01_tc01_pyproject_validity`: Validates `pyproject.toml` syntax, project metadata, build backend, and dependencies.
- `test_f01_tc02_requirements_pinned`: Checks `requirements.txt` contains required dependencies (torch, numpy, scipy, moabb, mne, pyriemann).
- `test_f01_tc03_license_and_readme`: Asserts MIT LICENSE exists and README.md contains Colab badge, CLI usage, and math overview.
- `test_f01_tc04_gitignore_rules`: Verifies `.gitignore` ignores `data_cache/`, `*.npz`, `results/raw/`, `__pycache__/`, `*.pt`.
- `test_f01_tc05_package_import_structure`: Verifies `koopman_lusi` package root exposes version, models, data, evaluation, and stats modules.

#### F-02: Multi-Scale Filterbanks
- `test_f02_tc01_kernel_scales_dimensions`: Verifies temporal convolution branches have kernel widths 16, 32, 64 and output expected channels.
- `test_f02_tc02_spatial_depthwise_mixing`: Asserts spatial convolution groups equal total temporal filters, mixing across all electrodes.
- `test_f02_tc03_temporal_average_pooling`: Verifies temporal pooling downsamples time axis while preserving spatial dimensions.
- `test_f02_tc04_observable_projection_layer_norm`: Checks projection layer produces normalized observables of dimension $d=48$.
- `test_f02_tc05_gradient_backprop`: Confirms non-zero gradients flow through all three temporal branches during backward pass.

#### F-03: Cayley Koopman Operator
- `test_f03_tc01_skew_symmetric_parameterization`: Verifies $S = \frac{1}{2}(A - A^T)$ satisfies $S + S^T = 0$ to machine precision.
- `test_f03_tc02_cayley_transform_orthogonality`: Verifies $Q = (I - S)(I + S)^{-1}$ satisfies $Q^T Q = I$ and $|\det(Q)| = 1.0$.
- `test_f03_tc03_dissipative_damping_bounds`: Checks diagonal damping factors $d_i \in (0.85, 0.995]$.
- `test_f03_tc04_spectral_radius_strict_bound`: Confirms $\rho(\mathbf{K}) = \max_j |\lambda_j(\mathbf{K})| < 1.0$ unconditionally across 100 random initializations.
- `test_f03_tc05_multi_step_forward_rollout`: Tests recursive rollout $K^m \psi_0$ maintains stability without norm explosion over 10 steps.

#### F-04: Riemannian LUSI Regularizer
- `test_f04_tc01_covariance_trace_conservation`: Asserts observable trace discrepancy $\mathcal{L}_{cov} = (\frac{1}{d}\text{Tr}(C_\psi) - 1.0)^2 \ge 0$.
- `test_f04_tc02_damping_spectrum_target_matching`: Verifies damping discrepancy matches physiological target $\tau_{damping} = 0.93$.
- `test_f04_tc03_fisher_class_separation_ratio`: Asserts within-class to between-class scatter ratio is non-negative and penalizes cluster overlap.
- `test_f04_tc04_batch_size_graceful_handling`: Tests regularizer gracefully returns zero loss when batch size $m < 2$.
- `test_f04_tc05_gradient_flow_to_encoder`: Confirms LUSI loss backpropagates valid gradients into upstream encoder weights.

#### F-05: Cosine Prototype Classifier Head
- `test_f05_tc01_hyperspherical_normalization`: Verifies latent observables and prototype vectors are projected onto $\mathbb{S}^{d-1}$ ($\|v\|_2 = 1.0$).
- `test_f05_tc02_temperature_scaling_range`: Asserts learnable temperature $\tau$ is strictly clamped in $[0.01, 1.0]$.
- `test_f05_tc03_orthogonal_prototype_initialization`: Checks initial prototypes satisfy mutual orthogonality ($\cos(w_i, w_j) \approx 0$ for $i \ne j$).
- `test_f05_tc04_norm_invariance_property`: Verifies scaling input $\|\psi\| \to 100\|\psi\|$ produces identical output logits.
- `test_f05_tc05_logits_probability_simplex`: Asserts softmax of cosine logits produces a valid probability distribution summing to 1.0.

#### F-06: Ablation Parameterization
- `test_f06_tc01_full_klnet_active_losses`: Confirms `ablation_mode='full'` computes non-zero CE, Koopman, LUSI, and PINN losses.
- `test_f06_tc02_koopman_only_ablates_lusi`: Confirms `ablation_mode='koopman_only'` sets LUSI loss to 0.0 while preserving Koopman dynamics.
- `test_f06_tc03_lusi_only_ablates_koopman`: Confirms `ablation_mode='lusi_only'` disables Koopman dynamics loss while retaining covariance trace invariant.
- `test_f06_tc04_base_cnn_pure_erm`: Confirms `ablation_mode='base_cnn'` sets Koopman, LUSI, and PINN regularizers to 0.0 (pure cross-entropy).
- `test_f06_tc05_identical_encoder_weights`: Asserts all 4 ablation variants instantiate identical encoder architecture and parameter counts.

#### F-07: BCI IV-2a MOABB Loader
- `test_f07_tc01_subject_count_and_channels`: Verifies loader handles 9 subjects, 22 EEG channels, and discards 3 EOG channels.
- `test_f07_tc02_sampling_rate_250hz`: Confirms sampling rate metadata is 250 Hz.
- `test_f07_tc03_four_motor_imagery_classes`: Confirms labels map strictly to 0: left, 1: right, 2: feet, 3: tongue.
- `test_f07_tc04_bandpass_filtering_range`: Asserts default bandpass filter range is 4.0 Hz to 38.0 Hz.
- `test_f07_tc05_trial_epoch_length`: Verifies epoch slicing produces 400 time samples (1.6s) or 1000 time samples (4.0s).

#### F-08: PhysioNet MOABB Loader
- `test_f08_tc01_subject_count_and_channels`: Verifies loader handles 109 subjects and 64 EEG channels.
- `test_f08_tc02_sampling_rate_160hz`: Asserts native sampling rate is 160 Hz with optional resampling support.
- `test_f08_tc03_four_class_event_mapping`: Verifies PhysioNet events map to 4 classes (left fist, right fist, both fists, both feet).
- `test_f08_tc04_subject_subset_filtering`: Checks loading a specific subset of subjects (e.g. `[1, 2, 3]`) works seamlessly.
- `test_f08_tc05_time_samples_compatibility`: Asserts data tensor aligns with decoder `time_samples` parameter (400 or 480).

#### F-09: Dual-Tier Caching & Synthetic Fallback
- `test_f09_tc01_npz_cache_write_and_read`: Verifies loaded dataset is written to `.npz` and reloaded with identical array equality.
- `test_f09_tc02_synthetic_generator_shape`: Asserts `generate_synthetic_smr_dataset` produces exact `(N, C, T)` dimensions requested.
- `test_f09_tc03_synthetic_erd_ers_oscillations`: Checks synthetic signals exhibit mu (8–12 Hz) and beta (13–30 Hz) spectral power.
- `test_f09_tc04_offline_fallback_activation`: Asserts when MOABB raises network/import error, fallback to synthetic is triggered automatically.
- `test_f09_tc05_channel_covariance_spd`: Checks sample covariance matrices of synthetic signals are strictly symmetric positive definite.

#### F-10: Stratified LOSO Protocol
- `test_f10_tc01_source_target_disjoint`: Verifies target subject $s$ is strictly excluded from source training set ($N-1$ subjects).
- `test_f10_tc02_calibration_exact_k_shots`: Confirms calibration set contains exactly $k \times C_{classes}$ trials (e.g., $5 \times 4 = 20$).
- `test_f10_tc03_calibration_test_disjoint`: Asserts $\text{len}(\mathcal{D}_{calib} \cap \mathcal{D}_{test}) == 0$ (zero test leakage).
- `test_f10_tc04_stratified_class_balance`: Asserts exactly $k$ trials are sampled for each class in the calibration partition.
- `test_f10_tc05_deterministic_seed_repeatability`: Verifies identical calibration indices are produced across multiple runs with `seed=42`.

#### F-11: EEGNet-4,2 Baseline
- `test_f11_tc01_architecture_filters`: Asserts $F_1=4$ temporal filters, $D=2$ spatial depth multiplier, and $F_2=8$ separable filters.
- `test_f11_tc02_max_norm_constraint`: Checks spatial convolution weights are renormed to $\|\mathbf{w}\|_2 \le 1.0$.
- `test_f11_tc03_forward_shape`: Asserts input `(B, 1, 22, 400)` produces output `(B, 4)`.
- `test_f11_tc04_gradient_backprop`: Confirms standard cross-entropy loss backpropagates through all layers of EEGNet.
- `test_f11_tc05_eval_mode_determinism`: Verifies `eval()` mode disables dropout, producing identical outputs for identical inputs.

#### F-12: ShallowFBCSPNet Baseline
- `test_f12_tc01_bandpass_squaring_layer`: Asserts temporal conv followed by spatial conv and squaring activation extracts power.
- `test_f12_tc02_safelog_numerical_stability`: Asserts SafeLog $\log(\max(x, 10^{-6}))$ avoids $\log(0)$ and $-\infty$.
- `test_f12_tc03_forward_shape`: Asserts input `(B, 1, 22, 400)` produces output `(B, 4)`.
- `test_f12_tc04_large_pooling_window`: Checks pooling layer uses kernel $(1, 75)$ and stride $(1, 15)$.
- `test_f12_tc05_linear_head_weights`: Verifies output projection is a standard linear layer mapping to 4 classes.

#### F-13: Riemannian MDM Baseline
- `test_f13_tc01_covariance_computation`: Verifies SCM with Ledoit-Wolf shrinkage produces $(N, C, C)$ SPD matrices.
- `test_f13_tc02_airm_distance_properties`: Asserts Riemannian distance $\delta_R(P, P) = 0$, $\delta_R(P_1, P_2) = \delta_R(P_2, P_1) \ge 0$.
- `test_f13_tc03_riemannian_mean_computation`: Asserts Fréchet geometric mean converges to an SPD centroid.
- `test_f13_tc04_fit_predict_pipeline`: Tests `fit(X_calib, y_calib)` and `predict(X_test)` returns valid integer labels in $0..3$.
- `test_f13_tc05_riemannian_alignment`: Tests whitening by reference covariance $R^{-1/2} P R^{-1/2}$ centers distribution at $I_C$.

#### F-14: Unified Adaptation Harness
- `test_f14_tc01_three_phase_execution`: Asserts harness executes pre-training on source, adaptation on calibration, evaluation on test.
- `test_f14_tc02_metric_collection`: Checks harness collects Accuracy, Cohen's Kappa, and Macro-F1 score per subject.
- `test_f14_tc03_lr_schedule_decay`: Verifies learning rate follows cosine annealing schedule over adaptation epochs.
- `test_f14_tc04_loss_logging_per_epoch`: Asserts per-epoch loss values are recorded in history dictionary.
- `test_f14_tc05_shared_eval_across_models`: Confirms harness seamlessly evaluates both PyTorch neural nets and Riemannian MDM.

#### F-15: Single Entrypoint CLI
- `test_f15_tc01_default_args_parsing`: Verifies default CLI parameters: `--dataset bci_iv_2a`, `--k_shots 5`, `--output_dir ./results`.
- `test_f15_tc02_invalid_dataset_rejection`: Asserts CLI raises descriptive error when `--dataset invalid_name` is passed.
- `test_f15_tc03_k_shots_validation`: Checks CLI rejects $k \le 0$ or $k > 20$ with exit code 2.
- `test_f15_tc04_shell_wrapper_existence`: Asserts `run_benchmark.sh` exists, is executable, and references `run_benchmark.py`.
- `test_f15_tc05_device_auto_selection`: Verifies `--device auto` selects CUDA if available, else MPS, else CPU.

#### F-16: High-Speed Demo Mode
- `test_f16_tc01_demo_flag_detection`: Asserts `--demo` or `--quick` flag sets demo mode active.
- `test_f16_tc02_demo_subject_override`: Checks demo mode restricts evaluation to 2 subjects regardless of default count.
- `test_f16_tc03_demo_epoch_override`: Checks demo mode sets pretrain and adaptation epochs to $\le 2$.
- `test_f16_tc04_execution_time_under_60s`: Measures demo execution on synthetic data, confirming it completes in $<60\text{ seconds}$ on CPU.
- `test_f16_tc05_demo_artifact_emission`: Asserts demo mode writes valid summary table and results JSON before exiting.

#### F-17: Google Colab T4 Notebook
- `test_f17_tc01_notebook_json_validity`: Validates `koopman_lusi_colab_benchmark.ipynb` is valid Jupyter JSON format.
- `test_f17_tc02_colab_badge_presence`: Asserts notebook markdown cell includes Google Colab open badge URL.
- `test_f17_tc03_gpu_detection_cell`: Verifies notebook includes code cell checking `torch.cuda.is_available()`.
- `test_f17_tc04_git_clone_and_install_cells`: Checks cells contain `!git clone` and `!pip install -r requirements.txt`.
- `test_f17_tc05_benchmark_execution_cells`: Checks cells contain commands to run `--demo` and full `--dataset bci_iv_2a`.

#### F-18: Paired Wilcoxon Signed-Rank Test
- `test_f18_tc01_strictly_superior_exact_p`: Verifies when KL-Net strictly outperforms baseline on all 9 subjects, $p = 0.0039$ (exact two-tailed).
- `test_f18_tc02_zero_difference_handling`: Asserts zero differences are handled via Pratt or Wilcoxon zero-method without crashing.
- `test_f18_tc03_identical_distribution_p1`: Verifies identical arrays yield $p = 1.0$ and statistic $0.0$.
- `test_f18_tc04_rejection_of_null_threshold`: Confirms `significant = (p_value < 0.05)` boolean flag is accurate.
- `test_f18_tc05_small_n_exact_method`: Asserts exact permutation method is used when $N < 10$ (for $N=9$ BCI IV-2a subjects).

#### F-19: Paired Cohen's d and Hedges' g
- `test_f19_tc01_cohens_dz_formula`: Verifies $d_z = \bar{D} / s_D$ matches manual calculation on test vectors.
- `test_f19_tc02_hedges_g_bias_correction`: Asserts Hedges' $g = J(N-1) \cdot d_z$ where $J(8) = 1 - \frac{3}{31} \approx 0.9032$.
- `test_f19_tc03_zero_variance_handling`: Checks when all differences are identical, effect size handles $s_D = 0$ safely without ZeroDivisionError.
- `test_f19_tc04_effect_size_magnitude_labels`: Verifies qualitative labels: Negligible ($<0.2$), Small ($0.2-0.5$), Medium ($0.5-0.8$), Large ($0.8-1.2$), Very Large ($\ge 1.2$).
- `test_f19_tc05_negative_gain_effect_size`: Asserts when baseline outperforms model, effect size is negative with correct sign.

#### F-20: Markdown & LaTeX Exporters
- `test_f20_tc01_markdown_table_formatting`: Asserts exported Markdown table contains headers, model names, Mean $\pm$ SEM, and p-values.
- `test_f20_tc02_latex_table_booktabs_format`: Checks LaTeX output uses `\toprule`, `\midrule`, `\bottomrule` without syntax errors.
- `test_f20_tc03_per_subject_matrix_export`: Verifies per-subject raw accuracy matrix is saved as CSV and JSON.
- `test_f20_tc04_distribution_figure_creation`: Checks `plot_accuracy_distributions` emits a valid 300 DPI `.png` file.
- `test_f20_tc05_eigenvalue_polar_plot_export`: Checks Koopman eigenvalue polar spectrum plot is saved with unit circle overlay.

#### F-21: Full Verification & Audit
- `test_f21_tc01_no_hardcoded_accuracies`: Audits benchmark code to verify results are dynamically computed, not hardcoded constants.
- `test_f21_tc02_seed_consistency_across_runs`: Runs identical benchmark seed twice, asserting accuracy outputs match to $10^{-5}$.
- `test_f21_tc03_all_tier_tests_passing`: Verifies complete test suite executes without failures or unexpected skips.
- `test_f21_tc04_no_memory_leaks_in_loop`: Asserts GPU/CPU memory does not accumulate monotonically across LOSO folds.
- `test_f21_tc05_clean_results_directory_structure`: Asserts final benchmark execution populates `results/raw/`, `results/tables/`, `results/figures/`.

---

### 3.2 Tier 2: Boundary & Corner Cases (>=5 per Key Area)

#### Extreme Few-Shot Boundary ($k = 1$ Shot per Class)
- `test_t2_k1_few_shot_calibration`: Evaluates adaptation with exactly 1 trial per class ($k=1$, 4 total trials). Confirms optimizer does not NaN or crash.
- `test_t2_k1_cosine_head_stability`: Verifies Cosine Prototype head retains stable unit gradients when updated with a single sample per class.
- `test_t2_k1_riemannian_mdm_covariance`: Tests Riemannian MDM computes class centroids from a single covariance matrix without singularity.
- `test_t2_k1_lusi_class_separation_fallback`: Asserts LUSI Fisher class separation handles single-sample classes without division by zero.
- `test_t2_k1_accuracy_sanity`: Checks that $k=1$ accuracy is above random chance level (25% for 4 classes).

#### Extreme Tensor Shapes & Channel Counts
- `test_t2_shape_single_sample_batch`: Tests forward pass with batch size $B=1$ across all model architectures.
- `test_t2_shape_physionet_64_channels`: Tests models with $C=64$ channels and $T=480$ time samples (PhysioNet dimensions).
- `test_t2_shape_bci_22_channels`: Tests models with $C=22$ channels and $T=400$ time samples (BCI IV-2a dimensions).
- `test_t2_shape_minimal_time_window`: Tests models with minimal time window $T=128$ samples (0.5s at 250 Hz).
- `test_t2_shape_extreme_batch_size`: Tests forward pass with large batch size $B=128$ to ensure no memory overflow.

#### Edge Numerical Conditions
- `test_t2_num_near_zero_signal`: Tests model behavior when EEG input is near machine epsilon ($\sim 10^{-12}$).
- `test_t2_num_massive_voltage_spike`: Tests artifact resilience when an extreme spike ($1000\mu V$) occurs in one channel.
- `test_t2_num_constant_dc_channel`: Tests behavior when one electrode channel has zero variance ($x_{c, t} = \text{const}$).
- `test_t2_num_negative_temperature_clamp`: Tests cosine head when raw temperature parameter drives toward negative or zero.
- `test_t2_num_singular_covariance_shrinkage`: Tests sample covariance regularizer handles rank-deficient trials ($T < C$).

---

### 3.3 Tier 3: Cross-Feature Combinations

- `test_t3_combo_klnet_bci2a_k5`: Evaluates Full KL-Net on BCI IV-2a data with $k=5$ shots per class.
- `test_t3_combo_klnet_physionet_k3`: Evaluates Full KL-Net on PhysioNet 64-channel data with $k=3$ shots per class.
- `test_t3_combo_koopman_only_bci2a`: Evaluates Koopman-Only ablation on BCI IV-2a, checking absence of LUSI terms.
- `test_t3_combo_lusi_only_physionet`: Evaluates LUSI-Only ablation on PhysioNet, checking absence of Koopman terms.
- `test_t3_combo_base_cnn_cross_subject`: Evaluates Unconstrained Base CNN across LOSO folds as lower baseline bound.
- `test_t3_combo_eegnet_vs_klnet_significance`: Pipes simulated subject accuracies of KL-Net and EEGNet into Wilcoxon test, verifying p-value output.
- `test_t3_combo_mdm_riemannian_alignment`: Tests Riemannian MDM with and without Riemannian Alignment across subjects.
- `test_t3_combo_shallow_fbcsp_kshots`: Evaluates ShallowFBCSPNet under varying calibration constraints ($k=1, 2, 5$).
- `test_t3_combo_all_models_identical_split`: Evaluates all 7 models on the identical deterministic few-shot split indices.
- `test_t3_combo_stats_to_latex_markdown`: Generates results dictionary from 7 models $\times$ 9 subjects and verifies both Markdown and LaTeX tables export successfully.

---

### 3.4 Tier 4: Real-World Workload Scenarios

- `test_t4_workload_demo_mode_full_run`: Executes `run_benchmark.py --demo` programmatically, verifying complete execution in <60 seconds.
- `test_t4_workload_bci_iv_2a_2subject_pipeline`: Runs 2 subjects of BCI IV-2a through complete train, adapt, test, and stats pipeline.
- `test_t4_workload_physionet_pipeline`: Runs automated PhysioNet pipeline (`--dataset physionet --subjects 1 2 --k_shots 3`).
- `test_t4_workload_report_generation`: Verifies end-to-end generation of `benchmark_report.md`, `benchmark_table.tex`, and figure PNGs.
- `test_t4_workload_colab_notebook_dry_run`: Executes headless dry-run of notebook structure, verifying all imports and entrypoint invocations.

---

## 4. Test Runner Commands & Pass/Fail Semantics

### 4.1 Test Runner Commands

Run all tests from the repository root:
```bash
# Run complete test suite with detailed verbosity
pytest koopman_lusi_benchmark/tests -v

# Run specific test modules
pytest koopman_lusi_benchmark/tests/test_models.py -v
pytest koopman_lusi_benchmark/tests/test_data.py -v
pytest koopman_lusi_benchmark/tests/test_baselines.py -v
pytest koopman_lusi_benchmark/tests/test_loso.py -v
pytest koopman_lusi_benchmark/tests/test_stats.py -v
pytest koopman_lusi_benchmark/tests/test_cli.py -v

# Run by tier marker
pytest -m "tier1" -v
pytest -m "tier2" -v
pytest -m "tier3" -v
pytest -m "tier4" -v
```

### 4.2 Fast Smoke Test Command (<60s)
```bash
python run_benchmark.py --demo --device auto
```

### 4.3 Pass/Fail Semantics & Criteria
| Check | Threshold / Condition | Consequence of Failure |
|---|---|---|
| **Koopman Spectral Radius** | $\rho(\mathbf{K}) < 1.0$ strictly | Immediate FAIL (Dynamical divergence risk) |
| **Data Leakage** | $\text{len}(\text{calib} \cap \text{test}) == 0$ | Immediate FAIL (Invalid benchmark protocol) |
| **Calibration Sample Count** | Exactly $k \times C_{classes}$ | Immediate FAIL (Few-shot contract violation) |
| **Numerical Stability** | Zero NaN/Inf in logits, losses, weights | Immediate FAIL (Numerical explosion) |
| **Statistical Test** | $p \in [0.0, 1.0]$, $W \ge 0$, valid $d_z$ | Immediate FAIL (Statistical corruption) |
| **Demo Runtime** | $< 60$ seconds on standard CPU | Immediate FAIL (CI/CD timeout risk) |

---

## 5. Test Suite File Map

```
koopman_lusi_benchmark/tests/
├── __init__.py               # Test package initialization and shared test fixtures
├── test_models.py            # MultiScaleEncoder, CayleyKoopman, LUSI, CosineHead, Ablations
├── test_data.py              # MOABB loaders, synthetic generator, disk caching, preprocessing
├── test_baselines.py         # EEGNet-4,2, ShallowFBCSPNet, Riemannian MDM
├── test_loso.py              # LOSO splitting, partition fairness, deterministic seeding, adaptation
├── test_stats.py             # Wilcoxon signed-rank test, Cohen's d, Hedges' g, Markdown/LaTeX
└── test_cli.py               # Argument parsing, --demo mode, shell script, error handling
```
