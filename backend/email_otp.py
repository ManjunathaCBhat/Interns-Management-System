import random
import smtplib
import os
from email.message import EmailMessage

# Store OTP temporarily
otp_store = {}

def generate_and_send_otp(email: str):
    otp = str(random.randint(100000, 999999))

    # Save OTP
    otp_store[email] = otp

    sender_email = os.getenv("SMTP_EMAIL")
    sender_password = os.getenv("SMTP_PASSWORD")

    if not sender_email or not sender_password:
        raise Exception("SMTP credentials not found in .env")

    msg = EmailMessage()
    msg["Subject"] = "Interns360 Email Verification OTP"
    msg["From"] = sender_email
    msg["To"] = email
    msg.set_content(f"Your OTP is: {otp}")

    # Gmail SMTP
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender_email, sender_password)
        server.send_message(msg)

    return True


def verify_otp(email: str, otp: str):
    if email not in otp_store:
        return False

    if otp_store[email] == otp:
        del otp_store[email]
        return True

    return False
