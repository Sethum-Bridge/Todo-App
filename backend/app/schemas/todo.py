from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class TodoCreate(BaseModel):
    """
    Schema for creating a new todo.
    """
    title: str = Field(..., min_length=1, max_length=500, description="Todo title")
    completed: bool = Field(default=False, description="Completion status")
    dueDate: Optional[datetime] = Field(None, description="Due date for the todo")
    pinned: bool = Field(default=False, description="Whether the todo is pinned")
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Complete project documentation",
                "completed": False,
                "dueDate": "2024-12-31T23:59:59Z",
                "pinned": True
            }
        }


class TodoUpdate(BaseModel):
    """
    Schema for updating an existing todo.
    """
    title: Optional[str] = Field(None, min_length=1, max_length=500, description="Todo title")
    completed: Optional[bool] = Field(None, description="Completion status")
    dueDate: Optional[datetime] = Field(None, description="Due date for the todo")
    pinned: Optional[bool] = Field(None, description="Whether the todo is pinned")
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Updated todo title",
                "completed": True,
                "dueDate": "2024-12-31T23:59:59Z",
                "pinned": False
            }
        }


class TodoResponse(BaseModel):
    """
    Schema for todo response.
    """
    id: str
    title: str
    completed: bool
    dueDate: Optional[datetime]
    pinned: bool
    userId: str
    createdAt: datetime
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "title": "Complete project documentation",
                "completed": False,
                "dueDate": "2024-12-31T23:59:59Z",
                "pinned": True,
                "userId": "507f1f77bcf86cd799439012",
                "createdAt": "2024-01-01T00:00:00Z"
            }
        }

