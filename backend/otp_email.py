"""
OTP Email Service - Send OTP via Microsoft Graph API
"""
import os
from datetime import datetime, timedelta
import httpx
from fastapi import HTTPException


async def get_graph_access_token() -> str:
    """Get Microsoft Graph API access token"""
    tenant_id = os.getenv("tenant_id")
    client_id = os.getenv("client_id")
    client_secret = os.getenv("AZURE_SECRET_KEY")

    if not tenant_id or not client_id or not client_secret:
        raise HTTPException(
            status_code=503, 
            detail="Microsoft Graph is not configured. Please contact administrator."
        )

    token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "scope": "https://graph.microsoft.com/.default",
        "grant_type": "client_credentials"
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(token_url, data=data, timeout=10.0)

    if resp.status_code != 200:
        raise HTTPException(
            status_code=503,
            detail=f"Failed to get Graph access token: {resp.text}"
        )

    token = resp.json().get("access_token")
    if not token:
        raise HTTPException(
            status_code=503, 
            detail="Missing Graph access token"
        )

    return token


async def send_otp_email(to_email: str, otp: str) -> None:
    """
    Send OTP via Microsoft Graph API
    
    Args:
        to_email: Recipient email address
        otp: 6-digit OTP code
    
    Raises:
        HTTPException: If email sending fails
    """
    sender_email = os.getenv("SENDER_MAIL")
    
    if not sender_email:
        raise HTTPException(
            status_code=503, 
            detail="Sender email is not configured. Please contact administrator."
        )

    
    token = await get_graph_access_token()

    
    subject = "Your Interns360 Verification Code"
    
    body_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }}
            .content {{
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }}
            .otp-box {{
                background: white;
                border: 2px dashed #667eea;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
                border-radius: 8px;
            }}
            .otp-code {{
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #667eea;
            }}
            .footer {{
                text-align: center;
                margin-top: 20px;
                color: #666;
                font-size: 12px;
            }}
            .warning {{
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 12px;
                margin: 15px 0;
                border-radius: 4px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Interns360</h1>
                <p>Email Verification</p>
            </div>
            <div class="content">
                <h2>Hello!</h2>
                <p>Thank you for registering with Interns360. To complete your registration, please use the verification code below:</p>
                
                <div class="otp-box">
                    <p style="margin: 0; color: #666; font-size: 14px;">Your Verification Code</p>
                    <p class="otp-code">{otp}</p>
                </div>
                
                <div class="warning">
                    <strong>⏰ Important:</strong> This code will expire in <strong>5 minutes</strong>.
                </div>
                
                <p>If you didn't request this code, please ignore this email or contact our support team if you have concerns.</p>
                
                <p>Best regards,<br>
                The Interns360 Team</p>
            </div>
            <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>&copy; {datetime.now().year} Interns360. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    # Prepare email payload
    payload = {
        "message": {
            "subject": subject,
            "body": {
                "contentType": "HTML",
                "content": body_html
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

    
    send_url = f"https://graph.microsoft.com/v1.0/users/{sender_email}/sendMail"
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            send_url,
            json=payload,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            timeout=10.0
        )

    if resp.status_code not in [202, 200]:
        print(f"❌ Failed to send OTP email: {resp.status_code} - {resp.text}")
        raise HTTPException(
            status_code=503,
            detail=f"Failed to send OTP email. Please try again later."
        )

    print(f"✅ OTP email sent successfully to {to_email}")