"""
Seed script to create admin users in MongoDB
Run this script once to set up the initial admin accounts.

Usage:
    python seed_admins.py
"""
import asyncio
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Admin users to create
ADMIN_USERS = [
    {
        "email": "mukund.hs@cirruslabs.io",
        "username": "mukund.hs",
        "name": "Mukund Prasad H S",
        "employee_id": "CL461"
    },
    {
        "email": "manjunatha.bhat@cirruslabs.io",
        "username": "manjunatha.bhat",
        "name": "Manjunatha Bhat",
        "employee_id": "CL576"
    },
    {
        "email": "karan.ry@cirruslabs.io",
        "username": "karan.ry",
        "name": "Karan RY",
        "employee_id": "CL600"
    }
]

# Default password for admin accounts (should be changed after first login)
DEFAULT_PASSWORD = "Admin@123"


def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


async def seed_admins():
    """Create admin users in the database"""
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "intern_lifecycle")

    print(f"Connecting to MongoDB: {MONGODB_URL}")
    print(f"Database: {MONGODB_DB_NAME}")

    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[MONGODB_DB_NAME]

    # Hash the default password once
    hashed_password = hash_password(DEFAULT_PASSWORD)

    created_count = 0
    updated_count = 0
    skipped_count = 0

    for admin in ADMIN_USERS:
        email = admin["email"].lower()

        # Check if user already exists
        existing = await db.users.find_one({"email": email})

        if existing:
            # Update existing user to ensure admin role and approval
            if existing.get("role") != "admin" or not existing.get("is_approved"):
                await db.users.update_one(
                    {"email": email},
                    {
                        "$set": {
                            "role": "admin",
                            "is_approved": True,
                            "is_active": True,
                            "updated_at": datetime.now(timezone.utc)
                        }
                    }
                )
                print(f"Updated existing user to admin: {email}")
                updated_count += 1
            else:
                print(f"Skipped (already admin): {email}")
                skipped_count += 1
        else:
            # Create new admin user
            user_doc = {
                "username": admin["username"].lower(),
                "email": email,
                "name": admin["name"],
                "employee_id": admin.get("employee_id"),
                "hashed_password": hashed_password,
                "role": "admin",
                "is_active": True,
                "is_approved": True,
                "auth_provider": "password",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }

            await db.users.insert_one(user_doc)
            print(f"Created admin user: {email}")
            created_count += 1

    # Close connection
    client.close()

    print("\n" + "=" * 50)
    print("Seed Summary:")
    print(f"  Created: {created_count}")
    print(f"  Updated: {updated_count}")
    print(f"  Skipped: {skipped_count}")
    print("=" * 50)

    if created_count > 0:
        print(f"\nDefault password for new accounts: {DEFAULT_PASSWORD}")
        print("Please change the password after first login!")


if __name__ == "__main__":
    asyncio.run(seed_admins())
