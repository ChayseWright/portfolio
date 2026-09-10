"""
High-Fidelity Sensorimotor Rhythm (SMR) Synthetic EEG Generator
==============================================================
Generates physiologically grounded synthetic Motor Imagery EEG datasets with
class-specific Event-Related Desynchronization (ERD) and Event-Related
Synchronization (ERS) dynamics across mu (8-12 Hz) and beta (13-30 Hz) bands,
colored 1/f pink noise, spatial volume conduction, and symmetric positive
definite (SPD) sample covariance matrices.

Enables zero-downtime offline testing, CI/CD verification, and fast demo runs
without external network downloads.
"""

from typing import Any, Dict, List, Optional
import numpy as np


def compute_sample_covariances(
    X: np.ndarray,
    shrink_alpha: float = 1e-4
) -> np.ndarray:
    """
    Computes regularized sample covariance matrices for EEG epochs.

    Parameters
    ----------
    X : np.ndarray
        EEG data tensor of shape (N, C, T).
    shrink_alpha : float, default=1e-4
        Shrinkage parameter toward identity scaled by trace mean to guarantee
        strict Symmetric Positive Definite (SPD) property.

    Returns
    -------
    covs : np.ndarray
        SPD covariance matrices of shape (N, C, C).
    """
    N, C, T = X.shape
    covs = np.zeros((N, C, C), dtype=np.float64)
    eye = np.eye(C, dtype=np.float64)

    for i in range(N):
        trial = X[i].astype(np.float64)
        trial_centered = trial - np.mean(trial, axis=-1, keepdims=True)
        cov = np.dot(trial_centered, trial_centered.T) / max(T - 1, 1)
        # Trace-normalized shrinkage
        trace_mean = np.trace(cov) / max(C, 1)
        cov_reg = (1.0 - shrink_alpha) * cov + shrink_alpha * trace_mean * eye
        # Guarantee strict symmetry
        cov_reg = 0.5 * (cov_reg + cov_reg.T)
        covs[i] = cov_reg

    return covs.astype(np.float32)


