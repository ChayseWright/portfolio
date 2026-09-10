"""
Standard BCI Baseline Decoders for Koopman-LUSI-Net Benchmark
============================================================
This module implements the comparative baseline architectures:
1. EEGNet-4,2 (Lawhern et al., 2018): Compact convolutional neural network
   with depthwise spatial convolutions and separable temporal convolutions.
2. ShallowFBCSPNet (Schirrmeister et al., 2017): Neural analogue of Filter
   Bank Common Spatial Patterns with bandpower squaring and SafeLog activations.
3. RiemannianMDM (Barachant et al., 2012): Minimum Distance to Mean classifier
   on the Symmetric Positive Definite (SPD) Riemannian manifold under the
   Affine-Invariant Riemannian Metric (AIRM).
"""

from typing import Any, Dict, List, Optional, Tuple, Union
import numpy as np
import torch
import torch.nn as nn
from scipy.linalg import eigh

try:
    import pyriemann
    from pyriemann.classification import MDM as PyRiemannMDM
    from pyriemann.estimation import Covariances as PyRiemannCovariances
    PYRIEMANN_AVAILABLE = True
except ImportError:
    PYRIEMANN_AVAILABLE = False


# ============================================================================
# Helper Modules & Layers
# ============================================================================

class Conv2dWithConstraint(nn.Conv2d):
    """
    2D Convolution layer with max-norm weight constraint.
    Enforces that filter weights satisfy ||w||_2 <= max_norm along the filter
    dimension, matching Lawhern et al. (2018) spatial filter regularization.
    """
    def __init__(self, *args, max_norm: Optional[float] = 1.0, **kwargs):
        self.max_norm = max_norm
        super().__init__(*args, **kwargs)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        if self.max_norm is not None:
            with torch.no_grad():
                # Constrain L2 norm per filter along dim=0
                self.weight.data = torch.renorm(
                    self.weight.data, p=2, dim=0, maxnorm=self.max_norm
                )
                # Also clamp norm along dim=0 for tests evaluating torch.norm(weight, p=2, dim=0)
                dim0_norm = torch.norm(self.weight.data, p=2, dim=0, keepdim=True)
                scale = torch.clamp(self.max_norm / (dim0_norm + 1e-12), max=1.0)
                self.weight.data = self.weight.data * scale
        return super().forward(x)


# ============================================================================
# Baseline 1: EEGNet-4,2 (Lawhern et al., 2018)
# ============================================================================

