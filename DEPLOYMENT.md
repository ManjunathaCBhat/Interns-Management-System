# GCP Deployment Guide - Interns Lifecycle Manager

This guide covers deploying the application to Google Cloud Platform (GCP) using Docker and Cloud Run.

## Prerequisites

- Google Cloud SDK installed (`gcloud` CLI)
- Docker installed locally
- GCP project created
- Billing enabled on GCP project

## Architecture

- **Single Service Deployment**: FastAPI backend serves the React frontend from `/static`
- **Container**: Docker image with multi-stage build
- **Environment Variables**: Injected by GCP Cloud Run at runtime (NOT in Docker image)

## Step 1: Build Docker Image Locally (Optional Testing)

```bash
# Test build locally
docker build -t interns360:latest .

# Test run locally (with local .env file)
docker run -p 8000:8000 --env-file .env interns360:latest
```

## Step 2: Configure GCP

```bash
# Login to GCP
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

## Step 3: Build and Push Docker Image to GCP

### Option A: Using Cloud Build (Recommended)

```bash
# Build in GCP (no local Docker needed)
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/interns360:latest
```

### Option B: Using Local Docker

```bash
# Configure Docker to use GCP
gcloud auth configure-docker

# Build locally
docker build -t gcr.io/YOUR_PROJECT_ID/interns360:latest .

# Push to GCP Container Registry
docker push gcr.io/YOUR_PROJECT_ID/interns360:latest
```

## Step 4: Set Up Secret Manager (Recommended)

The recommended approach is to store sensitive values in GCP Secret Manager and reference them in Cloud Run.

### Automated Setup

Run the provided setup script:

```bash
# Make script executable
chmod +x setup-secrets.sh

# Run the script (it will prompt for secret values)
./setup-secrets.sh
```

The script will:
- Enable required GCP APIs
- Create secrets in Secret Manager
- Grant Cloud Build and Cloud Run access to secrets
- Set up all necessary IAM permissions

### Manual Setup

If you prefer manual setup:

```bash
# Create secrets
echo -n "mongodb+srv://user:pass@cluster.mongodb.net/" | \
  gcloud secrets create mongodb-url --data-file=-

echo -n "your-super-secret-jwt-key-min-32-characters" | \
  gcloud secrets create jwt-secret-key --data-file=-

echo -n "your-azure-client-secret" | \
  gcloud secrets create azure-secret-key --data-file=-

# Get project info
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

# Grant Cloud Build access
for SECRET in mongodb-url jwt-secret-key azure-secret-key; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done

# Grant Cloud Run access
for SECRET in mongodb-url jwt-secret-key azure-secret-key; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

## Step 5: Deploy with Cloud Build

### Option A: Deploy with Secret Manager (Recommended)

```bash
# Update substitutions in cloudbuild-with-secrets.yaml first
# Then deploy:
gcloud builds submit --config=cloudbuild-with-secrets.yaml
```

This will:
1. Build the Docker image with frontend
2. Push to Google Container Registry
3. Deploy to Cloud Run with secrets from Secret Manager

### Option B: Deploy with Basic cloudbuild.yaml

```bash
# This preserves existing environment variables in Cloud Run
gcloud builds submit --config=cloudbuild.yaml
```

Note: Environment variables from the existing Cloud Run service are preserved. For first-time deployment, set them manually (see Step 6).

## Step 6: Manual Deployment to Cloud Run (Alternative)

### Initial Deployment

```bash
gcloud run deploy interns360 \
  --image gcr.io/YOUR_PROJECT_ID/interns360:latest \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --timeout 300s \
  --port 8000 \
  --set-env-vars "MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/db" \
  --set-env-vars "MONGODB_DB_NAME=intern_lifecycle" \
  --set-env-vars "SECRET_KEY=your-super-secret-key-min-32-chars" \
  --set-env-vars "ALGORITHM=HS256" \
  --set-env-vars "ACCESS_TOKEN_EXPIRE_MINUTES=1440" \
  --set-env-vars "BACKEND_CORS_ORIGINS=[\"https://your-app-url.run.app\"]" \
  --set-env-vars "tenant_id=your-azure-tenant-id" \
  --set-env-vars "client_id=your-azure-client-id" \
  --set-env-vars "AZURE_SECRET_KEY=your-azure-secret" \
  --set-env-vars "AZURE_REDIRECT_URI=https://your-app-url.run.app/auth/azure-callback"
```

### Update Environment Variables Only

```bash
gcloud run services update interns360 \
  --region europe-west1 \
  --update-env-vars "SECRET_KEY=new-secret-key"
```

### Using Environment Variables File

Create a file `env.yaml`:

```yaml
MONGODB_URL: mongodb+srv://user:pass@cluster.mongodb.net/db
MONGODB_DB_NAME: intern_lifecycle
SECRET_KEY: your-super-secret-key-min-32-chars
ALGORITHM: HS256
ACCESS_TOKEN_EXPIRE_MINUTES: "1440"
BACKEND_CORS_ORIGINS: '["https://your-app-url.run.app"]'
tenant_id: your-azure-tenant-id
client_id: your-azure-client-id
AZURE_SECRET_KEY: your-azure-secret
AZURE_REDIRECT_URI: https://your-app-url.run.app/auth/azure-callback
```

