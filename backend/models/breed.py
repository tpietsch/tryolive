from sqlmodel import SQLModel, Field
from typing import Optional


class Breed(SQLModel, table=True):
    """Breed model with image"""
    id: Optional[int] = Field(default=None, primary_key=True)
    breed: str = Field(index=True)
    image: str
