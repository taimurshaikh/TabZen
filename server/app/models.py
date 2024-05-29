# backend/app/models.py
from sentence_transformers import SentenceTransformer
from typing import List
import numpy as np
from threading import Lock
import os

os.environ["TOKENIZERS_PARALLELISM"] = "false"


class EmbeddingModel:
    _instance = None
    _lock: Lock = Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(EmbeddingModel, cls).__new__(cls)
                    cls._instance.model = SentenceTransformer("all-MiniLM-L6-v2")
        return cls._instance

    def get_embeddings(self, tab_texts: List[str]) -> np.ndarray:
        return self.model.encode(tab_texts)
