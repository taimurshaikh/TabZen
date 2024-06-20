from pydantic import BaseModel
from typing import List, Dict


class TabData(BaseModel):
    """
    Pydantic model representing data for a single tab.

    Attributes:
        tab_id (int): Unique identifier for the tab.
        url (str): URL associated with the tab.
        title (str): Title of the tab.
    """

    tab_id: int
    url: str
    title: str


class TabRemoveData(BaseModel):
    """
    Pydantic model representing data to remove a tab.

    Attributes:
        tab_id (int): Unique identifier of the tab to be removed.
    """

    tab_id: int


class GroupResponse(BaseModel):
    """
    Pydantic model representing response data grouped by identifiers.

    Attributes:
        groups (Dict[int, List[TabData]]): Dictionary mapping group identifiers to lists of TabData.
    """

    groups: Dict[int, List[TabData]]
