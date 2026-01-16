# test_connection.py
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from dotenv import load_dotenv
import os

load_dotenv()

async def test():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    try:
        # Test connection
        await client.admin.command('ping')
        print("✅ Successfully connected to MongoDB Atlas!")
        
        # List databases
        db_list = await client.list_database_names()
        print(f"📊 Available databases: {db_list}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()

asyncio.run(test())
