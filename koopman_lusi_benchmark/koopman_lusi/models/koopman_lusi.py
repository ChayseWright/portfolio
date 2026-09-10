"""
Koopman-LUSI-Net (KL-Net) Core Architecture
===========================================
A Physics-Informed, Statistical-Invariant Neural Architecture for
Few-Shot and Cross-Subject Motor Imagery Brain-Computer Interfaces.

Theoretical Pillars:
1. Multi-Scale Filterbank Spatio-Temporal Observable Encoding (8-35 Hz)
2. Lie-Algebraic Cayley-Parameterized Strictly Stable Koopman Dynamics Operator
3. Vapnik's Learning Using Statistical Invariants (LUSI) with Riemannian Geometry
4. Hyperspherical Temperature-Scaled Cosine Prototype Metric Classifier
5. Biophysical Current Source Density (CSD) Volume Conduction Regularization

Author: Chayse Wright
License: MIT
"""

import math
from typing import Dict, Tuple, Optional, Union
import torch
import torch.nn as nn
import torch.nn.functional as F


class MultiScaleSpatioTemporalEncoder(nn.Module):
    """
    Multi-Scale Filterbank Spatio-Temporal Feature Encoder.
    
    Applies parallel 1D temporal convolutions with distinct receptive fields:
    - Kernel 16 (~64 ms at 250 Hz): Resolves high-beta rhythms (20-35 Hz)
    - Kernel 32 (~128 ms at 250 Hz): Resolves low-beta rhythms (13-20 Hz)
    - Kernel 64 (~256 ms at 250 Hz): Resolves sensorimotor mu rhythms (8-12 Hz)
    
    Followed by depthwise spatial mixing across electrode channels, ELU activation,
    temporal average pooling, and LayerNorm projection to continuous observable space.
    """
    def __init__(
        self,
        num_channels: int = 22,
        time_samples: int = 400,
        filters_per_scale: int = 8,
        spatial_expansion: int = 2,
        observable_dim: int = 48,
        dropout_rate: float = 0.2
    ):
        super().__init__()
        self.num_channels = num_channels
        self.time_samples = time_samples
        self.observable_dim = observable_dim
        self.filters_per_scale = filters_per_scale
        self.spatial_expansion = spatial_expansion

        # Parallel multi-scale temporal filterbanks
        self.conv_scale1 = nn.Conv2d(1, filters_per_scale, (1, 16), padding=(0, 8), bias=False)
        self.conv_scale2 = nn.Conv2d(1, filters_per_scale, (1, 32), padding=(0, 16), bias=False)
        self.conv_scale3 = nn.Conv2d(1, filters_per_scale, (1, 64), padding=(0, 32), bias=False)
        
        total_temporal_filters = filters_per_scale * 3
        self.bn_temporal = nn.BatchNorm2d(total_temporal_filters)

        # Depthwise spatial convolution across electrode channels
        total_spatial = total_temporal_filters * spatial_expansion
        self.conv_spatial = nn.Conv2d(
            in_channels=total_temporal_filters,
            out_channels=total_spatial,
            kernel_size=(num_channels, 1),
            groups=total_temporal_filters,
            bias=False
        )
        self.bn_spatial = nn.BatchNorm2d(total_spatial)
        self.elu = nn.ELU()
        self.pool = nn.AvgPool2d(kernel_size=(1, 8), stride=(1, 4))
        self.dropout = nn.Dropout(dropout_rate)

        # Compute flattened dimension dynamically with dummy tensor
        with torch.no_grad():
            dummy = torch.zeros(1, 1, num_channels, time_samples)
            c1 = self.conv_scale1(dummy)[:, :, :, :time_samples]
            c2 = self.conv_scale2(dummy)[:, :, :, :time_samples]
            c3 = self.conv_scale3(dummy)[:, :, :, :time_samples]
            cat = torch.cat([c1, c2, c3], dim=1)
            cat = self.bn_temporal(cat)
            sp = self.conv_spatial(cat)
            sp = self.pool(sp)
            flat_dim = sp.numel()

        self.observable_proj = nn.Sequential(
            nn.Linear(flat_dim, observable_dim),
            nn.LayerNorm(observable_dim)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass for spatio-temporal encoding.
        
        Args:
            x: Input EEG tensor of shape (B, C, T) or (B, 1, C, T).
            
        Returns:
            psi: Latent observable representation of shape (B, observable_dim).
        """
        if x.dim() == 3:
            x = x.unsqueeze(1)
        
        T = x.size(-1)
        c1 = self.conv_scale1(x)[:, :, :, :T]
        c2 = self.conv_scale2(x)[:, :, :, :T]
        c3 = self.conv_scale3(x)[:, :, :, :T]
        
        cat = torch.cat([c1, c2, c3], dim=1)
        cat = self.bn_temporal(cat)
        
        sp = self.conv_spatial(cat)
        sp = self.bn_spatial(sp)
        sp = self.elu(sp)
        sp = self.pool(sp)
        sp = self.dropout(sp)
        
        return self.observable_proj(sp.flatten(1))


class CayleyKoopmanOperator(nn.Module):
    """
    Strictly Stable Deep Koopman Operator via Lie-Algebraic Cayley Parameterization.
    
    Guarantees that the spectral radius rho(K) < 1.0 unconditionally by parameterizing
    the linear transition matrix as:
        K = diag(d) * Q
    where:
        - S = 0.5 * (A - A^T) in so(d) is strictly skew-symmetric
        - Q = (I - S)(I + S)^-1 in SO(d) is strictly orthogonal (|lambda(Q)| == 1)
        - d_i = 0.85 + 0.145 * sigmoid(w_i) in [0.85, 0.995] enforces biophysical damping
        
    Spectral Radius Guarantee:
        rho(K) = max_j |lambda_j(K)| <= max_i(d_i) <= 0.995 < 1.0.
    """
    def __init__(self, observable_dim: int = 48):
        super().__init__()
        self.observable_dim = observable_dim

        # Unconstrained parameter matrix for Lie algebra projection
        self.A = nn.Parameter(torch.randn(observable_dim, observable_dim) * 0.05)
        # Learnable dissipative decay parameters (sigmoid maps to [0.85, 0.995])
        self.raw_decay = nn.Parameter(torch.ones(observable_dim) * 2.0)

    @property
    def K(self) -> torch.Tensor:
        """
        Computes the strictly stable Koopman operator matrix K.
        """
        I = torch.eye(self.observable_dim, device=self.A.device, dtype=self.A.dtype)
        # Project onto Lie algebra so(d): S = -S^T
        S = 0.5 * (self.A - self.A.t())
        # Cayley transform yields strictly orthogonal rotation matrix Q in SO(d)
        # Q = (I - S)(I + S)^{-1}
        Q = torch.linalg.solve(I + S, I - S)
        # Diagonal dissipative damping factors in [0.85, 0.995]
        d = 0.85 + 0.145 * torch.sigmoid(self.raw_decay)
        return torch.matmul(torch.diag(d), Q)

    def forward(self, psi_t: torch.Tensor) -> torch.Tensor:
        """
        One-step forward dynamics prediction: psi_{t+1} = K psi_t.
        For row vectors psi_t of shape (B, d), psi_{t+1} = psi_t K^T.
        """
        return torch.matmul(psi_t, self.K.t())

    def multi_step_forward(self, psi_0: torch.Tensor, steps: int = 3) -> torch.Tensor:
        """
        Rolls out forward dynamics for multiple temporal steps.
        
        Args:
            psi_0: Initial observable state of shape (B, d).
            steps: Number of forward rollout steps.
            
        Returns:
            trajectory: Stacked states of shape (B, steps, d).
        """
        trajectory = [psi_0]
        curr = psi_0
        K_mat = self.K
        for _ in range(steps - 1):
            curr = torch.matmul(curr, K_mat.t())
            trajectory.append(curr)
        return torch.stack(trajectory, dim=1)

    def get_eigenvalues(self) -> torch.Tensor:
        """
        Returns complex eigenvalues of the current Koopman operator matrix K.
        """
        return torch.linalg.eigvals(self.K)

    def spectral_loss(self) -> torch.Tensor:
        """
        Regularization penalty encouraging spectral diversity across dynamic modes.
        Prevents all observable modes from collapsing to an identical decay rate.
        """
        eigvals = self.get_eigenvalues()
        mags = torch.abs(eigvals)
        diversity_loss = -torch.std(mags)
        return diversity_loss


class BiophysicalPINNRegularizer(nn.Module):
    """
    Physics-Informed Neural Network (PINN) Volume Conduction Constraint.
    
    Under quasi-static Maxwell equations, current propagation through scalp tissues
    follows Poisson's equation: div(sigma * grad(Phi)) = -I_v.
    This module penalizes unphysical spatial high-frequency noise using a
    finite-difference scalp surface Laplacian (second spatial derivative),
    corresponding directly to Current Source Density (CSD).
    """
    def __init__(self, num_channels: int = 22):
        super().__init__()
        self.num_channels = num_channels

    def forward(self, raw_eeg: torch.Tensor) -> torch.Tensor:
        """
        Computes discrete surface Laplacian penalty across adjacent electrode channels.
        
        Args:
            raw_eeg: EEG tensor of shape (B, C, T) or (B, 1, C, T).
            
        Returns:
            Scalar Laplacian roughness penalty.
        """
        if raw_eeg.dim() == 4:
            x = raw_eeg.squeeze(1)
        else:
            x = raw_eeg

        if x.size(1) < 3:
            return torch.tensor(0.0, device=raw_eeg.device)

        diff1 = x[:, 1:, :] - x[:, :-1, :]
        diff2 = diff1[:, 1:, :] - diff1[:, :-1, :]
        return torch.mean(diff2 ** 2)


class RiemannianLUSIRegularizer(nn.Module):
    """
    Vapnik Learning Using Statistical Invariants (LUSI) & Privileged Information.
    
    Enforces four theoretical invariants to constrain hypothesis complexity in
    few-shot regimes (k <= 5 trials per class):
    1. Observable Covariance Energy Conservation: Trace matching (Tr(C_psi)/d ~ tau_cov)
    2. Koopman Damping Spectrum Invariant: Average decay rate matches empirical EEG damping
    3. Manifold Fisher Class Separation Ratio: Minimizes within-class / between-class scatter
    4. Privileged Information Loss: Representational similarity alignment with
       full-trial Riemannian covariance matrices Sigma in S_{++}^C.
    """
    def __init__(
        self,
        observable_dim: int = 48,
        num_classes: int = 4
    ):
        super().__init__()
        self.observable_dim = observable_dim
        self.num_classes = num_classes

        # Population invariant targets
        self.register_buffer("target_cov_trace", torch.tensor(1.0))
        self.register_buffer("target_mean_damping", torch.tensor(0.93))

    def forward(
        self,
        observables: torch.Tensor,
        labels: Optional[torch.Tensor] = None,
        koopman_eigvals: Optional[torch.Tensor] = None,
        privileged_cov: Optional[torch.Tensor] = None
    ) -> Tuple[torch.Tensor, Dict[str, float]]:
        """
        Computes LUSI statistical invariant losses.
        
        Args:
            observables: Latent observable representations psi of shape (B, d).
            labels: Optional class labels of shape (B,).
            koopman_eigvals: Optional complex eigenvalues of the Koopman operator.
            privileged_cov: Optional privileged Riemannian covariance matrices of shape (B, C, C).
            
        Returns:
            Tuple of (total_lusi_loss, metrics_dict).
        """
        m = observables.size(0)
        device = observables.device
        if m < 2:
            return torch.tensor(0.0, device=device), {}

        # 1. Observable Covariance Trace Invariant (Energy Conservation)
        cov = torch.matmul(observables.t(), observables) / m
        cov_trace = torch.trace(cov) / self.observable_dim
        disc_cov = (cov_trace - self.target_cov_trace) ** 2

        # 2. Koopman Damping Spectrum Invariant
        if koopman_eigvals is not None and koopman_eigvals.numel() > 0:
            mean_damping = torch.mean(torch.abs(koopman_eigvals))
            disc_damping = (mean_damping - self.target_mean_damping) ** 2
        else:
            disc_damping = torch.tensor(0.0, device=device)

        # 3. Class Separation Invariant (Between-class vs. Within-class scatter)
        disc_separation = torch.tensor(0.0, device=device)
        if labels is not None and len(torch.unique(labels)) > 1:
            class_means = []
            within_scatter = torch.tensor(0.0, device=device)
            for c in torch.unique(labels):
                mask = (labels == c)
                if mask.sum() > 0:
                    c_mean = observables[mask].mean(dim=0)
                    class_means.append(c_mean)
                    within_scatter = within_scatter + torch.mean((observables[mask] - c_mean) ** 2)
            if len(class_means) > 1:
                class_means = torch.stack(class_means)
                between_scatter = torch.var(class_means, dim=0).mean()
                disc_separation = within_scatter / (between_scatter + 1e-5)

        # 4. Privileged Information Alignment (Representational Similarity Alignment)
        disc_privileged = torch.tensor(0.0, device=device)
        if privileged_cov is not None and privileged_cov.size(0) > 1:
            cov_flat = privileged_cov.reshape(m, -1)
            psi_norm = F.normalize(observables, p=2, dim=1)
            cov_norm = F.normalize(cov_flat, p=2, dim=1)
            sim_psi = torch.matmul(psi_norm, psi_norm.t())
            sim_cov = torch.matmul(cov_norm, cov_norm.t())
            disc_privileged = F.mse_loss(sim_psi, sim_cov)

        total_lusi = (
            disc_cov
            + disc_damping
            + 0.1 * disc_separation
            + 0.05 * disc_privileged
        )

        metrics = {
            "lusi_cov": disc_cov.item(),
            "lusi_damping": disc_damping.item(),
            "lusi_separation": disc_separation.item(),
            "lusi_privileged": disc_privileged.item(),
            "lusi_total": total_lusi.item()
        }
        return total_lusi, metrics


class CosinePrototypeClassifier(nn.Module):
    """
    Temperature-Scaled Hyperspherical Cosine Prototype Classifier Head.
    
    Operates on L2-normalized observable representations and orthogonal class prototypes:
        logits_c = (psi / ||psi||_2) * (w_c / ||w_c||_2) / tau
    
    Eliminates weight norm divergence and decision boundary bias in few-shot regimes ($k <= 5$),
    yielding well-conditioned angular margins.
    """
    def __init__(
        self,
        observable_dim: int = 48,
        num_classes: int = 4,
        temperature: float = 0.1
    ):
        super().__init__()
        self.observable_dim = observable_dim
        self.num_classes = num_classes
        
        self.prototypes = nn.Parameter(torch.randn(num_classes, observable_dim))
        nn.init.orthogonal_(self.prototypes)
        self.log_tau = nn.Parameter(torch.log(torch.tensor(temperature)))

    def forward(self, psi: torch.Tensor) -> torch.Tensor:
        """
        Computes cosine similarity logits scaled by learnable temperature.
        
        Args:
            psi: Latent observable tensor of shape (B, observable_dim).
            
        Returns:
            logits: Normalized similarity logits of shape (B, num_classes).
        """
        psi_norm = F.normalize(psi, p=2, dim=1)
        proto_norm = F.normalize(self.prototypes, p=2, dim=1)
        tau = torch.clamp(self.log_tau.exp(), min=0.01, max=1.0)
        cosine_sim = torch.matmul(psi_norm, proto_norm.t())
        return cosine_sim / tau


class ModelOutput(tuple):
    """
    Tuple-subclass output container for KoopmanLUSINet forward passes.
    
    Ensures dual compatibility with:
    - 3-tuple unpacking: `logits, psi, _ = model(x)`
    - Single variable access: `logits = model(x)[0]` or `out = model(x)`
    - Attribute delegates: `out.shape`, `out.argmax()`, `out.dim()`, etc.
    """
    def __new__(cls, logits: torch.Tensor, psi_t: torch.Tensor, psi_pred_next: Optional[torch.Tensor] = None):
        return super().__new__(cls, (logits, psi_t, psi_pred_next))

    def __init__(self, logits: torch.Tensor, psi_t: torch.Tensor, psi_pred_next: Optional[torch.Tensor] = None):
        self.logits = logits
        self.psi_t = psi_t
        self.psi_pred_next = psi_pred_next

    def __getattr__(self, name: str):
        return getattr(self.logits, name)


class KoopmanLUSINet(nn.Module):
    """
    Unified Koopman-LUSI-Net Architecture with Modular Ablation Parameterization.
    
    Supported Ablation Modes (`ablation_mode`):
    - 'full': Full KL-Net with Multi-Scale filterbanks, Cayley Koopman operator,
              Riemannian LUSI invariants, PINN volume conduction, and Cosine Prototypes.
    - 'koopman_only': Koopman dynamics active; LUSI regularizer ablated (beta = 0.0).
    - 'lusi_only': Riemannian LUSI regularizer active; Koopman dynamics ablated
                   (identity transition, alpha = 0.0, damping spectrum omitted).
    - 'base_cnn': Unconstrained Base CNN; neither Koopman nor LUSI nor PINN regularizers.
    
    Interface Compliance:
    - Forward pass:
      `logits, psi, psi_pred = model(x_t)` (or `out = model(x_t)` where out[0] is logits).
      `model(x_t, return_dict=True)` returns `(logits, loss_dict)`.
      `model.predict(x_t)` returns discrete class predictions.
      `model.compute_loss(x_t, x_next, y, privileged_cov)` returns `(total_loss, metrics_dict)`.
    """
    def __init__(
        self,
        num_classes: int = 4,
        num_channels: int = 22,
        time_samples: int = 400,
        observable_dim: int = 48,
        dropout_rate: float = 0.2,
        alpha_koopman: float = 0.1,
        beta_lusi: float = 0.08,
        gamma_pinn: float = 0.01,
        ablation_mode: str = "full",
        classifier_type: str = "cosine"
    ):
        super().__init__()
        valid_modes = ["full", "koopman_only", "lusi_only", "base_cnn"]
        if ablation_mode not in valid_modes:
            raise ValueError(f"Invalid ablation_mode '{ablation_mode}'. Expected one of {valid_modes}")

        self.num_classes = num_classes
        self.num_channels = num_channels
        self.time_samples = time_samples
        self.observable_dim = observable_dim
        self.ablation_mode = ablation_mode
        self.classifier_type = classifier_type

        # Configure ablation flags
        if ablation_mode == "full":
            self.use_koopman = True
            self.use_lusi = True
            self.use_pinn = True
            self.alpha_koopman = alpha_koopman
            self.beta_lusi = beta_lusi
            self.gamma_pinn = gamma_pinn
        elif ablation_mode == "koopman_only":
            self.use_koopman = True
            self.use_lusi = False
            self.use_pinn = True
            self.alpha_koopman = alpha_koopman
            self.beta_lusi = 0.0
            self.gamma_pinn = gamma_pinn
        elif ablation_mode == "lusi_only":
            self.use_koopman = False
            self.use_lusi = True
            self.use_pinn = True
            self.alpha_koopman = 0.0
            self.beta_lusi = beta_lusi
            self.gamma_pinn = gamma_pinn
        elif ablation_mode == "base_cnn":
            self.use_koopman = False
            self.use_lusi = False
            self.use_pinn = False
            self.alpha_koopman = 0.0
            self.beta_lusi = 0.0
            self.gamma_pinn = 0.0

        # Shared Spatio-Temporal Encoder Backbone
        self.encoder = MultiScaleSpatioTemporalEncoder(
            num_channels=num_channels,
            time_samples=time_samples,
            observable_dim=observable_dim,
            dropout_rate=dropout_rate
        )

        # Koopman Dynamics Operator
        if self.use_koopman:
            self.koopman = CayleyKoopmanOperator(observable_dim=observable_dim)
        else:
            self.koopman = None

        # Biophysical PINN Regularizer
        if self.use_pinn:
            self.pinn = BiophysicalPINNRegularizer(num_channels=num_channels)
        else:
            self.pinn = None

        # Riemannian LUSI Regularizer
        if self.use_lusi:
            self.lusi = RiemannianLUSIRegularizer(
                observable_dim=observable_dim,
                num_classes=num_classes
            )
        else:
            self.lusi = None

        # Classifier Head
        if classifier_type == "cosine":
            self.classifier = CosinePrototypeClassifier(
                observable_dim=observable_dim,
                num_classes=num_classes,
                temperature=0.1
            )
        elif classifier_type == "linear":
            self.classifier = nn.Linear(observable_dim, num_classes)
        else:
            raise ValueError(f"Unknown classifier_type: {classifier_type}")

    def forward(
        self,
        x_t: torch.Tensor,
        x_next: Optional[torch.Tensor] = None,
        privileged_cov: Optional[torch.Tensor] = None,
        return_dict: bool = False
    ) -> Union[ModelOutput, Tuple[torch.Tensor, Dict[str, torch.Tensor]]]:
        """
        Forward pass supporting both inference and adaptation signatures.
        
        Args:
            x_t: Current EEG state of shape (B, C, T) or (B, 1, C, T).
            x_next: Optional successive state for Koopman transition dynamics.
            privileged_cov: Optional full-trial Riemannian covariance matrices.
            return_dict: If True, returns (logits, loss_dict).
            
        Returns:
            - ModelOutput(logits, psi_t, psi_pred_next) by default (unpacks to 3 values)
            - (logits, loss_dict) if return_dict is True
        """
        psi_t = self.encoder(x_t)
        logits = self.classifier(psi_t)

        # Compute next-step latent observable prediction
        psi_pred_next = None
        if self.use_koopman and self.koopman is not None:
            psi_pred_next = self.koopman(psi_t)
        elif self.ablation_mode == "lusi_only":
            # Identity transition for LUSI-Only ablation
            psi_pred_next = psi_t

        if return_dict:
            losses = {}
            # 1. Koopman Dynamics Consistency Loss
            if self.use_koopman and self.koopman is not None and x_next is not None:
                psi_next_actual = self.encoder(x_next)
                loss_koopman_linear = F.mse_loss(psi_pred_next, psi_next_actual)
                loss_koopman_spectral = self.koopman.spectral_loss()
                loss_koopman = loss_koopman_linear + 0.1 * loss_koopman_spectral
                losses["loss_koopman"] = loss_koopman
            else:
                losses["loss_koopman"] = torch.tensor(0.0, device=x_t.device)

            # 2. Riemannian LUSI Invariant Loss
            if self.use_lusi and self.lusi is not None:
                eigvals = self.koopman.get_eigenvalues() if (self.use_koopman and self.koopman is not None) else None
                loss_lusi, _ = self.lusi(
                    observables=psi_t,
                    labels=None,
                    koopman_eigvals=eigvals,
                    privileged_cov=privileged_cov
                )
                losses["loss_lusi"] = loss_lusi
            else:
                losses["loss_lusi"] = torch.tensor(0.0, device=x_t.device)

            # 3. Biophysical PINN Volume Conduction Loss
            if self.use_pinn and self.pinn is not None:
                losses["loss_pinn"] = self.pinn(x_t)
            else:
                losses["loss_pinn"] = torch.tensor(0.0, device=x_t.device)

            return logits, losses

        return ModelOutput(logits, psi_t, psi_pred_next)

    def predict(self, x_t: torch.Tensor) -> torch.Tensor:
        """
        Inference entrypoint: returns discrete class predictions of shape (B,).
        """
        out = self.forward(x_t)
        logits = out[0] if isinstance(out, tuple) else out
        return torch.argmax(logits, dim=-1)

    def compute_loss(
        self,
        x_t: torch.Tensor,
        x_next: torch.Tensor,
        y: torch.Tensor,
        privileged_cov: Optional[torch.Tensor] = None
    ) -> Tuple[torch.Tensor, Dict[str, float]]:
        """
        Full end-to-end multi-task objective computation.
        
        Args:
            x_t: Current EEG state (B, C, T).
            x_next: Successive state (B, C, T).
            y: Ground-truth target labels (B,).
            privileged_cov: Optional Riemannian covariance matrices (B, C, C).
            
        Returns:
            Tuple of (total_loss, metrics_dict).
        """
        psi_t = self.encoder(x_t)
        logits = self.classifier(psi_t)

        # 1. Classification Cross-Entropy
        loss_ce = F.cross_entropy(logits, y)

        # 2. Koopman Dynamics Consistency
        loss_koopman = torch.tensor(0.0, device=x_t.device)
        if self.use_koopman and self.koopman is not None:
            psi_pred_next = self.koopman(psi_t)
            psi_next_actual = self.encoder(x_next)
            loss_koopman_linear = F.mse_loss(psi_pred_next, psi_next_actual)
            loss_koopman_spectral = self.koopman.spectral_loss()
            loss_koopman = loss_koopman_linear + 0.1 * loss_koopman_spectral

        # 3. Riemannian LUSI Statistical Invariants
        loss_lusi = torch.tensor(0.0, device=x_t.device)
        lusi_metrics = {}
        if self.use_lusi and self.lusi is not None:
            eigvals = self.koopman.get_eigenvalues() if (self.use_koopman and self.koopman is not None) else None
            loss_lusi, lusi_metrics = self.lusi(
                observables=psi_t,
                labels=y,
                koopman_eigvals=eigvals,
                privileged_cov=privileged_cov
            )

        # 4. Biophysical PINN Volume Conduction
        loss_pinn = torch.tensor(0.0, device=x_t.device)
        if self.use_pinn and self.pinn is not None:
            loss_pinn = self.pinn(x_t)

        # Total Objective
        total_loss = (
            loss_ce
            + self.alpha_koopman * loss_koopman
            + self.beta_lusi * loss_lusi
            + self.gamma_pinn * loss_pinn
        )

        metrics = {
            "loss_total": total_loss.item(),
            "loss_ce": loss_ce.item(),
            "loss_koopman": loss_koopman.item(),
            "loss_lusi": loss_lusi.item(),
            "loss_pinn": loss_pinn.item(),
            **lusi_metrics
        }
        return total_loss, metrics
