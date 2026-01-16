"""
Pydantic models for all entities
"""
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime, timezone

# ==================== USER MODELS ====================
class User(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    username: str
    email: EmailStr
    name: str
    role: str  # admin, mentor, intern
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        populate_by_name = True

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    name: str
    password: str
    role: str = "intern"

class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    name: str
    role: str
    is_active: bool

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str


# ==================== INTERN MODELS ====================
class Intern(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    email: EmailStr
    phone: str
    college: str
    degree: str
    branch: str
    year: int
    cgpa: float
    domain: str
    internType: str  # project, rs
    isPaid: bool = False
    status: str = "onboarding"
    currentProject: Optional[str] = None
    mentor: str
    startDate: date
    endDate: date
    joinedDate: Optional[date] = None
    taskCount: int = 0
    completedTasks: int = 0
    dsuStreak: int = 0
    skills: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        populate_by_name = True

class InternCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    college: str
    degree: str
    branch: str
    year: int
    cgpa: float
    domain: str
    internType: str
    isPaid: bool = False
    mentor: str
    startDate: date
    endDate: date
    currentProject: Optional[str] = None
    skills: List[str] = []

class InternUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    currentProject: Optional[str] = None
    taskCount: Optional[int] = None
    completedTasks: Optional[int] = None
    dsuStreak: Optional[int] = None


# ==================== DSU MODELS ====================
class DSUEntry(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    internId: str
    date: date
    yesterday: str
    today: str
    blockers: Optional[str] = None
    learnings: Optional[str] = None
    status: str = "pending"
    submittedAt: Optional[datetime] = None
    reviewedBy: Optional[str] = None
    reviewedAt: Optional[datetime] = None
    feedback: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        populate_by_name = True

class DSUCreate(BaseModel):
    internId: str
    date: date
    yesterday: str
    today: str
    blockers: Optional[str] = None
    learnings: Optional[str] = None

class DSUUpdate(BaseModel):
    yesterday: Optional[str] = None
    today: Optional[str] = None
    blockers: Optional[str] = None
    learnings: Optional[str] = None
    feedback: Optional[str] = None


# ==================== TASK MODELS ====================
class Task(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    internId: str
    title: str
    description: Optional[str] = None
    project: str
    priority: str = "medium"
    status: str = "todo"
    assignedBy: str
    dueDate: date
    completedAt: Optional[datetime] = None
    tags: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        populate_by_name = True

class TaskCreate(BaseModel):
    internId: str
    title: str
    description: Optional[str] = None
    project: str
    priority: str = "medium"
    assignedBy: str
    dueDate: date
    tags: List[str] = []

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    dueDate: Optional[date] = None


# ==================== PROJECT MODELS ====================
class Project(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    description: Optional[str] = None
    status: str = "active"
    techStack: List[str] = []
    startDate: date
    endDate: Optional[date] = None
    internIds: List[str] = []
    mentor: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        populate_by_name = True

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    techStack: List[str] = []
    mentor: str
    startDate: date

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    techStack: Optional[List[str]] = None
    endDate: Optional[date] = None
