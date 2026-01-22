import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

async def update_user_role():
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db = client['intern_lifecycle']
    
    # Update all users to admin role
    result = await db.users.update_many(
        {},
        {'$set': {'role': 'admin'}}
    )
    
    print(f'Updated {result.modified_count} users to admin role')
    
    # List all users
    print('\nCurrent users:')
    async for user in db.users.find():
        print(f"  - {user.get('email')}: {user.get('role')}")
    
    client.close()

asyncio.run(update_user_role())
