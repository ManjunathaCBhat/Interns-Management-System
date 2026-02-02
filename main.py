"""
Unified entry point for Intern Lifecycle Manager
Runs both backend (FastAPI) and frontend (Vite) simultaneously
Usage: python main.py
"""

import subprocess
import sys
import os
import time
import signal
from pathlib import Path

# Get the root directory
ROOT_DIR = Path(__file__).parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

# Check if required directories exist
if not BACKEND_DIR.exists():
    print(f"❌ Backend directory not found: {BACKEND_DIR}")
    sys.exit(1)

if not FRONTEND_DIR.exists():
    print(f"❌ Frontend directory not found: {FRONTEND_DIR}")
    sys.exit(1)

# Store subprocess references for cleanup
processes = []


def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    print("\n\n⏹️  Shutting down...")
    for process in processes:
        try:
            process.terminate()
            # Wait a bit for graceful shutdown
            process.wait(timeout=5)
        except (subprocess.TimeoutExpired, ProcessLookupError):
            try:
                process.kill()
            except:
                pass
    print("✅ All services stopped")
    sys.exit(0)


def start_backend():
    """Start the FastAPI backend"""
    print("\n🚀 Starting Backend (FastAPI on port 8000)...")
    print("=" * 60)
    
    # Set environment variables
    env = os.environ.copy()
    env['PYTHONIOENCODING'] = 'utf-8'
    
    try:
        process = subprocess.Popen(
            [sys.executable, "main.py"],
            cwd=str(BACKEND_DIR),
            env=env,
            stdout=sys.stdout,
            stderr=sys.stderr
        )
        processes.append(process)
        print(f"✅ Backend started (PID: {process.pid})")
        return process
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return None


def start_frontend():
    """Start the Vite frontend dev server"""
    print("\n🎨 Starting Frontend (Vite on port 5173)...")
    print("=" * 60)
    
    # Detect package manager - prefer npm as fallback for Windows compatibility
    package_manager = "npm"
    
    # Check if bun exists in PATH and use it if available
    if (FRONTEND_DIR / "bun.lockb").exists():
        try:
            # Test if bun command is available
            result = subprocess.run(
                "bun --version",
                capture_output=True,
                timeout=5,
                shell=True
            )
            if result.returncode == 0:
                package_manager = "bun"
                print(f"📦 Detected {package_manager} package manager")
            else:
                print(f"⚠️  bun.lockb found but bun not available, using npm instead")
        except (FileNotFoundError, subprocess.TimeoutExpired):
            print(f"⚠️  bun.lockb found but bun not installed, using npm instead")
    
    # Verify package manager is available
    try:
        subprocess.run(
            f"{package_manager} --version",
            capture_output=True,
            timeout=5,
            shell=True,
            check=True
        )
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        print(f"❌ Error: {package_manager} is not installed or not in PATH")
        print("Please install Node.js and npm from https://nodejs.org/")
        return None
    
    # Check if node_modules exists, if not install dependencies
    if not (FRONTEND_DIR / "node_modules").exists():
        print(f"\n📥 Installing dependencies with {package_manager}...")
        try:
            subprocess.run(
                f"{package_manager} install",
                cwd=str(FRONTEND_DIR),
                check=True,
                shell=True
            )
            print(f"✅ Dependencies installed")
        except subprocess.CalledProcessError as e:
            print(f"⚠️  Failed to install dependencies: {e}")
            print("Continuing anyway...")
    
    try:
        # Use npm run dev to start the dev server
        process = subprocess.Popen(
            f"{package_manager} run dev",
            cwd=str(FRONTEND_DIR),
            stdout=sys.stdout,
            stderr=sys.stderr,
            shell=True
        )
        processes.append(process)
        print(f"✅ Frontend started (PID: {process.pid})")
        return process
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return None


def main():
    """Main entry point"""
    print("=" * 60)
    print("🎯 Intern Lifecycle Manager - Full Stack")
    print("=" * 60)
    print()
    print("📍 Backend: http://localhost:8000")
    print("📍 Frontend: http://localhost:5173")
    print("📍 API Docs: http://localhost:8000/docs")
    print()
    print("Press Ctrl+C to stop all services")
    print("=" * 60)
    print()
    
    # Set up signal handler for Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Start both services
    backend_process = start_backend()
    
    # Give backend a moment to start
    time.sleep(2)
    
    frontend_process = start_frontend()
    
    if not backend_process or not frontend_process:
        print("\n❌ Failed to start all services")
        signal_handler(None, None)
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ All services are running!")
    print("=" * 60)
    print()
    
    # Wait for processes to complete
    try:
        while True:
            # Check if processes are still running
            if backend_process.poll() is not None:
                print(f"\n⚠️  Backend process exited with code {backend_process.returncode}")
                signal_handler(None, None)
            
            if frontend_process.poll() is not None:
                print(f"\n⚠️  Frontend process exited with code {frontend_process.returncode}")
                signal_handler(None, None)
            
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(None, None)


if __name__ == "__main__":
    main()
