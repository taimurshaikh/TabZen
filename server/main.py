from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from sentence_transformers import SentenceTransformer
from sklearn.cluster import DBSCAN
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")


def get_embeddings(tabs: List["TabData"]) -> np.ndarray:
    tab_texts = [tab.title + " " + tab.url for tab in tabs]
    embeddings = model.encode(tab_texts)
    return embeddings


def cluster_tabs(embeddings: np.ndarray) -> np.ndarray:
    clustering = DBSCAN(eps=0.5, min_samples=2).fit(embeddings)
    return clustering.labels_


app = FastAPI()


class TabData(BaseModel):
    url: str
    title: str


class GroupResponse(BaseModel):
    groups: List[int]


@app.post("/group-tabs", response_model=GroupResponse)
async def group_tabs(tabs: List[TabData]) -> GroupResponse:
    embeddings = get_embeddings(tabs)
    labels = cluster_tabs(embeddings)
    return GroupResponse(groups=labels.tolist())
