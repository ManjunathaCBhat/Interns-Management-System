"""
Intern Lifecycle Manager - Simplified Backend
All routes in one file
"""
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime, date, timezone
from typing import Optional, List
from bson import ObjectId
import os
from dotenv import load_dotenv

# Import our modules
from database import connect_db, close_db, get_database
from auth import (
    get_password_hash, 
    verify_password, 
    create_access_token,
    get_current_active_user,
    get_admin_user
)
from models import (
    User, UserCreate, UserResponse, LoginRequest, Token,
    Intern, InternCreate, InternUpdate,
    DSUEntry, DSUCreate, DSUUpdate,
    Task, TaskCreate, TaskUpdate,
    Project, ProjectCreate, ProjectUpdate
)

load_dotenv()

# ==================== APP SETUP ====================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown"""
    await connect_db()
    yield
    await close_db()

app = FastAPI(
    title="Intern Lifecycle Manager",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
CORS_ORIGINS = eval(os.getenv("BACKEND_CORS_ORIGINS", '["http://localhost:5173"]'))
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== ROOT ROUTES ====================
@app.get("/")
async def root():
    return {"message": "Intern Lifecycle Manager API", "docs": "/docs"}

@app.get("/health")
async def health():
    return {"status": "healthy"}


# ==================== AUTH ROUTES ====================
@app.post("/api/v1/auth/login", response_model=Token)
async def login(credentials: LoginRequest, db = Depends(get_database)):
    """Login with email and password"""
    user = await db.users.find_one({"email": credentials.email})
    
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=400, detail="Inactive user")
    
    token = create_access_token(data={"sub": user["username"], "role": user["role"]})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/api/v1/auth/register", response_model=UserResponse, status_code=201)
