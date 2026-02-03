# """
# Intern Lifecycle Manager - Simplified Backend
# All routes in one file
# """
# from fastapi import FastAPI, Depends, HTTPException, status, Query
# from fastapi.middleware.cors import CORSMiddleware
# from contextlib import asynccontextmanager
# from datetime import datetime, date, timezone
# from typing import Optional, List
# from bson import ObjectId
# import os
# from dotenv import load_dotenv

# # Import our modules
# from database import connect_db, close_db, get_database
# from auth import (
#     get_password_hash, 
#     verify_password, 
#     create_access_token,
#     get_current_active_user,
#     get_admin_user
# )
# from models import (
#     User, UserCreate, UserResponse, LoginRequest, Token,
#     Intern, InternCreate, InternUpdate,
#     DSUEntry, DSUCreate, DSUUpdate,
#     Task, TaskCreate, TaskUpdate,
#     Project, ProjectCreate, ProjectUpdate
# )

# load_dotenv()

# # ==================== APP SETUP ====================
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     """Startup and shutdown"""
#     await connect_db()
#     yield
#     await close_db()

# app = FastAPI(
#     title="Intern Lifecycle Manager",
#     version="1.0.0",
#     lifespan=lifespan
# )

# # CORS
# CORS_ORIGINS = eval(os.getenv("BACKEND_CORS_ORIGINS", '["http://localhost:5173"]'))
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=CORS_ORIGINS,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ==================== ROOT ROUTES ====================
# @app.get("/")
# async def root():
#     return {"message": "Intern Lifecycle Manager API", "docs": "/docs"}

# @app.get("/health")
# async def health():
#     return {"status": "healthy"}


# # ==================== AUTH ROUTES ====================
# @app.post("/api/v1/auth/login", response_model=Token)
# async def login(credentials: LoginRequest, db = Depends(get_database)):
#     """Login with email and password"""
#     user = await db.users.find_one({"email": credentials.email})
    
#     if not user or not verify_password(credentials.password, user["hashed_password"]):
#         raise HTTPException(status_code=401, detail="Incorrect email or password")
    
#     if not user.get("is_active", True):
#         raise HTTPException(status_code=400, detail="Inactive user")
    
#     token = create_access_token(data={"sub": user["username"], "role": user["role"]})
#     return {"access_token": token, "token_type": "bearer"}

# @app.post("/api/v1/auth/register", response_model=UserResponse, status_code=201)
# async def register(user_data: UserCreate, db = Depends(get_database)):
#     """Register new user"""
#     existing = await db.users.find_one(
#         {"$or": [{"email": user_data.email}, {"username": user_data.username}]}
#     )
    
#     if existing:
#         raise HTTPException(status_code=400, detail="User already exists")
    
#     user_dict = user_data.model_dump()
#     user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
#     user_dict["is_active"] = True
#     user_dict["created_at"] = datetime.now(timezone.utc)
#     user_dict["updated_at"] = datetime.now(timezone.utc)
    
#     result = await db.users.insert_one(user_dict)
    
#     return UserResponse(
#         id=str(result.inserted_id),
#         username=user_dict["username"],
#         email=user_dict["email"],
#         name=user_dict["name"],
#         role=user_dict["role"],
#         is_active=True
#     )


# # ==================== USER ROUTES ====================
# @app.get("/api/v1/users/me", response_model=UserResponse)
# async def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
#     """Get current user profile"""
#     return UserResponse(
#         id=current_user.id,
#         username=current_user.username,
#         email=current_user.email,
#         name=current_user.name,
#         role=current_user.role,
#         is_active=current_user.is_active
#     )


# # ==================== INTERN ROUTES ====================
# @app.post("/api/v1/interns/", status_code=201)
# async def create_intern(
#     intern_data: InternCreate,
#     db = Depends(get_database),
#     admin: User = Depends(get_admin_user)
# ):
#     """Create new intern (admin only)"""
#     existing = await db.interns.find_one({"email": intern_data.email})
#     if existing:
#         raise HTTPException(status_code=400, detail="Intern already exists")
    
#     intern_dict = intern_data.model_dump()
#     intern_dict["status"] = "onboarding"
#     intern_dict["taskCount"] = 0
#     intern_dict["completedTasks"] = 0
#     intern_dict["dsuStreak"] = 0
#     intern_dict["joinedDate"] = date.today()
#     intern_dict["created_at"] = datetime.now(timezone.utc)
#     intern_dict["updated_at"] = datetime.now(timezone.utc)
    
#     result = await db.interns.insert_one(intern_dict)
#     intern_dict["_id"] = str(result.inserted_id)
    
#     return Intern(id=intern_dict["_id"], **intern_dict)

# @app.get("/api/v1/interns/")
# async def list_interns(
#     status: Optional[str] = Query(None),
#     internType: Optional[str] = Query(None),
#     db = Depends(get_database),
#     current_user: User = Depends(get_current_active_user)
# ):
#     """List all interns with filters"""
#     query = {}
#     if status:
#         query["status"] = status
#     if internType:
#         query["internType"] = internType
    
#     interns = []
#     async for intern in db.interns.find(query):
#         intern["_id"] = str(intern["_id"])
#         interns.append(intern)
    
#     return interns

# @app.get("/api/v1/interns/{intern_id}")
# async def get_intern(
#     intern_id: str,
#     db = Depends(get_database),
#     current_user: User = Depends(get_current_active_user)
# ):
#     """Get intern by ID"""
#     intern = await db.interns.find_one({"_id": ObjectId(intern_id)})
#     if not intern:
#         raise HTTPException(status_code=404, detail="Intern not found")
    
#     intern["_id"] = str(intern["_id"])
#     return intern

