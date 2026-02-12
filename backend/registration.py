# """
# Authentication router for registration with OTP verification
# """
# from fastapi import APIRouter, HTTPException, Depends, status
# from pydantic import BaseModel, EmailStr, validator
# from typing import Optional
# from database import get_database
# from auth import get_password_hash
# from otp_service import OTPService
# from datetime import datetime
# import registration

# router = APIRouter(prefix="/auth", tags=["Authentication"])

# # ==================== REQUEST MODELS ====================

# class SendOTPRequest(BaseModel):
#     email: EmailStr

# class CheckEmailRequest(BaseModel):
#     email: EmailStr

# class RegistrationRequest(BaseModel):
#     fullName: str
#     startDate: str  # Format: YYYY-MM-DD
#     endDate: str    # Format: YYYY-MM-DD
#     email: EmailStr
#     collegeName: str
#     degree: str
#     internType: str  # "Paid" or "Unpaid"
#     otp: str
#     password: str
    
#     @validator('fullName')
#     def validate_full_name(cls, v):
#         if not v or not v.strip():
#             raise ValueError('Full name is required')
#         return v.strip()
    
#     @validator('startDate', 'endDate')
#     def validate_dates(cls, v):
#         if not v:
#             raise ValueError('Date is required')
#         # Basic date format validation
#         if not re.match(r'^\d{4}-\d{2}-\d{2}$', v):
#             raise ValueError('Date must be in YYYY-MM-DD format')
#         return v
    
#     @validator('endDate')
#     def validate_end_date(cls, v, values):
#         if 'startDate' in values and v:
#             if v <= values['startDate']:
#                 raise ValueError('End date must be later than start date')
#         return v
    
#     @validator('email')
#     def validate_email(cls, v):
#         if not v or not v.strip():
#             raise ValueError('Email is required')
#         return v.lower().strip()
    
#     @validator('collegeName', 'degree')
#     def validate_required_fields(cls, v):
#         if not v or not v.strip():
#             raise ValueError('This field is required')
#         return v.strip()
    
#     @validator('internType')
#     def validate_intern_type(cls, v):
#         if v not in ['Paid', 'Unpaid']:
#             raise ValueError('Intern type must be either Paid or Unpaid')
#         return v
    
#     @validator('otp')
#     def validate_otp(cls, v):
#         if not v or len(v) != 6:
#             raise ValueError('OTP must be 6 digits')
#         if not v.isdigit():
#             raise ValueError('OTP must contain only numbers')
#         return v
    
#     @validator('password')
#     def validate_password(cls, v):
#         if len(v) < 8:
#             raise ValueError('Password must be at least 8 characters long')
#         if not re.search(r'[A-Z]', v):
#             raise ValueError('Password must contain at least one uppercase letter')
#         if not re.search(r'[a-z]', v):
#             raise ValueError('Password must contain at least one lowercase letter')
#         if not re.search(r'\d', v):
#             raise ValueError('Password must contain at least one number')
#         if not re.search(r'[@$!%*?&#]', v):
#             raise ValueError('Password must contain at least one special character (@$!%*?&#)')
#         return v

# # ==================== ENDPOINTS ====================

# @router.get("/check-email")
# async def check_email_exists(
#     email: str,
#     db = Depends(get_database)
# ):
#     """
#     Check if email already exists in the system
#     Returns: { "exists": true/false }
#     """
#     try:
#         email = email.lower().strip()
        
#         # Check in users collection
#         user = await db.users.find_one({"email": email})
#         if user:
#             return {"exists": True, "message": "Email already registered"}
        
#         # Check in interns collection
#         intern = await db.interns.find_one({"email": email})
#         if intern:
#             return {"exists": True, "message": "Email already registered"}
        
#         return {"exists": False}
        
#     except Exception as e:
#         print(f"[Auth] Error checking email: {e}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Error checking email availability"
#         )

# @router.post("/send-otp")
# async def send_otp(
#     request: SendOTPRequest,
#     db = Depends(get_database)
# ):
#     """
#     Send OTP to email for verification
#     """
#     try:
#         email = request.email.lower().strip()
        
#         # Check if email already exists
#         user_exists = await db.users.find_one({"email": email})
#         intern_exists = await db.interns.find_one({"email": email})
        
#         if user_exists or intern_exists:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Email already registered. Please use a different email or login."
#             )
        
#         # Send OTP
#         success = await OTPService.send_otp(email)
        
#         if not success:
#             raise HTTPException(
#                 status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#                 detail="Failed to send OTP. Please try again."
#             )
        
