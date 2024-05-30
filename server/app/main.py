# backend/app/main.py
from typing import List
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import TabData, GroupResponse
from app.utils import cluster_tabs
from app.models import EmbeddingModel

app = FastAPI()

# Allow CORS for all origins with all available methods and headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


# Define a dependency for the EmbeddingModel
def get_embedding_model() -> EmbeddingModel:
    return EmbeddingModel()


@app.post("/group-tabs", response_model=GroupResponse)
async def group_tabs(
    tabs: List[TabData], model: EmbeddingModel = Depends(get_embedding_model)
) -> GroupResponse:
    tab_texts = [f"{tab.title} {tab.url}" for tab in tabs]
    embeddings = model.get_embeddings(tab_texts)
    labels = cluster_tabs(embeddings)
    return GroupResponse(groups=labels.tolist())
