"""
Pydantic models for all entities
"""
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import date, datetime, timezone


# ==================== USER MODELS ====================
class User(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = Field(None, alias="_id")
    username: str
    email: EmailStr
    name: str
    role: str
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


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
    model_config = ConfigDict(populate_by_name=True)
    
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
    internType: str
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
    skills: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


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
    skills: List[str] = Field(default_factory=list)


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
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = Field(None, alias="_id")
    internId: str
    date: str
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


class DSUCreate(BaseModel):
    internId: str
    date: str
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

# # ==================== TASK MODELS ====================
# class Task(BaseModel):
#     model_config = ConfigDict(populate_by_name=True)
    
#     id: Optional[str] = Field(None, alias="_id")
#     internId: str
#     title: str
#     description: Optional[str] = None
#     project: str
#     priority: str = "medium"
#     status: str = "NOT_STARTED"
#     assignedBy: Optional[str] = None
#     dueDate: Optional[date] = None
#     completedAt: Optional[datetime] = None
#     tags: List[str] = Field(default_factory=list)
#     task_date: date = Field(default_factory=date.today, alias="date")  # ← FIXED
#     comments: Optional[str] = None
#     created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
#     updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# class TaskCreate(BaseModel):
#     internId: str
#     title: str
#     description: Optional[str] = None
#     project: str
#     priority: str = "medium"
#     status: str = "NOT_STARTED"
#     assignedBy: Optional[str] = None
#     dueDate: Optional[date] = None
#     tags: List[str] = Field(default_factory=list)
#     task_date: date = Field(default_factory=date.today, alias="date")  # ← FIXED
#     comments: Optional[str] = None


# class TaskUpdate(BaseModel):
#     title: Optional[str] = None

#     description: Optional[str] = None
#     project: Optional[str] = None
#     priority: Optional[str] = None
#     status: Optional[str] = None
#     dueDate: Optional[date] = None
#     comments: Optional[str] = None
#     tags: Optional[List[str]] = None

# Task Models
class TaskCreate(BaseModel):
    internId: str
    title: str
    description: Optional[str] = None
    project: str
    priority: Optional[str] = "medium"
    status: Optional[str] = "NOT_STARTED"  
    assignedBy: Optional[str] = None
    dueDate: Optional[date] = None
    tags: Optional[List[str]] = []
    task_date: Optional[date] = Field(None, alias="date")
    comments: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    project: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    dueDate: Optional[date] = None
    tags: Optional[List[str]] = None
    task_date: Optional[date] = Field(None, alias="date")
    comments: Optional[str] = None


class Task(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: str = Field(alias="_id")
    internId: str
    title: str
    description: Optional[str] = None
    project: str
    priority: str = "medium"
    status: str
    assignedBy: Optional[str] = None
    dueDate: Optional[date] = None
    completedAt: Optional[datetime] = None
    tags: List[str] = []
    task_date: Optional[date] = Field(None, alias="date")
    comments: Optional[str] = None
    created_at: datetime
    updated_at: datetime




# ==================== PROJECT MODELS ====================
class Project(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = Field(None, alias="_id")
    name: str
    description: Optional[str] = None
    status: str = "active"
    techStack: List[str] = Field(default_factory=list)
    startDate: date
    endDate: Optional[date] = None
    internIds: List[str] = Field(default_factory=list)
    mentor: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    techStack: List[str] = Field(default_factory=list)
    mentor: str
    startDate: date


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    techStack: Optional[List[str]] = None
    endDate: Optional[date] = None


# ==================== PTO MODELS ====================
class PTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = Field(None, alias="_id")
    internId: str
    name: str
    email: EmailStr
    team: str
    startDate: date
    endDate: date
    numberOfDays: int
    reason: Optional[str] = None
    status: str = "pending"  # pending, approved, rejected
    approvedBy: Optional[str] = None
    approvedAt: Optional[datetime] = None
    comments: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PTOCreate(BaseModel):
    internId: str
    name: str
    email: EmailStr
    team: str
    startDate: date
    endDate: date
    numberOfDays: int
    reason: Optional[str] = None


class PTOUpdate(BaseModel):
    status: Optional[str] = None
    approvedBy: Optional[str] = None
    comments: Optional[str] = None


# ==================== REFERENCE MODELS ====================
class Reference(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = Field(None, alias="_id")
    name: str
    email: EmailStr
    phone: str
    referredBy: Optional[str] = None
    referralComment: Optional[str] = None
    status: str = "pending"  # pending, test_scheduled, interviewed, selected, rejected
    testPerformance: Optional[str] = None
    interviewPerformance: Optional[str] = None
    comments: Optional[str] = None
    appliedDate: date = Field(default_factory=date.today)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ReferenceCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    referredBy: Optional[str] = None
    referralComment: Optional[str] = None


class ReferenceUpdate(BaseModel):
    status: Optional[str] = None
    testPerformance: Optional[str] = None
    interviewPerformance: Optional[str] = None
    comments: Optional[str] = None


# ==================== PERFORMANCE REVIEW MODELS ====================
class PerformanceReview(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = Field(None, alias="_id")
    internId: str
    internName: str
    email: EmailStr
    isPaid: bool
    project: str
    mentor: str
    reviewType: str = "mid-term"  # mid-term, final
    reviewDate: date = Field(default_factory=date.today)
    
    # Performance Metrics
    technicalSkills: int = Field(ge=1, le=5)  # 1-5 rating
    communicationSkills: int = Field(ge=1, le=5)
    punctuality: int = Field(ge=1, le=5)
    problemSolving: int = Field(ge=1, le=5)
    teamwork: int = Field(ge=1, le=5)
    overallRating: float = Field(ge=1.0, le=5.0)
    
    performanceReview: str
    continuationDecision: bool
    comments: Optional[str] = None
    reviewedBy: str
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PerformanceReviewCreate(BaseModel):
    internId: str
    internName: str
    email: EmailStr
    isPaid: bool
    project: str
    mentor: str
    reviewType: str = "mid-term"
    
    technicalSkills: int = Field(ge=1, le=5)
    communicationSkills: int = Field(ge=1, le=5)
    punctuality: int = Field(ge=1, le=5)
    problemSolving: int = Field(ge=1, le=5)
    teamwork: int = Field(ge=1, le=5)
    
    performanceReview: str
    continuationDecision: bool
    comments: Optional[str] = None
    reviewedBy: str


class PerformanceReviewUpdate(BaseModel):
    technicalSkills: Optional[int] = Field(None, ge=1, le=5)
    communicationSkills: Optional[int] = Field(None, ge=1, le=5)
    punctuality: Optional[int] = Field(None, ge=1, le=5)
    problemSolving: Optional[int] = Field(None, ge=1, le=5)
    teamwork: Optional[int] = Field(None, ge=1, le=5)
    performanceReview: Optional[str] = None
    continuationDecision: Optional[bool] = None
    comments: Optional[str] = None

