"""
Enhanced SSO Handler with Profile Completion Flow
"""
import httpx
import os
from datetime import datetime, timezone
from fastapi import HTTPException, Depends
from dotenv import load_dotenv
from azure_auth import validate_azure_token, normalize_email
from auth import create_access_token
from models import UserResponse
from database import get_database
from email_service import send_welcome_email

load_dotenv()


async def handle_azure_sso_callback(code: str, db):
    """
    Enhanced Azure SSO callback handler that supports:
    - New users → redirect to profile completion
    - Existing users not approved → show pending approval
    - Approved users → proceed to dashboard

    Returns: Dict with status, user, token, and message
    """
    try:
        # Exchange authorization code for token
        tenant_id = os.getenv("tenant_id")
        client_id = os.getenv("client_id")
        secret_key = os.getenv("AZURE_SECRET_KEY")
        redirect_uri = os.getenv("AZURE_REDIRECT_URI")

        print(f"[SSO Handler] Exchanging code for token...")

        if not all([tenant_id, client_id, secret_key]):
            missing = []
            if not tenant_id: missing.append("tenant_id")
            if not client_id: missing.append("client_id")
            if not secret_key: missing.append("AZURE_SECRET_KEY")
            raise HTTPException(
                status_code=500,
                detail=f"Azure configuration incomplete. Missing: {', '.join(missing)}"
            )

        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token",
                data={
                    "client_id": client_id,
                    "client_secret": secret_key,
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                    "scope": "User.Read openid profile email"
                },
                timeout=10.0
            )

            if token_response.status_code != 200:
                error_text = token_response.text
                print(f"[SSO Handler] Token exchange error: {error_text}")
                raise HTTPException(
                    status_code=401,
                    detail=f"Failed to exchange code for token"
                )

            token_data = token_response.json()
            access_token = token_data.get("access_token")

            if not access_token:
                raise HTTPException(status_code=401, detail="No access token in response")

        # Validate token and get user info from Azure
        azure_user = await validate_azure_token(access_token)
        email = normalize_email(azure_user.email or azure_user.preferred_username)

        print(f"[SSO Handler] Azure user validated: {email}")

        # Check if user exists in database
        existing_user = await db.users.find_one({"email": email})

        # Case 1: New user - needs profile completion
        if not existing_user:
            print(f"[SSO Handler] New user detected: {email}")

            # Extract SSO data from Azure user (now includes extended fields)
            first_name = azure_user.given_name or ""
            last_name = azure_user.family_name or ""
            phone = azure_user.phone or ""
            location = azure_user.location or ""
            department = azure_user.department or ""
            job_title = azure_user.job_title or ""

            print(f"[SSO Handler] Extended profile: phone={phone}, location={location}, dept={department}, title={job_title}")

            return {
                "status": "new_user",
                "user": {
                    "firstName": first_name,
                    "lastName": last_name,
                    "given_name": first_name,  # Alias for compatibility
                    "family_name": last_name,   # Alias for compatibility
                    "name": azure_user.name or f"{first_name} {last_name}".strip(),
                    "email": email,
                    "azure_oid": azure_user.oid,
                    # Extended SSO fields from Graph API
                    "phone": phone,
                    "phoneNumber": phone,  # Alias
                    "location": location,
                    "officeLocation": location,  # Alias
                    "department": department,
                    "position": job_title,
                    "jobTitle": job_title,  # Alias
                    "profilePicture": azure_user.profile_picture or "",  # Base64 image
                },
                "access_token": None,
                "message": "Please complete your profile to continue"
            }

        # Case 2: User exists but not approved
        if not existing_user.get("is_approved", False):
            print(f"[SSO Handler] User pending approval: {email}")
            return {
                "status": "pending_approval",
                "user": {
                    "name": existing_user.get("name"),
                    "email": email,
                },
                "access_token": None,
                "message": "Your account is pending admin approval"
            }

        # Case 3: User approved - proceed to dashboard
        print(f"[SSO Handler] User approved, proceeding: {email}")

        # Update user info from Azure (in case name changed)
        await db.users.update_one(
            {"_id": existing_user["_id"]},
            {
                "$set": {
                    "email": email,
                    "name": azure_user.name or existing_user.get("name"),
                    "azure_oid": azure_user.oid,
                    "auth_provider": "azure_ad",
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )

        # Refresh user data
        user_doc = await db.users.find_one({"_id": existing_user["_id"]})

        # Normalize role
        valid_roles = ["admin", "scrum_master", "intern"]
        user_role = user_doc.get("role", "intern")
        if user_role not in valid_roles:
            user_role = "intern"
            await db.users.update_one(
                {"_id": user_doc["_id"]},
                {"$set": {"role": "intern"}}
            )

        # Create JWT token
        our_token = create_access_token(
            data={"sub": user_doc["username"], "role": user_role}
        )

        # Prepare user response
        user_response = UserResponse(
            id=str(user_doc["_id"]),
            username=user_doc["username"],
            email=user_doc["email"],
            name=user_doc.get("name", ""),
            employee_id=user_doc.get("employee_id"),
            role=user_role,
            is_active=user_doc.get("is_active", True),
            is_approved=user_doc.get("is_approved", False),
            created_at=user_doc.get("created_at", datetime.now(timezone.utc)),
            # Intern fields
            organization=user_doc.get("organization"),
            phone=user_doc.get("phone"),
            college=user_doc.get("college"),
            degree=user_doc.get("degree"),
            branch=user_doc.get("branch"),
            year=user_doc.get("year"),
            cgpa=user_doc.get("cgpa"),
            domain=user_doc.get("domain"),
            internType=user_doc.get("internType"),
            isPaid=user_doc.get("isPaid"),
            status=user_doc.get("status"),
            batch=user_doc.get("batch"),
            currentProject=user_doc.get("currentProject"),
            mentor=user_doc.get("mentor"),
            startDate=user_doc.get("startDate"),
            endDate=user_doc.get("endDate"),
            joinedDate=user_doc.get("joinedDate"),
            taskCount=user_doc.get("taskCount", 0),
            completedTasks=user_doc.get("completedTasks", 0),
            dsuStreak=user_doc.get("dsuStreak", 0),
            skills=user_doc.get("skills", [])
        )

        return {
            "status": "approved",
            "user": user_response.model_dump(),
            "access_token": our_token,
            "token_type": "bearer",
            "message": "Login successful"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[SSO Handler] Unexpected error: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"SSO authentication failed: {str(e)}"
        )


async def complete_sso_profile(profile_data: dict, db):
    """
    Complete profile for new SSO user
    Creates user record with status = pending approval
    """
    try:
        email = normalize_email(profile_data.get("email"))

        # Check if user already exists
        existing_user = await db.users.find_one({"email": email})
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="User with this email already exists"
            )

        # Create username from email
        username = email.split("@")[0].lower()

        # Ensure unique username
        existing_username = await db.users.find_one({"username": username})
        if existing_username:
            username = f"{username}_{datetime.now().strftime('%Y%m%d%H%M%S')}"

        # Create new user - AUTO-APPROVE ALL USERS AS INTERN
        new_user = {
            "username": username,
            "email": email,
            "name": profile_data.get("name"),
            "auth_provider": "azure_ad",
            "azure_oid": profile_data.get("azure_oid"),
            "is_active": True,
            "is_approved": True,  # Auto-approve all users
            "role": "admin" if is_admin else "intern",
            "hashed_password": None,  # No password for SSO users

            # SSO Extended fields
            "phone": profile_data.get("phone"),
            "location": profile_data.get("location"),
            "department": profile_data.get("department"),
            "position": profile_data.get("position"),
            "profilePicture": profile_data.get("profilePicture"),  # Base64 image

            # Internship details
            "startDate": profile_data.get("startDate"),
            "endDate": profile_data.get("endDate"),
            "joinedDate": profile_data.get("startDate"),  # Use startDate as joinedDate
            "college": profile_data.get("college"),
            "degree": profile_data.get("degree"),
            "branch": profile_data.get("branch"),
            "year": profile_data.get("year"),
            "internType": profile_data.get("internType", "unpaid"),
            "isPaid": profile_data.get("isPaid", False),
            "status": "active",
            "organization": profile_data.get("organization", "Cirrus Labs"),
            "domain": profile_data.get("domain"),

            # Store multiple internship periods
            "internshipPeriods": profile_data.get("internshipPeriods", []),

            # Defaults
            "taskCount": 0,
            "completedTasks": 0,
            "dsuStreak": 0,
            "skills": profile_data.get("skills", []),

            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }

        result = await db.users.insert_one(new_user)
        user_id = str(result.inserted_id)

        print(f"[SSO Handler] Profile completed for: {email}, auto-approved: True")

        # Generate access token for immediate login
        user_role = "intern"
        access_token = create_access_token(
            data={"sub": username, "role": user_role}
        )

        # Prepare user response
        user_response = UserResponse(
            id=user_id,
            username=username,
            email=email,
            name=profile_data.get("name"),
            employee_id=None,
            role=user_role,
            is_active=True,
            is_approved=True,
            created_at=datetime.now(timezone.utc),
            profilePicture=profile_data.get("profilePicture")
        )

        # Send welcome email
        try:
            await send_welcome_email(
                to_email=email,
                name=profile_data.get("name"),
                role=user_role
            )
            print(f"[SSO Handler] Welcome email sent to: {email}")
        except Exception as email_error:
            # Log error but don't fail the registration
            print(f"[SSO Handler] Failed to send welcome email: {str(email_error)}")

        return {
            "message": "Welcome to Interns360! Your account has been created successfully.",
            "status": "approved",
            "user_id": user_id,
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_response.model_dump()
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[SSO Handler] Profile completion error: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to complete profile: {str(e)}"
        )
