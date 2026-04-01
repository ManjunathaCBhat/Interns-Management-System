from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from database import db
from auth import get_current_user

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("/my-projects")
async def get_my_projects(current_user: dict = Depends(get_current_user)):
    """
    Get all projects assigned to the current intern
    """
    
    if current_user.get("role") != "intern":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only interns can access this endpoint"
        )
    
    intern_id = str(current_user.get("_id") or current_user.get("id"))
    
    
    projects_cursor = db.projects.find({
        "internIds": {"$in": [intern_id]}
    })
    
    projects = []
    async for project in projects_cursor:
        project["_id"] = str(project["_id"])
        projects.append(project)
    
    return projects


@router.get("/{project_id}/tasks")
async def get_project_tasks(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all tasks for a specific project
    """
    # Verify project exists
    try:
        project = await db.projects.find_one({"_id": ObjectId(project_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid project ID")
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    
    tasks_cursor = db.project_updates.find({
        "projectId": project_id
    })
    
    tasks = []
    async for task in tasks_cursor:
        task["_id"] = str(task["_id"])
        tasks.append(task)
    
    return tasks