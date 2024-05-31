# backend/app/storage.py
from typing import Dict, List
import numpy as np
from threading import Lock


class EmbeddingStorage:
    _instance = None
    _lock: Lock = Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(EmbeddingStorage, cls).__new__(cls)
                    cls._instance.embeddings = {}
                    cls._instance.tab_data = {}
        return cls._instance

    def add_or_update_tab(self, tab_id: int, embedding: np.ndarray, tab_info: dict):
        self.embeddings[tab_id] = embedding
        self.tab_data[tab_id] = tab_info

    def remove_tab(self, tab_id: int):
        if tab_id in self.embeddings:
            del self.embeddings[tab_id]
        if tab_id in self.tab_data:
            del self.tab_data[tab_id]

    def get_all_embeddings(self) -> List[np.ndarray]:
        return list(self.embeddings.values())

    def get_all_tab_data(self) -> List[dict]:
        return list(self.tab_data.values())


embedding_storage = EmbeddingStorage()