async def register(user_data: UserCreate, db = Depends(get_database)):
    """Register new user"""
    existing = await db.users.find_one(
        {"$or": [{"email": user_data.email}, {"username": user_data.username}]}
    )
    
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_dict = user_data.model_dump()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    user_dict["is_active"] = True
    user_dict["created_at"] = datetime.now(timezone.utc)
    user_dict["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.users.insert_one(user_dict)
    
    return UserResponse(
        id=str(result.inserted_id),
        username=user_dict["username"],
        email=user_dict["email"],
        name=user_dict["name"],
        role=user_dict["role"],
        is_active=True
    )


# ==================== USER ROUTES ====================
@app.get("/api/v1/users/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """Get current user profile"""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        is_active=current_user.is_active
    )


# ==================== INTERN ROUTES ====================
@app.post("/api/v1/interns/", status_code=201)
async def create_intern(
    intern_data: InternCreate,
    db = Depends(get_database),
    admin: User = Depends(get_admin_user)
):
    """Create new intern (admin only)"""
    existing = await db.interns.find_one({"email": intern_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Intern already exists")
    
    intern_dict = intern_data.model_dump()
    intern_dict["status"] = "onboarding"
    intern_dict["taskCount"] = 0
    intern_dict["completedTasks"] = 0
    intern_dict["dsuStreak"] = 0
    intern_dict["joinedDate"] = date.today()
    intern_dict["created_at"] = datetime.now(timezone.utc)
    intern_dict["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.interns.insert_one(intern_dict)
    intern_dict["_id"] = str(result.inserted_id)
    
    return Intern(id=intern_dict["_id"], **intern_dict)

@app.get("/api/v1/interns/")
async def list_interns(
    status: Optional[str] = Query(None),
    internType: Optional[str] = Query(None),
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """List all interns with filters"""
    query = {}
    if status:
        query["status"] = status
    if internType:
        query["internType"] = internType
    
    interns = []
    async for intern in db.interns.find(query):
        intern["_id"] = str(intern["_id"])
        interns.append(intern)
    
    return interns

@app.get("/api/v1/interns/{intern_id}")
async def get_intern(
    intern_id: str,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get intern by ID"""
    intern = await db.interns.find_one({"_id": ObjectId(intern_id)})
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found")
    
    intern["_id"] = str(intern["_id"])
    return intern

@app.patch("/api/v1/interns/{intern_id}")
async def update_intern(
    intern_id: str,
    intern_update: InternUpdate,
    db = Depends(get_database),
    admin: User = Depends(get_admin_user)
):
    """Update intern (admin only)"""
    update_data = intern_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.interns.find_one_and_update(
        {"_id": ObjectId(intern_id)},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Intern not found")
    
    result["_id"] = str(result["_id"])
    return result

@app.delete("/api/v1/interns/{intern_id}", status_code=204)
async def delete_intern(
    intern_id: str,
    db = Depends(get_database),
    admin: User = Depends(get_admin_user)
):
    """Delete intern (admin only)"""
    result = await db.interns.delete_one({"_id": ObjectId(intern_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Intern not found")
    return None


# ==================== DSU ROUTES ====================
@app.post("/api/v1/dsu-entries/", status_code=201)
async def create_dsu(
    dsu_data: DSUCreate,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Create DSU entry"""
    existing = await db.dsu_entries.find_one({
        "internId": dsu_data.internId,
        "date": dsu_data.date
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="DSU already exists for this date")
    
    dsu_dict = dsu_data.model_dump()
    dsu_dict["status"] = "submitted"
    dsu_dict["submittedAt"] = datetime.now(timezone.utc)
    dsu_dict["created_at"] = datetime.now(timezone.utc)
    dsu_dict["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.dsu_entries.insert_one(dsu_dict)
    
    # Update intern's DSU streak
    await db.interns.update_one(
        {"_id": ObjectId(dsu_data.internId)},
        {"$inc": {"dsuStreak": 1}}
    )
    
    dsu_dict["_id"] = str(result.inserted_id)
    return dsu_dict

@app.get("/api/v1/dsu-entries/")
async def list_dsu_entries(
    intern_id: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """List DSU entries with filters"""
    query = {}
    if intern_id:
        query["internId"] = intern_id
    if date_from or date_to:
        query["date"] = {}
        if date_from:
            query["date"]["$gte"] = date_from
        if date_to:
            query["date"]["$lte"] = date_to
    
    entries = []
    async for entry in db.dsu_entries.find(query).sort("date", -1):
        entry["_id"] = str(entry["_id"])
        entries.append(entry)
    
    return entries

@app.patch("/api/v1/dsu-entries/{entry_id}")
async def update_dsu(
    entry_id: str,
    dsu_update: DSUUpdate,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Update DSU entry"""
    update_data = dsu_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    if "feedback" in update_data and current_user.role in ["admin", "mentor"]:
        update_data["reviewedBy"] = current_user.username
        update_data["reviewedAt"] = datetime.now(timezone.utc)
        update_data["status"] = "reviewed"
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.dsu_entries.find_one_and_update(
        {"_id": ObjectId(entry_id)},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="DSU entry not found")
    
    result["_id"] = str(result["_id"])
    return result


# ==================== TASK ROUTES ====================
@app.post("/api/v1/tasks/", status_code=201)
async def create_task(
    task_data: TaskCreate,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Create new task"""
    task_dict = task_data.model_dump()
    task_dict["status"] = "todo"
    task_dict["created_at"] = datetime.now(timezone.utc)
    task_dict["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.tasks.insert_one(task_dict)
    
    # Update intern's task count
    await db.interns.update_one(
        {"_id": ObjectId(task_data.internId)},
        {"$inc": {"taskCount": 1}}
    )
    
    task_dict["_id"] = str(result.inserted_id)
    return task_dict

@app.get("/api/v1/tasks/")
async def list_tasks(
    intern_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """List tasks with filters"""
    query = {}
    if intern_id:
        query["internId"] = intern_id
    if status:
        query["status"] = status
    
    tasks = []
    async for task in db.tasks.find(query).sort("dueDate", 1):
        task["_id"] = str(task["_id"])
        tasks.append(task)
    
    return tasks

@app.patch("/api/v1/tasks/{task_id}")
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Update task"""
    update_data = task_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    current_task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    if not current_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if update_data.get("status") == "completed" and current_task["status"] != "completed":
        update_data["completedAt"] = datetime.now(timezone.utc)
        await db.interns.update_one(
            {"_id": ObjectId(current_task["internId"])},
            {"$inc": {"completedTasks": 1}}
        )
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.tasks.find_one_and_update(
        {"_id": ObjectId(task_id)},
        {"$set": update_data},
        return_document=True
    )
    
    result["_id"] = str(result["_id"])
    return result


# ==================== PROJECT ROUTES ====================
@app.post("/api/v1/projects/", status_code=201)
async def create_project(
    project_data: ProjectCreate,
    db = Depends(get_database),
    admin: User = Depends(get_admin_user)
):
    """Create new project (admin only)"""
    existing = await db.projects.find_one({"name": project_data.name})
    if existing:
        raise HTTPException(status_code=400, detail="Project already exists")
    
    project_dict = project_data.model_dump()
    project_dict["status"] = "active"
    project_dict["internIds"] = []
    project_dict["created_at"] = datetime.now(timezone.utc)
    project_dict["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.projects.insert_one(project_dict)
    project_dict["_id"] = str(result.inserted_id)
    
    return project_dict

@app.get("/api/v1/projects/")
async def list_projects(
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """List all projects"""
    projects = []
    async for project in db.projects.find():
        project["_id"] = str(project["_id"])
        projects.append(project)
    
    return projects


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
