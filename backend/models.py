# """
# Pydantic models for all entities
# """
# from typing import Optional, List
# from pydantic import BaseModel, EmailStr, Field, ConfigDict
# from datetime import date, datetime, timezone


# # ==================== USER MODELS ====================
# class User(BaseModel):
#     model_config = ConfigDict(populate_by_name=True)
    
#     id: Optional[str] = Field(None, alias="_id")
#     username: str
#     email: EmailStr
#     name: str
#     role: str
#     hashed_password: str
#     is_active: bool = True
#     created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
#     updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# class UserCreate(BaseModel):
#     username: str
#     email: EmailStr
#     name: str
#     password: str
#     role: str = "intern"


# class UserResponse(BaseModel):
#     id: str
#     username: str
#     email: EmailStr
#     name: str
#     role: str
#     is_active: bool


# class LoginRequest(BaseModel):
#     email: EmailStr
#     password: str


# class Token(BaseModel):
#     access_token: str
#     token_type: str


# # ==================== INTERN MODELS ====================
# class Intern(BaseModel):
#     model_config = ConfigDict(populate_by_name=True)
    
#     id: Optional[str] = Field(None, alias="_id")
#     name: str
#     email: EmailStr
#     phone: str
#     college: str
#     degree: str
#     branch: str
#     year: int
#     cgpa: float
#     domain: str
#     internType: str
#     isPaid: bool = False
#     status: str = "onboarding"
#     currentProject: Optional[str] = None
#     mentor: str
#     startDate: date
#     endDate: date
#     joinedDate: Optional[date] = None
#     taskCount: int = 0
#     completedTasks: int = 0
#     dsuStreak: int = 0
#     skills: List[str] = Field(default_factory=list)
#     created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
#     updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# class InternCreate(BaseModel):
#     name: str
#     email: EmailStr
#     phone: str
#     college: str
#     degree: str
#     branch: str
#     year: int
#     cgpa: float
#     domain: str
#     internType: str
#     isPaid: bool = False
#     mentor: str
#     startDate: date
#     endDate: date
#     currentProject: Optional[str] = None
#     skills: List[str] = Field(default_factory=list)


# class InternUpdate(BaseModel):
#     name: Optional[str] = None
#     phone: Optional[str] = None
#     status: Optional[str] = None
#     currentProject: Optional[str] = None
#     taskCount: Optional[int] = None
#     completedTasks: Optional[int] = None
#     dsuStreak: Optional[int] = None


# # ==================== DSU MODELS ====================
# class DSUEntry(BaseModel):
#     model_config = ConfigDict(populate_by_name=True)
    
#     id: Optional[str] = Field(None, alias="_id")
#     internId: str
#     date: str
#     yesterday: str
#     today: str
#     blockers: Optional[str] = None
#     learnings: Optional[str] = None
#     status: str = "pending"
#     submittedAt: Optional[datetime] = None
#     reviewedBy: Optional[str] = None
#     reviewedAt: Optional[datetime] = None
#     feedback: Optional[str] = None
#     created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
#     updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# class DSUCreate(BaseModel):
#     internId: str
#     date: str
#     yesterday: str
#     today: str
#     blockers: Optional[str] = None
#     learnings: Optional[str] = None


# class DSUUpdate(BaseModel):
#     yesterday: Optional[str] = None
#     today: Optional[str] = None
#     blockers: Optional[str] = None
#     learnings: Optional[str] = None
#     feedback: Optional[str] = None

# # # ==================== TASK MODELS ====================
# # class Task(BaseModel):
# #     model_config = ConfigDict(populate_by_name=True)
    
# #     id: Optional[str] = Field(None, alias="_id")
# #     internId: str
# #     title: str
# #     description: Optional[str] = None
# #     project: str
# #     priority: str = "medium"
# #     status: str = "NOT_STARTED"
# #     assignedBy: Optional[str] = None
# #     dueDate: Optional[date] = None
# #     completedAt: Optional[datetime] = None
# #     tags: List[str] = Field(default_factory=list)
# #     task_date: date = Field(default_factory=date.today, alias="date")  # ← FIXED
# #     comments: Optional[str] = None
# #     created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
# #     updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# # class TaskCreate(BaseModel):
# #     internId: str
# #     title: str
# #     description: Optional[str] = None
# #     project: str
# #     priority: str = "medium"
# #     status: str = "NOT_STARTED"
# #     assignedBy: Optional[str] = None
# #     dueDate: Optional[date] = None
# #     tags: List[str] = Field(default_factory=list)
# #     task_date: date = Field(default_factory=date.today, alias="date")  # ← FIXED
# #     comments: Optional[str] = None


