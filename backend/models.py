"""
Interns360 – Backend Models (Normalized & Clean)
Roles: admin, scrum_master, intern
"""

from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import date, datetime, timezone
from enum import Enum


# =========================
# ENUMS
# =========================

class UserRole(str, Enum):
    admin = "admin"
    scrum_master = "scrum_master"
    intern = "intern"


class TaskStatus(str, Enum):
    open = "open"
    in_progress = "in_progress"
    completed = "completed"
    on_hold = "on_hold"


class DSUStatus(str, Enum):
    submitted = "submitted"
    pending = "pending"


class DSUSubmissionStatus(str, Enum):
    on_time = "on_time"
    late = "late"
    missed = "missed"


class AttendanceStatus(str, Enum):
    present = "present"
    absent = "absent"
    half_day = "half_day"
    late = "late"


class LeaveStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


# =========================
# USERS
# =========================

class User(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    username: str
    email: EmailStr
    name: str
    role: UserRole
    hashed_password: Optional[str] = None  # Optional for SSO users
    is_active: bool = True
    azure_oid: Optional[str] = None  # Azure AD Object ID for SSO users
    auth_provider: Optional[str] = None  # 'azure_ad' or None for password auth
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# =========================
# INTERNS
# =========================

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
    status: str = "active"
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


# =========================
# DSU ENTRIES (CONTENT)
# =========================

class DSUEntry(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    internId: str
    date: date
    yesterday: str
    today: str
    blockers: Optional[str] = None
    learnings: Optional[str] = None
    status: DSUStatus = DSUStatus.pending
    submittedAt: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# =========================
# DSU ATTENDANCE (BEHAVIOR)
# =========================

class DSUAttendance(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    internId: str
    date: date
    dsuSubmitted: bool
    submittedTime: Optional[str] = None
    submissionStatus: DSUSubmissionStatus
    dsuEntryId: Optional[str] = None
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# =========================
# OFFICE ATTENDANCE
# =========================

class OfficeAttendance(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    internId: str
    date: date
    status: AttendanceStatus
    remarks: Optional[str] = None
    markedBy: str
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# =========================
# TASKS
# =========================

class Task(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    internId: str
    title: str
    description: Optional[str] = None
    project: str
    priority: str = "medium"
    status: TaskStatus = TaskStatus.open
    assignedBy: str
    dueDate: Optional[date] = None
    completedDate: Optional[date] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# =========================
# LEAVE MANAGEMENT
# =========================

class Leave(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    internId: str
    type: str
    startDate: date
    endDate: date
    numberOfDays: int
    status: LeaveStatus = LeaveStatus.pending
    approvedBy: Optional[str] = None
    reason: Optional[str] = None
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# =========================
# USER SCHEMAS
# =========================

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    name: str
    password: str
    role: UserRole = UserRole.intern


class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    name: str
    role: UserRole
    is_active: bool
    created_at: Optional[datetime] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# =========================
# INTERN SCHEMAS
# =========================

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
    skills: List[str] = []


class InternUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[int] = None
    cgpa: Optional[float] = None
    domain: Optional[str] = None
    internType: Optional[str] = None
    isPaid: Optional[bool] = None
    status: Optional[str] = None
    currentProject: Optional[str] = None
    mentor: Optional[str] = None
    startDate: Optional[date] = None
    endDate: Optional[date] = None
    skills: Optional[List[str]] = None


# =========================
# DSU SCHEMAS
# =========================

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
    status: Optional[DSUStatus] = None


# =========================
# TASK SCHEMAS
# =========================

class TaskCreate(BaseModel):
    internId: str
    title: str
    description: Optional[str] = None
    project: str
    priority: str = "medium"
    assignedBy: str
    dueDate: Optional[date] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    project: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[TaskStatus] = None
    dueDate: Optional[date] = None
    completedDate: Optional[date] = None


# =========================
# PROJECT SCHEMAS
# =========================

class Project(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    name: str
    description: Optional[str] = None
    status: str = "active"
    startDate: date
    endDate: Optional[date] = None
    teamMembers: List[str] = []
    scrumMaster: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    startDate: date
    endDate: Optional[date] = None
    teamMembers: List[str] = []
    scrumMaster: str


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    startDate: Optional[date] = None
    endDate: Optional[date] = None
    teamMembers: Optional[List[str]] = None
    scrumMaster: Optional[str] = None


# =========================
# PTO SCHEMAS (Leave)
# =========================

class PTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    internId: str
    type: str
    startDate: date
    endDate: date
    numberOfDays: int
    status: LeaveStatus = LeaveStatus.pending
    approvedBy: Optional[str] = None
    reason: Optional[str] = None
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PTOCreate(BaseModel):
    internId: str
    type: str
    startDate: date
    endDate: date
    reason: Optional[str] = None


class PTOUpdate(BaseModel):
    status: Optional[LeaveStatus] = None
    approvedBy: Optional[str] = None


# =========================
# BATCH SCHEMAS
# =========================

class Batch(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    name: str
    startDate: date
    endDate: date
    internIds: List[str] = []
    scrumMaster: str
    status: str = "active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BatchCreate(BaseModel):
    name: str
    startDate: date
    endDate: date
    scrumMaster: str
    internIds: List[str] = []


class BatchUpdate(BaseModel):
    name: Optional[str] = None
    startDate: Optional[date] = None
    endDate: Optional[date] = None
    scrumMaster: Optional[str] = None
    internIds: Optional[List[str]] = None
    status: Optional[str] = None