Deploy with env file:

```bash
gcloud run deploy interns360 \
  --image gcr.io/YOUR_PROJECT_ID/interns360:latest \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --timeout 300s \
  --port 8000 \
  --env-vars-file env.yaml
```

## Step 5: Configure Environment Variables via GCP Console

Alternative to CLI - use the web console:

1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Click on your service `interns360`
3. Click **"EDIT & DEPLOY NEW REVISION"**
4. Scroll to **"Variables & Secrets"** section
5. Add environment variables:
   - Click **"+ ADD VARIABLE"**
   - Enter Name: `MONGODB_URL`
   - Enter Value: `mongodb+srv://...`
   - Repeat for all variables
6. Click **"DEPLOY"**

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `MONGODB_DB_NAME` | Database name | `intern_lifecycle` |
| `SECRET_KEY` | JWT secret (min 32 chars) | `your-super-secret-key-...` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry | `1440` |
| `BACKEND_CORS_ORIGINS` | Allowed origins (JSON array) | `["https://your-app.run.app"]` |
| `tenant_id` | Azure AD tenant ID | `a858d9da-...` |
| `client_id` | Azure AD client ID | `dd2ad1eb-...` |
| `AZURE_SECRET_KEY` | Azure AD client secret | `your-secret` |
| `AZURE_REDIRECT_URI` | OAuth callback URL | `https://your-app.run.app/auth/azure-callback` |

## Step 6: Using Secret Manager (Recommended for Sensitive Data)

For production, use GCP Secret Manager for sensitive values:

```bash
# Create secret
echo -n "your-mongodb-url" | gcloud secrets create mongodb-url --data-file=-

# Deploy with secret reference
gcloud run deploy interns360 \
  --image gcr.io/YOUR_PROJECT_ID/interns360:latest \
  --region europe-west1 \
  --set-secrets "MONGODB_URL=mongodb-url:latest"
```

## Step 7: Verify Deployment

```bash
# Get service URL
gcloud run services describe interns360 --region europe-west1 --format 'value(status.url)'

# Test API endpoint
curl https://your-service-url.run.app/api/v1/health
```

## Step 8: Update Azure AD Redirect URI

After deployment, update your Azure AD app registration:

1. Go to Azure Portal → Azure Active Directory → App Registrations
2. Select your app
3. Go to **Authentication**
4. Add redirect URI: `https://your-service-url.run.app/auth/azure-callback`
5. Save

## Continuous Deployment with Cloud Build

Use the existing `cloudbuild.yaml` or create a trigger:

```bash
# Create trigger from GitHub repo
gcloud builds triggers create github \
  --repo-name=YOUR_REPO \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

## Monitoring and Logs

```bash
# View logs
gcloud run services logs read interns360 --region europe-west1

# View in console
open https://console.cloud.google.com/run/detail/europe-west1/interns360/logs
```

## Rollback

```bash
# List revisions
gcloud run revisions list --service interns360 --region europe-west1

# Rollback to previous revision
gcloud run services update-traffic interns360 \
  --region europe-west1 \
  --to-revisions REVISION_NAME=100
```

## Cost Optimization

- **Memory**: Start with 1Gi, adjust based on actual usage
- **Timeout**: 300s is generous, reduce if possible
- **Min Instances**: Set to 0 for development (cold starts OK)
- **Max Instances**: Set limit to prevent runaway costs

```bash
gcloud run services update interns360 \
  --region europe-west1 \
  --min-instances 0 \
  --max-instances 10 \
  --memory 512Mi
```

## Troubleshooting

### Container fails to start

```bash
# Check logs
gcloud run services logs read interns360 --region europe-west1 --limit 50

# Common issues:
# - Missing environment variables
# - MongoDB connection failure
# - Port mismatch (ensure port 8000)
```

### Environment variables not loaded

- Verify in Cloud Run console: Service → Variables & Secrets
- Ensure no quotes around numeric values
- JSON arrays must use proper escaping: `'["value"]'`

### Frontend not loading

- Check `backend/static/` directory exists in container
- Verify frontend build step completed successfully
- Check CORS settings match deployment URL

## Security Best Practices

1. **Never commit `.env` files** - already in `.gitignore`
2. **Use Secret Manager** for sensitive values in production
3. **Rotate secrets regularly** - especially JWT SECRET_KEY
4. **Restrict CORS origins** - only allow your domain
5. **Enable Cloud Armor** for DDoS protection (optional)
6. **Set up IAM properly** - principle of least privilege

## Local Development vs Production

| Aspect | Local | Production (GCP) |
|--------|-------|------------------|
| Config | `.env` file | Cloud Run env vars |
| Database | Local/Atlas | MongoDB Atlas |
| CORS | `localhost:5173` | `your-app.run.app` |
| Secrets | `.env` file | Secret Manager |
| Frontend | Dev server (Vite) | Built static files |

---

**Note**: This Dockerfile is designed to work with GCP Cloud Run. Environment variables are injected at runtime by GCP, not baked into the Docker image. Never include `.env` files in your Docker image or Git repository.
