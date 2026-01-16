"""
Seed database with sample data
Run: python seed_database.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta  # Remove 'date' import
from dotenv import load_dotenv
import os

from auth import get_password_hash

load_dotenv()

async def seed_database():
    """Seed database with sample data"""
    MONGODB_URL = os.getenv("MONGODB_URL")
    MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "intern_lifecycle")
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[MONGODB_DB_NAME]
    
    print("🌱 Seeding database...")
    
    # Clear existing data
    print("🗑️  Clearing old data...")
    await db.users.delete_many({})
    await db.interns.delete_many({})
    await db.dsu_entries.delete_many({})
    await db.tasks.delete_many({})
    await db.projects.delete_many({})
    
    # ==================== CREATE USERS ====================
    print("👤 Creating users...")
    users = [
        {
            "username": "admin",
            "email": "admin@company.com",
            "name": "Vikram Singh",
            "role": "admin",
            "hashed_password": get_password_hash("admin123"),
            "is_active": True,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "username": "mentor1",
            "email": "anita.desai@company.com",
            "name": "Anita Desai",
            "role": "mentor",
            "hashed_password": get_password_hash("mentor123"),
            "is_active": True,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "username": "priya.sharma",
            "email": "priya.sharma@example.com",
            "name": "Priya Sharma",
            "role": "intern",
            "hashed_password": get_password_hash("intern123"),
            "is_active": True,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]
    
    await db.users.insert_many(users)
    print(f"✅ Created {len(users)} users")
    
    # ==================== CREATE PROJECTS ====================
    print("📁 Creating projects...")
    projects = [
        {
            "name": "E-commerce Platform",
            "description": "Building a modern e-commerce platform",
            "status": "active",
            "techStack": ["React", "FastAPI", "MongoDB", "TypeScript"],
            "startDate": datetime(2025, 1, 1),  # Changed from date to datetime
            "mentor": "Vikram Singh",
            "internIds": [],
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Microservices API",
            "description": "Scalable microservices architecture",
            "status": "active",
            "techStack": ["Python", "FastAPI", "PostgreSQL", "Docker"],
            "startDate": datetime(2024, 12, 1),  # Changed
            "mentor": "Anita Desai",
            "internIds": [],
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Mobile App",
            "description": "Cross-platform mobile application",
            "status": "active",
            "techStack": ["React Native", "Expo", "Firebase"],
            "startDate": datetime(2026, 1, 15),  # Changed
            "mentor": "Rajesh Kumar",
            "internIds": [],
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]
    
    project_results = await db.projects.insert_many(projects)
    print(f"✅ Created {len(projects)} projects")
    
    # ==================== CREATE INTERNS ====================
    print("👨‍💼 Creating interns...")
    interns = [
        {
            "name": "Priya Sharma",
            "email": "priya.sharma@example.com",
            "phone": "+91 98765 43210",
            "college": "IIT Delhi",
            "degree": "B.Tech",
            "branch": "Computer Science",
            "year": 3,
            "cgpa": 8.7,
            "domain": "Full Stack",
            "internType": "project",
            "isPaid": True,
            "status": "active",
            "currentProject": "E-commerce Platform",
            "mentor": "Vikram Singh",
            "startDate": datetime(2025, 1, 6),
            "endDate": datetime(2025, 7, 6),
            "joinedDate": datetime(2025, 1, 6),
            "taskCount": 15,
            "completedTasks": 10,
            "dsuStreak": 7,
            "skills": ["React", "Node.js", "MongoDB", "TypeScript"],
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Arjun Patel",
            "email": "arjun.patel@example.com",
            "phone": "+91 98765 43211",
            "college": "BITS Pilani",
            "degree": "B.E",
            "branch": "Electronics",
            "year": 4,
            "cgpa": 9.1,
            "domain": "Backend",
            "internType": "rs",
            "isPaid": True,
            "status": "active",
            "currentProject": "Microservices API",
            "mentor": "Anita Desai",
            "startDate": datetime(2024, 12, 1),
            "endDate": datetime(2025, 6, 1),
            "joinedDate": datetime(2024, 12, 1),
            "taskCount": 20,
            "completedTasks": 18,
            "dsuStreak": 15,
            "skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Karthik Nair",
            "email": "karthik.nair@example.com",
            "phone": "+91 98765 43212",
            "college": "NIT Trichy",
            "degree": "B.Tech",
            "branch": "IT",
            "year": 2,
            "cgpa": 8.2,
            "domain": "Mobile Dev",
            "internType": "project",
            "isPaid": False,
            "status": "training",
            "currentProject": "Mobile App",
            "mentor": "Rajesh Kumar",
            "startDate": datetime(2026, 1, 15),
            "endDate": datetime(2026, 4, 15),
            "joinedDate": datetime(2026, 1, 15),
            "taskCount": 5,
            "completedTasks": 2,
            "dsuStreak": 2,
            "skills": ["React Native", "JavaScript"],
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Sneha Reddy",
            "email": "sneha.reddy@example.com",
            "phone": "+91 98765 43213",
            "college": "VIT Vellore",
            "degree": "B.Tech",
            "branch": "CSE",
            "year": 3,
            "cgpa": 8.9,
            "domain": "Data Science",
            "internType": "rs",
            "isPaid": True,
            "status": "active",
            "currentProject": "ML Pipeline",
            "mentor": "Pradeep Menon",
            "startDate": datetime(2025, 2, 1),
            "endDate": datetime(2025, 8, 1),
            "joinedDate": datetime(2025, 2, 1),
            "taskCount": 12,
            "completedTasks": 8,
            "dsuStreak": 5,
            "skills": ["Python", "TensorFlow", "Pandas", "SQL"],
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]
    
    intern_results = await db.interns.insert_many(interns)
    intern_ids = [str(id) for id in intern_results.inserted_ids]
    print(f"✅ Created {len(interns)} interns")
    
    # ==================== CREATE DSU ENTRIES ====================
    print("📝 Creating DSU entries...")
    today = datetime.now()
    dsu_entries = [
        {
            "internId": intern_ids[0],
            "date": today,
            "yesterday": "Completed product listing page",
            "today": "Working on cart functionality",
            "blockers": "",
            "learnings": "Learned React Query",
            "status": "submitted",
            "submittedAt": datetime.now(),
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "internId": intern_ids[1],
            "date": today,
            "yesterday": "Implemented authentication",
            "today": "Working on order service",
            "blockers": "",
            "learnings": "FastAPI dependency injection",
            "status": "submitted",
            "submittedAt": datetime.now(),
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]
    
    await db.dsu_entries.insert_many(dsu_entries)
    print(f"✅ Created {len(dsu_entries)} DSU entries")
    
    # ==================== CREATE TASKS ====================
    print("✅ Creating tasks...")
    tasks = [
        {
            "internId": intern_ids[0],
            "title": "Implement product search",
            "description": "Add search with autocomplete",
            "project": "E-commerce Platform",
            "priority": "high",
            "status": "in_progress",
            "assignedBy": "Vikram Singh",
            "dueDate": datetime.now() + timedelta(days=7),
            "tags": ["frontend", "react"],
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "internId": intern_ids[0],
            "title": "Create shopping cart UI",
            "description": "Design cart page",
            "project": "E-commerce Platform",
            "priority": "medium",
            "status": "todo",
            "assignedBy": "Vikram Singh",
            "dueDate": datetime.now() + timedelta(days=10),
            "tags": ["frontend", "ui"],
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]
    
    await db.tasks.insert_many(tasks)
    print(f"✅ Created {len(tasks)} tasks")
    
    print("\n" + "="*50)
    print("🎉 Database seeded successfully!")
    print("="*50)
    print("\n📝 Demo Credentials:")
    print("   Admin:  admin@company.com / admin123")
    print("   Mentor: anita.desai@company.com / mentor123")
    print("   Intern: priya.sharma@example.com / intern123")
    print("\n🌐 API: http://localhost:8000/docs")
    print("="*50)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
