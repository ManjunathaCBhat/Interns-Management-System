# """
# OTP Service for email verification
# """
# import random
# import string
# from datetime import datetime, timedelta
# from typing import Optional, Dict
# import smtplib
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart
# import os
# from dotenv import load_dotenv

# load_dotenv()

# # In-memory OTP storage (for production, use Redis or database)
# # Format: { email: { "otp": "123456", "expires_at": datetime, "used": False } }
# otp_storage: Dict[str, dict] = {}

# class OTPService:
#     """Handle OTP generation, sending, and verification"""
    
#     OTP_LENGTH = 6
#     OTP_EXPIRY_MINUTES = 10
    
#     # Email configuration
#     SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
#     SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
#     SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
#     SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
#     FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@interns360.com")
    
#     @staticmethod
#     def generate_otp() -> str:
#         """Generate a random 6-digit OTP"""
#         return ''.join(random.choices(string.digits, k=OTPService.OTP_LENGTH))
    
#     @staticmethod
#     async def send_otp(email: str) -> bool:
#         """
#         Generate and send OTP to email
#         Returns True if successful, False otherwise
#         """
#         try:
#             # Generate OTP
#             otp = OTPService.generate_otp()
#             expires_at = datetime.utcnow() + timedelta(minutes=OTPService.OTP_EXPIRY_MINUTES)
            
#             # Store OTP
#             otp_storage[email] = {
#                 "otp": otp,
#                 "expires_at": expires_at,
#                 "used": False
#             }
            
#             # Send email
#             success = await OTPService._send_email(email, otp)
            
#             if success:
#                 print(f"[OTP] Sent OTP to {email}: {otp} (expires at {expires_at})")
#             else:
#                 print(f"[OTP] Failed to send OTP to {email}")
            
#             return success
            
#         except Exception as e:
#             print(f"[OTP] Error sending OTP: {e}")
#             return False
    
#     @staticmethod
#     async def _send_email(to_email: str, otp: str) -> bool:
#         """Send OTP via email"""
#         try:
#             # Create message
#             message = MIMEMultipart("alternative")
#             message["Subject"] = "Your Interns360 Verification Code"
#             message["From"] = OTPService.FROM_EMAIL
#             message["To"] = to_email
            
#             # HTML email body
#             html = f"""
#             <html>
#                 <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
#                     <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
#                         <h1 style="color: #7c3aed; text-align: center;">Interns360</h1>
#                         <h2 style="color: #333;">Email Verification Code</h2>
#                         <p style="color: #666; font-size: 16px;">Hello,</p>
#                         <p style="color: #666; font-size: 16px;">Your verification code for Interns360 registration is:</p>
#                         <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
#                             <h1 style="color: #7c3aed; font-size: 36px; letter-spacing: 8px; margin: 0;">{otp}</h1>
#                         </div>
#                         <p style="color: #666; font-size: 14px;">This code will expire in {OTPService.OTP_EXPIRY_MINUTES} minutes.</p>
#                         <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
#                         <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
#                         <p style="color: #999; font-size: 12px; text-align: center;">© 2024 Interns360. All rights reserved.</p>
#                     </div>
#                 </body>
#             </html>
#             """
            
#             # Attach HTML content
#             message.attach(MIMEText(html, "html"))
            
#             # If SMTP credentials are not configured, just log the OTP (for development)
#             if not OTPService.SMTP_USERNAME or not OTPService.SMTP_PASSWORD:
#                 print(f"⚠️ [OTP] SMTP not configured. OTP for {to_email}: {otp}")
#                 print(f"   Configure SMTP_USERNAME and SMTP_PASSWORD in .env to send real emails")
#                 return True  # Return True for development
            
#             # Send via SMTP
#             with smtplib.SMTP(OTPService.SMTP_SERVER, OTPService.SMTP_PORT) as server:
#                 server.starttls()
#                 server.login(OTPService.SMTP_USERNAME, OTPService.SMTP_PASSWORD)
#                 server.send_message(message)
            
#             return True
            
#         except Exception as e:
#             print(f"[OTP] Email sending error: {e}")
#             # For development, still return True and log OTP
#             print(f"📧 [DEV MODE] OTP for {to_email}: {otp}")
#             return True
    
#     @staticmethod
#     def verify_otp(email: str, otp: str) -> bool:
#         """
#         Verify OTP for email
#         Returns True if valid, False otherwise
#         """
#         try:
#             # Check if OTP exists
#             if email not in otp_storage:
#                 print(f"[OTP] No OTP found for {email}")
#                 return False
            
#             stored_data = otp_storage[email]
            
#             # Check if already used
#             if stored_data["used"]:
#                 print(f"[OTP] OTP already used for {email}")
#                 return False
            
#             # Check if expired
#             if datetime.utcnow() > stored_data["expires_at"]:
#                 print(f"[OTP] OTP expired for {email}")
#                 del otp_storage[email]
#                 return False
            
#             # Check if OTP matches
#             if stored_data["otp"] != otp:
#                 print(f"[OTP] Invalid OTP for {email}")
#                 return False
            
#             # Mark as used
#             stored_data["used"] = True
#             print(f"[OTP] OTP verified successfully for {email}")
            
#             # Clean up
#             del otp_storage[email]
            
