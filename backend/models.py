"""
Interns360 – Backend Models (Normalized & Clean)
Roles: admin, scrum_master, user
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
    user = "user"
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
    hashed_password: str
    is_active: bool = True
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

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: UserRole
    is_active: bool = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"