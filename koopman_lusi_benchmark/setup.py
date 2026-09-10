from setuptools import setup, find_packages

setup(
    name="koopman-lusi",
    version="0.1.0",
    description="A Physics-Informed, Statistical-Invariant Neural Architecture for Few-Shot and Cross-Subject Motor Imagery BCI",
    author="Chayse Wright",
    packages=find_packages(include=["koopman_lusi", "koopman_lusi.*"]),
    python_requires=">=3.9",
    install_requires=[
        "torch>=2.0.0",
        "numpy>=1.23.0",
        "scipy>=1.10.0",
        "scikit-learn>=1.2.0",
        "moabb>=1.0.0",
        "mne>=1.5.0",
        "pyriemann>=0.5",
        "matplotlib>=3.7.0",
        "pandas>=1.5.0",
        "tabulate>=0.9.0",
    ],
    extras_require={
        "dev": ["pytest>=7.0.0", "black>=23.0.0", "flake8>=6.0.0"],
    },
)
