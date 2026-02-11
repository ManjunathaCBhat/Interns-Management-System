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
from pydantic import BaseModel, EmailStr
import os
from pathlib import Path
from dotenv import load_dotenv
from urllib.parse import quote
import httpx
from utils.security import hash_password

=======
from urllib.parse import quote
import json
import httpx

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
    Batch, BatchCreate, BatchUpdate,
    BatchYear, BatchMonth, Organization,
    OfficeAttendanceCreate,
    MentorRequestCreate, MentorRequestUpdate
)

# Admin emails that are auto-approved with admin role
ADMIN_EMAILS = [
    "mukund.hs@cirruslabs.io",
    "manjunatha.bhat@cirruslabs.io",
    "karan.ry@cirruslabs.io"
]

RESET_SENDER_EMAIL = os.getenv("SENDER_MAIL")


def normalize_email(email: str) -> str:
    """Normalize email to lowercase for consistent storage and lookup"""
    return email.lower().strip() if email else email


def parse_date(value: object) -> date:
    """Parse date or datetime inputs from API payloads."""
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00")).date()
        except ValueError:
            return date.fromisoformat(value)
    raise ValueError("Unsupported date format")


def parse_object_id(value: str, label: str) -> ObjectId:
    """Validate and convert a string to ObjectId."""
    try:
        return ObjectId(value)
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid {label} id")


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class BatchYearCreate(BaseModel):
    year: int
    label: Optional[str] = None


class BatchMonthCreate(BaseModel):
    name: str
    order: int


class OrganizationCreate(BaseModel):
    name: str


class ProjectAssign(BaseModel):
    internIds: List[str]


async def get_graph_access_token() -> str:
    tenant_id = os.getenv("tenant_id")
    client_id = os.getenv("client_id")
    client_secret = os.getenv("AZURE_SECRET_KEY")

    missing = []
    if not tenant_id:
        missing.append("tenant_id")
    if not client_id:
        missing.append("client_id")
    if not client_secret:
        missing.append("AZURE_SECRET_KEY")

    if missing:
        raise HTTPException(
            status_code=503,
            detail=f"Microsoft Graph is not configured. Missing: {', '.join(missing)}"
        )

    token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "scope": "https://graph.microsoft.com/.default",
        "grant_type": "client_credentials"
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(token_url, data=data, timeout=10.0)

    if resp.status_code != 200:
        raise HTTPException(
            status_code=503,
            detail=f"Failed to get Graph access token: {resp.text}"
        )

    token = resp.json().get("access_token")
    if not token:
        raise HTTPException(status_code=503, detail="Missing Graph access token")

    return token


async def send_reset_email(to_email: str, reset_link: str) -> None:
    if not RESET_SENDER_EMAIL:
        raise HTTPException(
            status_code=503,
            detail="SENDER_MAIL is not configured. Missing: SENDER_MAIL"
        )
    token = await get_graph_access_token()

    subject = "Reset your Interns360 password"
    body = (
        "<p>Hello,</p>"
        "<p>Click the link below to reset your password:</p>"
        f"<p><a href=\"{reset_link}\">Reset password</a></p>"
        "<p>If you did not request a reset, you can ignore this email.</p>"
    )

    payload = {
        "message": {
            "subject": subject,
            "body": {
                "contentType": "HTML",
                "content": body
            },
            "toRecipients": [
                {"emailAddress": {"address": to_email}}
            ]
        },
        "saveToSentItems": "false"
    }

    send_url = f"https://graph.microsoft.com/v1.0/users/{RESET_SENDER_EMAIL}/sendMail"
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            send_url,
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
            timeout=10.0
        )

    if resp.status_code not in [202]:
        raise HTTPException(
            status_code=503,
            detail=f"Failed to send reset email: {resp.text}"
        )


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





import random
from datetime import timedelta

# Temporary OTP Store (for testing)
otp_store = {}

# ================= OTP SEND ROUTE =================
@app.post("/api/auth/send-otp")
async def send_otp_route(payload: dict):
    email = payload.get("email")

    if not email:
        raise HTTPException(status_code=400, detail="Email required")

    otp = str(random.randint(100000, 999999))

    # Store OTP with expiry (5 min)
    otp_store[email] = {
        "otp": otp,
        "expires": datetime.now() + timedelta(minutes=5)
    }

    print("OTP SENT TO EMAIL:", email)
    print("OTP =", otp)

    return {"message": "OTP sent successfully"}