def generate_synthetic_smr_dataset(
    num_subjects: int = 9,
    trials_per_subject: int = 40,
    num_channels: int = 22,
    time_samples: int = 500,
    sampling_rate: int = 250,
    random_seed: int = 42,
    time_window: Optional[int] = 400,
    time_delay: Optional[int] = 100,
    num_classes: int = 4
) -> Dict[str, Any]:
    """
    Generates a high-fidelity synthetic Sensorimotor Rhythm (SMR) motor imagery
    EEG dataset across multiple subjects.

    Parameters
    ----------
    num_subjects : int, default=9
        Number of subjects in the cohort.
    trials_per_subject : int, default=40
        Total trials per subject (balanced uniformly across classes).
    num_channels : int, default=22
        Number of EEG electrode channels.
    time_samples : int, default=500
        Total time samples generated per trial before state-pair windowing.
    sampling_rate : int, default=250
        Sampling frequency in Hz.
    random_seed : int, default=42
        Deterministic random seed.
    time_window : int, optional
        Window length for current state X_t and future state X_next. Defaults to 400.
    time_delay : int, optional
        Temporal shift between X_t and X_next. Defaults to 100.
    num_classes : int, default=4
        Number of motor imagery classes (0: left, 1: right, 2: feet, 3: tongue/hands).

    Returns
    -------
    dict
        Dictionary containing:
        - 'X_t': (N_total, C, time_window) current state tensor.
        - 'X_next': (N_total, C, time_window) future state tensor.
        - 'y': (N_total,) integer class labels in 0..num_classes-1.
        - 'subject_ids': (N_total,) subject index for each trial.
        - 'cov': (N_total, C, C) SPD sample covariance matrices.
        - 'fs': sampling frequency (Hz).
        - 'channels': list of channel names.
    """
    rng = np.random.RandomState(random_seed)
    total_trials = num_subjects * trials_per_subject

    # Time axis (seconds)
    t = np.linspace(0, time_samples / sampling_rate, time_samples, endpoint=False)
    freqs = np.fft.rfftfreq(time_samples, d=1.0 / sampling_rate)

    # Pre-allocate full trial array: (total_trials, num_channels, time_samples)
    X_full = np.zeros((total_trials, num_channels, time_samples), dtype=np.float32)
    y = np.zeros(total_trials, dtype=np.int64)
    subject_ids = np.zeros(total_trials, dtype=np.int64)

    # 1/f noise spectral filter: 1 / f^(alpha/2)
    alpha = 1.2
    f_safe = np.maximum(freqs, 0.5)
    pink_filter = 1.0 / (f_safe ** (alpha / 2.0))
    pink_filter[0] = 0.0  # Zero DC component

    # Generate spatial mixing matrix (volume conduction)
    spatial_dist = np.abs(np.arange(num_channels)[:, None] - np.arange(num_channels)[None, :])
    spatial_kernel = np.exp(-spatial_dist / max(num_channels / 4.0, 1.0))
    spatial_kernel = spatial_kernel / np.sum(spatial_kernel, axis=-1, keepdims=True)

    trial_idx = 0
    for s in range(num_subjects):
        # Create balanced class labels for this subject
        subj_labels = np.array([i % num_classes for i in range(trials_per_subject)], dtype=np.int64)
        # Deterministic local shuffle per subject
        subj_rng = np.random.RandomState(random_seed + s * 1000)
        subj_labels = subj_rng.permutation(subj_labels)

        for c_lbl in subj_labels:
            trial_signal = np.zeros((num_channels, time_samples), dtype=np.float64)

            # 1. Background 1/f pink noise
            for ch in range(num_channels):
                white_real = subj_rng.randn(len(freqs))
                white_imag = subj_rng.randn(len(freqs))
                spec = (white_real + 1j * white_imag) * pink_filter
                noise = np.fft.irfft(spec, n=time_samples)
                trial_signal[ch] += 1.5 * noise

            # 2. Add physiological SMR oscillations with class-specific ERD/ERS
            # Base rhythm frequencies with slight subject-specific jitter
            mu_freq = 10.0 + 0.5 * subj_rng.randn()
            beta_freq = 20.0 + 1.0 * subj_rng.randn()

            # Random phase offsets
            mu_phase = subj_rng.uniform(0, 2 * np.pi, size=num_channels)
            beta_phase = subj_rng.uniform(0, 2 * np.pi, size=num_channels)

            # Spatial ERD/ERS modulation weights based on motor imagery class
            # Class 0: Left hand -> right hemisphere desynchronization (ERD)
            # Class 1: Right hand -> left hemisphere desynchronization (ERD)
            # Class 2: Both feet -> central/vertex desynchronization (Cz area)
            # Class 3: Tongue/hands -> bilateral motor modulation
            half_ch = num_channels // 2
            erd_weights_mu = np.ones(num_channels, dtype=np.float64)
            erd_weights_beta = np.ones(num_channels, dtype=np.float64)

            if c_lbl == 0:  # Left hand
                erd_weights_mu[half_ch:] = 0.3   # Right hemisphere ERD
                erd_weights_mu[:half_ch] = 1.4   # Left hemisphere ERS
                erd_weights_beta[half_ch:] = 0.4
                erd_weights_beta[:half_ch] = 1.3
            elif c_lbl == 1:  # Right hand
                erd_weights_mu[:half_ch] = 0.3   # Left hemisphere ERD
                erd_weights_mu[half_ch:] = 1.4   # Right hemisphere ERS
                erd_weights_beta[:half_ch] = 0.4
                erd_weights_beta[half_ch:] = 1.3
            elif c_lbl == 2:  # Both feet
                mid_start = max(0, half_ch - 3)
                mid_end = min(num_channels, half_ch + 3)
                erd_weights_mu[mid_start:mid_end] = 0.2  # Central vertex ERD
                erd_weights_beta[mid_start:mid_end] = 0.3
            elif c_lbl == 3:  # Tongue / Both hands
                erd_weights_mu = np.full(num_channels, 0.5)
                erd_weights_beta = np.full(num_channels, 1.2)

            # Modulate rhythms over time (active task from t >= 0.2s)
            task_envelope = 1.0 / (1.0 + np.exp(-10.0 * (t - 0.2)))

            for ch in range(num_channels):
                mu_amp = 1.0 + (erd_weights_mu[ch] - 1.0) * task_envelope
                beta_amp = 0.6 + (erd_weights_beta[ch] - 0.6) * task_envelope
                mu_wave = mu_amp * np.sin(2 * np.pi * mu_freq * t + mu_phase[ch])
                beta_wave = beta_amp * np.sin(2 * np.pi * beta_freq * t + beta_phase[ch])
                trial_signal[ch] += mu_wave + beta_wave

            # 3. Apply spatial volume conduction
            trial_signal = np.dot(spatial_kernel, trial_signal)

            # 4. Standardize channel variance per trial (Z-score)
            ch_mean = np.mean(trial_signal, axis=-1, keepdims=True)
            ch_std = np.std(trial_signal, axis=-1, keepdims=True) + 1e-6
            trial_signal = (trial_signal - ch_mean) / ch_std

            X_full[trial_idx] = trial_signal.astype(np.float32)
            y[trial_idx] = c_lbl
            subject_ids[trial_idx] = s
            trial_idx += 1

    # Slice into state pairs (X_t, X_next)
    win = min(time_window if time_window is not None else 400, time_samples)
    delay = time_delay if time_delay is not None else 100
    shift = min(delay, time_samples - win) if time_samples > win else 0

    X_t = X_full[:, :, :win].copy()
    if shift > 0:
        X_next = X_full[:, :, shift:shift + win].copy()
    else:
        X_next = X_full[:, :, :win].copy()

    # Compute regularized SPD sample covariance matrices on X_t
    cov = compute_sample_covariances(X_t)

    channel_names = [f"EEG_{i + 1}" for i in range(num_channels)]

    return {
        "X_t": X_t,
        "X_next": X_next,
        "y": y,
        "subject_ids": subject_ids,
        "cov": cov,
        "fs": int(sampling_rate),
        "channels": channel_names
    }


# Contract alias for test suite compatibility
generate_synthetic_motor_imagery = generate_synthetic_smr_dataset
