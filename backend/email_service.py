"""
Email Service using Microsoft Graph API
Sends emails via Microsoft Graph for Welcome, Password Reset, etc.
"""

import httpx
import os
from fastapi import HTTPException
from dotenv import load_dotenv
from email_templates import get_welcome_email_template, get_password_reset_email_template

load_dotenv()

# Email configuration from environment
RESET_SENDER_EMAIL = os.getenv("SENDER_MAIL")  # The email account used to send emails
AZURE_CLIENT_ID = os.getenv("client_id")
AZURE_CLIENT_SECRET = os.getenv("AZURE_SECRET_KEY")
AZURE_TENANT_ID = os.getenv("tenant_id")


async def get_graph_access_token() -> str:
    """
    Get Microsoft Graph API access token using client credentials flow
    """
    if not all([AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET]):
        raise HTTPException(
            status_code=503,
            detail="Azure AD configuration is incomplete. Check tenant_id, client_id, and AZURE_SECRET_KEY in .env"
        )

    token_url = f"https://login.microsoftonline.com/{AZURE_TENANT_ID}/oauth2/v2.0/token"

    data = {
        "client_id": AZURE_CLIENT_ID,
        "client_secret": AZURE_CLIENT_SECRET,
        "scope": "https://graph.microsoft.com/.default",
        "grant_type": "client_credentials"
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data, timeout=10.0)

        if response.status_code != 200:
            raise HTTPException(
                status_code=503,
                detail=f"Failed to get Graph API token: {response.text}"
            )

        token_data = response.json()
        return token_data["access_token"]


async def send_welcome_email(to_email: str, name: str, role: str = "intern") -> None:
    """
    Send welcome email to newly registered user using Microsoft Graph API

    Args:
        to_email: Recipient email address
        name: User's full name
        role: User role (intern, scrum_master, admin)
    """
    if not RESET_SENDER_EMAIL:
        raise HTTPException(
            status_code=503,
            detail="SENDER_MAIL is not configured in .env"
        )

    # Get access token
    token = await get_graph_access_token()

    # Get frontend URL for login link
    frontend_url = os.getenv("FRONTEND_URL")
    if not frontend_url:
        raise HTTPException(
            status_code=503,
            detail="FRONTEND_URL is not configured in environment variables"
        )
    login_url = frontend_url.rstrip("/") + "/login"

    # Generate email template
    email_template = get_welcome_email_template(
        user_name=name,
        user_email=to_email,
        login_url=login_url
    )

    # Prepare Microsoft Graph sendMail payload
    payload = {
        "message": {
            "subject": email_template["subject"],
            "body": {
                "contentType": "HTML",
                "content": email_template["html_content"]
            },
            "toRecipients": [
                {
                    "emailAddress": {
                        "address": to_email
                    }
                }
            ]
        },
        "saveToSentItems": "false"  # Don't save to sent items to avoid clutter
    }

    # Send email via Microsoft Graph API
    send_url = f"https://graph.microsoft.com/v1.0/users/{RESET_SENDER_EMAIL}/sendMail"

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            send_url,
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
            timeout=10.0
        )

    if resp.status_code not in [202, 200]:
        print(f"[Email Service] Failed to send welcome email to {to_email}: {resp.status_code} - {resp.text}")
        raise HTTPException(
            status_code=503,
            detail=f"Failed to send welcome email: {resp.text}"
        )

    print(f"[Email Service] ✅ Welcome email sent successfully to {to_email}")


async def send_password_reset_email(to_email: str, name: str, reset_link: str, expiration_hours: int = 1) -> None:
    """
    Send password reset email using Microsoft Graph API

    Args:
        to_email: Recipient email address
        name: User's full name
        reset_link: Password reset link
        expiration_hours: Link expiration time in hours
    """
    if not RESET_SENDER_EMAIL:
        raise HTTPException(
            status_code=503,
            detail="SENDER_MAIL is not configured in .env"
        )

    # Get access token
    token = await get_graph_access_token()

    # Generate email template
    email_template = get_password_reset_email_template(
        user_name=name,
        reset_link=reset_link,
        expiration_hours=expiration_hours
    )

    # Prepare Microsoft Graph sendMail payload
    payload = {
        "message": {
            "subject": email_template["subject"],
            "body": {
                "contentType": "HTML",
                "content": email_template["html_content"]
            },
            "toRecipients": [
                {
                    "emailAddress": {
                        "address": to_email
                    }
                }
            ]
        },
        "saveToSentItems": "false"
    }

    # Send email via Microsoft Graph API
    send_url = f"https://graph.microsoft.com/v1.0/users/{RESET_SENDER_EMAIL}/sendMail"

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            send_url,
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
            timeout=10.0
        )

    if resp.status_code not in [202, 200]:
        print(f"[Email Service] Failed to send password reset email to {to_email}: {resp.status_code} - {resp.text}")
        raise HTTPException(
            status_code=503,
            detail=f"Failed to send password reset email: {resp.text}"
        )

    print(f"[Email Service] ✅ Password reset email sent successfully to {to_email}")