# ================= REGISTER ROUTE =================
@app.post("/api/auth/register")
async def register_with_otp(payload: dict, db=Depends(get_database)):

    email = payload.get("email")
    otp = payload.get("otp")
    password = payload.get("password")

    if email not in otp_store:
        raise HTTPException(status_code=400, detail="OTP not requested")

    saved = otp_store[email]

    if datetime.now() > saved["expires"]:
        raise HTTPException(status_code=400, detail="OTP expired")

    if otp != saved["otp"]:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # OTP verified → remove OTP
    otp_store.pop(email)

    # Check if email already exists
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    user_doc = {
        "name": payload.get("fullName"),
        "email": email,
        "hashed_password": get_password_hash(password),
        "role": "intern",
        "is_active": True,
        "is_approved": False,
        "created_at": datetime.now(timezone.utc)
    }

    await db.users.insert_one(user_doc)

    return {"message": "Registration successful"}





# CORS
def parse_cors_origins(value: Optional[str]) -> List[str]:
    if not value:
        return []
    try:
        parsed = json.loads(value)
        if isinstance(parsed, list):
            return [str(origin).strip() for origin in parsed if str(origin).strip()]
    except json.JSONDecodeError:
        pass
    return [origin.strip() for origin in value.split(",") if origin.strip()]

CORS_ORIGINS = parse_cors_origins(os.getenv("BACKEND_CORS_ORIGINS"))
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
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


