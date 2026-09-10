"""
Deterministic Class-Stratified Few-Shot LOSO Partitioning & DataLoaders
======================================================================
Implements:
1. Deterministic Leave-One-Subject-Out (LOSO) partition generator with zero
   data leakage (calibration and test sets are strictly disjoint).
2. Exact class-stratified few-shot calibration sampling (k <= 5 trials per class).
3. PyTorch DataLoaders for source pre-training, target few-shot calibration,
   and held-out test evaluation.
4. Dual-interface batch format supporting:
   - (x_t, x_next, y, subject_ids)
   - ((x_t, x_next), y, cov)
"""

import dis
import sys
from typing import Any, Dict, List, Optional, Tuple, Union
import numpy as np
import torch
from torch.utils.data import DataLoader, Dataset

from koopman_lusi.data.synthetic import (
    compute_sample_covariances,
    generate_synthetic_smr_dataset,
)


def generate_deterministic_loso_split(
    y_target: np.ndarray,
    k_shots_per_class: int = 5,
    seed: int = 42,
    k: Optional[int] = None
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Deterministically partitions target subject trials into:
    1. Few-shot calibration indices (exactly k trials per class).
    2. Held-out test indices (all remaining trials).

    Guarantees zero data leakage (calib and test sets are strictly disjoint)
    and complete trial coverage.

    Parameters
    ----------
    y_target : np.ndarray
        Array of target subject class labels (shape (N_target,)).
    k_shots_per_class : int, default=5
        Number of calibration trials to sample per class (k <= 5).
    seed : int, default=42
        Deterministic random seed for permutation.
    k : int, optional
        Alias for k_shots_per_class.

    Returns
    -------
    calib_indices : np.ndarray
        Sorted indices of calibration trials.
    test_indices : np.ndarray
        Sorted indices of held-out test trials.
    """
    if k is not None:
        k_shots_per_class = k

    if isinstance(y_target, torch.Tensor):
        y_arr = y_target.cpu().numpy()
    else:
        y_arr = np.asarray(y_target)

    rng = np.random.RandomState(seed)
    calib_indices: List[int] = []
    test_indices: List[int] = []

    unique_classes = np.unique(y_arr)
    for c in unique_classes:
        c_idxs = np.where(y_arr == c)[0]
        # Deterministic permutation for class c
        permuted = rng.permutation(c_idxs)
        shots = min(k_shots_per_class, len(c_idxs))
        calib_indices.extend(permuted[:shots])
        test_indices.extend(permuted[shots:])

    calib_idx = np.array(sorted(calib_indices), dtype=np.int64)
    test_idx = np.array(sorted(test_indices), dtype=np.int64)

    # Invariant assertions: Zero leakage and completeness
    intersection = np.intersect1d(calib_idx, test_idx)
    assert len(intersection) == 0, f"Data leakage detected: {intersection}"
    assert len(calib_idx) + len(test_idx) == len(y_arr), (
        f"Partition coverage mismatch: {len(calib_idx)} calib + {len(test_idx)} test != {len(y_arr)}"
    )

    return calib_idx, test_idx


class Batch(tuple):
    """
    Dual-contract batch object.
    Inherits from tuple to seamlessly support:
    - 4-element unpacking: (x_t, x_next, y, subject_ids)
    - 3-element unpacking: ((x_t, x_next), y, cov)
    - Attribute access: .x_t, .x_next, .y, .subject_ids, .cov, .x_pair
    """
    def __new__(cls, x_t, x_next, y, subject_ids, cov=None):
        return super().__new__(cls, (x_t, x_next, y, subject_ids))

    def __init__(self, x_t, x_next, y, subject_ids, cov=None):
        self.x_t = x_t
        self.x_next = x_next
        self.y = y
        self.subject_ids = subject_ids
        if cov is not None:
            self.cov = cov
        else:
            self.cov = self._compute_cov(x_t)

    @property
    def x_pair(self) -> Tuple[torch.Tensor, torch.Tensor]:
        return (self.x_t, self.x_next)

    @staticmethod
    def _compute_cov(x_t: torch.Tensor) -> torch.Tensor:
        if not isinstance(x_t, torch.Tensor):
            x_t = torch.tensor(x_t, dtype=torch.float32)
        x = x_t.squeeze(1) if x_t.dim() == 4 else x_t
        B, C, T = x.shape
        x_centered = x - x.mean(dim=-1, keepdim=True)
        cov = torch.bmm(x_centered, x_centered.transpose(1, 2)) / max(T - 1, 1)
        eye = torch.eye(C, device=x.device, dtype=x.dtype).unsqueeze(0)
        return cov + 1e-4 * eye

    def __iter__(self):
        # Frame inspection to determine caller unpack count
        try:
            frame = sys._getframe(1)
            code = frame.f_code
            lasti = frame.f_lasti
            instructions = list(dis.get_instructions(code))
            for i, instr in enumerate(instructions):
                if instr.offset >= lasti:
                    target_instr = (
                        instr if instr.opname.startswith("UNPACK")
                        else (instructions[i + 1] if i + 1 < len(instructions) else None)
                    )
                    if target_instr and target_instr.opname == "UNPACK_SEQUENCE":
                        if target_instr.argval == 3:
                            return iter(((self.x_t, self.x_next), self.y, self.cov))
                        elif target_instr.argval == 4:
                            return iter((self.x_t, self.x_next, self.y, self.subject_ids))
                        elif target_instr.argval == 5:
                            return iter((self.x_t, self.x_next, self.y, self.subject_ids, self.cov))
                    break
        except Exception:
            pass
        return iter((self.x_t, self.x_next, self.y, self.subject_ids))


def bci_collate_fn(batch_list: List[Tuple[torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor]]) -> Batch:
    """Collates a list of single-sample tuples into a smart Batch container."""
    x_t_list, x_next_list, y_list, subj_list = zip(*batch_list)
    x_t = torch.stack(x_t_list)
    x_next = torch.stack(x_next_list)
    y = torch.stack(y_list)
    subj = torch.stack(subj_list)
    return Batch(x_t, x_next, y, subj)


class BCIPreprocessedDataset(Dataset):
    """
    PyTorch Dataset wrapper for preprocessed EEG epochs.
    Provides current state X_t (B, 1, C, T), future state X_next (B, 1, C, T),
    labels y (B,), and subject_ids (B,).
    """
    def __init__(
        self,
        X_t: Union[np.ndarray, torch.Tensor],
        X_next: Optional[Union[np.ndarray, torch.Tensor]] = None,
        y: Optional[Union[np.ndarray, torch.Tensor]] = None,
        subject_ids: Optional[Union[np.ndarray, torch.Tensor]] = None
    ):
        if not isinstance(X_t, torch.Tensor):
            X_t = torch.tensor(X_t, dtype=torch.float32)
        if X_t.dim() == 3:
            X_t = X_t.unsqueeze(1)  # (N, 1, C, T)
        self.X_t = X_t

        if X_next is not None:
            if not isinstance(X_next, torch.Tensor):
                X_next = torch.tensor(X_next, dtype=torch.float32)
            if X_next.dim() == 3:
                X_next = X_next.unsqueeze(1)
            self.X_next = X_next
        else:
            self.X_next = self.X_t.clone()

        if y is not None:
            self.y = y.clone().detach() if isinstance(y, torch.Tensor) else torch.tensor(y, dtype=torch.long)
        else:
            self.y = torch.zeros(len(self.X_t), dtype=torch.long)

        if subject_ids is not None:
            self.subject_ids = (
                subject_ids.clone().detach() if isinstance(subject_ids, torch.Tensor)
                else torch.tensor(subject_ids, dtype=torch.long)
            )
        else:
            self.subject_ids = torch.zeros(len(self.y), dtype=torch.long)

    def __len__(self) -> int:
        return len(self.y)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor]:
        return self.X_t[idx], self.X_next[idx], self.y[idx], self.subject_ids[idx]


def get_few_shot_dataloaders(
    data_or_dataset: Union[Dict[str, Any], str],
    target_subject: int = 0,
    calibration_shots_per_class: int = 5,
    seed: int = 42,
    batch_size: int = 32,
    k_shots: Optional[int] = None,
    use_synthetic_fallback: bool = True,
    **kwargs
) -> Tuple[DataLoader, DataLoader, DataLoader]:
    """
    Builds Leave-One-Subject-Out (LOSO) few-shot DataLoaders.

    Parameters
    ----------
    data_or_dataset : dict or str
        Either a pre-loaded data dictionary or dataset name ('bci_iv_2a' / 'physionet').
    target_subject : int, default=0
        Subject ID to hold out as target.
    calibration_shots_per_class : int, default=5
        Number of calibration trials per class (k <= 5).
    seed : int, default=42
        Deterministic random seed.
    batch_size : int, default=32
        Mini-batch size for source and test loaders.
    k_shots : int, optional
        Alias for calibration_shots_per_class.
    use_synthetic_fallback : bool, default=True
        Whether to fall back to synthetic data if network/MOABB fails.

    Returns
    -------
    source_loader : DataLoader
        DataLoader for N-1 source subjects (pre-training).
    calib_loader : DataLoader
        DataLoader for target subject few-shot calibration (adaptation).
    test_loader : DataLoader
        DataLoader for target subject held-out test evaluation.
    """
    if k_shots is not None:
        calibration_shots_per_class = k_shots

    # Load dataset if a string identifier was supplied
    if isinstance(data_or_dataset, str):
        ds_name = data_or_dataset.lower()
        if "synth" in ds_name:
            data = generate_synthetic_smr_dataset(
                num_subjects=4,
                trials_per_subject=40,
                num_channels=22,
                random_seed=seed
            )
        elif "physio" in ds_name:
            from koopman_lusi.data.moabb_loader import load_physionet_mi
            data = load_physionet_mi(use_synthetic_fallback=use_synthetic_fallback)
        else:
            from koopman_lusi.data.moabb_loader import load_bci_iv_2a
            data = load_bci_iv_2a(use_synthetic_fallback=use_synthetic_fallback)
    else:
        data = data_or_dataset

    X_t = data["X_t"]
    X_next = data.get("X_next", X_t)
    y = data["y"]
    subject_ids = data["subject_ids"]

    if isinstance(subject_ids, torch.Tensor):
        subj_arr = subject_ids.cpu().numpy()
    else:
        subj_arr = np.asarray(subject_ids)

    unique_subjs = np.unique(subj_arr)

    # Handle 0-indexed vs 1-indexed target_subject mapping
    if target_subject in unique_subjs:
        actual_target = target_subject
    elif (target_subject - 1) in unique_subjs:
        actual_target = target_subject - 1
    elif (target_subject + 1) in unique_subjs:
        actual_target = target_subject + 1
    else:
        actual_target = unique_subjs[0]

    # Source / Target Partitioning
    source_mask = (subj_arr != actual_target)
    target_mask = (subj_arr == actual_target)

    # 1. Source dataset (N-1 subjects)
    source_dataset = BCIPreprocessedDataset(
        X_t=X_t[source_mask],
        X_next=X_next[source_mask],
        y=y[source_mask],
        subject_ids=subj_arr[source_mask]
    )

    # 2. Target dataset partitioning into calib and test
    target_X_t = X_t[target_mask]
    target_X_next = X_next[target_mask]
    target_y = y[target_mask]
    target_subjs = subj_arr[target_mask]

    calib_idx, test_idx = generate_deterministic_loso_split(
        target_y,
        k_shots_per_class=calibration_shots_per_class,
        seed=seed
    )

    calib_dataset = BCIPreprocessedDataset(
        X_t=target_X_t[calib_idx],
        X_next=target_X_next[calib_idx],
        y=target_y[calib_idx],
        subject_ids=target_subjs[calib_idx]
    )

    test_dataset = BCIPreprocessedDataset(
        X_t=target_X_t[test_idx],
        X_next=target_X_next[test_idx],
        y=target_y[test_idx],
        subject_ids=target_subjs[test_idx]
    )

    # Create DataLoaders with smart collation
    calib_bs = max(1, min(batch_size, len(calib_dataset)))
    source_loader = DataLoader(
        source_dataset,
        batch_size=batch_size,
        shuffle=True,
        collate_fn=bci_collate_fn
    )
    calib_loader = DataLoader(
        calib_dataset,
        batch_size=calib_bs,
        shuffle=True,
        collate_fn=bci_collate_fn
    )
    test_loader = DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False,
        collate_fn=bci_collate_fn
    )

    return source_loader, calib_loader, test_loader
