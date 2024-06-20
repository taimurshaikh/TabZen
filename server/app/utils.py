from sklearn.cluster import KMeans, DBSCAN, AffinityPropagation
import numpy as np


def cluster_tabs(embeddings: np.ndarray) -> np.ndarray:
    """
    Cluster tab embeddings using a clustering algorithm.

    Args:
        embeddings (np.ndarray): Array of embeddings to cluster.

    Returns:
        np.ndarray: Array of cluster labels for each embedding.
    """
    # Uncomment the desired clustering algorithm

    # DBSCAN clustering with specific parameters
    # clustering = DBSCAN(eps=1 * 10 ** (-16), min_samples=2).fit(embeddings)

    # KMeans clustering with a fixed number of clusters
    # clustering = KMeans(n_clusters=4).fit(embeddings)

    # Affinity Propagation clustering with a fixed random state
    clustering = AffinityPropagation(random_state=42).fit(embeddings)

    return clustering.labels_
