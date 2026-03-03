"""
Interns360 – Updated Backend Models (With Missing Fields)
Roles: admin, scrum_master, intern
"""

from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import date, datetime, timezone,timedelta
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


class MentorRequestStatus(str, Enum):
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

    # 🔐 AUTH
    hashed_password: Optional[str] = None

    # 🔁 RESET PASSWORD (NEW)
    reset_password_id: Optional[str] = None
    reset_password_expires_at: Optional[datetime] = None
    reset_password_used: bool = False

    # 🔐 STATUS
    is_active: bool = True
    is_approved: bool = False
    azure_oid: Optional[str] = None
    auth_provider: Optional[str] = None

    # 📚 INTERN/SCRUM MASTER FIELDS (applicable when role is intern or scrum_master)
    organization: Optional[str] = None  # Mandatory for interns
    phone: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[int] = None
    cgpa: Optional[float] = None
    domain: Optional[str] = None
    internType: Optional[str] = None  # e.g., "full-time", "part-time"
    isPaid: bool = False
    status: Optional[str] = "active"  # active, onboarding, completed, dropped
    batch: Optional[str] = None
    currentProject: Optional[str] = None
    mentor: Optional[str] = None
    startDate: Optional[date] = None
    endDate: Optional[date] = None
    joinedDate: Optional[date] = None
    taskCount: int = 0
    completedTasks: int = 0
    dsuStreak: int = 0
    skills: List[str] = []

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# =========================
# NOTE: Intern model removed - using User model with role="intern" instead
# =========================


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


# =========================
# 360-DEGREE FEEDBACK (NEW)
# =========================

class FeedbackType(str, Enum):
    peer = "peer"
    mentor = "mentor"
    self = "self"


class FeedbackEntry(BaseModel):
    feedbackId: Optional[str] = Field(None, alias="_id")
    reviewerId: str
    reviewerName: str
    reviewerRole: str
    feedbackType: FeedbackType
    rating: int
    comments: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Feedback360(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    internId: str
    internName: str
    project: Optional[str] = None
    period: Optional[str] = None  # e.g., Q1-2024
    feedbacks: List[FeedbackEntry]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
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

    # Intern/Scrum Master fields (when applicable)
    organization: Optional[str] = None
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
    joinedDate: Optional[date] = None
    taskCount: Optional[int] = None
    completedTasks: Optional[int] = None
    dsuStreak: Optional[int] = None
    skills: Optional[List[str]] = None


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
# INTERN SCHEMAS (Now creates Users with role=intern)
# =========================

class InternCreate(BaseModel):
    """Create intern/scrum_master - creates a User with role=intern or scrum_master"""
    username: str
    name: str
    email: EmailStr
    password: Optional[str] = None  # Optional - can be set later
    role: UserRole = UserRole.intern  # Can be intern or scrum_master
    organization: str  # Mandatory field
    phone: str
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[int] = None
    cgpa: Optional[float] = None
    domain: Optional[str] = None
    internType: Optional[str] = None
    isPaid: bool = False
    batch: Optional[str] = None
    mentor: Optional[str] = None
    startDate: date
    endDate: date
    skills: List[str] = []
    employee_id: Optional[str] = None


class InternUpdate(BaseModel):
    """Update intern/scrum_master fields in User model"""
    name: Optional[str] = None
    username: Optional[str] = None
    organization: Optional[str] = None
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
    employee_id: Optional[str] = None


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
# NOTE: BatchYear and BatchMonth removed - not needed

class Organization(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    name: str
    status: str = "active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Batch(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    batchId: str
    batchName: str
    startDate: date
    endDate: Optional[date] = None
    duration: int = 90  # Duration in days
    coordinator: str
    description: Optional[str] = None
    domains: List[str] = []
    status: str = "active"  # upcoming, active, completed, archived
    internIds: List[str] = []
    totalInterns: int = 0
    activeInterns: int = 0
    completedInterns: int = 0
    droppedInterns: int = 0
    averageRating: float = 0.0
    averageTaskCompletion: float = 0.0
    averageDSUStreak: float = 0.0
    createdBy: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BatchCreate(BaseModel):
    batchName: str
    startDate: date
    coordinator: str
    description: Optional[str] = None
    domains: List[str] = []


class BatchUpdate(BaseModel):
    batchName: Optional[str] = None
    startDate: Optional[date] = None
    duration: Optional[int] = None
    coordinator: Optional[str] = None
    description: Optional[str] = None
    domains: Optional[List[str]] = None
    status: Optional[str] = None


# =========================
# MENTOR REQUESTS
# =========================

class MentorRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    requesterUserId: str
    requesterEmail: EmailStr
    requesterName: str
    mentorUserId: str
    mentorEmail: EmailStr
    mentorName: str
    status: MentorRequestStatus = MentorRequestStatus.pending
    approvedBy: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class MentorRequestCreate(BaseModel):
    mentorUserId: str


class MentorRequestUpdate(BaseModel):
    status: MentorRequestStatus