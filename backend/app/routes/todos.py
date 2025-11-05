from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.todo import TodoCreate, TodoUpdate, TodoResponse
from app.database.prisma import get_prisma_client
from app.core.dependencies import get_current_user_id
from prisma import Prisma
from typing import List

router = APIRouter(prefix="/todos", tags=["Todos"])


@router.get("", response_model=List[TodoResponse])
async def get_todos(
    user_id: str = Depends(get_current_user_id),
    prisma: Prisma = Depends(get_prisma_client)
):
    """
    Get all todos for the authenticated user.
    
    Returns a list of all todos belonging to the current user, sorted by creation date (newest first).
    """
    todos = await prisma.todo.find_many(
        where={"userId": user_id}
    )
    # Sort by creation date (newest first) - Prisma Python doesn't support order_by for MongoDB
    todos = sorted(todos, key=lambda x: x.createdAt, reverse=True)
    return todos


@router.post("", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo_data: TodoCreate,
    user_id: str = Depends(get_current_user_id),
    prisma: Prisma = Depends(get_prisma_client)
):
    """
    Create a new todo for the authenticated user.
    
    - **title**: Todo title (required, 1-500 characters)
    - **completed**: Completion status (default: false)
    - **dueDate**: Optional due date
    - **pinned**: Whether the todo is pinned (default: false)
    
    Returns the created todo object.
    """
    todo = await prisma.todo.create(
        data={
            "title": todo_data.title,
            "completed": todo_data.completed,
            "dueDate": todo_data.dueDate,
            "pinned": todo_data.pinned,
            "userId": user_id
        }
    )
    return todo


@router.put("/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: str,
    todo_data: TodoUpdate,
    user_id: str = Depends(get_current_user_id),
    prisma: Prisma = Depends(get_prisma_client)
):
    """
    Update an existing todo.
    
    Only the todo owner can update their todos.
    
    - **todo_id**: ID of the todo to update
    - **title**: Optional new title
    - **completed**: Optional completion status
    - **dueDate**: Optional due date
    - **pinned**: Optional pinned status
    
    Returns the updated todo object.
    """
    # Check if todo exists and belongs to user
    todo = await prisma.todo.find_unique(where={"id": todo_id})
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    if todo.userId != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this todo"
        )
    
    # Prepare update data (only include fields that are provided)
    update_data = {}
    if todo_data.title is not None:
        update_data["title"] = todo_data.title
    if todo_data.completed is not None:
        update_data["completed"] = todo_data.completed
    if todo_data.dueDate is not None:
        update_data["dueDate"] = todo_data.dueDate
    if todo_data.pinned is not None:
        update_data["pinned"] = todo_data.pinned
    
    # Update todo
    updated_todo = await prisma.todo.update(
        where={"id": todo_id},
        data=update_data
    )
    
    return updated_todo


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    todo_id: str,
    user_id: str = Depends(get_current_user_id),
    prisma: Prisma = Depends(get_prisma_client)
):
    """
    Delete a todo.
    
    Only the todo owner can delete their todos.
    
    - **todo_id**: ID of the todo to delete
    
    Returns 204 No Content on success.
    """
    # Check if todo exists and belongs to user
    todo = await prisma.todo.find_unique(where={"id": todo_id})
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    if todo.userId != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this todo"
        )
    
    # Delete todo
    await prisma.todo.delete(where={"id": todo_id})
    return None