#         return {
#             "success": True,
#             "message": f"OTP sent successfully to {email}",
#             "expiresIn": f"{OTPService.OTP_EXPIRY_MINUTES} minutes"
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"[Auth] Error sending OTP: {e}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Error sending OTP"
#         )

# @router.post("/register")
# async def register_user(
#     request: RegistrationRequest,
#     db = Depends(get_database)
# ):
#     """
#     Complete user registration with OTP verification
#     """
#     try:
#         email = request.email.lower().strip()
        
#         # Verify OTP
#         if not OTPService.verify_otp(email, request.otp):
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Invalid or expired OTP. Please request a new one."
#             )
        
#         # Check if email already exists (double-check)
#         user_exists = await db.users.find_one({"email": email})
#         intern_exists = await db.interns.find_one({"email": email})
        
#         if user_exists or intern_exists:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Email already registered"
#             )
        
#         # Hash password
#         hashed_password = get_password_hash(request.password)
        
#         # Generate username from email
#         username = email.split('@')[0]
#         base_username = username
#         counter = 1
#         while await db.users.find_one({"username": username}):
#             username = f"{base_username}{counter}"
#             counter += 1
        
#         # Create user document
#         user_doc = {
#             "username": username,
#             "email": email,
#             "password": hashed_password,
#             "name": request.fullName,
#             "role": "intern",
#             "is_active": True,
#             "created_at": datetime.utcnow(),
#             "updated_at": datetime.utcnow()
#         }
        
#         # Create intern document
#         intern_doc = {
#             "name": request.fullName,
#             "email": email,
#             "startDate": request.startDate,
#             "endDate": request.endDate,
#             "joinedDate": request.startDate,  # Same as start date for now
#             "college": request.collegeName,
#             "degree": request.degree,
#             "internType": request.internType,
#             "payType": request.internType,  # Same as intern type
#             "status": "active",
#             "skills": [],
#             "phone": "",
#             "cgpa": None,
#             "batch": None,
#             "mentor": None,
#             "currentProject": None,
#             "created_at": datetime.utcnow(),
#             "updated_at": datetime.utcnow()
#         }
        
#         # Insert into database
#         user_result = await db.users.insert_one(user_doc)
#         intern_result = await db.interns.insert_one(intern_doc)
        
#         print(f"[Auth] User registered: {email} (username: {username})")
        
#         return {
#             "success": True,
#             "message": "Registration successful! You can now login.",
#             "user": {
#                 "id": str(user_result.inserted_id),
#                 "username": username,
#                 "email": email,
#                 "name": request.fullName,
#                 "role": "intern"
#             }
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"[Auth] Registration error: {e}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Registration failed: {str(e)}"
#         )

# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel, EmailStr

# from otp_service import send_otp, verify_otp

# router = APIRouter()


# # -------------------------------
# # Request Models
# # -------------------------------

# class SendOtpRequest(BaseModel):
#     email: EmailStr


# class VerifyOtpRequest(BaseModel):
#     email: EmailStr
#     otp: str


# # -------------------------------
# Routes
# -------------------------------

# @router.post("/send-otp")
# async def send_otp_api(payload: SendOtpRequest):
#     """
#     API to send OTP to email
#     """
#     await send_otp(payload.email)

#     return {"message": "OTP sent successfully"}


# @router.post("/verify-otp")
# async def verify_otp_api(payload: VerifyOtpRequest):
#     """
#     API to verify OTP entered by user
#     """
#     valid = verify_otp(payload.email, payload.otp)

#     if not valid:
#         raise HTTPException(status_code=400, detail="Invalid OTP")

#     return {"message": "OTP verified successfully"}
"""
Authentication router for registration with OTP verification
"""
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from database import get_database
from auth import get_password_hash
from otp_service import OTPService
from datetime import datetime
import re

router = APIRouter(tags=["Authentication"])

# ==================== REQUEST MODELS ====================

class SendOTPRequest(BaseModel):
    email: EmailStr

class CheckEmailRequest(BaseModel):
    email: EmailStr

