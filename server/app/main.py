# backend/app/main.py
from fastapi import FastAPI, Depends
from typing import List
from app.schemas import TabData, GroupResponse
from app.utils import cluster_tabs
from app.models import EmbeddingModel

app = FastAPI()


# Dependency injection for the singleton EmbeddingModel
def get_embedding_model() -> EmbeddingModel:
    return EmbeddingModel()


@app.post("/group-tabs", response_model=GroupResponse)
async def group_tabs(
    tabs: List[TabData], model: EmbeddingModel = Depends(get_embedding_model)
) -> GroupResponse:
    tab_texts = [tab.title + " " + tab.url for tab in tabs]
    embeddings = model.get_embeddings(tab_texts)
    labels = cluster_tabs(embeddings)
    return GroupResponse(groups=labels.tolist())