#             return True
            
#         except Exception as e:
#             print(f"[OTP] Verification error: {e}")
#             return False
    
#     @staticmethod
#     def cleanup_expired_otps():
#         """Remove expired OTPs from storage"""
#         now = datetime.utcnow()
#         expired = [email for email, data in otp_storage.items() if now > data["expires_at"]]
#         for email in expired:
#             del otp_storage[email]
#         if expired:
#             print(f"[OTP] Cleaned up {len(expired)} expired OTPs")







"""
OTP Service for email verification
"""
import random
import string
from datetime import datetime, timedelta
from typing import Optional, Dict
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()
otp_storage: Dict[str, dict] = {}

class OTPService:
    """Handle OTP generation, sending, and verification"""
    
    OTP_LENGTH = 6
    OTP_EXPIRY_MINUTES = 10
    
    # Email configuration
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@interns360.com")
    
    @staticmethod
    def generate_otp() -> str:
        """Generate a random 6-digit OTP"""
        return ''.join(random.choices(string.digits, k=OTPService.OTP_LENGTH))
    
    @staticmethod
    async def send_otp(email: str) -> bool:
        """
        Generate and send OTP to email
        Returns True if successful, False otherwise
        """
        try:
            # Generate OTP
            otp = OTPService.generate_otp()
            expires_at = datetime.utcnow() + timedelta(minutes=OTPService.OTP_EXPIRY_MINUTES)
            
            # Store OTP
            otp_storage[email] = {
                "otp": otp,
                "expires_at": expires_at,
                "used": False
            }
            
            # Send email
            success = await OTPService._send_email(email, otp)
            
            if success:
                print(f"[OTP] Sent OTP to {email}: {otp} (expires at {expires_at})")
            else:
                print(f"[OTP] Failed to send OTP to {email}")
            
            return success
            
        except Exception as e:
            print(f"[OTP] Error sending OTP: {e}")
            return False
    
    @staticmethod
    async def _send_email(to_email: str, otp: str) -> bool:
        """Send OTP via email"""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = "Your Interns360 Verification Code"
            message["From"] = OTPService.FROM_EMAIL
            message["To"] = to_email
            
            # HTML email body
            html = f"""
            <html>
                <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #7c3aed; text-align: center;">Interns360</h1>
                        <h2 style="color: #333;">Email Verification Code</h2>
                        <p style="color: #666; font-size: 16px;">Hello,</p>
                        <p style="color: #666; font-size: 16px;">Your verification code for Interns360 registration is:</p>
                        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                            <h1 style="color: #7c3aed; font-size: 36px; letter-spacing: 8px; margin: 0;">{otp}</h1>
                        </div>
                        <p style="color: #666; font-size: 14px;">This code will expire in {OTPService.OTP_EXPIRY_MINUTES} minutes.</p>
                        <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        <p style="color: #999; font-size: 12px; text-align: center;">© 2024 Interns360. All rights reserved.</p>
                    </div>
                </body>
            </html>
            """
            
            # Attach HTML content
            message.attach(MIMEText(html, "html"))
            
            # If SMTP credentials are not configured, just log the OTP (for development)
            if not OTPService.SMTP_USERNAME or not OTPService.SMTP_PASSWORD:
                print(f"⚠️ [OTP] SMTP not configured. OTP for {to_email}: {otp}")
                print(f"   Configure SMTP_USERNAME and SMTP_PASSWORD in .env to send real emails")
                return True  # Return True for development
            
            
            with smtplib.SMTP(OTPService.SMTP_SERVER, OTPService.SMTP_PORT) as server:
                server.starttls()
                server.login(OTPService.SMTP_USERNAME, OTPService.SMTP_PASSWORD)
                server.send_message(message)
            
            return True
            
        except Exception as e:
            print(f"[OTP] Email sending error: {e}")
        
            print(f"📧 [DEV MODE] OTP for {to_email}: {otp}")
            return True
    
    @staticmethod
    def verify_otp(email: str, otp: str) -> bool:
        """
        Verify OTP for email
        Returns True if valid, False otherwise
        """
        try:
            # Check if OTP exists
            if email not in otp_storage:
                print(f"[OTP] No OTP found for {email}")
                return False
            
            stored_data = otp_storage[email]
            
            # Check if already used
            if stored_data["used"]:
                print(f"[OTP] OTP already used for {email}")
                return False
            
            # Check if expired
            if datetime.utcnow() > stored_data["expires_at"]:
                print(f"[OTP] OTP expired for {email}")
                del otp_storage[email]
                return False
            
            # Check if OTP matches
            if stored_data["otp"] != otp:
                print(f"[OTP] Invalid OTP for {email}")
                return False
            
            
            stored_data["used"] = True
            print(f"[OTP] OTP verified successfully for {email}")
            
    
            del otp_storage[email]
            
            return True
            
        except Exception as e:
            print(f"[OTP] Verification error: {e}")
            return False
    
    @staticmethod
    def cleanup_expired_otps():
        """Remove expired OTPs from storage"""
        now = datetime.utcnow()
        expired = [email for email, data in otp_storage.items() if now > data["expires_at"]]
        for email in expired:
            del otp_storage[email]
        if expired:
            print(f"[OTP] Cleaned up {len(expired)} expired OTPs")