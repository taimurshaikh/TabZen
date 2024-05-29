# backend/app/utils.py
from sklearn.cluster import KMeans, DBSCAN, AffinityPropagation
import numpy as np


def cluster_tabs(embeddings: np.ndarray) -> np.ndarray:
    # clustering = DBSCAN(eps=1 * 10 ** (-16), min_samples=2).fit(embeddings)
    # clustering = KMeans(n_clusters=4).fit(embeddings)
    clustering = AffinityPropagation(random_state=42).fit(embeddings)
    return clustering.labels_