# @app.patch("/api/v1/interns/{intern_id}")
# async def update_intern(
#     intern_id: str,
#     intern_update: InternUpdate,
#     db = Depends(get_database),
#     admin: User = Depends(get_admin_user)
# ):
#     """Update intern (admin only)"""
#     update_data = intern_update.model_dump(exclude_unset=True)
#     if not update_data:
#         raise HTTPException(status_code=400, detail="No fields to update")
    
#     update_data["updated_at"] = datetime.now(timezone.utc)
    
#     result = await db.interns.find_one_and_update(
#         {"_id": ObjectId(intern_id)},
#         {"$set": update_data},
#         return_document=True
#     )
    
#     if not result:
#         raise HTTPException(status_code=404, detail="Intern not found")
    
#     result["_id"] = str(result["_id"])
#     return result

# @app.delete("/api/v1/interns/{intern_id}", status_code=204)
# async def delete_intern(
#     intern_id: str,
#     db = Depends(get_database),
#     admin: User = Depends(get_admin_user)
# ):
#     """Delete intern (admin only)"""
#     result = await db.interns.delete_one({"_id": ObjectId(intern_id)})
#     if result.deleted_count == 0:
#         raise HTTPException(status_code=404, detail="Intern not found")
#     return None


# # ==================== DSU ROUTES ====================
# @app.post("/api/v1/dsu-entries/", status_code=201)
# async def create_dsu(
#     dsu_data: DSUCreate,
#     db = Depends(get_database),
#     current_user: User = Depends(get_current_active_user)
# ):
#     """Create DSU entry"""
#     existing = await db.dsu_entries.find_one({
#         "internId": dsu_data.internId,
#         "date": dsu_data.date
#     })
    
#     if existing:
#         raise HTTPException(status_code=400, detail="DSU already exists for this date")
    
#     dsu_dict = dsu_data.model_dump()
#     dsu_dict["status"] = "submitted"
#     dsu_dict["submittedAt"] = datetime.now(timezone.utc)
#     dsu_dict["created_at"] = datetime.now(timezone.utc)
#     dsu_dict["updated_at"] = datetime.now(timezone.utc)
    
#     result = await db.dsu_entries.insert_one(dsu_dict)
    
#     # Update intern's DSU streak
#     await db.interns.update_one(
#         {"_id": ObjectId(dsu_data.internId)},
#         {"$inc": {"dsuStreak": 1}}
#     )
    
#     dsu_dict["_id"] = str(result.inserted_id)
#     return dsu_dict

# @app.get("/api/v1/dsu-entries/")
# async def list_dsu_entries(
#     intern_id: Optional[str] = Query(None),
#     date_from: Optional[date] = Query(None),
#     date_to: Optional[date] = Query(None),
#     db = Depends(get_database),
#     current_user: User = Depends(get_current_active_user)
# ):
#     """List DSU entries with filters"""
#     query = {}
#     if intern_id:
#         query["internId"] = intern_id
#     if date_from or date_to:
#         query["date"] = {}
#         if date_from:
#             query["date"]["$gte"] = date_from
#         if date_to:
#             query["date"]["$lte"] = date_to
    
#     entries = []
#     async for entry in db.dsu_entries.find(query).sort("date", -1):
#         entry["_id"] = str(entry["_id"])
#         entries.append(entry)
    
#     return entries

# @app.patch("/api/v1/dsu-entries/{entry_id}")
# async def update_dsu(
#     entry_id: str,
#     dsu_update: DSUUpdate,
#     db = Depends(get_database),
#     current_user: User = Depends(get_current_active_user)
# ):
#     """Update DSU entry"""
#     update_data = dsu_update.model_dump(exclude_unset=True)
#     if not update_data:
#         raise HTTPException(status_code=400, detail="No fields to update")
    
#     if "feedback" in update_data and current_user.role in ["admin", "scrum_master"]:
#         update_data["reviewedBy"] = current_user.username
#         update_data["reviewedAt"] = datetime.now(timezone.utc)
#         update_data["status"] = "reviewed"
    
#     update_data["updated_at"] = datetime.now(timezone.utc)
    
#     result = await db.dsu_entries.find_one_and_update(
#         {"_id": ObjectId(entry_id)},
#         {"$set": update_data},
#         return_document=True
#     )
    
#     if not result:
#         raise HTTPException(status_code=404, detail="DSU entry not found")
    
#     result["_id"] = str(result["_id"])
#     return result



# # ==================== TASK ROUTES ====================
# @app.post("/api/v1/tasks/", status_code=201)
# async def create_task(
#     task_data: TaskCreate,
#     db = Depends(get_database),
#     current_user: User = Depends(get_current_active_user)
# ):
#     """Create new task"""
#     # ✅ Use by_alias=False to get internal field names for database
#     task_dict = task_data.model_dump(by_alias=False)
    
#     if "status" not in task_dict or not task_dict["status"]:
#         task_dict["status"] = "NOT_STARTED"
    
#     task_dict["created_at"] = datetime.now(timezone.utc)
#     task_dict["updated_at"] = datetime.now(timezone.utc)
    
#     result = await db.tasks.insert_one(task_dict)
    
#     # Update intern's task count
#     await db.interns.update_one(
#         {"_id": ObjectId(task_data.internId)},
#         {"$inc": {"taskCount": 1}}
#     )
    
#     # ✅ Prepare response with alias conversion
#     task_dict["_id"] = str(result.inserted_id)
    
#     # Convert task_date to date for response
#     if "task_date" in task_dict and task_dict["task_date"]:
#         task_dict["date"] = task_dict["task_date"]
    
#     return task_dict


# @app.get("/api/v1/tasks/")
# async def list_tasks(
#     intern_id: Optional[str] = Query(None),
#     status: Optional[str] = Query(None),
#     db = Depends(get_database),
#     current_user: User = Depends(get_current_active_user)
# ):
#     """List tasks with filters"""
#     query = {}
#     if intern_id:
#         query["internId"] = intern_id
#     if status:
#         query["status"] = status
    
