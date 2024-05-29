# backend/app/utils.py
from sklearn.cluster import KMeans
import numpy as np


def cluster_tabs(embeddings: np.ndarray) -> np.ndarray:
    # clustering = DBSCAN(eps=0.1, min_samples=2).fit(embeddings)
    clustering = KMeans(n_clusters=4).fit(embeddings)
    return clustering.labels_
