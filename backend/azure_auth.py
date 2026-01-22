"""
Azure AD SSO Authentication Module
Handles Azure AD token validation via Microsoft Graph API
"""

import httpx
import os
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from functools import lru_cache
from database import get_database
from dotenv import load_dotenv

load_dotenv()

# Azure AD configuration
security = HTTPBearer(auto_error=False)


class AzureADSettings(BaseModel):
    tenant_id: str
    client_id: str
    secret_key: str


class AzureUser(BaseModel):
    """User info from Azure AD token"""
    oid: str  # Azure AD Object ID
    preferred_username: str
    email: Optional[str] = None
    name: Optional[str] = None
    given_name: Optional[str] = None
    family_name: Optional[str] = None
    roles: list = []


@lru_cache(maxsize=1)
def get_azure_settings() -> Optional[AzureADSettings]:
    """Get Azure AD settings from environment"""
    tenant_id = os.getenv("tenant_id")
    client_id = os.getenv("client_id")
    secret_key = os.getenv("AZURE_SECRET_KEY")
    
    if not tenant_id or not client_id or not secret_key:
        return None
    
    return AzureADSettings(
        tenant_id=tenant_id,
        client_id=client_id,
        secret_key=secret_key
    )


async def validate_azure_token(token: str) -> AzureUser:
    """
    Validate Azure AD token by calling Microsoft Graph API.
    This is the most reliable method as it works with any valid Azure token.
    """
    azure_settings = get_azure_settings()
    if not azure_settings:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Azure AD SSO is not configured"
        )
    
    print(f"[Azure SSO] Validating token via Microsoft Graph API...")
    print(f"[Azure SSO] Token length: {len(token)}")
    
    try:
        # Validate by calling Microsoft Graph API
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://graph.microsoft.com/v1.0/me",
                headers={"Authorization": f"Bearer {token}"},
                timeout=10.0
            )
            
            print(f"[Azure SSO] Graph API response status: {response.status_code}")
            
            if response.status_code == 401:
                try:
                    error_detail = response.json()
                except:
                    error_detail = response.text
                print(f"[Azure SSO] Graph API 401 error: {error_detail}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Azure AD token - rejected by Microsoft Graph"
                )
            
            if response.status_code != 200:
                print(f"[Azure SSO] Graph API error: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Microsoft Graph API error: {response.status_code}"
                )
            
            user_data = response.json()
            print(f"[Azure SSO] Successfully authenticated user: {user_data.get('userPrincipalName')}")
            
            return AzureUser(
                oid=user_data.get("id", ""),
                preferred_username=user_data.get("userPrincipalName", ""),
                email=user_data.get("mail") or user_data.get("userPrincipalName"),
                name=user_data.get("displayName"),
                given_name=user_data.get("givenName"),
                family_name=user_data.get("surname"),
                roles=[]
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Azure SSO] Unexpected error: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to validate token: {str(e)}"
        )


async def get_or_create_azure_user(azure_user: AzureUser, db):
    """
    Get existing user or create new one from Azure AD info.
    Returns the user document from MongoDB.
    """
    
    # Try to find existing user by Azure OID
    user = await db.users.find_one({"azure_oid": azure_user.oid})
    
    if user:
        # Update user info from Azure (in case name/email changed)
        await db.users.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "email": azure_user.email or azure_user.preferred_username,
                    "name": azure_user.name or f"{azure_user.given_name or ''} {azure_user.family_name or ''}".strip(),
                }
            }
        )
        return await db.users.find_one({"_id": user["_id"]})
    
    # Try to find by email (for existing users migrating to SSO)
    email = azure_user.email or azure_user.preferred_username
    user = await db.users.find_one({"email": email})
    
    if user:
        # Link existing user to Azure account
        await db.users.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "azure_oid": azure_user.oid,
                    "auth_provider": "azure_ad"
                }
            }
        )
        return await db.users.find_one({"_id": user["_id"]})
    
    # Create new user from Azure AD info
    username = azure_user.preferred_username.split("@")[0]  # Use email prefix as username
    
    # Ensure unique username
    existing = await db.users.find_one({"username": username})
    if existing:
        username = f"{username}_{azure_user.oid[:8]}"
    
    from datetime import datetime, timezone
    
    new_user = {
        "username": username,
        "email": email,
        "name": azure_user.name or f"{azure_user.given_name or ''} {azure_user.family_name or ''}".strip() or username,
        "azure_oid": azure_user.oid,
        "auth_provider": "azure_ad",
        "is_active": True,
        "role": "intern",  # Default role for new SSO users
        "hashed_password": None,  # No password for SSO users
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    result = await db.users.insert_one(new_user)
    return await db.users.find_one({"_id": result.inserted_id})


async def get_current_azure_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db = Depends(get_database)
):
    """
    Dependency to get current user from Azure AD token.
    Use this for routes that require Azure AD authentication.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Azure AD authentication required"
        )
    
    azure_user = await validate_azure_token(credentials.credentials)
    user = await get_or_create_azure_user(azure_user, db)
    return user