#     tasks = []
#     async for task in db.tasks.find(query).sort("created_at", -1):
#         task["_id"] = str(task["_id"])
        
#         # ✅ Convert task_date to date for frontend
#         if "task_date" in task and task["task_date"]:
#             task["date"] = task["task_date"]
        
#         tasks.append(task)
    
#     return tasks


# @app.patch("/api/v1/tasks/{task_id}")
# async def update_task(
#     task_id: str,
#     task_update: TaskUpdate,
#     db = Depends(get_database),
#     current_user: User = Depends(get_current_active_user)
# ):
#     """Update task"""
#     # ✅ Use by_alias=False to get internal field names
#     update_data = task_update.model_dump(exclude_unset=True, by_alias=False)
#     if not update_data:
#         raise HTTPException(status_code=400, detail="No fields to update")
    
#     current_task = await db.tasks.find_one({"_id": ObjectId(task_id)})
#     if not current_task:
#         raise HTTPException(status_code=404, detail="Task not found")
    
#     # ✅ Check for DONE status and update completion
#     if update_data.get("status") == "DONE" and current_task.get("status") != "DONE":
#         update_data["completedAt"] = datetime.now(timezone.utc)
#         await db.interns.update_one(
#             {"_id": ObjectId(current_task["internId"])},
#             {"$inc": {"completedTasks": 1}}
#         )
    
#     update_data["updated_at"] = datetime.now(timezone.utc)
    
#     result = await db.tasks.find_one_and_update(
#         {"_id": ObjectId(task_id)},
#         {"$set": update_data},
#         return_document=True
#     )
    
#     result["_id"] = str(result["_id"])
    
#     # ✅ Convert task_date to date for response
#     if "task_date" in result and result["task_date"]:
#         result["date"] = result["task_date"]
    
#     return result


# @app.delete("/api/v1/tasks/{task_id}", status_code=204)
# async def delete_task(
#     task_id: str,
#     db = Depends(get_database),
#     current_user: User = Depends(get_current_active_user)
# ):
#     """Delete task"""
#     task = await db.tasks.find_one({"_id": ObjectId(task_id)})
#     if not task:
#         raise HTTPException(status_code=404, detail="Task not found")
    
#     # Update intern's task count
#     await db.interns.update_one(
#         {"_id": ObjectId(task["internId"])},
#         {"$inc": {"taskCount": -1}}
#     )
    
#     result = await db.tasks.delete_one({"_id": ObjectId(task_id)})
#     if result.deleted_count == 0:
#         raise HTTPException(status_code=404, detail="Task not found")
    
#     return None





# # ==================== PROJECT ROUTES ====================
# @app.post("/api/v1/projects/", status_code=201)
# async def create_project(
#     project_data: ProjectCreate,
#     db = Depends(get_database),
#     admin: User = Depends(get_admin_user)
# ):
#     """Create new project (admin only)"""
#     existing = await db.projects.find_one({"name": project_data.name})
#     if existing:
#         raise HTTPException(status_code=400, detail="Project already exists")
    
#     project_dict = project_data.model_dump()
#     project_dict["status"] = "active"
#     project_dict["internIds"] = []
#     project_dict["created_at"] = datetime.now(timezone.utc)
#     project_dict["updated_at"] = datetime.now(timezone.utc)
    
#     result = await db.projects.insert_one(project_dict)
#     project_dict["_id"] = str(result.inserted_id)
    
#     return project_dict

# @app.get("/api/v1/projects/")
# async def list_projects(
#     db = Depends(get_database),
#     current_user: User = Depends(get_current_active_user)
# ):
#     """List all projects"""
#     projects = []
#     async for project in db.projects.find():
#         project["_id"] = str(project["_id"])
#         projects.append(project)
    
#     return projects


# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


"""
Intern Lifecycle Manager - Complete Backend with Batch Management
All routes in one file - Enhanced Version
"""
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime, date, timezone
from typing import Optional, List
from bson import ObjectId
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend folder first, then from root folder
env_path = Path(__file__).parent / '.env'
root_env_path = Path(__file__).parent.parent / '.env'

if env_path.exists():
    load_dotenv(env_path)
elif root_env_path.exists():
    load_dotenv(root_env_path)
else:
    load_dotenv()  # Try default locations


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
    User, UserCreate, UserUpdate, UserResponse, LoginRequest, Token,
    Intern, InternCreate, InternUpdate,
    DSUEntry, DSUCreate, DSUUpdate,
    Task, TaskCreate, TaskUpdate,
    Project, ProjectCreate, ProjectUpdate,
    PTO, PTOCreate, PTOUpdate,
    Batch, BatchCreate, BatchUpdate
)

# Admin emails that are auto-approved with admin role
ADMIN_EMAILS = [
    "mukund.hs@cirruslabs.io",
    "manjunatha.bhat@cirruslabs.io",
    "karan.ry@cirruslabs.io"
]


def normalize_email(email: str) -> str:
    """Normalize email to lowercase for consistent storage and lookup"""
    return email.lower().strip() if email else email


# ==================== APP SETUP ====================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown"""
    try:
        await connect_db()
    except Exception as exc:
        print(f"⚠️  Startup without database connection: {exc}")
    yield
    await close_db()


app = FastAPI(
    title="Intern Lifecycle Manager",
    version="2.0.0",
    lifespan=lifespan
)


# CORS
CORS_ORIGINS = eval(os.getenv("BACKEND_CORS_ORIGINS", '["http://localhost:5173"]'))
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== ROOT ROUTES ====================
@app.get("/")
async def root():
    return {"message": "Intern Lifecycle Manager API v2.0", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "healthy", "version": "2.0.0"}