# # class TaskUpdate(BaseModel):
# #     title: Optional[str] = None

# #     description: Optional[str] = None
# #     project: Optional[str] = None
# #     priority: Optional[str] = None
# #     status: Optional[str] = None
# #     dueDate: Optional[date] = None
# #     comments: Optional[str] = None
# #     tags: Optional[List[str]] = None

# # Task Models
# class TaskCreate(BaseModel):
#     internId: str
#     title: str
#     description: Optional[str] = None
#     project: str
#     priority: Optional[str] = "medium"
#     status: Optional[str] = "NOT_STARTED"  
#     assignedBy: Optional[str] = None
#     dueDate: Optional[date] = None
#     tags: Optional[List[str]] = []
#     task_date: Optional[date] = Field(None, alias="date")
#     comments: Optional[str] = None


# class TaskUpdate(BaseModel):
#     title: Optional[str] = None
#     description: Optional[str] = None
#     project: Optional[str] = None
#     priority: Optional[str] = None
#     status: Optional[str] = None
#     dueDate: Optional[date] = None
#     tags: Optional[List[str]] = None
#     task_date: Optional[date] = Field(None, alias="date")
#     comments: Optional[str] = None


# class Task(BaseModel):
#     model_config = ConfigDict(populate_by_name=True)
    
#     id: str = Field(alias="_id")
#     internId: str
#     title: str
#     description: Optional[str] = None
#     project: str
#     priority: str = "medium"
#     status: str
#     assignedBy: Optional[str] = None
#     dueDate: Optional[date] = None
#     completedAt: Optional[datetime] = None
#     tags: List[str] = []
#     task_date: Optional[date] = Field(None, alias="date")
#     comments: Optional[str] = None
#     created_at: datetime
#     updated_at: datetime




# # ==================== PROJECT MODELS ====================
# class Project(BaseModel):
#     model_config = ConfigDict(populate_by_name=True)
    
#     id: Optional[str] = Field(None, alias="_id")
#     name: str
#     description: Optional[str] = None
#     status: str = "active"
#     techStack: List[str] = Field(default_factory=list)
#     startDate: date
#     endDate: Optional[date] = None
#     internIds: List[str] = Field(default_factory=list)
#     mentor: str
#     created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
#     updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# class ProjectCreate(BaseModel):
#     name: str
#     description: Optional[str] = None
#     techStack: List[str] = Field(default_factory=list)
#     mentor: str
#     startDate: date


# class ProjectUpdate(BaseModel):
#     name: Optional[str] = None
#     description: Optional[str] = None
#     status: Optional[str] = None
#     techStack: Optional[List[str]] = None
#     endDate: Optional[date] = None


# # ==================== PTO MODELS ====================
# class PTO(BaseModel):
#     model_config = ConfigDict(populate_by_name=True)
    
#     id: Optional[str] = Field(None, alias="_id")
#     internId: str
#     name: str
#     email: EmailStr
#     team: str
#     startDate: date
#     endDate: date
#     numberOfDays: int
#     reason: Optional[str] = None
#     status: str = "pending"  # pending, approved, rejected
#     approvedBy: Optional[str] = None
#     approvedAt: Optional[datetime] = None
#     comments: Optional[str] = None
#     created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
#     updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# class PTOCreate(BaseModel):
#     internId: str
#     name: str
#     email: EmailStr
#     team: str
#     startDate: date
#     endDate: date
#     numberOfDays: int
#     reason: Optional[str] = None


# class PTOUpdate(BaseModel):
#     status: Optional[str] = None
#     approvedBy: Optional[str] = None
#     comments: Optional[str] = None


# # ==================== REFERENCE MODELS ====================
# class Reference(BaseModel):
#     model_config = ConfigDict(populate_by_name=True)
    
