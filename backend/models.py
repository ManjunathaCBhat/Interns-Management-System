"""
Interns360 – Updated Backend Models (With Missing Fields)
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
# USERS (UPDATED)
# =========================

class User(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    username: str
    email: EmailStr
    name: str
    employee_id: Optional[str] = None
    role: UserRole = UserRole.intern
    hashed_password: Optional[str] = None
    is_active: bool = True
    is_approved: bool = False
    azure_oid: Optional[str] = None
    auth_provider: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# =========================
# INTERNS (UPDATED)
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
    batch: Optional[str] = None
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
# DSU ENTRIES (UPDATED)
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
    reviewedBy: Optional[str] = None
    reviewedAt: Optional[datetime] = None
    feedback: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# =========================
# DSU ATTENDANCE
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


class OfficeAttendanceCreate(BaseModel):
    internId: str
    date: date
    status: AttendanceStatus
    remarks: Optional[str] = None


# =========================
# TASKS (UPDATED)
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
    tags: Optional[List[str]] = None
    comments: Optional[str] = None
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
# PROJECTS (NEW)
# =========================

class Project(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    name: str
    description: Optional[str] = None
    status: str = "active"
    techStack: List[str] = []
    startDate: date
    endDate: Optional[date] = None
    mentor: str
    internIds: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    techStack: List[str] = []
    startDate: date
    endDate: Optional[date] = None
    mentor: str
    internIds: List[str] = []


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    techStack: Optional[List[str]] = None
    startDate: Optional[date] = None
    endDate: Optional[date] = None
    mentor: Optional[str] = None
    internIds: Optional[List[str]] = None


# =========================
# PERFORMANCE REVIEWS (NEW)
# =========================

class PerformanceReview(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    internId: str
    internName: str
    email: EmailStr
    isPaid: bool
    project: str
    mentor: str
    reviewType: str
    reviewDate: date
    technicalSkills: int
    communicationSkills: int
    punctuality: int
    problemSolving: int
    teamwork: int
    overallRating: float
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
    reviewType: str
    technicalSkills: int
    communicationSkills: int
    punctuality: int
    problemSolving: int
    teamwork: int
    overallRating: float
    performanceReview: str
    continuationDecision: bool
    comments: Optional[str] = None
    reviewedBy: str


class PerformanceReviewUpdate(BaseModel):
    technicalSkills: Optional[int] = None
    communicationSkills: Optional[int] = None
    punctuality: Optional[int] = None
    problemSolving: Optional[int] = None
    teamwork: Optional[int] = None
    overallRating: Optional[float] = None
    performanceReview: Optional[str] = None
    continuationDecision: Optional[bool] = None
    comments: Optional[str] = None
    reviewType: Optional[str] = None
    reviewDate: Optional[date] = None


# =========================
# USER SCHEMAS
# =========================

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    name: str
    password: str
    employee_id: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    name: str
    employee_id: Optional[str] = None
    role: UserRole
    is_active: bool
    is_approved: bool = False
    created_at: Optional[datetime] = None


class UserUpdate(BaseModel):
    role: Optional[UserRole] = None
    is_approved: Optional[bool] = None
    is_active: Optional[bool] = None
    employee_id: Optional[str] = None


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
    batch: Optional[str] = None
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
    batch: Optional[str] = None
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
    reviewedBy: Optional[str] = None
    reviewedAt: Optional[datetime] = None
    feedback: Optional[str] = None


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
    tags: Optional[List[str]] = None
    comments: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    project: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[TaskStatus] = None
    dueDate: Optional[date] = None
    completedDate: Optional[date] = None
    tags: Optional[List[str]] = None
    comments: Optional[str] = None


# =========================
# PTO SCHEMAS (Leave)
# =========================

class PTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    internId: str
    type: str
    leaveType: Optional[str] = None
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    team: Optional[str] = None
    startDate: date
    endDate: date
    numberOfDays: int
    status: LeaveStatus = LeaveStatus.pending
    approvedBy: Optional[str] = None
    approvedAt: Optional[datetime] = None
    reason: Optional[str] = None
    comments: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PTOCreate(BaseModel):
    internId: str
    type: str
    leaveType: Optional[str] = None
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    team: Optional[str] = None
    startDate: date
    endDate: date
    numberOfDays: Optional[int] = None
    reason: Optional[str] = None


class PTOUpdate(BaseModel):
    status: Optional[LeaveStatus] = None
    approvedBy: Optional[str] = None
    comments: Optional[str] = None


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