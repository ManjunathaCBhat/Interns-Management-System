"""
Email Templates for Interns360
Includes Welcome Email and Password Reset Email
"""


def get_welcome_email_template(user_name: str, user_email: str, login_url: str) -> dict:
    """
    Generate Welcome Email HTML template
    Returns dict with subject and html_content
    """
    subject = "Welcome to Interns360! 🎉"

    html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Interns360</title>
    <style>
        body {{
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
        }}
        .email-container {{
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #0F0E47 0%, #272757 100%);
            padding: 40px 30px;
            text-align: center;
        }}
        .logo {{
            font-size: 32px;
            font-weight: 800;
            color: #ffffff;
            margin: 0;
        }}
        .logo-accent {{
            color: #8686AC;
        }}
        .tagline {{
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            margin-top: 8px;
        }}
        .content {{
            padding: 40px 30px;
            color: #333333;
        }}
        .greeting {{
            font-size: 24px;
            font-weight: 700;
            color: #0F0E47;
            margin: 0 0 20px 0;
        }}
        .message {{
            font-size: 16px;
            line-height: 1.6;
            color: #505081;
            margin-bottom: 30px;
        }}
        .cta-button {{
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #0F0E47, #272757);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(15, 14, 71, 0.3);
            transition: all 0.3s ease;
        }}
        .cta-button:hover {{
            background: linear-gradient(135deg, #272757, #505081);
            box-shadow: 0 6px 20px rgba(15, 14, 71, 0.4);
        }}
        .features {{
            background-color: #f8f9fa;
            border-radius: 12px;
            padding: 24px;
            margin: 30px 0;
        }}
        .feature-item {{
            display: flex;
            align-items: center;
            margin-bottom: 16px;
        }}
        .feature-icon {{
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #8686AC, #505081);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-center;
            margin-right: 16px;
            font-size: 20px;
        }}
        .feature-text {{
            font-size: 14px;
            color: #505081;
            font-weight: 500;
        }}
        .footer {{
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
        }}
        .footer-text {{
            font-size: 13px;
            color: #8686AC;
            line-height: 1.5;
        }}
        .footer-link {{
            color: #505081;
            text-decoration: none;
            font-weight: 600;
        }}
        .divider {{
            height: 1px;
            background: linear-gradient(to right, transparent, #e0e0e0, transparent);
            margin: 30px 0;
        }}
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1 class="logo">Interns<span class="logo-accent">360</span></h1>
            <p class="tagline">Your Internship Management Platform</p>
        </div>

        <!-- Content -->
        <div class="content">
            <h2 class="greeting">Welcome, {user_name}! 👋</h2>

            <p class="message">
                We're excited to have you join <strong>Interns360</strong>! Your account has been successfully created,
                and you're all set to begin your internship journey with us.
            </p>

            <p class="message">
                Interns360 is your one-stop platform for managing tasks, daily standups, performance reviews,
                and much more throughout your internship.
            </p>

            <div style="text-align: center;">
                <a href="{login_url}" class="cta-button">Get Started →</a>
            </div>

            <div class="divider"></div>

            <!-- Features -->
            <div class="features">
                <div class="feature-item">
                    <div class="feature-icon">✓</div>
                    <div class="feature-text">Submit daily standup updates</div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">📊</div>
                    <div class="feature-text">Track your tasks and projects</div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">🎯</div>
                    <div class="feature-text">Monitor your performance and growth</div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">🌴</div>
                    <div class="feature-text">Request time off easily</div>
                </div>
            </div>

            <div class="divider"></div>

            <p class="message">
                <strong>Your Login Email:</strong> <span style="color: #0F0E47;">{user_email}</span>
            </p>

            <p class="message">
                If you have any questions or need assistance, feel free to reach out to the support team.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">
                <strong>Need Help?</strong><br>
                Contact us at <a href="mailto:support@interns360.com" class="footer-link">support@interns360.com</a>
            </p>
            <p class="footer-text">
                © 2026 Interns360 by Cirrus Labs. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    """

    return {
        "subject": subject,
        "html_content": html_content
    }


def get_password_reset_email_template(user_name: str, reset_link: str, expiration_hours: int = 1) -> dict:
    """
    Generate Password Reset Email HTML template
    Returns dict with subject and html_content
    """
    subject = "Reset Your Password - Interns360"

    html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {{
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
        }}
        .email-container {{
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #0F0E47 0%, #272757 100%);
            padding: 40px 30px;
            text-align: center;
        }}
        .logo {{
            font-size: 32px;
            font-weight: 800;
            color: #ffffff;
            margin: 0;
        }}
        .logo-accent {{
            color: #8686AC;
        }}
        .content {{
            padding: 40px 30px;
            color: #333333;
        }}
        .greeting {{
            font-size: 24px;
            font-weight: 700;
            color: #0F0E47;
            margin: 0 0 20px 0;
        }}
        .message {{
            font-size: 16px;
            line-height: 1.6;
            color: #505081;
            margin-bottom: 25px;
        }}
        .cta-button {{
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #0F0E47, #272757);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(15, 14, 71, 0.3);
        }}
        .warning-box {{
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 16px;
            border-radius: 8px;
            margin: 25px 0;
        }}
        .warning-text {{
            font-size: 14px;
            color: #856404;
            margin: 0;
        }}
        .info-box {{
            background: linear-gradient(135deg, #8686AC15, #50508115);
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
        }}
        .info-text {{
            font-size: 14px;
            color: #505081;
            font-weight: 500;
            margin: 0;
        }}
        .footer {{
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
        }}
        .footer-text {{
            font-size: 13px;
            color: #8686AC;
            line-height: 1.5;
        }}
        .footer-link {{
            color: #505081;
            text-decoration: none;
            font-weight: 600;
        }}
        .divider {{
            height: 1px;
            background: linear-gradient(to right, transparent, #e0e0e0, transparent);
            margin: 30px 0;
        }}
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1 class="logo">Interns<span class="logo-accent">360</span></h1>
        </div>

        <!-- Content -->
        <div class="content">
            <h2 class="greeting">Hi {user_name},</h2>

            <p class="message">
                We received a request to reset your password for your <strong>Interns360</strong> account.
            </p>

            <p class="message">
                Click the button below to create a new password:
            </p>

            <div style="text-align: center;">
                <a href="{reset_link}" class="cta-button">Reset Password</a>
            </div>

            <div class="info-box">
                <p class="info-text">
                    ⏰ <strong>Important:</strong> This link will expire in <strong>{expiration_hours} hour(s)</strong>.
                    Please reset your password before it expires.
                </p>
            </div>

            <div class="divider"></div>

            <div class="warning-box">
                <p class="warning-text">
                    <strong>⚠ Didn't request this?</strong><br>
                    If you didn't request a password reset, please ignore this email. Your password will remain unchanged,
                    and your account is secure.
                </p>
            </div>

            <p class="message">
                For security reasons, we recommend using a strong password that includes:
            </p>

            <ul style="color: #505081; line-height: 1.8;">
                <li>At least 8 characters</li>
                <li>Uppercase and lowercase letters</li>
                <li>Numbers</li>
                <li>Special characters (!@#$%^&*)</li>
            </ul>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">
                <strong>Need Help?</strong><br>
                Contact us at <a href="mailto:support@interns360.com" class="footer-link">support@interns360.com</a>
            </p>
            <p class="footer-text">
                © 2026 Interns360 by Cirrus Labs. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    """

    return {
        "subject": subject,
        "html_content": html_content
    }


# Example usage function (can be called from other modules)
def send_welcome_email(user_name: str, user_email: str, login_url: str):
    """
    Send welcome email to new user
    """
    template = get_welcome_email_template(user_name, user_email, login_url)
    # TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    print(f"[Email] Welcome email prepared for {user_email}")
    return template


def send_password_reset_email(user_name: str, user_email: str, reset_link: str):
    """
    Send password reset email
    """
    template = get_password_reset_email_template(user_name, reset_link)
    # TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    print(f"[Email] Password reset email prepared for {user_email}")
    return template
