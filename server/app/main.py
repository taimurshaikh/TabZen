from typing import List, Dict
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import TabData, TabRemoveData, GroupResponse
from app.utils import cluster_tabs
from app.models import EmbeddingModel
from app.storage import embedding_storage
import numpy as np
import logging
from openai import OpenAI
import json
import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

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
    """
    Root endpoint that returns a simple greeting message.

    Returns:
        dict: A dictionary with a greeting message.
    """
    return {"message": "Hello World"}


# Singleton pattern for the EmbeddingModel
class ModelSingleton:
    _model = None

    @staticmethod
    def get_model() -> EmbeddingModel:
        """
        Retrieve the singleton instance of EmbeddingModel.

        Returns:
            EmbeddingModel: The singleton instance of EmbeddingModel.
        """
        if ModelSingleton._model is None:
            ModelSingleton._model = EmbeddingModel()
        return ModelSingleton._model


def get_embedding_model() -> EmbeddingModel:
    """
    Dependency injection for retrieving the singleton EmbeddingModel.

    Returns:
        EmbeddingModel: The singleton instance of EmbeddingModel.
    """
    return ModelSingleton.get_model()


def group_tabs(
    tab_data: Dict[int, dict], labels: np.ndarray
) -> Dict[int, List[TabData]]:
    """
    Group tabs based on their cluster labels.

    Args:
        tab_data (Dict[int, dict]): A dictionary where keys are tab IDs and values are tab information.
        labels (np.ndarray): An array of cluster labels for each tab.

    Returns:
        Dict[int, List[TabData]]: A dictionary where keys are cluster labels and values are lists of TabData.
    """
    grouped_tabs: Dict[int, List[TabData]] = {}
    for tab_id, label in zip(tab_data.keys(), labels):
        if label not in grouped_tabs:
            grouped_tabs[label] = []
        tab_info = tab_data[tab_id]
        grouped_tabs[label].append(
            TabData(tab_id=tab_id, title=tab_info["title"], url=tab_info["url"])
        )

    logger.info(f"Grouped tabs: {grouped_tabs}")

    return grouped_tabs


def get_chat_completion(user_message: str) -> str:
    client = OpenAI()
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": "You are an intelligent labelling system that excels at taking in information and generating concise, meaningful labels for them.",
            },
            {
                "role": "user",
                "content": f"""I will give you a list of information about tabs a user has open. 
             Please generate a short label (no more than 3 words) for this group of tabs. Output your answer as a JSON object
             with a single key "label" and the value as the label you generated.
             Here is the list of tabs:\n{user_message}""",
            },
        ],
    )
    try:
        res = completion.choices[0].message.content
        resJSON = json.loads(res)
        return resJSON["label"]
    except Exception as e:
        logger.error(f"Error in get_chat_completion: {e}")
        return None


@app.post("/label-groups", response_model=Dict[int, str])
async def label_groups(groupIdToTabData: Dict[int, List[TabData]]) -> Dict[int, str]:
    """
    Assign a string label to each group.

    Args:
        grouped_tabs (Dict[int, List[TabData]]): A dictionary where keys are cluster labels and values are lists of TabData.

    Returns:
        Dict[int, int]: A dictionary where keys are cluster labels and values are group labels.
    """
    group_labels = {}
    for i, label in enumerate(groupIdToTabData.keys()):
        group_labels[label] = get_chat_completion(groupIdToTabData[label])

    return group_labels


@app.post("/update-tabs", response_model=GroupResponse)
async def update_tabs(
    tabs: List[TabData] = [], model: EmbeddingModel = Depends(get_embedding_model)
) -> GroupResponse:
    """
    Endpoint to update tabs with their embeddings and group them.

    Args:
        tabs (List[TabData]): A list of TabData to be updated.
        model (EmbeddingModel): The embedding model (injected dependency).

    Returns:
        GroupResponse: A response containing the grouped tabs.

    Raises:
        HTTPException: If an error occurs during the update process.
    """
    try:
        for tab in tabs:
            tab_text = f"{tab.title} {tab.url}"
            embedding = model.get_embeddings([tab_text])[0]
            embedding_storage.add_or_update_tab(
                tab.tab_id, embedding, {"title": tab.title, "url": tab.url}
            )

        all_embeddings = embedding_storage.get_all_embeddings()
        tab_data = embedding_storage.get_all_tab_data()
        labels = cluster_tabs(np.array(all_embeddings))
        grouped_tabs = group_tabs(tab_data, labels)
        return GroupResponse(groups=grouped_tabs)
    except Exception as e:
        logger.error(f"Error in update_tabs: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.post("/delete-tab", response_model=GroupResponse)
async def delete_tab(tab: TabRemoveData) -> GroupResponse:
    """
    Endpoint to delete a tab and update the grouping of remaining tabs.

    Args:
        tab (TabRemoveData): The TabRemoveData instance containing the ID of the tab to be removed.

    Returns:
        GroupResponse: A response containing the grouped tabs.

    Raises:
        HTTPException: If an error occurs during the deletion process.
    """
    try:
        embedding_storage.remove_tab(tab.tab_id)
        all_embeddings = embedding_storage.get_all_embeddings()
        if not all_embeddings:
            return GroupResponse(groups={})

        tab_data = embedding_storage.get_all_tab_data()
        labels = cluster_tabs(np.array(all_embeddings))
        grouped_tabs = group_tabs(tab_data, labels)

        return GroupResponse(groups=grouped_tabs)
    except Exception as e:
        logger.error(f"Error in delete_tab: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