#     id: Optional[str] = Field(None, alias="_id")
#     name: str
#     email: EmailStr
#     phone: str
#     referredBy: Optional[str] = None
#     referralComment: Optional[str] = None
#     status: str = "pending"  # pending, test_scheduled, interviewed, selected, rejected
#     testPerformance: Optional[str] = None
#     interviewPerformance: Optional[str] = None
#     comments: Optional[str] = None
#     appliedDate: date = Field(default_factory=date.today)
#     created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
#     updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# class ReferenceCreate(BaseModel):
#     name: str
#     email: EmailStr
#     phone: str
#     referredBy: Optional[str] = None
#     referralComment: Optional[str] = None


# class ReferenceUpdate(BaseModel):
#     status: Optional[str] = None
#     testPerformance: Optional[str] = None
#     interviewPerformance: Optional[str] = None
#     comments: Optional[str] = None


# # ==================== PERFORMANCE REVIEW MODELS ====================
# class PerformanceReview(BaseModel):
#     model_config = ConfigDict(populate_by_name=True)
    
#     id: Optional[str] = Field(None, alias="_id")
#     internId: str
#     internName: str
#     email: EmailStr
#     isPaid: bool
#     project: str
#     mentor: str
#     reviewType: str = "mid-term"  # mid-term, final
#     reviewDate: date = Field(default_factory=date.today)
    
#     # Performance Metrics
#     technicalSkills: int = Field(ge=1, le=5)  # 1-5 rating
#     communicationSkills: int = Field(ge=1, le=5)
#     punctuality: int = Field(ge=1, le=5)
#     problemSolving: int = Field(ge=1, le=5)
#     teamwork: int = Field(ge=1, le=5)
#     overallRating: float = Field(ge=1.0, le=5.0)
    
#     performanceReview: str
#     continuationDecision: bool
#     comments: Optional[str] = None
#     reviewedBy: str
    
#     created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
#     updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# class PerformanceReviewCreate(BaseModel):
#     internId: str
#     internName: str
#     email: EmailStr
#     isPaid: bool
#     project: str
#     mentor: str
#     reviewType: str = "mid-term"
    
#     technicalSkills: int = Field(ge=1, le=5)
#     communicationSkills: int = Field(ge=1, le=5)
#     punctuality: int = Field(ge=1, le=5)
#     problemSolving: int = Field(ge=1, le=5)
#     teamwork: int = Field(ge=1, le=5)
    
#     performanceReview: str
#     continuationDecision: bool
#     comments: Optional[str] = None
#     reviewedBy: str


# class PerformanceReviewUpdate(BaseModel):
#     technicalSkills: Optional[int] = Field(None, ge=1, le=5)
#     communicationSkills: Optional[int] = Field(None, ge=1, le=5)
#     punctuality: Optional[int] = Field(None, ge=1, le=5)
#     problemSolving: Optional[int] = Field(None, ge=1, le=5)
#     teamwork: Optional[int] = Field(None, ge=1, le=5)
#     performanceReview: Optional[str] = None
#     continuationDecision: Optional[bool] = None
#     comments: Optional[str] = None

# # Add to existing models.py after PTO models

# # ==================== BATCH MODELS ====================
# class BatchCreate(BaseModel):
#     batchId: str  # "JUN-2025", "DEC-2024"
#     batchName: str  # "June 2025 Engineering Batch"
#     startDate: str  # ISO date
#     endDate: str
#     duration: int  # in months
#     coordinator: str  # Admin/Mentor name
#     description: Optional[str] = ""
#     maxInterns: Optional[int] = 50
#     domains: Optional[List[str]] = []  # ["Frontend", "Backend", "QA"]


# class BatchUpdate(BaseModel):
#     batchName: Optional[str] = None
#     endDate: Optional[str] = None
#     coordinator: Optional[str] = None
#     description: Optional[str] = None
#     status: Optional[str] = None
#     maxInterns: Optional[int] = None


# class Batch(BaseModel):
#     model_config = ConfigDict(populate_by_name=True)
    
#     id: Optional[str] = Field(None, alias="_id")
#     batchId: str
#     batchName: str
#     startDate: str
#     endDate: str
#     duration: int
#     coordinator: str
#     description: str
#     maxInterns: int
#     domains: List[str]
    
#     # Auto-calculated stats
#     totalInterns: int = 0
#     activeInterns: int = 0
#     completedInterns: int = 0
#     droppedInterns: int = 0
    
#     # Performance metrics
#     averageRating: float = 0.0
#     averageTaskCompletion: float = 0.0
#     averageDSUStreak: int = 0
    
#     # Status
#     status: str  # "upcoming", "active", "completed", "archived"
    
#     # Metadata
#     created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
#     updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


