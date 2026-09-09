"""
Evaluation & Benchmarking Engine for Koopman-LUSI-Net
=====================================================
Executes few-shot cross-subject adaptation experiments.
Compares:
1. Koopman-LUSI-Net (KL-Net) [Full Proposed Architecture]
2. Koopman-Only Net (Ablating LUSI Invariants)
3. Standard CNN Baseline (EEGNet-style, No Koopman, No LUSI)
"""

from typing import Dict, List
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

from ..models.koopman_lusi import KoopmanLUSINet
from ..data.moabb_loader import generate_synthetic_motor_imagery, get_few_shot_dataloaders


class StandardCNNBaseline(nn.Module):
    """
    Standard Compact CNN Baseline (adapted from EEGNet-4,2).
    Ablates both Koopman operator dynamics and Vapnik LUSI regularizers.
    """
    def __init__(self, num_classes: int = 4, num_channels: int = 22, time_samples: int = 400):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 16, (1, 32), padding=(0, 16), bias=False)
        self.bn1 = nn.BatchNorm2d(16)
        self.conv2 = nn.Conv2d(16, 32, (num_channels, 1), groups=16, bias=False)
        self.bn2 = nn.BatchNorm2d(32)
        self.elu = nn.ELU()
        self.pool = nn.AvgPool2d((1, 8), (1, 4))
        self.dropout = nn.Dropout(0.25)

        with torch.no_grad():
            dummy = torch.zeros(1, 1, num_channels, time_samples)
            x = self.conv1(dummy)
            x = self.conv2(x)
            x = self.pool(x)
            flat_dim = x.numel()

        self.classifier = nn.Linear(flat_dim, num_classes)

    def forward(self, x: torch.Tensor, *args) -> torch.Tensor:
        if x.dim() == 3:
            x = x.unsqueeze(1)
        x = self.conv1(x)
        x = self.bn1(x)
        x = self.conv2(x)
        x = self.bn2(x)
        x = self.elu(x)
        x = self.pool(x)
        x = self.dropout(x)
        return self.classifier(x.flatten(1))


def train_and_adapt(
    model: nn.Module,
    source_loader,
    calib_loader,
    test_loader,
    device: torch.device,
    pretrain_epochs: int = 10,
    adapt_epochs: int = 8,
    lr: float = 1e-3,
    is_kl_net: bool = True
) -> float:
    """
    Pre-trains on source subjects, adapts on scarce target calibration trials (few-shot),
    and evaluates accuracy on the target subject's held-out test set.
    """
    model.to(device)
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)

    # Phase 1: Source Pre-training
    model.train()
    for _ in range(pretrain_epochs):
        for x_t, x_next, y, _ in source_loader:
            x_t, x_next, y = x_t.to(device), x_next.to(device), y.to(device)
            optimizer.zero_grad()
            if is_kl_net:
                loss, _ = model.compute_loss(x_t, x_next, y)
            else:
                logits = model(x_t)
                loss = nn.functional.cross_entropy(logits, y)
            loss.backward()
            optimizer.step()

    # Phase 2: Few-Shot Calibration on Target Subject
    for _ in range(adapt_epochs):
        for x_t, x_next, y, _ in calib_loader:
            x_t, x_next, y = x_t.to(device), x_next.to(device), y.to(device)
            optimizer.zero_grad()
            if is_kl_net:
                loss, _ = model.compute_loss(x_t, x_next, y)
            else:
                logits = model(x_t)
                loss = nn.functional.cross_entropy(logits, y)
            loss.backward()
            optimizer.step()

    # Phase 3: Evaluation on Target Subject Test Data
    model.eval()
    correct = 0
    total = 0
    with torch.no_grad():
        for x_t, _, y, _ in test_loader:
            x_t, y = x_t.to(device), y.to(device)
            if is_kl_net:
                logits, _, _ = model(x_t)
            else:
                logits = model(x_t)
            preds = torch.argmax(logits, dim=1)
            correct += (preds == y).sum().item()
            total += y.size(0)

    return (correct / total) * 100.0 if total > 0 else 0.0


def run_comparative_benchmark(
    target_subject: int = 8,
    calibration_shots_per_class: int = 2
) -> Dict[str, float]:
    """
    Runs a direct head-to-head few-shot comparison.
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    data = generate_synthetic_motor_imagery(num_subjects=9, trials_per_subject=100)
    source_loader, calib_loader, test_loader = get_few_shot_dataloaders(
        data,
        target_subject=target_subject,
        calibration_shots_per_class=calibration_shots_per_class,
        batch_size=16
    )

    # 1. Full Koopman-LUSI-Net
    kl_net = KoopmanLUSINet(num_classes=4, num_channels=22, time_samples=400, observable_dim=48)
    acc_kl = train_and_adapt(kl_net, source_loader, calib_loader, test_loader, device, is_kl_net=True)

    # 2. Standard CNN (Ablating Koopman & LUSI)
    std_cnn = StandardCNNBaseline(num_classes=4, num_channels=22, time_samples=400)
    acc_cnn = train_and_adapt(std_cnn, source_loader, calib_loader, test_loader, device, is_kl_net=False)

    return {
        "Koopman-LUSI-Net (Proposed)": round(acc_kl, 2),
        "Standard CNN (Baseline)": round(acc_cnn, 2),
        "Absolute Gain": round(acc_kl - std_cnn_acc if (std_cnn_acc := acc_cnn) else 0.0, 2)
    }
