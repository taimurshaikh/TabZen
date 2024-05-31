from typing import List
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import TabData, TabRemoveData, GroupResponse
from app.utils import cluster_tabs
from app.models import EmbeddingModel
from app.storage import embedding_storage
import numpy as np
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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


# Singleton EmbeddingModel
class ModelSingleton:
    _model = None

    @staticmethod
    def get_model():
        if ModelSingleton._model is None:
            ModelSingleton._model = EmbeddingModel()
        return ModelSingleton._model


def get_embedding_model() -> EmbeddingModel:
    return ModelSingleton.get_model()


@app.post("/update-tabs", response_model=GroupResponse)
async def update_tabs(
    tabs: List[TabData], model: EmbeddingModel = Depends(get_embedding_model)
) -> GroupResponse:
    logger.info(f"Received tabs for update: {tabs}")
    try:
        for tab in tabs:
            tab_text = f"{tab.title} {tab.url}"
            embedding = model.get_embeddings([tab_text])[0]
            embedding_storage.add_or_update_tab(
                tab.tab_id, embedding, {"title": tab.title, "url": tab.url}
            )

        all_embeddings = embedding_storage.get_all_embeddings()
        labels = cluster_tabs(np.array(all_embeddings))
        return GroupResponse(groups=labels.tolist())
    except Exception as e:
        logger.error(f"Error in update_tabs: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.post("/delete-tab", response_model=GroupResponse)
async def delete_tab(tab: TabRemoveData) -> GroupResponse:
    logger.info(f"Received tab for deletion: {tab}")
    try:
        embedding_storage.remove_tab(tab.tab_id)
        all_embeddings = embedding_storage.get_all_embeddings()
        if not all_embeddings:
            return GroupResponse(groups=[])

        labels = cluster_tabs(np.array(all_embeddings))
        return GroupResponse(groups=labels.tolist())
    except Exception as e:
        logger.error(f"Error in delete_tab: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
