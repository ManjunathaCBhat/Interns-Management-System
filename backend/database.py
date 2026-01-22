"""
MongoDB database connection and utilities
"""
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
import os
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
    """Connect to MongoDB"""
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "intern_lifecycle")
    
    db.client = AsyncIOMotorClient(MONGODB_URL)
    db.db = db.client[MONGODB_DB_NAME]
    
    print(f"Connected to MongoDB: {MONGODB_DB_NAME}")
    
    # Create indexes
    await db.db.users.create_index("email", unique=True)
    await db.db.users.create_index("username", unique=True)
    
    await db.db.interns.create_index("email", unique=True)
    await db.db.interns.create_index([("status", ASCENDING)])
    
    await db.db.dsu_entries.create_index([("internId", ASCENDING), ("date", DESCENDING)])
    await db.db.tasks.create_index([("internId", ASCENDING)])
    await db.db.projects.create_index("name", unique=True)
    
    print("Database indexes created")

async def close_db():
    """Close database connection"""
    if db.client:
        db.client.close()
        print("Database connection closed")