class RegistrationRequest(BaseModel):
    fullName: str
    startDate: str  
    endDate: str    
    email: EmailStr
    collegeName: str
    degree: str
    internType: str 
    otp: str
    password: str
    
    @validator('fullName')
    def validate_full_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Full name is required')
        return v.strip()
    
    @validator('startDate', 'endDate')
    def validate_dates(cls, v):
        if not v:
            raise ValueError('Date is required')
        
        if not re.match(r'^\d{4}-\d{2}-\d{2}$', v):
            raise ValueError('Date must be in YYYY-MM-DD format')
        return v
    
    @validator('endDate')
    def validate_end_date(cls, v, values):
        if 'startDate' in values and v:
            if v <= values['startDate']:
                raise ValueError('End date must be later than start date')
        return v
    
    @validator('email')
    def validate_email(cls, v):
        if not v or not v.strip():
            raise ValueError('Email is required')
        return v.lower().strip()
    
    @validator('collegeName', 'degree')
    def validate_required_fields(cls, v):
        if not v or not v.strip():
            raise ValueError('This field is required')
        return v.strip()
    
    @validator('internType')
    def validate_intern_type(cls, v):
        if v not in ['Paid', 'Unpaid']:
            raise ValueError('Intern type must be either Paid or Unpaid')
        return v
    
    @validator('otp')
    def validate_otp(cls, v):
        if not v or len(v) != 6:
            raise ValueError('OTP must be 6 digits')
        if not v.isdigit():
            raise ValueError('OTP must contain only numbers')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[@$!%*?&#]', v):
            raise ValueError('Password must contain at least one special character (@$!%*?&#)')
        return v

# ==================== ENDPOINTS ====================

@router.get("/check-email")
async def check_email_exists(
    email: str,
    db = Depends(get_database)
):
    """
    Check if email already exists in the system
    Returns: { "exists": true/false }
    """
    try:
        email = email.lower().strip()
        
        # Check in users collection
        user = await db.users.find_one({"email": email})
        if user:
            return {"exists": True, "message": "Email already registered"}
        
        # Check in interns collection
        intern = await db.interns.find_one({"email": email})
        if intern:
            return {"exists": True, "message": "Email already registered"}
        
        return {"exists": False}
        
    except Exception as e:
        print(f"[Auth] Error checking email: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error checking email availability"
        )

@router.post("/send-otp")
async def send_otp(
    request: SendOTPRequest,
    db = Depends(get_database)
):
    """
    Send OTP to email for verification
    """
    try:
        email = request.email.lower().strip()
        
        # Check if email already exists
        user_exists = await db.users.find_one({"email": email})
        intern_exists = await db.interns.find_one({"email": email})
        
        if user_exists or intern_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered. Please use a different email or login."
            )
        
        # Send OTP
        success = await OTPService.send_otp(email)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send OTP. Please try again."
            )
        
        return {
            "success": True,
            "message": f"OTP sent successfully to {email}",
            "expiresIn": f"{OTPService.OTP_EXPIRY_MINUTES} minutes"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Auth] Error sending OTP: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error sending OTP"
        )

@router.post("/register")
async def register_user(
    request: RegistrationRequest,
    db = Depends(get_database)
):
    """
    Complete user registration with OTP verification
    """
    try:
        email = request.email.lower().strip()
        
        # Verify OTP
        if not OTPService.verify_otp(email, request.otp):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP. Please request a new one."
            )
        
        
        user_exists = await db.users.find_one({"email": email})
        intern_exists = await db.interns.find_one({"email": email})
        
        if user_exists or intern_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        
        hashed_password = get_password_hash(request.password)
        
        # Generate username from email
        username = email.split('@')[0]
        base_username = username
        counter = 1
        while await db.users.find_one({"username": username}):
            username = f"{base_username}{counter}"
            counter += 1
        
        # Create user document
        user_doc = {
            "username": username,
            "email": email,
            "hashed_password": hashed_password,  # Changed from "password" to "hashed_password"
            "name": request.fullName,
            "role": "intern",
            "is_active": True,
            "is_approved": False,  # Needs admin approval
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Create intern document
        intern_doc = {
            "name": request.fullName,
            "email": email,
            "startDate": request.startDate,
            "endDate": request.endDate,
            "joinedDate": request.startDate,  # Same as start date for now
            "college": request.collegeName,
            "degree": request.degree,
            "internType": request.internType,
            "payType": request.internType,  # Same as intern type
            "status": "active",
            "skills": [],
            "phone": "",
            "cgpa": None,
            "batch": None,
            "mentor": None,
            "currentProject": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert into database
        user_result = await db.users.insert_one(user_doc)
        intern_result = await db.interns.insert_one(intern_doc)
        
        print(f"[Auth] User registered: {email} (username: {username})")
        
        return {
            "success": True,
            "message": "Registration successful! Your account is pending admin approval.",
            "user": {
                "id": str(user_result.inserted_id),
                "username": username,
                "email": email,
                "name": request.fullName,
                "role": "intern"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Auth] Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )