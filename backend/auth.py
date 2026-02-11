"""
Authentication and security utilities
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import APIRouter,Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import re
from dotenv import load_dotenv
from models import User
from database import get_database
from utils.security import verify_password, hash_password
from pydantic import BaseModel, EmailStr



router = APIRouter()


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str
    confirm_password: str


@router.post("/auth/reset-password")
async def reset_password(
    data: ResetPasswordRequest,
    db = Depends(get_database)
):
    user = await db.users.find_one({"email": data.email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.new_password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Password rules
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    if not re.search(r"[A-Z]", data.new_password) or \
       not re.search(r"[0-9]", data.new_password) or \
       not re.search(r"[!@#$%^&*]", data.new_password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain uppercase, number, and special character"
        )

    hashed_password = hash_password(data.new_password)

    await db.users.update_one(
        {"email": data.email},
        {
            "$set": {
                "hashed_password": hashed_password,
                "reset_password_used": True,
                "updated_at": datetime.utcnow()
            }
        }
    )

    return {"message": "Password reset successful"}


load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

security = HTTPBearer(auto_error=False)  # Don't auto-error, we'll handle it



# ==================== JWT FUNCTIONS ====================
def create_access_token(data: dict) -> str:
    """Create JWT token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """Decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

# ==================== AUTH DEPENDENCIES ====================
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db = Depends(get_database)
) -> User:
    """Get current authenticated user"""
    try:
        # Check if credentials were provided
        if credentials is None:
            print(f"[Auth] No credentials provided (no Authorization header)")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No authorization header provided"
            )

        token = credentials.credentials
        print(f"[Auth] Token received, length: {len(token) if token else 0}")
        payload = decode_access_token(token)

        if payload is None:
            print(f"[Auth] Token decode failed")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials - token decode failed"
            )

        username: str = payload.get("sub")
        if username is None:
            print(f"[Auth] No username in token payload")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials - no username"
            )

        user_data = await db.users.find_one({"username": username})
        if user_data is None:
            print(f"[Auth] User not found: {username}")
            raise HTTPException(status_code=404, detail=f"User not found: {username}")

        user_data["_id"] = str(user_data["_id"])
        print(f"[Auth] User authenticated: {username}, role: {user_data.get('role')}")
        return User(**user_data)
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Auth] Unexpected error: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}"
        )

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """Verify admin role"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