"""
Pydantic models for all entities
"""
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from datetime import date, datetime, timezone



# ==================== USER MODELS ====================
class User(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = Field(None, alias="_id")
    username: str
    email: EmailStr
    name: str
    role: str  # "admin", "mentor", "intern"
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        allowed_roles = ["admin", "mentor", "intern"]
        if v not in allowed_roles:
            raise ValueError(f"Role must be one of {allowed_roles}")
        return v


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    name: str = Field(min_length=2, max_length=100)
    password: str = Field(min_length=6)
    role: str = "intern"
    
    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        allowed_roles = ["admin", "mentor", "intern"]
        if v not in allowed_roles:
            raise ValueError(f"Role must be one of {allowed_roles}")
        return v


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
    token_type: str = "bearer"



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
    year: int = Field(ge=1, le=5)  # Validation: 1-5 years
    cgpa: float = Field(ge=0.0, le=10.0)  # Validation: 0-10 CGPA
    domain: str
    internType: str  # "project", "rs"
    isPaid: bool = False
    status: str = "onboarding"  # "onboarding", "active", "completed", "dropped"
    currentProject: Optional[str] = None
    mentor: str
    batch: Optional[str] = None  # ✅ ADD THIS - batch reference
    startDate: date
    endDate: date
    joinedDate: Optional[date] = None
    taskCount: int = 0
    completedTasks: int = 0
    dsuStreak: int = 0
    skills: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    @field_validator('internType')
    @classmethod
    def validate_intern_type(cls, v):
        if v not in ["project", "rs"]:
            raise ValueError("internType must be 'project' or 'rs'")
        return v
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        allowed = ["onboarding", "active", "completed", "dropped"]
        if v not in allowed:
            raise ValueError(f"Status must be one of {allowed}")
        return v


class InternCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(pattern=r'^\+?[\d\s\-()]+$')  # Basic phone validation
    college: str
    degree: str
    branch: str
    year: int = Field(ge=1, le=5)
    cgpa: float = Field(ge=0.0, le=10.0)
    domain: str
    internType: str
    isPaid: bool = False
    mentor: str
    batch: Optional[str] = None  # ✅ ADD THIS
    startDate: date
    endDate: date
    currentProject: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    
    @field_validator('internType')
    @classmethod
    def validate_intern_type(cls, v):
        if v not in ["project", "rs"]:
            raise ValueError("internType must be 'project' or 'rs'")
        return v
    
    @field_validator('endDate')
    @classmethod
    def validate_dates(cls, v, info):
        if 'startDate' in info.data and v < info.data['startDate']:
            raise ValueError("endDate must be after startDate")
        return v


class InternUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    currentProject: Optional[str] = None
    batch: Optional[str] = None  # ✅ ADD THIS
    taskCount: Optional[int] = None
    completedTasks: Optional[int] = None
    dsuStreak: Optional[int] = None
    mentor: Optional[str] = None
    skills: Optional[List[str]] = None



# ==================== DSU MODELS ====================
class DSUEntry(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = Field(None, alias="_id")
    internId: str
    date: str  # ISO date string "YYYY-MM-DD"
    yesterday: str = Field(min_length=10, max_length=1000)
    today: str = Field(min_length=10, max_length=1000)
    blockers: Optional[str] = Field(None, max_length=500)
    learnings: Optional[str] = Field(None, max_length=500)
    status: str = "submitted"  # "submitted", "reviewed"
    submittedAt: Optional[datetime] = None
    reviewedBy: Optional[str] = None
    reviewedAt: Optional[datetime] = None
    feedback: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class DSUCreate(BaseModel):
    internId: str
    date: str  # ISO date string
    yesterday: str = Field(min_length=10, max_length=1000)
    today: str = Field(min_length=10, max_length=1000)
    blockers: Optional[str] = Field(None, max_length=500)
    learnings: Optional[str] = Field(None, max_length=500)


class DSUUpdate(BaseModel):
    yesterday: Optional[str] = Field(None, min_length=10, max_length=1000)
    today: Optional[str] = Field(None, min_length=10, max_length=1000)
    blockers: Optional[str] = Field(None, max_length=500)
    learnings: Optional[str] = Field(None, max_length=500)
    feedback: Optional[str] = Field(None, max_length=1000)



# ==================== TASK MODELS ====================
class Task(BaseModel):
    model_config = ConfigDict(populate_by_name=True, use_enum_values=True)
    
    id: Optional[str] = Field(None, alias="_id")
    internId: str
    title: str = Field(min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    project: str
    priority: str = "medium"  # "low", "medium", "high", "urgent"
    status: str = "NOT_STARTED"  # "NOT_STARTED", "IN_PROGRESS", "DONE", "BLOCKED"
    assignedBy: Optional[str] = None
    dueDate: Optional[date] = None
    completedAt: Optional[datetime] = None
    tags: List[str] = Field(default_factory=list)
    task_date: Optional[date] = Field(None, alias="date")
    comments: Optional[str] = Field(None, max_length=1000)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    @field_validator('priority')
    @classmethod
    def validate_priority(cls, v):
        allowed = ["low", "medium", "high", "urgent"]
        if v not in allowed:
            raise ValueError(f"Priority must be one of {allowed}")
        return v
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        allowed = ["NOT_STARTED", "IN_PROGRESS", "DONE", "BLOCKED"]
        if v not in allowed:
            raise ValueError(f"Status must be one of {allowed}")
        return v


class TaskCreate(BaseModel):
    internId: str
    title: str = Field(min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    project: str
    priority: str = "medium"
    status: str = "NOT_STARTED"
    assignedBy: Optional[str] = None
    dueDate: Optional[date] = None
    tags: List[str] = Field(default_factory=list)
    task_date: Optional[date] = Field(None, alias="date")
    comments: Optional[str] = Field(None, max_length=1000)


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    project: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    dueDate: Optional[date] = None
    tags: Optional[List[str]] = None
    task_date: Optional[date] = Field(None, alias="date")
    comments: Optional[str] = Field(None, max_length=1000)



# ==================== PROJECT MODELS ====================
class Project(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = Field(None, alias="_id")
    name: str = Field(min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=2000)
    status: str = "active"  # "active", "completed", "on-hold"
    techStack: List[str] = Field(default_factory=list)
    startDate: date
    endDate: Optional[date] = None
    internIds: List[str] = Field(default_factory=list)
    mentor: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProjectCreate(BaseModel):
    name: str = Field(min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=2000)
    techStack: List[str] = Field(default_factory=list)
    mentor: str
    startDate: date


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=2000)
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
    leaveType: str = "casual"  # ✅ ADD THIS - "casual", "sick", "emergency"
    startDate: date
    endDate: date
    numberOfDays: int = Field(ge=1)
    reason: Optional[str] = Field(None, max_length=500)
    status: str = "pending"  # "pending", "approved", "rejected"
    approvedBy: Optional[str] = None
    approvedAt: Optional[datetime] = None
    comments: Optional[str] = Field(None, max_length=500)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        allowed = ["pending", "approved", "rejected"]
        if v not in allowed:
            raise ValueError(f"Status must be one of {allowed}")
        return v
    
    @field_validator('endDate')
    @classmethod
    def validate_dates(cls, v, info):
        if 'startDate' in info.data and v < info.data['startDate']:
            raise ValueError("endDate must be after or equal to startDate")
        return v


class PTOCreate(BaseModel):
    internId: str
    name: str
    email: EmailStr
    team: str
    leaveType: str = "casual"  # ✅ ADD THIS
    startDate: date
    endDate: date
    numberOfDays: int = Field(ge=1)
    reason: Optional[str] = Field(None, max_length=500)
    
    @field_validator('endDate')
    @classmethod
    def validate_dates(cls, v, info):
        if 'startDate' in info.data and v < info.data['startDate']:
            raise ValueError("endDate must be after or equal to startDate")
        return v


class PTOUpdate(BaseModel):
    status: Optional[str] = None
    approvedBy: Optional[str] = None
    comments: Optional[str] = Field(None, max_length=500)
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        if v and v not in ["pending", "approved", "rejected"]:
            raise ValueError("Status must be 'pending', 'approved', or 'rejected'")
        return v



# ==================== BATCH MODELS ====================
class BatchCreate(BaseModel):
    batchId: str = Field(min_length=3, max_length=20)  # "JUN-2025"
    batchName: str = Field(min_length=5, max_length=100)
    startDate: str  # ISO date string
    endDate: str
    duration: int = Field(ge=1, le=24)  # 1-24 months
    coordinator: str
    description: Optional[str] = Field("", max_length=1000)
    maxInterns: int = Field(default=50, ge=1, le=200)
    domains: List[str] = Field(default_factory=list)
    
    @field_validator('batchId')
    @classmethod
    def validate_batch_id(cls, v):
        # Validate format: XXX-YYYY (e.g., JUN-2025)
        import re
        if not re.match(r'^[A-Z]{3}-\d{4}$', v):
            raise ValueError("batchId must be in format 'XXX-YYYY' (e.g., 'JUN-2025')")
        return v


class BatchUpdate(BaseModel):
    batchName: Optional[str] = Field(None, min_length=5, max_length=100)
    endDate: Optional[str] = None
    coordinator: Optional[str] = None
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[str] = None
    maxInterns: Optional[int] = Field(None, ge=1, le=200)
    domains: Optional[List[str]] = None
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        if v and v not in ["upcoming", "active", "completed", "archived"]:
            raise ValueError("Status must be one of: upcoming, active, completed, archived")
        return v


class Batch(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = Field(None, alias="_id")
    batchId: str
    batchName: str
    startDate: str
    endDate: str
    duration: int
    coordinator: str
    description: str = ""
    maxInterns: int = 50
    domains: List[str] = Field(default_factory=list)
    
    # Auto-calculated stats
    totalInterns: int = 0
    activeInterns: int = 0
    completedInterns: int = 0
    droppedInterns: int = 0
    
    # Performance metrics
    averageRating: float = 0.0
    averageTaskCompletion: float = 0.0
    averageDSUStreak: int = 0
    
    # Status
    status: str  # "upcoming", "active", "completed", "archived"
    
    # Metadata
    createdBy: Optional[str] = None  # ✅ ADD THIS - track who created
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))



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
    reviewType: str = "mid-term"  # "mid-term", "final"
    reviewDate: date = Field(default_factory=date.today)
    
    # Performance Metrics (1-5 rating)
    technicalSkills: int = Field(ge=1, le=5)
    communicationSkills: int = Field(ge=1, le=5)
    punctuality: int = Field(ge=1, le=5)
    problemSolving: int = Field(ge=1, le=5)
    teamwork: int = Field(ge=1, le=5)
    overallRating: float = Field(ge=1.0, le=5.0)
    
    performanceReview: str = Field(min_length=20, max_length=2000)
    continuationDecision: bool
    comments: Optional[str] = Field(None, max_length=1000)
    reviewedBy: str
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    @field_validator('reviewType')
    @classmethod
    def validate_review_type(cls, v):
        if v not in ["mid-term", "final"]:
            raise ValueError("reviewType must be 'mid-term' or 'final'")
        return v


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
    
    performanceReview: str = Field(min_length=20, max_length=2000)
    continuationDecision: bool
    comments: Optional[str] = Field(None, max_length=1000)
    reviewedBy: str


class PerformanceReviewUpdate(BaseModel):
    technicalSkills: Optional[int] = Field(None, ge=1, le=5)
    communicationSkills: Optional[int] = Field(None, ge=1, le=5)
    punctuality: Optional[int] = Field(None, ge=1, le=5)
    problemSolving: Optional[int] = Field(None, ge=1, le=5)
    teamwork: Optional[int] = Field(None, ge=1, le=5)
    performanceReview: Optional[str] = Field(None, min_length=20, max_length=2000)
    continuationDecision: Optional[bool] = None
    comments: Optional[str] = Field(None, max_length=1000)



# ==================== REFERENCE MODELS ====================
class Reference(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: Optional[str] = Field(None, alias="_id")
    name: str
    email: EmailStr
    phone: str
    referredBy: Optional[str] = None
    referralComment: Optional[str] = Field(None, max_length=500)
    status: str = "pending"  # "pending", "test_scheduled", "interviewed", "selected", "rejected"
    testPerformance: Optional[str] = Field(None, max_length=500)
    interviewPerformance: Optional[str] = Field(None, max_length=500)
    comments: Optional[str] = Field(None, max_length=1000)
    appliedDate: date = Field(default_factory=date.today)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ReferenceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str
    referredBy: Optional[str] = None
    referralComment: Optional[str] = Field(None, max_length=500)


class ReferenceUpdate(BaseModel):
    status: Optional[str] = None
    testPerformance: Optional[str] = Field(None, max_length=500)
    interviewPerformance: Optional[str] = Field(None, max_length=500)
    comments: Optional[str] = Field(None, max_length=1000)
