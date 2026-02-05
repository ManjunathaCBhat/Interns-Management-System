"""
Unified entry point for Intern Lifecycle Manager
Serves both FastAPI backend API and frontend build from a single process
Usage: python main.py
"""

import sys
import os
import importlib.util
from pathlib import Path

# Setup paths
ROOT_DIR = Path(__file__).parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIST = ROOT_DIR / "frontend" / "dist"

if not BACKEND_DIR.exists():
    print("Backend directory not found:", BACKEND_DIR)
    sys.exit(1)

# Add backend to sys.path so its internal imports (database, auth, models) work
sys.path.insert(0, str(BACKEND_DIR))
os.chdir(str(BACKEND_DIR))

# Load the backend FastAPI app via importlib to avoid naming conflict with this file
spec = importlib.util.spec_from_file_location("backend_main", str(BACKEND_DIR / "main.py"))
backend_module = importlib.util.module_from_spec(spec)
sys.modules["backend_main"] = backend_module
spec.loader.exec_module(backend_module)

app = backend_module.app

# --- Cache-control middleware to prevent stale builds ---
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class CacheControlMiddleware(BaseHTTPMiddleware):
    """
    Sets cache headers so that after a new frontend build, browsers
    pick up the changes without the user having to clear cache.

    Strategy:
    - API responses:        no-cache  (always fresh data)
    - Hashed assets (/assets/*):  1-year cache, immutable
      (safe because Vite filenames change with content, e.g. index-abc123.js)
    - HTML / SPA routes:    no-cache  (forces browser to always fetch the
      latest index.html which points to the new hashed assets)
    """

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        path = request.url.path

        if path.startswith("/api/"):
            # API: never cache
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"

        elif path.startswith("/assets/"):
            # Vite hashed bundles: cache forever (filename changes on rebuild)
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"

        else:
            # HTML pages, SPA routes, root: never cache
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"

        return response


app.add_middleware(CacheControlMiddleware)

# --- Serve frontend build if dist folder exists ---
if FRONTEND_DIST.exists() and (FRONTEND_DIST / "index.html").exists():
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse, JSONResponse
    from starlette.routing import Route

    # Remove the backend's root GET / route so the frontend is served at /
    app.router.routes = [
        r for r in app.router.routes
        if not (isinstance(r, Route) and r.path == "/" and "GET" in (r.methods or set()))
    ]

    # Mount /assets for Vite JS/CSS bundles
    if (FRONTEND_DIST / "assets").exists():
        app.mount(
            "/assets",
            StaticFiles(directory=str(FRONTEND_DIST / "assets")),
            name="frontend-assets",
        )

    # Serve index.html at root
    @app.get("/", include_in_schema=False)
    async def serve_root():
        return FileResponse(str(FRONTEND_DIST / "index.html"))

    # SPA catch-all: must be registered last so API routes take priority
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str):
        # Return proper 404 for unmatched API paths
        if full_path.startswith("api/"):
            return JSONResponse(status_code=404, content={"detail": "Not found"})

        # Serve static file from dist if it exists (with path-traversal guard)
        file_path = (FRONTEND_DIST / full_path).resolve()
        if file_path.is_file() and str(file_path).startswith(str(FRONTEND_DIST.resolve())):
            return FileResponse(str(file_path))

        # Everything else gets index.html (client-side routing)
        return FileResponse(str(FRONTEND_DIST / "index.html"))

    print(f"Frontend: serving build from {FRONTEND_DIST}")
else:
    print("Frontend dist not found, serving API only.")
    print("Run 'npm run build' in frontend/ to generate the build.")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
