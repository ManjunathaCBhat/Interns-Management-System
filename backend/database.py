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
    
    try:
        # Create client with connection timeout
        db.client = AsyncIOMotorClient(
            MONGODB_URL,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
        db.db = db.client[MONGODB_DB_NAME]
        
        # Verify connection with timeout
        await asyncio.wait_for(db.client.admin.command('ping'), timeout=5.0)
        print(f"✅ Connected to MongoDB: {MONGODB_DB_NAME}")
        
        # Create indexes
        await db.db.users.create_index("email", unique=True)
        await db.db.users.create_index("username", unique=True)
        
        await db.db.interns.create_index("email", unique=True)
        await db.db.interns.create_index([("status", ASCENDING)])
        
        await db.db.dsu_entries.create_index([("internId", ASCENDING), ("date", DESCENDING)])
        await db.db.tasks.create_index([("internId", ASCENDING)])
        await db.db.pto.create_index([("internId", ASCENDING), ("status", ASCENDING), ("type", ASCENDING)])
        await db.db.projects.create_index("name", unique=True)
        await db.db.batches.create_index("batchId", unique=True)
        await db.db.batch_years.create_index("year", unique=True)
        await db.db.batch_months.create_index("name", unique=True)
        await db.db.organizations.create_index("name", unique=True)
        await db.db.mentor_requests.create_index([("requesterUserId", ASCENDING), ("status", ASCENDING)])
        await db.db.mentor_requests.create_index([("mentorUserId", ASCENDING), ("status", ASCENDING)])
        
        print("✅ Database indexes created")
    except asyncio.TimeoutError:
        print("❌ Database connection timeout - check MONGODB_URL")
        raise
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        raise

async def close_db():
    """Close database connection"""
    if db.client:
        db.client.close()
        print("Database connection closed")