@app.post("/api/v1/auth/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, db = Depends(get_database)):
    """Send password reset link to the provided email"""
    email = normalize_email(payload.email)
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")

    frontend_url = os.getenv("FRONTEND_URL")
    if not frontend_url:
        raise HTTPException(
            status_code=503,
            detail="FRONTEND_URL is not configured. Missing: FRONTEND_URL"
        )
    frontend_url = frontend_url.rstrip("/")
    reset_link = f"{frontend_url}/forgot-password?email={quote(email)}"

    await send_reset_email(email, reset_link)

    return {"message": "Password reset email sent"}


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
        redirect_uri = os.getenv("AZURE_REDIRECT_URI")
        
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
                print(f"[Azure SSO] Redirect URI used: {os.getenv('AZURE_REDIRECT_URI')}")
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


@app.get("/api/v1/users")
async def list_basic_users(
    role: Optional[str] = Query(None, description="Filter by role"),
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """List basic user info for admins and scrum masters"""
    if current_user.role not in ["admin", "scrum_master"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    query = {}
    if role:
        query["role"] = role

    users = []
    async for user in db.users.find(query).sort("created_at", -1):
        users.append({
            "id": str(user["_id"]),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "role": user.get("role", "intern")
        })

    return users


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
    """Fetch real-time dashboard statistics"""
    
    if current_user.role not in ["admin", "scrum_master"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        # 1. Total Interns (from users collection)
        total_interns = await db.users.count_documents({
            "role": {"$in": ["intern", "scrum_master"]},
            "is_approved": True
        })
        active_interns = await db.users.count_documents({
            "role": {"$in": ["intern", "scrum_master"]},
            "is_approved": True,
            "is_active": True
        })
        
        # 2. DSU Completion (today)
        today_str = date.today().isoformat()
        
        # Count active interns for DSU percentage calculation
        
        submitted_dsus = await db.dsu_entries.count_documents({
            "date": today_str,
            "status": {"$in": ["submitted", "approved", "completed"]}
        })
        
        pending_dsus = await db.dsu_entries.count_documents({
            "date": today_str,
            "status": "pending"
        })
        
        dsu_completion = round((submitted_dsus / active_interns * 100), 1) if active_interns > 0 else 0
        
        print(f"📊 DSU Stats - Submitted: {submitted_dsus}, Pending: {pending_dsus}, Completion: {dsu_completion}%")
        
        # 3. Intern Types (Project / RS)
        # First try with all interns
        project_interns = await db.interns.count_documents({"internType": "project"})
        rs_interns = await db.interns.count_documents({"internType": "rs"})
        
        # If both are 0, try different field names:
        if project_interns == 0 and rs_interns == 0:
            project_interns = await db.interns.count_documents({"type": "project"})
            rs_interns = await db.interns.count_documents({"type": "rs"})
        
        print(f"📊 Intern Types - Project: {project_interns}, RS: {rs_interns}")
        
        # 4. Task Completion
        total_tasks = await db.tasks.count_documents({})
        completed_tasks = await db.tasks.count_documents({
            "status": {"$in": ["completed", "done", "finished", "COMPLETED", "DONE", "FINISHED"]}
        })
        task_completion = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0
        
        print(f"📊 Tasks - Total: {total_tasks}, Completed: {completed_tasks}, Completion: {task_completion}%")
        
        # 5. PTO Stats
        pending_ptos = await db.pto.count_documents({"status": "pending"})
        
        # Approved PTOs this month
        month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        approved_ptos = await db.pto.count_documents({
            "status": "approved",
            "created_at": {"$gte": month_start}
        })
        
        print(f"📊PTOs - Pending: {pending_ptos}, Approved: {approved_ptos}")
        
        # 6. Active Batches
        active_batches = await db.batches.count_documents({"status": "active"})
        
        print(f"📊 Batches - Active: {active_batches}")
        
        return {
            "totalInterns": total_interns,
            "dsuCompletion": dsu_completion,
            "submittedDSUs": submitted_dsus,
            "pendingDSUs": pending_dsus,
            "projectInterns": project_interns,
            "rsInterns": rs_interns,
            "taskCompletion": task_completion,
            "completedTasks": completed_tasks,
            "totalTasks": total_tasks,
            "pendingPTOs": pending_ptos,
            "approvedPTOs": approved_ptos,
            "activeBatches": active_batches
        }
        
    except Exception as e:
        print(f"❌ Dashboard Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")

# @app.get("/api/v1/admin/dashboard/recent-interns")
# async def get_recent_interns(
#     limit: int = 5,
#     db = Depends(get_database),
#     current_user: User = Depends(get_current_active_user)
# ):
#     """Get recently added interns"""
#     if current_user.role not in ["admin", "scrum_master"]:
#         raise HTTPException(status_code=403, detail="Not authorized")
    
#     interns = []
#     async for intern in db.interns.find().sort("created_at", -1).limit(limit):
#         intern["_id"] = str(intern["_id"])
#         # Convert date to ISO string if needed
#         if "joinedDate" in intern and isinstance(intern["joinedDate"], date):
#             intern["joinedDate"] = intern["joinedDate"].isoformat()
#         interns.append(intern)
    
#     return interns


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


# ==================== PERFORMANCE ROUTES ====================
@app.get("/api/v1/admin/performance/users")
async def list_performance_users(
    role: Optional[str] = Query(None),
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """List intern/scrum master users for performance dashboards"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    if role:
        query = {"role": role}
    else:
        query = {"role": {"$in": ["intern", "scrum_master"]}}

    users = []
    async for user in db.users.find(query).sort("created_at", -1):
        user_id = str(user["_id"])
        payload = {
            "id": user_id,
            "name": user.get("name"),
            "email": user.get("email"),
            "role": user.get("role"),
            "employee_id": user.get("employee_id"),
            "is_active": user.get("is_active", True),
            "is_approved": user.get("is_approved", False)
        }

        intern_profile = await db.interns.find_one({"email": user.get("email")})
        if intern_profile:
            payload.update({
                "internId": str(intern_profile["_id"]),
                "batch": intern_profile.get("batch"),
                "internType": intern_profile.get("internType"),
                "taskCount": intern_profile.get("taskCount", 0),
                "completedTasks": intern_profile.get("completedTasks", 0),
                "dsuStreak": intern_profile.get("dsuStreak", 0),
                "currentProject": intern_profile.get("currentProject"),
                "phone": intern_profile.get("phone"),
                "college": intern_profile.get("college"),
                "cgpa": intern_profile.get("cgpa"),
                "joinedDate": intern_profile.get("joinedDate"),
                "skills": intern_profile.get("skills", [])
            })

        users.append(payload)

    return users


@app.get("/api/v1/admin/performance/activity")
async def get_performance_activity(
    user_id: str = Query(...),
    limit: int = Query(50, ge=1, le=200),
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get activity details for a user (intern or scrum master)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    user = await db.users.find_one({"_id": parse_object_id(user_id, "user")})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    role = user.get("role")
    username = user.get("username")

    tasks = []
    dsus = []
    attendance = []

    if role == "intern":
        intern_profile = await db.interns.find_one({"email": user.get("email")})
        if intern_profile:
            intern_id = str(intern_profile["_id"])
            async for task in db.tasks.find({"internId": intern_id}).sort("created_at", -1).limit(limit):
                task["_id"] = str(task["_id"])
                tasks.append(task)

            async for dsu in db.dsu_entries.find({"internId": intern_id}).sort("date", -1).limit(limit):
                dsu["_id"] = str(dsu["_id"])
                dsus.append(dsu)

    if role == "scrum_master":
        async for dsu in db.dsu_entries.find({"reviewedBy": username}).sort("reviewedAt", -1).limit(limit):
            dsu["_id"] = str(dsu["_id"])
            dsus.append(dsu)

        async for record in db.office_attendance.find({"markedBy": username}).sort("updatedAt", -1).limit(limit):
            record["_id"] = str(record["_id"])
            attendance.append(record)

    return {
        "role": role,
        "tasks": tasks,
        "dsus": dsus,
        "attendance": attendance
    }


# ==================== MENTOR REQUEST ROUTES ====================
@app.post("/api/v1/mentor-requests", status_code=201)
async def create_mentor_request(
    payload: MentorRequestCreate,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Create a mentorship request (intern/scrum master)"""
    if current_user.role not in ["intern", "scrum_master"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    requester_id = str(current_user.id)
    if requester_id == payload.mentorUserId:
        raise HTTPException(status_code=400, detail="Cannot request yourself as mentor")

    mentor_user = await db.users.find_one({"_id": parse_object_id(payload.mentorUserId, "mentor")})
    if not mentor_user or mentor_user.get("role") != "intern":
        raise HTTPException(status_code=404, detail="Mentor not found")

    existing = await db.mentor_requests.find_one({
        "requesterUserId": requester_id,
        "mentorUserId": payload.mentorUserId,
        "status": "pending"
    })
    if existing:
        raise HTTPException(status_code=400, detail="Request already pending")

    record = {
        "requesterUserId": requester_id,
        "requesterEmail": current_user.email,
        "requesterName": current_user.name,
        "mentorUserId": payload.mentorUserId,
        "mentorEmail": mentor_user.get("email"),
        "mentorName": mentor_user.get("name"),
        "status": "pending",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    result = await db.mentor_requests.insert_one(record)
    record["_id"] = str(result.inserted_id)
    return record


@app.get("/api/v1/mentor-requests")
async def list_mentor_requests(
    status: Optional[str] = Query(None),
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """List mentorship requests (admin/scrum master)"""
    if current_user.role not in ["admin", "scrum_master"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    query = {}
    if status:
        query["status"] = status

    requests = []
    async for req in db.mentor_requests.find(query).sort("created_at", -1):
        req["_id"] = str(req["_id"])
        requests.append(req)
    return requests


@app.get("/api/v1/mentor-requests/me")
async def list_my_mentor_requests(
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """List mentorship requests for the current user"""
    user_id = str(current_user.id)
    query = {
        "$or": [
            {"requesterUserId": user_id},
            {"mentorUserId": user_id}
        ]
    }

    requests = []
    async for req in db.mentor_requests.find(query).sort("created_at", -1):
        req["_id"] = str(req["_id"])
        requests.append(req)
    return requests


@app.patch("/api/v1/mentor-requests/{request_id}")
async def update_mentor_request(
    request_id: str,
    payload: MentorRequestUpdate,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Approve or reject mentor request (admin/scrum master)"""
    if current_user.role not in ["admin", "scrum_master"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = payload.model_dump()
    update_data["approvedBy"] = current_user.username
    update_data["updated_at"] = datetime.now(timezone.utc)

    result = await db.mentor_requests.find_one_and_update(
        {"_id": parse_object_id(request_id, "mentor request")},
        {"$set": update_data},
        return_document=True
    )

    if not result:
        raise HTTPException(status_code=404, detail="Mentor request not found")

    result["_id"] = str(result["_id"])
    return result


@app.get("/api/v1/mentorships/me")
async def get_my_mentorships(
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get approved mentor/mentee relationships for the current user"""
    user_id = str(current_user.id)

    mentor_request = await db.mentor_requests.find_one({
        "requesterUserId": user_id,
        "status": "approved"
    })

    mentor = None
    if mentor_request:
        mentor = {
            "userId": mentor_request.get("mentorUserId"),
            "name": mentor_request.get("mentorName"),
            "email": mentor_request.get("mentorEmail")
        }

    mentees = []
    async for req in db.mentor_requests.find({
        "mentorUserId": user_id,
        "status": "approved"
    }):
        mentees.append({
            "userId": req.get("requesterUserId"),
            "name": req.get("requesterName"),
            "email": req.get("requesterEmail")
        })

    return {
        "mentor": mentor,
        "mentees": mentees
    }


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
    
    # Validate category references if provided
    if batch_data.yearId:
        year = await db.batch_years.find_one({"_id": parse_object_id(batch_data.yearId, "batch year")})
        if not year:
            raise HTTPException(status_code=404, detail="Batch year not found")
    if batch_data.monthId:
        month = await db.batch_months.find_one({"_id": parse_object_id(batch_data.monthId, "batch month")})
        if not month:
            raise HTTPException(status_code=404, detail="Batch month not found")
    if batch_data.organizationId:
        org = await db.organizations.find_one({"_id": parse_object_id(batch_data.organizationId, "organization")})
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")

    # Determine status based on start/end date
    start_date = parse_date(batch_data.startDate)
    end_date = parse_date(batch_data.endDate)
    today = date.today()

    if start_date > today:
        status = "upcoming"
    elif end_date < today:
        status = "completed"
    else:
        status = "active"
    
    batch_dict = batch_data.model_dump()
    if not batch_dict.get("duration"):
        batch_dict["duration"] = max((end_date - start_date).days, 0)
    if not batch_dict.get("maxInterns"):
        batch_dict["maxInterns"] = 50
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

        if batch.get("yearId"):
            try:
                year_doc = await db.batch_years.find_one({"_id": parse_object_id(batch["yearId"], "batch year")})
                if year_doc:
                    batch["year"] = year_doc.get("label") or str(year_doc.get("year"))
            except HTTPException:
                pass
        if batch.get("monthId"):
            try:
                month_doc = await db.batch_months.find_one({"_id": parse_object_id(batch["monthId"], "batch month")})
                if month_doc:
                    batch["month"] = month_doc.get("name")
            except HTTPException:
                pass
        if batch.get("organizationId"):
            try:
                org_doc = await db.organizations.find_one({"_id": parse_object_id(batch["organizationId"], "organization")})
                if org_doc:
                    batch["organization"] = org_doc.get("name")
            except HTTPException:
                pass
        
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
    if batch.get("yearId"):
        try:
            year_doc = await db.batch_years.find_one({"_id": parse_object_id(batch["yearId"], "batch year")})
            if year_doc:
                batch["year"] = year_doc.get("label") or str(year_doc.get("year"))
        except HTTPException:
            pass
    if batch.get("monthId"):
        try:
            month_doc = await db.batch_months.find_one({"_id": parse_object_id(batch["monthId"], "batch month")})
            if month_doc:
                batch["month"] = month_doc.get("name")
        except HTTPException:
            pass
    if batch.get("organizationId"):
        try:
            org_doc = await db.organizations.find_one({"_id": parse_object_id(batch["organizationId"], "organization")})
            if org_doc:
                batch["organization"] = org_doc.get("name")
        except HTTPException:
            pass
    
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

    if "yearId" in update_data and update_data["yearId"]:
        year = await db.batch_years.find_one({"_id": parse_object_id(update_data["yearId"], "batch year")})
        if not year:
            raise HTTPException(status_code=404, detail="Batch year not found")
    if "monthId" in update_data and update_data["monthId"]:
        month = await db.batch_months.find_one({"_id": parse_object_id(update_data["monthId"], "batch month")})
        if not month:
            raise HTTPException(status_code=404, detail="Batch month not found")
    if "organizationId" in update_data and update_data["organizationId"]:
        org = await db.organizations.find_one({"_id": parse_object_id(update_data["organizationId"], "organization")})
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")
    
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


# ==================== BATCH CATEGORY ROUTES ====================
@app.get("/api/v1/batch-years/")
async def list_batch_years(
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    years = []
    async for year in db.batch_years.find().sort("year", -1):
        year["_id"] = str(year["_id"])
        years.append(year)
    return years


@app.post("/api/v1/batch-years/", status_code=201)
async def create_batch_year(
    payload: BatchYearCreate,
    db = Depends(get_database),
    admin: User = Depends(get_admin_user)
):
    existing = await db.batch_years.find_one({"year": payload.year})
    if existing:
        raise HTTPException(status_code=400, detail="Batch year already exists")

    data = payload.model_dump()
    data["created_at"] = datetime.now(timezone.utc)
    data["updated_at"] = datetime.now(timezone.utc)
    result = await db.batch_years.insert_one(data)
    data["_id"] = str(result.inserted_id)
    return data


@app.get("/api/v1/batch-months/")
async def list_batch_months(
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    months = []
    async for month in db.batch_months.find().sort("order", 1):
        month["_id"] = str(month["_id"])
        months.append(month)
    return months


@app.post("/api/v1/batch-months/", status_code=201)
async def create_batch_month(
    payload: BatchMonthCreate,
    db = Depends(get_database),
    admin: User = Depends(get_admin_user)
):
    existing = await db.batch_months.find_one({"name": payload.name})
    if existing:
        raise HTTPException(status_code=400, detail="Batch month already exists")

    data = payload.model_dump()
    data["created_at"] = datetime.now(timezone.utc)
    data["updated_at"] = datetime.now(timezone.utc)
    result = await db.batch_months.insert_one(data)
    data["_id"] = str(result.inserted_id)
    return data


@app.get("/api/v1/organizations/")
async def list_organizations(
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    organizations = []
    async for org in db.organizations.find().sort("name", 1):
        org["_id"] = str(org["_id"])
        organizations.append(org)
    return organizations


@app.post("/api/v1/organizations/", status_code=201)
async def create_organization(
    payload: OrganizationCreate,
    db = Depends(get_database),
    admin: User = Depends(get_admin_user)
):
    existing = await db.organizations.find_one({"name": payload.name})
    if existing:
        raise HTTPException(status_code=400, detail="Organization already exists")

    data = payload.model_dump()
    data["created_at"] = datetime.now(timezone.utc)
    data["updated_at"] = datetime.now(timezone.utc)
    result = await db.organizations.insert_one(data)
    data["_id"] = str(result.inserted_id)
    return data


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
    submitted_at = datetime.now(timezone.utc)
    dsu_dict["submittedAt"] = submitted_at
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


# ==================== OFFICE ATTENDANCE ROUTES ====================
@app.post("/api/v1/office-attendance", status_code=201)
async def upsert_office_attendance(
    attendance_data: OfficeAttendanceCreate,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Mark office attendance (admin/scrum master)"""
    if current_user.role not in ["admin", "scrum_master"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    date_value = attendance_data.date
    date_key = date_value.isoformat() if isinstance(date_value, date) else str(date_value)

    filter_query = {
        "internId": attendance_data.internId,
        "date": date_key
    }

    update_data = {
        "status": attendance_data.status,
        "remarks": attendance_data.remarks,
        "markedBy": current_user.username,
        "updatedAt": datetime.now(timezone.utc)
    }

    result = await db.office_attendance.update_one(
        filter_query,
        {
            "$set": update_data,
            "$setOnInsert": {
                "internId": attendance_data.internId,
                "date": date_key,
                "createdAt": datetime.now(timezone.utc)
            }
        },
        upsert=True
    )

    stored = await db.office_attendance.find_one(filter_query)
    if not stored and result.upserted_id:
        stored = await db.office_attendance.find_one({"_id": result.upserted_id})

    if not stored:
        raise HTTPException(status_code=500, detail="Failed to save attendance")

    stored["_id"] = str(stored["_id"])
    return stored


@app.get("/api/v1/office-attendance")
async def list_office_attendance(
    date: Optional[date] = Query(None),
    intern_id: Optional[str] = Query(None),
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """List office attendance records (admin/scrum master)"""
    if current_user.role not in ["admin", "scrum_master"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    query = {}
    if date:
        query["date"] = date.isoformat()
    if intern_id:
        query["internId"] = intern_id

    records = []
    async for record in db.office_attendance.find(query).sort("updatedAt", -1):
        record["_id"] = str(record["_id"])
        records.append(record)

    return records


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
    pto_dict["type"] = (pto_dict.get("type") or "PTO").upper()
    if pto_dict["type"] not in ["PTO", "WFH"]:
        raise HTTPException(status_code=400, detail="Invalid PTO type")

    start_value = pto_dict.get("startDate")
    end_value = pto_dict.get("endDate")

    if not pto_dict.get("numberOfDays"):
        if not start_value or not end_value:
            raise HTTPException(status_code=400, detail="startDate and endDate are required")

        if isinstance(start_value, date) and isinstance(end_value, date):
            pto_dict["numberOfDays"] = (end_value - start_value).days + 1
        else:
            start = datetime.fromisoformat(str(start_value))
            end = datetime.fromisoformat(str(end_value))
            pto_dict["numberOfDays"] = (end - start).days + 1

    # Normalize dates to datetimes for MongoDB encoding
    def normalize_pto_date(value):
        if isinstance(value, datetime):
            return value
        if isinstance(value, date):
            return datetime.combine(value, datetime.min.time(), tzinfo=timezone.utc)
        try:
            return datetime.fromisoformat(str(value))
        except Exception:
            return value

    if start_value is not None:
        pto_dict["startDate"] = normalize_pto_date(start_value)
    if end_value is not None:
        pto_dict["endDate"] = normalize_pto_date(end_value)

    if pto_dict["type"] == "PTO" and not pto_dict.get("leaveType"):
        pto_dict["leaveType"] = "casual"

    intern = None
    try:
        intern = await db.interns.find_one({"_id": ObjectId(pto_dict["internId"])})
    except Exception:
        intern = None

    if not intern and pto_dict.get("email"):
        intern = await db.interns.find_one({"email": pto_dict["email"]})
        if intern:
            pto_dict["internId"] = str(intern["_id"])

    if intern:
        pto_dict.setdefault("name", intern.get("name"))
        pto_dict.setdefault("email", intern.get("email"))

    pto_dict["status"] = "pending"
    pto_dict["created_at"] = datetime.now(timezone.utc)
    pto_dict["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.pto.insert_one(pto_dict)
    pto_dict["_id"] = str(result.inserted_id)
    
    return pto_dict


@app.get("/api/v1/pto/")
async def list_ptos(
    status: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    intern_id: Optional[str] = Query(None),
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """List PTO requests"""
    query = {}
    if status:
        query["status"] = status
    if type:
        query["type"] = type.upper()
    if intern_id:
        query["internId"] = intern_id
    
    ptos = []
    async for pto in db.pto.find(query).sort("created_at", -1):
        pto["_id"] = str(pto["_id"])
        pto.setdefault("type", "PTO")
        
        # Add intern details
        intern = None
        try:
            intern = await db.interns.find_one({"_id": ObjectId(pto["internId"])})
        except Exception:
            intern = None

        if not intern and pto.get("email"):
            intern = await db.interns.find_one({"email": pto.get("email")})

        if intern:
            pto["internName"] = pto.get("name") or intern.get("name", "Unknown")
            pto["email"] = pto.get("email") or intern.get("email", "")
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
    project_dict["internIds"] = project_dict.get("internIds", []) or []
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


@app.get("/api/v1/projects/assigned")
async def list_assigned_projects(
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """List projects assigned to the current intern"""
    intern = await db.interns.find_one({"email": current_user.email})
    if not intern:
        return []

    intern_id = str(intern["_id"])
    projects = []
    async for project in db.projects.find({"internIds": intern_id}):
        project["_id"] = str(project["_id"])
        projects.append(project)
    return projects


@app.patch("/api/v1/projects/{project_id}")
async def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    db = Depends(get_database),
    admin: User = Depends(get_admin_user)
):
    """Update a project (admin only)"""
    update_data = project_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_data["updated_at"] = datetime.now(timezone.utc)
    result = await db.projects.find_one_and_update(
        {"_id": parse_object_id(project_id, "project")},
        {"$set": update_data},
        return_document=True
    )

    if not result:
        raise HTTPException(status_code=404, detail="Project not found")

    result["_id"] = str(result["_id"])
    return result


@app.post("/api/v1/projects/{project_id}/interns")
async def assign_project_interns(
    project_id: str,
    payload: ProjectAssign,
    db = Depends(get_database),
    admin: User = Depends(get_admin_user)
):
    """Assign interns to a project (admin only)"""
    if not payload.internIds:
        raise HTTPException(status_code=400, detail="No interns provided")

    project = await db.projects.find_one({"_id": parse_object_id(project_id, "project")})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    valid_ids = []
    for intern_id in payload.internIds:
        intern = await db.interns.find_one({"_id": parse_object_id(intern_id, "intern")})
        if intern:
            valid_ids.append(intern_id)

    if not valid_ids:
        raise HTTPException(status_code=404, detail="No valid interns found")

    await db.projects.update_one(
        {"_id": project["_id"]},
        {"$addToSet": {"internIds": {"$each": valid_ids}}, "$set": {"updated_at": datetime.now(timezone.utc)}}
    )

    await db.interns.update_many(
        {"_id": {"$in": [parse_object_id(i, "intern") for i in valid_ids]}},
        {"$set": {"currentProject": project.get("name"), "updated_at": datetime.now(timezone.utc)}}
    )

    updated = await db.projects.find_one({"_id": project["_id"]})
    updated["_id"] = str(updated["_id"])
    return updated


@app.get("/api/v1/projects/{project_id}/updates")
async def get_project_updates(
    project_id: str,
    limit: int = Query(10, ge=1, le=50),
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get latest task updates for a project"""
    project = await db.projects.find_one({"_id": parse_object_id(project_id, "project")})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    tasks = []
    cursor = db.tasks.find({"project": project.get("name")}).sort([
        ("updated_at", -1),
        ("created_at", -1)
    ]).limit(limit)

    intern_cache = {}
    async for task in cursor:
        task["_id"] = str(task["_id"])
        intern_id = task.get("internId")
        if intern_id:
            if intern_id not in intern_cache:
                intern = await db.interns.find_one({"_id": parse_object_id(intern_id, "intern")})
                intern_cache[intern_id] = intern.get("name") if intern else None
            task["internName"] = intern_cache.get(intern_id)
        tasks.append(task)

    return tasks

# ==================== INTERN PROFILE ROUTES ====================
@app.get("/api/v1/interns/me/profile")
async def get_my_profile(
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's intern profile"""
    # Find intern by email matching current user
    intern = await db.interns.find_one({"email": current_user.email})
    
    if not intern:
        # Return empty profile if intern doesn't exist yet
        return {
            "exists": False,
            "message": "Profile not found"
        }
    
    intern["_id"] = str(intern["_id"])
    if "joinedDate" in intern and isinstance(intern["joinedDate"], date):
        intern["joinedDate"] = intern["joinedDate"].isoformat()
    
    return {
        "exists": True,
        "data": intern
    }


@app.put("/api/v1/interns/me/profile")
async def update_my_profile(
    profile_data: dict,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Update current user's intern profile"""
    # Find existing intern profile
    intern = await db.interns.find_one({"email": current_user.email})
    
    # Prepare update data
    update_data = {}
    
    # Handle date fields
    if "startDate" in profile_data:
        update_data["startDate"] = profile_data["startDate"]
    if "joinedDate" in profile_data:
        update_data["joinedDate"] = profile_data["joinedDate"]
    if "endDate" in profile_data:
        update_data["endDate"] = profile_data["endDate"]
    
    # Handle other fields
    allowed_fields = ["currentProject", "mentor", "skills", "phone", 
                     "internType", "payType", "college", "degree", "batch"]
    
    for field in allowed_fields:
        if field in profile_data:
            update_data[field] = profile_data[field]
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    if intern:
        # Update existing profile
        result = await db.interns.find_one_and_update(
            {"email": current_user.email},
            {"$set": update_data},
            return_document=True
        )
    else:
        # Create new intern profile
        update_data["email"] = current_user.email
        update_data["name"] = current_user.name
        update_data["status"] = "active"
        update_data["taskCount"] = 0
        update_data["completedTasks"] = 0
        update_data["dsuStreak"] = 0
        update_data["created_at"] = datetime.now(timezone.utc)
        
        result_insert = await db.interns.insert_one(update_data)
        result = await db.interns.find_one({"_id": result_insert.inserted_id})
    
    if result:
        result["_id"] = str(result["_id"])
        if "joinedDate" in result and isinstance(result["joinedDate"], date):
            result["joinedDate"] = result["joinedDate"].isoformat()
        return {"success": True, "data": result}
    
    raise HTTPException(status_code=500, detail="Failed to update profile")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    reload_enabled = os.getenv("RELOAD", "false").lower() == "true"
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload_enabled)