# ==================== AUTH ROUTES ====================
@app.post("/api/v1/auth/login", response_model=Token)
async def login(credentials: LoginRequest, db = Depends(get_database)):
    """Login with email and password"""
    # Normalize email to lowercase
    email = normalize_email(credentials.email)

    user = await db.users.find_one({"email": email})

    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    if not user.get("is_active", True):
        raise HTTPException(status_code=400, detail="Your account has been deactivated")

    # Check if user is approved (admins are always approved)
    if not user.get("is_approved", False) and user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Your account is pending admin approval. Please wait for approval."
        )

    token = create_access_token(data={"sub": user["username"], "role": user["role"]})

    user_response = UserResponse(
        id=str(user["_id"]),
        username=user["username"],
        email=user["email"],
        name=user["name"],
        employee_id=user.get("employee_id"),
        role=user["role"],
        is_active=user.get("is_active", True),
        is_approved=user.get("is_approved", False),
        created_at=user.get("created_at", datetime.now(timezone.utc))
    )

    return {"access_token": token, "token_type": "bearer", "user": user_response}


@app.post("/api/v1/auth/register", response_model=UserResponse, status_code=201)
async def register(user_data: UserCreate, db = Depends(get_database)):
    """Register new user - requires admin approval"""
    # Normalize email to lowercase
    email = normalize_email(user_data.email)
    username = user_data.username.lower().strip()

    existing = await db.users.find_one(
        {"$or": [{"email": email}, {"username": username}]}
    )

    if existing:
        raise HTTPException(status_code=400, detail="User with this email or username already exists")

    # Check if this is an admin email (auto-approve with admin role)
    is_admin = email in ADMIN_EMAILS
    role = "admin" if is_admin else "intern"
    is_approved = is_admin  # Admins are auto-approved

    user_dict = {
        "username": username,
        "email": email,
        "name": user_data.name,
        "employee_id": user_data.employee_id,
        "hashed_password": get_password_hash(user_data.password),
        "role": role,
        "is_active": True,
        "is_approved": is_approved,
        "auth_provider": "password",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    result = await db.users.insert_one(user_dict)

    return UserResponse(
        id=str(result.inserted_id),
        username=user_dict["username"],
        email=user_dict["email"],
        name=user_dict["name"],
        employee_id=user_dict["employee_id"],
        role=user_dict["role"],
        is_active=True,
        is_approved=is_approved
    )


@app.post("/api/v1/auth/sso/azure", response_model=Token)
async def azure_sso(azure_token: dict, db = Depends(get_database)):
    """
    Azure SSO authentication endpoint.
    Expects: { "access_token": "azure_token_string" }
    """
    from azure_auth import validate_azure_token, get_or_create_azure_user

    if not azure_token.get("access_token"):
        raise HTTPException(status_code=400, detail="Missing access_token")

    # Validate Azure token and get user info
    azure_user = await validate_azure_token(azure_token["access_token"])

    # Get or create user in our database
    user_doc = await get_or_create_azure_user(azure_user, db)

    # Check if user is approved (admins are always approved)
    if not user_doc.get("is_approved", False) and user_doc.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Your account is pending admin approval. Please wait for approval."
        )

    # Normalize role - convert any invalid roles to 'intern'
    valid_roles = ["admin", "scrum_master", "intern"]
    user_role = user_doc.get("role", "intern")
    if user_role not in valid_roles:
        user_role = "intern"
        # Update the user's role in the database
        await db.users.update_one(
            {"_id": user_doc["_id"]},
            {"$set": {"role": "intern"}}
        )

    # Create our own JWT token for the user
    our_token = create_access_token(
        data={"sub": user_doc["username"], "role": user_role}
    )

    # Prepare user response
    user_response = UserResponse(
        id=str(user_doc["_id"]),
        username=user_doc["username"],
        email=user_doc["email"],
        name=user_doc.get("name", ""),
        employee_id=user_doc.get("employee_id"),
        role=user_role,
        is_active=user_doc.get("is_active", True),
        is_approved=user_doc.get("is_approved", False),
        created_at=user_doc.get("created_at", datetime.now(timezone.utc))
    )

    return {
        "access_token": our_token,
        "token_type": "bearer",
        "user": user_response
    }


