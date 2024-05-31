# backend/app/schemas.py
from typing import List
from pydantic import BaseModel


class TabData(BaseModel):
    tab_id: int
    url: str
    title: str


class TabRemoveData(BaseModel):
    tab_id: int


class GroupResponse(BaseModel):
    groups: List[int]
