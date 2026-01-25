"""
Seed database with Cirrus Labs Admin data
Run: python seed_database.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import os

# Import your hashing function from your auth/security file
from auth import get_password_hash 

load_dotenv()

async def seed_database():
    """Seed database with Cirrus Labs admin data"""
    MONGODB_URL = os.getenv("MONGODB_URL")
    # Make sure this matches your actual database name in Atlas
    MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "intern_lifecycle")
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[MONGODB_DB_NAME]
    
    print("🌱 Seeding database...")
    
    # Clear existing data to ensure a clean start
    print("🗑️  Clearing old data...")
    await db.users.delete_many({})
    await db.interns.delete_many({})
    await db.projects.delete_many({})
    
    # ==================== CREATE ADMIN USERS ====================
    print("👤 Creating Cirrus Labs Admin users...")
    
    # Standardized password for all admins
    default_password = get_password_hash("admin123")
    
    users = [
        {
            "username": "mukund.hs",
            "email": "mukund.hs@cirruslabs.io",
            "name": "Mukund Prasad H S",
            "employee_id": "CL461",
            "role": "admin",
            "hashed_password": default_password,
            "is_active": True,
            "is_approved": True,
            "auth_provider": "password",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "username": "manjunatha.bhat",
            "email": "manjunatha.bhat@cirruslabs.io",
            "name": "Manjunatha Bhat",
            "employee_id": "CL576",
            "role": "admin",
            "hashed_password": default_password,
            "is_active": True,
            "is_approved": True,
            "auth_provider": "password",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "username": "karan.ry",
            "email": "karan.ry@cirruslabs.io",
            "name": "Karan RY",
            "employee_id": "CL600",
            "role": "admin",
            "hashed_password": default_password,
            "is_active": True,
            "is_approved": True,
            "auth_provider": "password",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
    ]
    
    await db.users.insert_many(users)
    print(f"✅ Created {len(users)} admin users")

    # ==================== CREATE DUMMY PROJECT ====================
    # Adding one project so the dashboard isn't empty
    print("📁 Creating initial project...")
    project = {
        "name": "Internal Platform",
        "description": "Cirrus Labs Intern Management System",
        "status": "active",
        "startDate": datetime.now(timezone.utc),
        "mentor": "Mukund HS",
        "created_at": datetime.now(timezone.utc)
    }
    await db.projects.insert_one(project)

    print("\n" + "="*50)
    print("🎉 Database seeded successfully!")
    print("="*50)
    print("\n📝 Login Details:")
    print("   Emails: [any of the above]@cirruslabs.io")
    print("   Password: admin123")
    print("="*50)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())