@app.post("/api/v1/auth/sso/azure/callback", response_model=Token)
async def azure_sso_callback(request: dict, db = Depends(get_database)):
    """
    Handle Azure SSO callback with authorization code.
    Expects: { "code": "authorization_code_from_azure" }
    
    Note: In production, exchange the code for a token on the backend.
    For now, we expect the frontend to send us the token after getting it.
    """
    import httpx
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    code = request.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")
    
    try:
        # Exchange authorization code for token
        tenant_id = os.getenv("tenant_id")
        client_id = os.getenv("client_id")
        secret_key = os.getenv("AZURE_SECRET_KEY")
        redirect_uri = os.getenv("AZURE_REDIRECT_URI", "http://localhost:5173/auth/azure-callback")
        
        print(f"[Azure SSO] tenant_id: {tenant_id}")
        print(f"[Azure SSO] client_id: {client_id}")
        print(f"[Azure SSO] secret_key present: {bool(secret_key)}")
        print(f"[Azure SSO] redirect_uri: {redirect_uri}")
        
        if not all([tenant_id, client_id, secret_key]):
            missing = []
            if not tenant_id: missing.append("tenant_id")
            if not client_id: missing.append("client_id")
            if not secret_key: missing.append("AZURE_SECRET_KEY")
            raise HTTPException(status_code=500, detail=f"Azure configuration incomplete. Missing: {', '.join(missing)}")
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token",
                data={
                    "client_id": client_id,
                    "client_secret": secret_key,
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                    "scope": "User.Read openid profile email"
                },
                timeout=10.0
            )
            
            if token_response.status_code != 200:
                error_text = token_response.text
                print(f"[Azure SSO] Token exchange error: {error_text}")
                print(f"[Azure SSO] Status code: {token_response.status_code}")
                print(f"[Azure SSO] Redirect URI used: {os.getenv('AZURE_REDIRECT_URI', 'http://localhost:5173/auth/azure-callback')}")
                try:
                    error_data = token_response.json()
                    print(f"[Azure SSO] Error response: {error_data}")
                except:
                    pass
                raise HTTPException(status_code=401, detail=f"Failed to exchange code for token: {error_text}")
            
            token_data = token_response.json()
            access_token = token_data.get("access_token")
            
            if not access_token:
                raise HTTPException(status_code=401, detail="No access token in response")
        
        # Validate token and get/create user
        from azure_auth import validate_azure_token, get_or_create_azure_user

        azure_user = await validate_azure_token(access_token)
        user_doc = await get_or_create_azure_user(azure_user, db)

        # Check if user is approved (admins are always approved)
        if not user_doc.get("is_approved", False) and user_doc.get("role") != "admin":
            raise HTTPException(
                status_code=403,
                detail="Your account is pending admin approval. Please wait for approval."
            )

        # Create our JWT token
        # Normalize role - convert any invalid roles to 'intern'
        valid_roles = ["admin", "scrum_master", "intern"]
        user_role = user_doc.get("role", "intern")
        if user_role not in valid_roles:
            user_role = "intern"
            # Update the user's role in the database
            await db.users.update_one(
                {"_id": user_doc["_id"]},
                {"$set": {"role": "intern"}}
            )

        our_token = create_access_token(
            data={"sub": user_doc["username"], "role": user_role}
        )

        user_response = UserResponse(
            id=str(user_doc["_id"]),
            username=user_doc["username"],
            email=user_doc["email"],
            name=user_doc.get("name", ""),
            employee_id=user_doc.get("employee_id"),
            role=user_role,
            is_active=user_doc.get("is_active", True),
            is_approved=user_doc.get("is_approved", False),
            created_at=user_doc.get("created_at", datetime.now(timezone.utc))
        )

        return {
            "access_token": our_token,
            "token_type": "bearer",
            "user": user_response
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Azure callback error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


# ==================== USER ROUTES ====================
@app.get("/api/v1/users/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """Get current user profile"""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        name=current_user.name,
        employee_id=current_user.employee_id,
        role=current_user.role,
        is_active=current_user.is_active,
        is_approved=current_user.is_approved,
        created_at=current_user.created_at
    )


# ==================== ADMIN USER MANAGEMENT ROUTES ====================
@app.get("/api/v1/admin/users")
async def list_users(
    pending_only: bool = Query(False, description="Filter to show only pending approval users"),
    role: Optional[str] = Query(None, description="Filter by role"),
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """List all users (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    query = {}
    if pending_only:
        query["is_approved"] = False
    if role:
        query["role"] = role

    users = []
    async for user in db.users.find(query).sort("created_at", -1):
        users.append({
            "id": str(user["_id"]),
            "username": user.get("username"),
            "email": user.get("email"),
            "name": user.get("name"),
            "employee_id": user.get("employee_id"),
            "role": user.get("role"),
            "is_active": user.get("is_active", True),
            "is_approved": user.get("is_approved", False),
            "auth_provider": user.get("auth_provider"),
            "created_at": user.get("created_at")
        })

    return users


@app.get("/api/v1/admin/users/pending")
async def list_pending_users(
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """List users pending approval (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    users = []
    async for user in db.users.find({"is_approved": False}).sort("created_at", -1):
        users.append({
            "id": str(user["_id"]),
            "username": user.get("username"),
            "email": user.get("email"),
            "name": user.get("name"),
            "employee_id": user.get("employee_id"),
            "role": user.get("role"),
            "is_active": user.get("is_active", True),
            "is_approved": False,
            "auth_provider": user.get("auth_provider"),
            "created_at": user.get("created_at")
        })

    return users


@app.patch("/api/v1/admin/users/{user_id}")
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Update user - approve and assign role (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    update_data = user_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_data["updated_at"] = datetime.now(timezone.utc)

    result = await db.users.find_one_and_update(
        {"_id": ObjectId(user_id)},
        {"$set": update_data},
        return_document=True
    )

    if not result:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": str(result["_id"]),
        "username": result.get("username"),
        "email": result.get("email"),
        "name": result.get("name"),
        "employee_id": result.get("employee_id"),
        "role": result.get("role"),
        "is_active": result.get("is_active", True),
        "is_approved": result.get("is_approved", False),
        "auth_provider": result.get("auth_provider"),
        "created_at": result.get("created_at"),
        "updated_at": result.get("updated_at")
    }


@app.delete("/api/v1/admin/users/{user_id}", status_code=204)
async def delete_user(
    user_id: str,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Delete user (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    # Prevent deleting self
    if str(current_user.id) == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return None


# ==================== ADMIN DASHBOARD ROUTES ====================
@app.get("/api/v1/admin/dashboard/stats")
async def get_dashboard_stats(
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get comprehensive admin dashboard statistics"""
    if current_user.role not in ["admin", "scrum_master"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    today = date.today().isoformat()
    
    # Fetch all data in parallel
    total_interns = await db.interns.count_documents({})
    active_interns = await db.interns.count_documents({"status": "active"})
    project_interns = await db.interns.count_documents({"internType": "project"})
    rs_interns = await db.interns.count_documents({"internType": "rs"})
    paid_interns = await db.interns.count_documents({"isPaid": True})
    
    total_tasks = await db.tasks.count_documents({})
    completed_tasks = await db.tasks.count_documents({"status": "DONE"})
    
    # DSU stats for today
    todays_dsus = await db.dsu_entries.count_documents({"date": today})
    submitted_dsus = await db.dsu_entries.count_documents({"date": today, "status": "submitted"})
    
    # PTO stats
    pending_ptos = await db.pto.count_documents({"status": "pending"})
    approved_ptos = await db.pto.count_documents({"status": "approved"})
    
    # Calculate DSU completion percentage
    dsu_completion = 0
    if active_interns > 0:
        dsu_completion = round((submitted_dsus / active_interns) * 100)
    
    # Task completion percentage
    task_completion = 0
    if total_tasks > 0:
        task_completion = round((completed_tasks / total_tasks) * 100)
    
    # Batch stats
    total_batches = await db.batches.count_documents({})
    active_batches = await db.batches.count_documents({"status": "active"})
    upcoming_batches = await db.batches.count_documents({"status": "upcoming"})
    
    return {
        "totalInterns": total_interns,
        "activeInterns": active_interns,
        "projectInterns": project_interns,
        "rsInterns": rs_interns,
        "paidInterns": paid_interns,
        "totalTasks": total_tasks,
        "completedTasks": completed_tasks,
        "taskCompletion": task_completion,
        "submittedDSUs": submitted_dsus,
        "pendingDSUs": active_interns - submitted_dsus,
        "dsuCompletion": dsu_completion,
        "pendingPTOs": pending_ptos,
        "approvedPTOs": approved_ptos,
        "totalBatches": total_batches,
        "activeBatches": active_batches,
        "upcomingBatches": upcoming_batches,
    }


@app.get("/api/v1/admin/dashboard/recent-interns")
async def get_recent_interns(
    limit: int = 5,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get recently added interns"""
    if current_user.role not in ["admin", "scrum_master"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    interns = []
    async for intern in db.interns.find().sort("created_at", -1).limit(limit):
        intern["_id"] = str(intern["_id"])
        # Convert date to ISO string if needed
        if "joinedDate" in intern and isinstance(intern["joinedDate"], date):
            intern["joinedDate"] = intern["joinedDate"].isoformat()
        interns.append(intern)
    
    return interns


@app.get("/api/v1/admin/dashboard/blocked-interns")
async def get_blocked_interns(
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get interns with blockers from today's DSU"""
    if current_user.role not in ["admin", "scrum_master"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    today = date.today().isoformat()
    
    blocked = []
    async for dsu in db.dsu_entries.find({
        "date": today,
        "blockers": {"$ne": "", "$ne": None, "$exists": True}
    }):
        dsu["_id"] = str(dsu["_id"])
        
        # Get intern details
        intern = await db.interns.find_one({"_id": ObjectId(dsu["internId"])})
        if intern:
            dsu["internName"] = intern.get("name", "Unknown")
            dsu["internEmail"] = intern.get("email", "")
            dsu["batch"] = intern.get("batch", "")
        
        blocked.append(dsu)
    
    return blocked


@app.get("/api/v1/admin/dashboard/blocked-dsus")
async def get_blocked_dsus(
    limit: int = 5,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get DSUs with blockers from today - alias for blocked-interns"""
    if current_user.role not in ["admin", "scrum_master"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    today = date.today().isoformat()
    
    blocked = []
    async for dsu in db.dsu_entries.find({
        "date": today,
        "blockers": {"$nin": ["", None]}
    }).limit(limit):
        dsu["_id"] = str(dsu["_id"])
        
        # Get intern details
        try:
            intern = await db.interns.find_one({"_id": ObjectId(dsu["internId"])})
            if intern:
                dsu["internName"] = intern.get("name", "Unknown")
        except:
            dsu["internName"] = "Unknown"
        
        blocked.append(dsu)
    
    return blocked


@app.get("/api/v1/admin/dashboard/recent-dsus")
async def get_recent_dsus(
    limit: int = 5,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get recently submitted DSU entries"""
    if current_user.role not in ["admin", "scrum_master"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    dsus = []
    async for dsu in db.dsu_entries.find().sort("submittedAt", -1).limit(limit):
        dsu["_id"] = str(dsu["_id"])
        
        # Get intern details
        try:
            intern = await db.interns.find_one({"_id": ObjectId(dsu["internId"])})
            if intern:
                dsu["internName"] = intern.get("name", "Unknown")
        except:
            dsu["internName"] = "Unknown"
        
        dsus.append(dsu)
    
    return dsus


@app.get("/api/v1/admin/dashboard/pending-ptos")
async def get_pending_ptos(
    limit: int = 5,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get pending PTO requests"""
    if current_user.role not in ["admin", "scrum_master"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    ptos = []
    async for pto in db.pto.find({"status": "pending"}).sort("created_at", -1).limit(limit):
        pto["_id"] = str(pto["_id"])
        
        # Get intern details
        intern = await db.interns.find_one({"_id": ObjectId(pto["internId"])})
        if intern:
            pto["internName"] = intern.get("name", "Unknown")
            pto["batch"] = intern.get("batch", "")
        
        ptos.append(pto)
    
    return ptos


@app.get("/api/v1/admin/analytics/batch-performance")
async def get_batch_performance(
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get performance analytics by batch"""
    if current_user.role not in ["admin", "scrum_master"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    batches = []
    async for batch in db.batches.find({"status": {"$in": ["active", "completed"]}}):
        batch["_id"] = str(batch["_id"])
        
        # Get batch interns
        batch_interns = []
        async for intern in db.interns.find({"batch": batch["batchId"]}):
            batch_interns.append(intern)
        
        if batch_interns:
            # Calculate averages
            avg_completion = sum(i.get("completedTasks", 0) / max(i.get("taskCount", 1), 1) * 100 for i in batch_interns) / len(batch_interns)
            avg_streak = sum(i.get("dsuStreak", 0) for i in batch_interns) / len(batch_interns)
            
            batch["avgTaskCompletion"] = round(avg_completion, 2)
            batch["avgDSUStreak"] = round(avg_streak, 1)
        else:
            batch["avgTaskCompletion"] = 0
            batch["avgDSUStreak"] = 0
        
        batches.append(batch)
    
    return batches


# ==================== BATCH ROUTES ====================
@app.post("/api/v1/batches/", status_code=201)
async def create_batch(
    batch_data: BatchCreate,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new batch"""
    if current_user.role not in ["admin", "scrum_master"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if batch ID already exists
    existing = await db.batches.find_one({"batchId": batch_data.batchId})
    if existing:
        raise HTTPException(status_code=400, detail="Batch ID already exists")
    
    # Determine status based on start date
    start_date = datetime.fromisoformat(batch_data.startDate.replace('Z', '+00:00'))
    today = datetime.now(timezone.utc)
    
    if start_date > today:
        status = "upcoming"
    else:
        end_date = datetime.fromisoformat(batch_data.endDate.replace('Z', '+00:00'))
        if end_date < today:
            status = "completed"
        else:
            status = "active"
    
    batch_dict = batch_data.model_dump()
    batch_dict["status"] = status
    batch_dict["totalInterns"] = 0
    batch_dict["activeInterns"] = 0
    batch_dict["completedInterns"] = 0
    batch_dict["droppedInterns"] = 0
    batch_dict["averageRating"] = 0.0
    batch_dict["averageTaskCompletion"] = 0.0
    batch_dict["averageDSUStreak"] = 0
    batch_dict["created_at"] = datetime.now(timezone.utc)
    batch_dict["updated_at"] = datetime.now(timezone.utc)
    batch_dict["createdBy"] = current_user.username
    
    result = await db.batches.insert_one(batch_dict)
    batch_dict["_id"] = str(result.inserted_id)
    
    return batch_dict


@app.get("/api/v1/batches/")
async def list_batches(
    status: Optional[str] = Query(None),
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """List all batches with stats"""
    query = {}
    if status:
        query["status"] = status
    
    batches = []
    async for batch in db.batches.find(query).sort("startDate", -1):
        batch["_id"] = str(batch["_id"])
        
        # Update intern counts
        batch_interns = await db.interns.count_documents({"batch": batch["batchId"]})
        active_interns = await db.interns.count_documents({
            "batch": batch["batchId"],
            "status": "active"
        })
        completed_interns = await db.interns.count_documents({
            "batch": batch["batchId"],
            "status": "completed"
        })
        dropped_interns = await db.interns.count_documents({
            "batch": batch["batchId"],
            "status": "dropped"
        })
        
        batch["totalInterns"] = batch_interns
        batch["activeInterns"] = active_interns
        batch["completedInterns"] = completed_interns
        batch["droppedInterns"] = dropped_interns
        
        batches.append(batch)
    
    return batches


@app.get("/api/v1/batches/{batch_id}")
async def get_batch(
    batch_id: str,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get batch by ID with intern details"""
    batch = await db.batches.find_one({"batchId": batch_id})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    batch["_id"] = str(batch["_id"])
    
    # Get detailed stats
    interns = []
    async for intern in db.interns.find({"batch": batch_id}).sort("name", 1):
        intern["_id"] = str(intern["_id"])
        if "joinedDate" in intern and isinstance(intern["joinedDate"], date):
            intern["joinedDate"] = intern["joinedDate"].isoformat()
        interns.append(intern)
    
    batch["interns"] = interns
    batch["totalInterns"] = len(interns)
    batch["activeInterns"] = len([i for i in interns if i["status"] == "active"])
    batch["completedInterns"] = len([i for i in interns if i["status"] == "completed"])
    batch["droppedInterns"] = len([i for i in interns if i["status"] == "dropped"])
    
    # Calculate performance metrics
    if interns:
        avg_completion = sum(i.get("completedTasks", 0) / max(i.get("taskCount", 1), 1) * 100 for i in interns) / len(interns)
        avg_streak = sum(i.get("dsuStreak", 0) for i in interns) / len(interns)
        batch["averageTaskCompletion"] = round(avg_completion, 2)
        batch["averageDSUStreak"] = round(avg_streak, 1)
    
    return batch


@app.patch("/api/v1/batches/{batch_id}")
async def update_batch(
    batch_id: str,
    batch_update: BatchUpdate,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Update batch"""
    if current_user.role not in ["admin", "scrum_master"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    batch = await db.batches.find_one({"batchId": batch_id})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    update_data = batch_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.batches.find_one_and_update(
        {"batchId": batch_id},
        {"$set": update_data},
        return_document=True
    )
    
    result["_id"] = str(result["_id"])
    return result


@app.delete("/api/v1/batches/{batch_id}", status_code=204)
async def delete_batch(
    batch_id: str,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Delete batch (only if no interns)"""
    if current_user.role not in ["admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if batch has interns
    intern_count = await db.interns.count_documents({"batch": batch_id})
    if intern_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete batch with {intern_count} interns. Remove interns first."
        )
    
    result = await db.batches.delete_one({"batchId": batch_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    return None


@app.get("/api/v1/batches/{batch_id}/interns")
async def get_batch_interns(
    batch_id: str,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get all interns in a batch"""
    interns = []
    async for intern in db.interns.find({"batch": batch_id}).sort("name", 1):
        intern["_id"] = str(intern["_id"])
        if "joinedDate" in intern and isinstance(intern["joinedDate"], date):
            intern["joinedDate"] = intern["joinedDate"].isoformat()
        interns.append(intern)
    
    return interns


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
    
    # Validate batch exists if provided
    if intern_data.batch:
        batch = await db.batches.find_one({"batchId": intern_data.batch})
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        # Check max capacity
        current_count = await db.interns.count_documents({"batch": intern_data.batch})
        if current_count >= batch.get("maxInterns", 50):
            raise HTTPException(status_code=400, detail="Batch is full")
    
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
    intern_dict["joinedDate"] = intern_dict["joinedDate"].isoformat()
    
    return intern_dict


@app.get("/api/v1/interns/")
async def list_interns(
    status: Optional[str] = Query(None),
    internType: Optional[str] = Query(None),
    batch: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """List all interns with filters and pagination"""
    query = {}
    if status:
        query["status"] = status
    if internType:
        query["internType"] = internType
    if batch:
        query["batch"] = batch
    
    total = await db.interns.count_documents(query)
    
    interns = []
    async for intern in db.interns.find(query).skip(skip).limit(limit):
        intern["_id"] = str(intern["_id"])
        if "joinedDate" in intern and isinstance(intern["joinedDate"], date):
            intern["joinedDate"] = intern["joinedDate"].isoformat()
        interns.append(intern)
    
    return {
        "items": interns,
        "total": total,
        "skip": skip,
        "limit": limit
    }


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
    if "joinedDate" in intern and isinstance(intern["joinedDate"], date):
        intern["joinedDate"] = intern["joinedDate"].isoformat()
    
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
    if "joinedDate" in result and isinstance(result["joinedDate"], date):
        result["joinedDate"] = result["joinedDate"].isoformat()
    
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
    batch: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """List DSU entries with filters"""
    query = {}
    if intern_id:
        query["internId"] = intern_id
    if batch:
        # Get all interns in batch first
        intern_ids = []
        async for intern in db.interns.find({"batch": batch}):
            intern_ids.append(str(intern["_id"]))
        query["internId"] = {"$in": intern_ids}
    if date_from or date_to:
        query["date"] = {}
        if date_from:
            query["date"]["$gte"] = str(date_from)
        if date_to:
            query["date"]["$lte"] = str(date_to)
    
    entries = []
    async for entry in db.dsu_entries.find(query).sort("date", -1):
        entry["_id"] = str(entry["_id"])
        
        # Add intern details
        intern = await db.interns.find_one({"_id": ObjectId(entry["internId"])})
        if intern:
            entry["internName"] = intern.get("name", "Unknown")
            entry["batch"] = intern.get("batch", "")
        
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
    
    if "feedback" in update_data and current_user.role in ["admin", "scrum_master"]:
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
    task_dict = task_data.model_dump(by_alias=False)
    
    if "status" not in task_dict or not task_dict["status"]:
        task_dict["status"] = "NOT_STARTED"
    
    task_dict["created_at"] = datetime.now(timezone.utc)
    task_dict["updated_at"] = datetime.now(timezone.utc)
    task_dict["createdBy"] = current_user.username
    
    result = await db.tasks.insert_one(task_dict)
    
    # Update intern's task count
    await db.interns.update_one(
        {"_id": ObjectId(task_data.internId)},
        {"$inc": {"taskCount": 1}}
    )
    
    task_dict["_id"] = str(result.inserted_id)
    
    if "task_date" in task_dict and task_dict["task_date"]:
        task_dict["date"] = task_dict["task_date"]
    
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
    async for task in db.tasks.find(query).sort("created_at", -1):
        task["_id"] = str(task["_id"])
        
        if "task_date" in task and task["task_date"]:
            task["date"] = task["task_date"]
        
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
    update_data = task_update.model_dump(exclude_unset=True, by_alias=False)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    current_task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    if not current_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if update_data.get("status") == "DONE" and current_task.get("status") != "DONE":
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
    
    if "task_date" in result and result["task_date"]:
        result["date"] = result["task_date"]
    
    return result


@app.delete("/api/v1/tasks/{task_id}", status_code=204)
async def delete_task(
    task_id: str,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Delete task"""
    task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await db.interns.update_one(
        {"_id": ObjectId(task["internId"])},
        {"$inc": {"taskCount": -1}}
    )
    
    result = await db.tasks.delete_one({"_id": ObjectId(task_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return None


# ==================== PTO ROUTES ====================
@app.post("/api/v1/pto/", status_code=201)
async def create_pto(
    pto_data: PTOCreate,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Create PTO request"""
    pto_dict = pto_data.model_dump()
    pto_dict["status"] = "pending"
    pto_dict["created_at"] = datetime.now(timezone.utc)
    pto_dict["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.pto.insert_one(pto_dict)
    pto_dict["_id"] = str(result.inserted_id)
    
    return pto_dict


@app.get("/api/v1/pto/")
async def list_ptos(
    status: Optional[str] = Query(None),
    intern_id: Optional[str] = Query(None),
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """List PTO requests"""
    query = {}
    if status:
        query["status"] = status
    if intern_id:
        query["internId"] = intern_id
    
    ptos = []
    async for pto in db.pto.find(query).sort("created_at", -1):
        pto["_id"] = str(pto["_id"])
        
        # Add intern details
        intern = await db.interns.find_one({"_id": ObjectId(pto["internId"])})
        if intern:
            pto["internName"] = intern.get("name", "Unknown")
            pto["batch"] = intern.get("batch", "")
        
        ptos.append(pto)
    
    return ptos


@app.patch("/api/v1/pto/{pto_id}")
async def update_pto(
    pto_id: str,
    pto_update: PTOUpdate,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Update PTO request (approve/reject)"""
    if current_user.role not in ["admin", "scrum_master"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = pto_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    if "status" in update_data and update_data["status"] in ["approved", "rejected"]:
        update_data["approvedBy"] = current_user.username
        update_data["approvedAt"] = datetime.now(timezone.utc)
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.pto.find_one_and_update(
        {"_id": ObjectId(pto_id)},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="PTO not found")
    
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
    port = int(os.getenv("PORT", "8000"))
    reload_enabled = os.getenv("RELOAD", "false").lower() == "true"
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload_enabled)