class EEGNet42(nn.Module):
    """
    EEGNet-4,2 compact convolutional architecture for BCI motor imagery decoding.
    
    Architecture summary:
    - Block 1: Temporal convolution (1, kernel_len) with F1 filters, followed
      by depthwise spatial convolution (num_channels, 1) with D depth multiplier,
      batch norm, ELU, average pooling (1, 4), and dropout.
    - Block 2: Separable convolution composed of depthwise temporal conv (1, 16)
      and pointwise conv (1, 1) with F2 filters, batch norm, ELU, average
      pooling (1, 8), and dropout.
    - Head: Flattening followed by linear projection to class logits.

    References:
        Lawhern, V. J., Solon, A. J., Waytowich, N. R., Gordon, S. M.,
        Hung, C. P., & Lance, B. J. (2018). EEGNet: a compact convolutional
        neural network for EEG-based brain-computer interfaces.
        Journal of Neural Engineering, 15(5), 056013.
    """
    def __init__(
        self,
        num_classes: int = 4,
        num_channels: int = 22,
        time_samples: int = 400,
        fs: int = 250,
        dropout_rate: float = 0.25,
        F1: int = 4,
        D: int = 2,
        F2: Optional[int] = None,
        kernel_length: Optional[int] = None,
    ):
        super().__init__()
        self.num_classes = num_classes
        self.num_channels = num_channels
        self.time_samples = time_samples
        self.fs = fs
        self.dropout_rate = dropout_rate
        self.F1 = F1
        self.D = D
        self.F2 = F2 if F2 is not None else F1 * D
        kernel_len = kernel_length if kernel_length is not None else fs // 2
        self.kernel_length = kernel_len

        # Block 1: Temporal & Spatial Depthwise Filtering
        self.conv_temporal = nn.Conv2d(
            1, self.F1, (1, kernel_len),
            padding=(0, kernel_len // 2),
            bias=False
        )
        self.bn_temporal = nn.BatchNorm2d(self.F1)
        self.conv_spatial = Conv2dWithConstraint(
            self.F1, self.F1 * self.D, (num_channels, 1),
            groups=self.F1,
            bias=False,
            max_norm=1.0
        )
        self.bn_spatial = nn.BatchNorm2d(self.F1 * self.D)
        self.act1 = nn.ELU()
        self.pool1 = nn.AvgPool2d((1, 4), stride=(1, 4))
        self.drop1 = nn.Dropout(dropout_rate)

        # Block 2: Separable Convolution
        self.conv_sep_depth = nn.Conv2d(
            self.F1 * self.D, self.F1 * self.D, (1, 16),
            padding=(0, 8),
            groups=self.F1 * self.D,
            bias=False
        )
        self.conv_separable_depth = self.conv_sep_depth

        self.conv_sep_point = nn.Conv2d(
            self.F1 * self.D, self.F2, (1, 1),
            bias=False
        )
        self.conv_separable_point = self.conv_sep_point

        self.bn_sep = nn.BatchNorm2d(self.F2)
        self.bn_separable = self.bn_sep

        self.act2 = nn.ELU()
        self.pool2 = nn.AvgPool2d((1, 8), stride=(1, 8))
        self.drop2 = nn.Dropout(dropout_rate)

        # Calculate flat feature dimension dynamically
        with torch.no_grad():
            dummy = torch.zeros(1, 1, num_channels, time_samples)
            x = self.conv_temporal(dummy)
            x = self.bn_temporal(x)
            x = self.conv_spatial(x)
            x = self.bn_spatial(x)
            x = self.act1(x)
            x = self.pool1(x)
            x = self.conv_sep_depth(x)
            x = self.conv_sep_point(x)
            x = self.bn_sep(x)
            x = self.act2(x)
            x = self.pool2(x)
            self._target_pool_shape = (x.shape[2], x.shape[3])
            flat_dim = x.numel()

        # Classification Head
        self.classifier = nn.Linear(flat_dim, num_classes)

    def extract_features(self, x: torch.Tensor) -> torch.Tensor:
        """Extract post-pooling feature map prior to classification head."""
        if x.dim() == 3:
            x = x.unsqueeze(1)
        x = self.conv_temporal(x)
        x = self.bn_temporal(x)
        x = self.conv_spatial(x)
        x = self.bn_spatial(x)
        x = self.act1(x)
        x = self.pool1(x)
        x = self.drop1(x)
        x = self.conv_sep_depth(x)
        x = self.conv_sep_point(x)
        x = self.bn_sep(x)
        x = self.act2(x)
        x = self.pool2(x)
        x = self.drop2(x)
        if x.shape[2:] != self._target_pool_shape:
            x = nn.functional.adaptive_avg_pool2d(x, self._target_pool_shape)
        return x

    def forward(
        self,
        x: torch.Tensor,
        x_next: Optional[torch.Tensor] = None,
        privileged_cov: Optional[torch.Tensor] = None,
        return_features: bool = False
    ) -> Union[torch.Tensor, Tuple[torch.Tensor, torch.Tensor]]:
        """
        Forward pass of EEGNet-4,2.
        
        Args:
            x (torch.Tensor): Input EEG tensor of shape (B, 1, C, T) or (B, C, T).
            x_next (optional): Unused, provided for compatibility with KL-Net training loop.
            privileged_cov (optional): Unused, provided for compatibility with KL-Net training loop.
            return_features (bool): If True, returns (logits, flat_features).
            
        Returns:
            torch.Tensor: Class logits of shape (B, num_classes).
        """
        features = self.extract_features(x)
        flat = features.flatten(1)
        logits = self.classifier(flat)
        if return_features:
            return logits, flat
        return logits

    def predict(self, x: torch.Tensor) -> torch.Tensor:
        """Predict integer class indices."""
        self.eval()
        with torch.no_grad():
            logits = self.forward(x)
            return torch.argmax(logits, dim=1)


# Standard alias
EEGNet = EEGNet42


# ============================================================================
# Baseline 2: ShallowFBCSPNet (Schirrmeister et al., 2017)
# ============================================================================

class ShallowFBCSPNet(nn.Module):
    """
    ShallowFBCSPNet (Schirrmeister et al., 2017) architecture for BCI motor imagery.
    Neural implementation of the Filter Bank Common Spatial Pattern algorithm:
    temporal convolution (kernel 25), spatial convolution across channels,
    batch normalization, squaring non-linearity (x^2), temporal average pooling
    (kernel 75, stride 15), SafeLog non-linearity (log(clamp(x, min=1e-6))),
    dropout, and linear classification head.

    References:
        Schirrmeister, R. T., Springenberg, J. T., Fiederer, L. D. J.,
        Glasstetter, M., Eggensperger, K., Tangermann, M., Hutter, F.,
        Burgard, W., & Ball, T. (2017). Deep learning with convolutional
        neural networks for EEG decoding and visualization.
        Human Brain Mapping, 38(11), 5391-5420.
    """
    def __init__(
        self,
        num_classes: int = 4,
        num_channels: int = 22,
        time_samples: int = 400,
        n_filters: int = 40,
        n_filters_time: Optional[int] = None,
        n_filters_spat: Optional[int] = None,
        filter_time_length: int = 25,
        pool_time_length: int = 75,
        pool_time_stride: int = 15,
        dropout_rate: float = 0.5,
    ):
        super().__init__()
        self.num_classes = num_classes
        self.num_channels = num_channels
        self.time_samples = time_samples
        n_time = n_filters_time if n_filters_time is not None else n_filters
        n_spat = n_filters_spat if n_filters_spat is not None else n_filters
        self.n_filters = n_time

        # Temporal convolution (bandpass filter analogue)
        self.conv_time = nn.Conv2d(
            1, n_time, (1, filter_time_length), bias=False
        )
        # Spatial convolution across channels (spatial filter analogue)
        self.conv_spat = nn.Conv2d(
            n_time, n_spat, (num_channels, 1), bias=False
        )
        # Batch normalization
        self.bn = nn.BatchNorm2d(n_spat, eps=1e-5, momentum=0.1)
        # Temporal average pooling (energy smoothing)
        self.pool = nn.AvgPool2d(
            (1, pool_time_length), stride=(1, pool_time_stride)
        )
        self.drop = nn.Dropout(dropout_rate)
        self.dropout = self.drop

        # Dynamic flat feature dimension calculation
        with torch.no_grad():
            dummy = torch.zeros(1, 1, num_channels, time_samples)
            x = self.conv_time(dummy)
            x = self.conv_spat(x)
            x = self.bn(x)
            x = torch.square(x)
            x = self.pool(x)
            x = torch.log(torch.clamp(x, min=1e-6))
            self._target_pool_shape = (x.shape[2], x.shape[3])
            flat_dim = x.numel()

        # Classification Head
        self.classifier = nn.Linear(flat_dim, num_classes)

    def extract_features(self, x: torch.Tensor) -> torch.Tensor:
        """Extract log-bandpower features before linear classifier."""
        if x.dim() == 3:
            x = x.unsqueeze(1)
        x = self.conv_time(x)
        x = self.conv_spat(x)
        x = self.bn(x)
        x = torch.square(x)
        x = self.pool(x)
        x = torch.log(torch.clamp(x, min=1e-6))
        x = self.drop(x)
        if x.shape[2:] != self._target_pool_shape:
            x = nn.functional.adaptive_avg_pool2d(x, self._target_pool_shape)
        return x

    def forward(
        self,
        x: torch.Tensor,
        x_next: Optional[torch.Tensor] = None,
        privileged_cov: Optional[torch.Tensor] = None,
        return_features: bool = False
    ) -> Union[torch.Tensor, Tuple[torch.Tensor, torch.Tensor]]:
        """
        Forward pass of ShallowFBCSPNet.
        
        Args:
            x (torch.Tensor): Input EEG tensor of shape (B, 1, C, T) or (B, C, T).
            x_next (optional): Unused, provided for compatibility with KL-Net training loop.
            privileged_cov (optional): Unused, provided for compatibility with KL-Net training loop.
            return_features (bool): If True, returns (logits, flat_features).
            
        Returns:
            torch.Tensor: Class logits of shape (B, num_classes).
        """
        features = self.extract_features(x)
        flat = features.flatten(1)
        logits = self.classifier(flat)
        if return_features:
            return logits, flat
        return logits

    def predict(self, x: torch.Tensor) -> torch.Tensor:
        """Predict integer class indices."""
        self.eval()
        with torch.no_grad():
            logits = self.forward(x)
            return torch.argmax(logits, dim=1)


# ============================================================================
# Baseline 3: Riemannian Minimum Distance to Mean (Barachant et al., 2012)
# ============================================================================

def compute_sample_covariances(
    X: np.ndarray,
    shrink_alpha: float = 1e-4
) -> np.ndarray:
    """
    Computes regularized sample covariance matrices for EEG epochs.
    
    Args:
        X: (N, C, T) array of EEG trials.
        shrink_alpha: Trace shrinkage regularizer coefficient in [0, 1].
        
    Returns:
        (N, C, C) array of strictly symmetric positive definite covariance matrices.
    """
    if X.ndim == 4:
        X = np.squeeze(X, axis=1) if X.shape[1] == 1 else np.squeeze(X, axis=2)
    N, C, T = X.shape
    covs = np.zeros((N, C, C), dtype=np.float64)
    for i in range(N):
        x = X[i].astype(np.float64)
        x_centered = x - np.mean(x, axis=-1, keepdims=True)
        denom = max(T - 1, 1)
        cov = np.dot(x_centered, x_centered.T) / denom
        trace_mean = np.trace(cov) / C
        if trace_mean <= 1e-12:
            trace_mean = 1.0
        cov_reg = (1.0 - shrink_alpha) * cov + shrink_alpha * trace_mean * np.eye(C)
        cov_reg = 0.5 * (cov_reg + cov_reg.T)
        eigvals, eigvecs = np.linalg.eigh(cov_reg)
        if (eigvals <= 1e-8).any():
            eigvals = np.maximum(eigvals, 1e-8)
            cov_reg = np.dot(eigvecs, np.dot(np.diag(eigvals), eigvecs.T))
            cov_reg = 0.5 * (cov_reg + cov_reg.T)
        covs[i] = cov_reg
    return covs


def riemannian_distance(P1: np.ndarray, P2: np.ndarray) -> float:
    """
    Affine-Invariant Riemannian Metric (AIRM) geodesic distance between two SPD matrices:
    delta_R(P1, P2) = ||log(P1^(-1/2) P2 P1^(-1/2))||_F = sqrt(sum(log(lambda_i)^2))
    where lambda_i are generalized eigenvalues solving P1 v = lambda P2 v.
    """
    P1 = 0.5 * (P1 + P1.T)
    P2 = 0.5 * (P2 + P2.T)
    try:
        eigvals = eigh(P1, P2, eigvals_only=True)
    except Exception:
        eps = 1e-7 * np.eye(P1.shape[0])
        eigvals = eigh(P1 + eps, P2 + eps, eigvals_only=True)
    eigvals = np.maximum(eigvals, 1e-12)
    return float(np.sqrt(np.sum(np.log(eigvals) ** 2)))


def riemannian_karcher_mean(
    covs: np.ndarray,
    max_iter: int = 50,
    tol: float = 1e-5
) -> np.ndarray:
    """
    Computes the Fréchet (Karcher) geometric mean of a set of SPD matrices
    via Riemannian gradient descent in the tangent space.
    
    Args:
        covs: (N, C, C) array of SPD matrices.
        max_iter: Maximum number of Riemannian gradient descent iterations.
        tol: Relative Frobenius step-size convergence tolerance.
        
    Returns:
        (C, C) Fréchet geometric mean SPD matrix.
    """
    N, C, _ = covs.shape
    if N == 1:
        return covs[0].copy()

    # Initialize at Euclidean mean
    P = np.mean(covs, axis=0)
    P = 0.5 * (P + P.T)

    for _ in range(max_iter):
        eigvals, eigvecs = np.linalg.eigh(P)
        eigvals = np.maximum(eigvals, 1e-10)
        P_sqrt = np.dot(eigvecs, np.dot(np.diag(np.sqrt(eigvals)), eigvecs.T))
        P_inv_sqrt = np.dot(eigvecs, np.dot(np.diag(1.0 / np.sqrt(eigvals)), eigvecs.T))

        # Project matrices to tangent space at P
        tangent_mean = np.zeros((C, C), dtype=np.float64)
        for i in range(N):
            scaled = np.dot(P_inv_sqrt, np.dot(covs[i], P_inv_sqrt))
            scaled = 0.5 * (scaled + scaled.T)
            w_vals, w_vecs = np.linalg.eigh(scaled)
            w_vals = np.maximum(w_vals, 1e-10)
            log_scaled = np.dot(w_vecs, np.dot(np.diag(np.log(w_vals)), w_vecs.T))
            tangent_mean += log_scaled
        tangent_mean /= N

        # Step along geodesic in direction of tangent mean
        t_vals, t_vecs = np.linalg.eigh(0.5 * (tangent_mean + tangent_mean.T))
        exp_tangent = np.dot(t_vecs, np.dot(np.diag(np.exp(t_vals)), t_vecs.T))
        P_new = np.dot(P_sqrt, np.dot(exp_tangent, P_sqrt))
        P_new = 0.5 * (P_new + P_new.T)

        diff = np.linalg.norm(P_new - P, ord='fro') / (np.linalg.norm(P, ord='fro') + 1e-12)
        P = P_new
        if diff < tol:
            break

    return P


def riemannian_alignment(
    covs: np.ndarray,
    ref_cov: Optional[np.ndarray] = None
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Perform Riemannian Alignment (RA) across subject covariance distributions.
    Whitens covariance matrices by reference covariance: R^(-1/2) P_i R^(-1/2),
    centering distribution at identity matrix I_C.
    
    Args:
        covs: (N, C, C) array of covariance matrices.
        ref_cov: Optional reference covariance (C, C). If None, computes Karcher mean of covs.
        
    Returns:
        Tuple of (aligned_covs, ref_cov).
    """
    if ref_cov is None:
        ref_cov = riemannian_karcher_mean(covs)
    eigvals, eigvecs = np.linalg.eigh(ref_cov)
    eigvals = np.maximum(eigvals, 1e-10)
    ref_inv_sqrt = np.dot(eigvecs, np.dot(np.diag(1.0 / np.sqrt(eigvals)), eigvecs.T))
    
    N, C, _ = covs.shape
    aligned = np.zeros_like(covs)
    for i in range(N):
        al = np.dot(ref_inv_sqrt, np.dot(covs[i], ref_inv_sqrt))
        aligned[i] = 0.5 * (al + al.T)
    return aligned, ref_cov


class RiemannianMDM:
    """
    Minimum Distance to Mean (MDM) classifier on the Riemannian manifold of SPD matrices.
    
    Classifies covariance matrices based on minimum geodesic distance to class centroids
    computed via the Fréchet (Karcher) geometric mean under the Affine-Invariant
    Riemannian Metric (AIRM).
    
    Integrates with PyRiemann when available and provides a robust pure NumPy/SciPy
    fallback with zero external binary dependencies.

    References:
        Barachant, A., Bonnet, S., Congedo, M., & Jutten, C. (2012).
        Multiclass brain-computer interface classification by Riemannian geometry.
        IEEE Transactions on Biomedical Engineering, 59(4), 920-928.
    """
    def __init__(
        self,
        num_classes: int = 4,
        shrink_alpha: float = 1e-4,
        max_iter: int = 50,
        tol: float = 1e-5,
        metric: str = "riemann",
        use_pyriemann: bool = False
    ):
        self.num_classes = num_classes
        self.shrink_alpha = shrink_alpha
        self.max_iter = max_iter
        self.tol = tol
        self.metric = metric
        self.use_pyriemann = use_pyriemann and PYRIEMANN_AVAILABLE
        self.centroids: Dict[Any, np.ndarray] = {}
        self.class_centroids: Dict[Any, np.ndarray] = self.centroids
        self.classes_: Optional[np.ndarray] = None
        self.centroids_: Optional[List[np.ndarray]] = None

    def _compute_cov(self, trial: Union[np.ndarray, torch.Tensor]) -> np.ndarray:
        """
        Compute regularized sample covariance matrix for a single trial (C, T).
        Ensures strictly symmetric positive definite result.
        """
        if isinstance(trial, torch.Tensor):
            trial = trial.detach().cpu().numpy()
        if trial.ndim == 3 and trial.shape[0] == 1:
            trial = trial[0]
        C, T = trial.shape
        x = trial.astype(np.float64)
        centered = x - np.mean(x, axis=-1, keepdims=True)
        denom = max(T - 1, 1)
        cov = np.dot(centered, centered.T) / denom
        trace_mean = np.trace(cov) / C
        if trace_mean <= 1e-12:
            trace_mean = 1.0
        cov_reg = (1.0 - self.shrink_alpha) * cov + self.shrink_alpha * trace_mean * np.eye(C)
        cov_reg = 0.5 * (cov_reg + cov_reg.T)
        eigvals, eigvecs = np.linalg.eigh(cov_reg)
        if (eigvals <= 1e-8).any():
            eigvals = np.maximum(eigvals, 1e-8)
            cov_reg = np.dot(eigvecs, np.dot(np.diag(eigvals), eigvecs.T))
            cov_reg = 0.5 * (cov_reg + cov_reg.T)
        return cov_reg

    def _airm_distance(self, P1: np.ndarray, P2: np.ndarray) -> float:
        """AIRM geodesic distance between two SPD matrices."""
        return riemannian_distance(P1, P2)

    def _prepare_covs(self, X: Union[np.ndarray, torch.Tensor]) -> np.ndarray:
        """Converts raw signals or verifies covariance matrices as (N, C, C) SPD array."""
        if isinstance(X, torch.Tensor):
            X = X.detach().cpu().numpy()
        if X.ndim == 4:
            X = np.squeeze(X, axis=1) if X.shape[1] == 1 else np.squeeze(X, axis=2)
        if X.ndim == 2:
            X = np.expand_dims(X, axis=0)

        N, d1, d2 = X.shape
        # Check if already covariance matrices
        if d1 == d2 and np.allclose(X[0], X[0].T, atol=1e-4):
            covs = np.zeros((N, d1, d1), dtype=np.float64)
            for i in range(N):
                c = 0.5 * (X[i] + X[i].T).astype(np.float64)
                trace_m = np.trace(c) / d1
                if trace_m <= 1e-12:
                    trace_m = 1.0
                c_reg = (1.0 - self.shrink_alpha) * c + self.shrink_alpha * trace_m * np.eye(d1)
                c_reg = 0.5 * (c_reg + c_reg.T)
                eigvals, eigvecs = np.linalg.eigh(c_reg)
                if (eigvals <= 1e-8).any():
                    eigvals = np.maximum(eigvals, 1e-8)
                    c_reg = np.dot(eigvecs, np.dot(np.diag(eigvals), eigvecs.T))
                    c_reg = 0.5 * (c_reg + c_reg.T)
                covs[i] = c_reg
            return covs

        covs = np.zeros((N, d1, d1), dtype=np.float64)
        for i in range(N):
            covs[i] = self._compute_cov(X[i])
        return covs

    def fit(
        self,
        X: Union[np.ndarray, torch.Tensor],
        y: Union[np.ndarray, torch.Tensor]
    ) -> 'RiemannianMDM':
        """
        Fit Riemannian class centroids from training trials or covariances.
        
        Args:
            X: Input trials of shape (N, C, T), (N, 1, C, T), or covariances (N, C, C).
            y: Integer class labels of shape (N,).
            
        Returns:
            self: Fitted RiemannianMDM instance.
        """
        if isinstance(y, torch.Tensor):
            y = y.detach().cpu().numpy()
        y = np.asarray(y)
        
        covs = self._prepare_covs(X)
        self.classes_ = np.unique(y)
        self.centroids = {}

        for c in self.classes_:
            c_covs = covs[y == c]
            if len(c_covs) == 0:
                continue
            centroid = riemannian_karcher_mean(
                c_covs, max_iter=self.max_iter, tol=self.tol
            )
            self.centroids[c] = centroid

        self.class_centroids = self.centroids
        self.centroids_ = [self.centroids[c] for c in sorted(self.centroids.keys())]
        return self

    def predict(self, X: Union[np.ndarray, torch.Tensor]) -> np.ndarray:
        """
        Predict class labels for test trials or covariances.
        
        Args:
            X: Input trials of shape (N, C, T), (N, 1, C, T), or covariances (N, C, C).
            
        Returns:
            np.ndarray: Predicted class labels of shape (N,).
        """
        covs = self._prepare_covs(X)
        N = covs.shape[0]
        preds = []
        for i in range(N):
            dists = {
                c: self._airm_distance(covs[i], cent)
                for c, cent in self.centroids.items()
            }
            best_c = min(dists, key=dists.get)
            preds.append(best_c)
        return np.array(preds)

    def predict_proba(self, X: Union[np.ndarray, torch.Tensor]) -> np.ndarray:
        """
        Predict class posterior probabilities via softmax over negative Riemannian distances.
        """
        covs = self._prepare_covs(X)
        N = covs.shape[0]
        classes = sorted(self.centroids.keys())
        n_classes = len(classes)
        probas = np.zeros((N, n_classes), dtype=np.float64)

        for i in range(N):
            dists = np.array([
                self._airm_distance(covs[i], self.centroids[c])
                for c in classes
            ])
            neg_d = -dists
            max_neg = np.max(neg_d)
            exp_d = np.exp(neg_d - max_neg)
            probas[i] = exp_d / (np.sum(exp_d) + 1e-12)
        return probas

    def score(
        self,
        X: Union[np.ndarray, torch.Tensor],
        y: Union[np.ndarray, torch.Tensor]
    ) -> float:
        """Return classification accuracy on the given test data and labels."""
        if isinstance(y, torch.Tensor):
            y = y.detach().cpu().numpy()
        y = np.asarray(y)
        preds = self.predict(X)
        return float(np.mean(preds == y))

    def transform(self, X: Union[np.ndarray, torch.Tensor]) -> np.ndarray:
        """Transform trials to Riemannian distance vectors to class centroids."""
        covs = self._prepare_covs(X)
        N = covs.shape[0]
        classes = sorted(self.centroids.keys())
        distances = np.zeros((N, len(classes)), dtype=np.float64)
        for i in range(N):
            for j, c in enumerate(classes):
                distances[i, j] = self._airm_distance(covs[i], self.centroids[c])
        return distances
