# Original User Request

## Initial Request — 2026-09-09T22:11:08Z

Execute a comprehensive leave-one-subject-out few-shot cross-validation benchmark of Koopman-LUSI-Net across all 9 subjects of BCI Competition IV-2a (with an automated evaluation pipeline for the 109-subject PhysioNet dataset), proving statistically significant accuracy gains over standard BCI baselines alongside ablation studies.

Working directory: ~/teamwork_projects/koopman_lusi_benchmark
Integrity mode: demo

## Requirements

### R1. Standalone Benchmark Repository & Pipeline
Initialize a standalone, version-controlled repository containing the complete Koopman-LUSI-Net model, data ingestion pipelines (BCI Competition IV-2a and PhysioNet via MOABB/MNE), and automated leave-one-subject-out few-shot evaluation scripts (k <= 5 calibration trials per class).

### R2. Baseline Implementations & Fair Comparative Evaluation
Implement and evaluate standard BCI baseline decoders (EEGNet-4,2, ShallowFBCSPNet, and Riemannian Minimum Distance to Mean) under identical data partitions, few-shot calibration constraints, and random seeds.

### R3. Comprehensive Ablation Study
Evaluate systematically ablative variants under identical training conditions:
- Full Koopman-LUSI-Net (Multi-scale filterbanks + Cayley Koopman dynamics + Riemannian LUSI + Cosine Prototypes)
- Koopman-Only Net (Ablating LUSI regularizers)
- LUSI-Only Net (Ablating Koopman dynamics)
- Unconstrained Base CNN (Ablating both)

### R4. Statistical Significance Testing & Reporting
Perform two-tailed paired Wilcoxon signed-rank tests and compute effect sizes (Cohen's d) between Koopman-LUSI-Net and all baseline models across all subjects, outputting publication-ready Markdown/LaTeX tables and distribution plots.

## Acceptance Criteria

### Statistical & Empirical Performance
- [ ] Koopman-LUSI-Net achieves statistically significant superior mean classification accuracy over the EEGNet baseline across the 9 BCI Competition IV-2a subjects (p < 0.05 via paired Wilcoxon signed-rank test).
- [ ] Ablation experiments prove positive incremental accuracy contributions (p < 0.05 or non-overlapping confidence intervals) for both the Koopman dynamics operator and the Vapnik LUSI regularizer independently.

### Automation & Reproducibility
- [ ] Running a single top-level entrypoint script (run_benchmark.sh or python run_benchmark.py --dataset bci_iv_2a) executes the complete cross-subject evaluation end-to-end without manual intervention.
- [ ] Generates a summary evaluation report containing per-subject accuracy matrices, mean +/- standard error metrics, p-values, and Cohen's d effect sizes.
- [ ] An automated extension script or flag (--dataset physionet) is provided and verified to ingest and evaluate the PhysioNet Motor Imagery dataset.

## Follow-up — 2026-09-09T22:12:00Z

The work should run out of a github repo and the agents should use that as the working directory. All project progress should be completed on github and run in colab with the T4s otherwise the training steps will take too long.
