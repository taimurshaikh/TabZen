# backend/app/schemas.py
from pydantic import BaseModel
from typing import List, Dict


class TabData(BaseModel):
    tab_id: int
    url: str
    title: str


class TabRemoveData(BaseModel):
    tab_id: int


class GroupResponse(BaseModel):
    groups: Dict[int, List[TabData]]
