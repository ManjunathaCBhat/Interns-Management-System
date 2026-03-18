"""
MongoDB database connection and utilities
"""
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

# Database instance
class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def get_database():
    """Dependency to get database"""
    return db.db

async def connect_db():
    """Connect to MongoDB with timeout"""
    MONGODB_URL = os.getenv("MONGODB_URL")
    MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "intern_lifecycle")

    if not MONGODB_URL:
        print("[WARNING] MONGODB_URL not set - running without database")
        return

    try:
        # Create client with connection timeout
        db.client = AsyncIOMotorClient(
            MONGODB_URL,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            maxPoolSize=10,
            minPoolSize=1
        )
        db.db = db.client[MONGODB_DB_NAME]

        # Verify connection with timeout
        await asyncio.wait_for(db.client.admin.command('ping'), timeout=10.0)
        print(f"[OK] Connected to MongoDB: {MONGODB_DB_NAME}")

        # Create indexes in background (non-blocking)
        asyncio.create_task(create_indexes())

    except asyncio.TimeoutError:
        print("[ERROR] Database connection timeout - check MONGODB_URL")
        # Don't raise - allow app to start without DB
    except Exception as e:
        print(f"[ERROR] Database connection error: {e}")
        # Don't raise - allow app to start without DB


async def create_indexes():
    """Create database indexes (called asynchronously)"""
    try:
        await db.db.users.create_index("email", unique=True)
        await db.db.users.create_index("username", unique=True)
        await db.db.users.create_index([("role", ASCENDING)])
        await db.db.users.create_index([("is_approved", ASCENDING)])
        await db.db.users.create_index([("is_active", ASCENDING)])
        await db.db.users.create_index([("role", ASCENDING), ("is_approved", ASCENDING), ("is_active", ASCENDING)])
        await db.db.users.create_index([("created_at", DESCENDING)])
        
        await db.db.interns.create_index("email", unique=True)
        await db.db.interns.create_index([("status", ASCENDING)])
        await db.db.interns.create_index([("internType", ASCENDING)])
        await db.db.interns.create_index([("type", ASCENDING)])
        await db.db.interns.create_index([("batch", ASCENDING)])
        await db.db.interns.create_index([("batch", ASCENDING), ("status", ASCENDING)])
        
        await db.db.dsu_entries.create_index([("internId", ASCENDING), ("date", DESCENDING)])
        await db.db.dsu_entries.create_index([("date", DESCENDING)])
        await db.db.dsu_entries.create_index([("status", ASCENDING)])
        await db.db.dsu_entries.create_index([("date", DESCENDING), ("status", ASCENDING)])
        await db.db.dsu_entries.create_index([("date", DESCENDING), ("blockers", ASCENDING)])
        await db.db.dsu_entries.create_index([("submittedAt", DESCENDING)])
        
        await db.db.tasks.create_index([("internId", ASCENDING)])
        await db.db.tasks.create_index([("status", ASCENDING)])
        await db.db.tasks.create_index([("created_at", DESCENDING)])
        await db.db.tasks.create_index([("internId", ASCENDING), ("status", ASCENDING)])
        
        await db.db.pto.create_index([("internId", ASCENDING), ("status", ASCENDING), ("type", ASCENDING)])
        await db.db.pto.create_index([("status", ASCENDING)])
        await db.db.pto.create_index([("created_at", DESCENDING)])
        await db.db.pto.create_index([("status", ASCENDING), ("created_at", DESCENDING)])
        
        await db.db.projects.create_index("name", unique=True)
        
        await db.db.batches.create_index("batchId", unique=True)
        await db.db.batches.create_index([("status", ASCENDING)])
        await db.db.batches.create_index([("startDate", DESCENDING)])
        
        await db.db.organizations.create_index("name", unique=True)
        await db.db.mentor_requests.create_index([("requesterUserId", ASCENDING), ("status", ASCENDING)])
        await db.db.mentor_requests.create_index([("mentorUserId", ASCENDING), ("status", ASCENDING)])

        print("[OK] Database indexes created")
    except Exception as e:
        print(f"[WARNING] Error creating indexes: {e}")

async def close_db():
    """Close database connection"""
    if db.client:
        db.client.close()
        print("Database connection closed")
