#!/usr/bin/env python3
"""
Startup script for Cloud Run deployment
"""
import os
import sys

# Add the current directory to Python path so backend module can be imported
sys.path.insert(0, os.getcwd())

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", "8000"))
    
    print(f"🚀 Starting server on port {port}")
    print(f"📁 Working directory: {os.getcwd()}")
    print(f"🐍 Python path: {sys.path}")
    
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True
    )
