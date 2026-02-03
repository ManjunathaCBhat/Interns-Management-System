# Interns-Management-System

## Quick Start

### Run Everything with a Single Command

To start both the backend (FastAPI) and frontend (Vite) simultaneously:

```bash
python main.py
```

This will:
- Start the **Backend** on `http://localhost:8000`
- Start the **Frontend** on `http://localhost:5173`
- Open API documentation at `http://localhost:8000/docs`

Press **Ctrl+C** to stop all services.

### Alternative Commands

**Backend Only:**
```bash
cd backend
python main.py
```

**Frontend Only:**
```bash
cd frontend
npm run dev
```

**Using npm scripts:**
```bash
npm start          # Run both (same as `python main.py`)
npm run backend    # Backend only
npm run frontend   # Frontend only
npm run dev        # Run both (alternative method)
```

## Project Structure

- **`backend/`** - FastAPI REST API server
- **`frontend/`** - React + TypeScript + Vite web application
- **`main.py`** - Unified entry point that runs both services

## Requirements

- **Python 3.8+** - For backend
- **Node.js or Bun** - For frontend package management

## Setup

### First Time Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

2. **Install Node dependencies (automatic):**
   The frontend dependencies will be installed automatically when you first run `python main.py`

3. **Run the application:**
   ```bash
   python main.py
   ```
