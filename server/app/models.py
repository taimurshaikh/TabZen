from typing import List
from threading import Lock
import os

import numpy as np
from sentence_transformers import SentenceTransformer

os.environ["TOKENIZERS_PARALLELISM"] = "false"


class EmbeddingModel:
    """
    Singleton class to handle embedding model initialization and inference.

    Attributes:
        _instance (EmbeddingModel): Singleton instance of EmbeddingModel.
        _lock (Lock): Thread lock for ensuring thread-safe initialization.
        model (SentenceTransformer): SentenceTransformer model instance for embeddings.
    """

    _instance = None
    _lock: Lock = Lock()

    def __new__(cls):
        """
        Override to ensure only one instance of EmbeddingModel is created.

        Returns:
            EmbeddingModel: The singleton instance of EmbeddingModel.
        """
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(EmbeddingModel, cls).__new__(cls)
                    # Initialize the SentenceTransformer model
                    cls._instance.model = SentenceTransformer("all-MiniLM-L6-v2")
        return cls._instance

    def get_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        Get embeddings for a list of textual inputs.

        Args:
            tab_texts (List[str]): List of texts to encode into embeddings.

        Returns:
            np.ndarray: Array of embeddings for the input texts.
        """
        return self.model.encode(texts)
