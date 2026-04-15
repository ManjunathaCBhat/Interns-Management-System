# Multi-stage build for Interns Lifecycle Manager
# This Dockerfile is designed for GCP Cloud Run deployment

# ================================
# Stage 1: Build Frontend
# ================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend with production API URL (relative path for same origin)
ARG VITE_API_URL=/api/v1
ARG VITE_AZURE_CLIENT_ID
ARG VITE_AZURE_TENANT_ID
ARG VITE_AZURE_REDIRECT_URI

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_AZURE_CLIENT_ID=${VITE_AZURE_CLIENT_ID}
ENV VITE_AZURE_TENANT_ID=${VITE_AZURE_TENANT_ID}
ENV VITE_AZURE_REDIRECT_URI=${VITE_AZURE_REDIRECT_URI}

# Build the frontend
RUN npm run build

# ================================
# Stage 2: Python Backend Runtime
# ================================
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY backend/ ./

# Copy built frontend from stage 1 into backend/static
COPY --from=frontend-builder /app/frontend/dist ./static

# Environment variables will be injected by GCP Cloud Run at runtime
# Do NOT include .env file in the Docker image
# Configure these in Cloud Run service: MONGODB_URL, SECRET_KEY, etc.

# Expose port 8000 (Cloud Run will map this)
EXPOSE 8000

# Health check (optional but recommended for Cloud Run)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# Run the FastAPI application
# Use --host 0.0.0.0 to accept connections from Cloud Run
# Cloud Run sets PORT env var, but we'll default to 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
