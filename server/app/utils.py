# backend/app/utils.py
from sklearn.cluster import DBSCAN
import numpy as np


def cluster_tabs(embeddings: np.ndarray) -> np.ndarray:
    clustering = DBSCAN(eps=0.5, min_samples=2).fit(embeddings)
    return clustering.labels_
