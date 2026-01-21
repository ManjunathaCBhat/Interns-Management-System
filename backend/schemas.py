from pydantic import BaseModel, EmailStr
from typing import Optional, Literal


# ---------- AUTH ----------

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: Literal["INTERN", "ADMIN"]


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: str

    class Config:
        orm_mode = True


# ---------- INTERN ----------

class InternCreate(BaseModel):
    user_id: str
    domain: Optional[str] = None


class InternUpdate(BaseModel):
    domain: Optional[str] = None