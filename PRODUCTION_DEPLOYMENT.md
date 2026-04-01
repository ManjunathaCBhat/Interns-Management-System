# Production Deployment Guide

## Environment Variables Required for Production

### Backend Environment Variables (Cloud Run)

When deploying the backend to production, ensure the following environment variables are set:

```bash
# Required for production deployment
FRONTEND_URL=https://interns360-frontend-697140918049.europe-west1.run.app
AZURE_REDIRECT_URI=https://interns360-frontend-697140918049.europe-west1.run.app/auth/azure-callback

# MongoDB Connection (from secrets)
MONGODB_URL=<your-mongodb-connection-string>
MONGODB_DB_NAME=intern_lifecycle

# JWT Settings
SECRET_KEY=<your-secret-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Azure AD SSO Configuration
tenant_id=<your-azure-tenant-id>
client_id=<your-azure-client-id>
AZURE_SECRET_KEY=<your-azure-secret>

# Email Configuration
SENDER_MAIL=<your-sender-email>
```

### Frontend Environment Variables (Build Time)

Frontend environment variables are set during the build process in Cloud Build:

```bash
VITE_API_URL=https://interns360-697140918049.europe-west1.run.app/api/v1
VITE_AZURE_CLIENT_ID=<your-azure-client-id>
VITE_AZURE_TENANT_ID=<your-azure-tenant-id>
VITE_AZURE_REDIRECT_URI=https://interns360-frontend-697140918049.europe-west1.run.app/auth/azure-callback
```

## Setting Environment Variables in Cloud Run

### Option 1: Via Cloud Build (Recommended)

Environment variables are automatically set via `cloudbuild.yaml`:

```yaml
- '--set-env-vars=FRONTEND_URL=${_FRONTEND_URL}'
- '--set-env-vars=AZURE_REDIRECT_URI=${_AZURE_REDIRECT_URI}'
```

The substitution variables are defined in the `substitutions` section of `cloudbuild.yaml`.

### Option 2: Via gcloud CLI

```bash
gcloud run services update interns360 \
  --region=europe-west1 \
  --set-env-vars="FRONTEND_URL=https://interns360-frontend-697140918049.europe-west1.run.app,AZURE_REDIRECT_URI=https://interns360-frontend-697140918049.europe-west1.run.app/auth/azure-callback"
```

### Option 3: Via Google Cloud Console

1. Go to Cloud Run in Google Cloud Console
2. Select your service (interns360)
3. Click "EDIT & DEPLOY NEW REVISION"
4. Go to "Variables & Secrets" tab
5. Add environment variables:
   - `FRONTEND_URL`: `https://interns360-frontend-697140918049.europe-west1.run.app`
   - `AZURE_REDIRECT_URI`: `https://interns360-frontend-697140918049.europe-west1.run.app/auth/azure-callback`
6. Click "DEPLOY"

## Deployment Process

### Automatic Deployment via Cloud Build

1. Push to main branch
2. Cloud Build automatically triggers
3. Backend deploys with environment variables set via cloudbuild.yaml
4. Frontend builds with production env vars and deploys

### Manual Deployment

#### Backend

```bash
cd backend
gcloud run deploy interns360 \
  --source=. \
  --region=europe-west1 \
  --platform=managed \
  --allow-unauthenticated \
  --memory=1Gi \
  --timeout=300s \
  --port=8000 \
  --set-env-vars="FRONTEND_URL=https://interns360-frontend-697140918049.europe-west1.run.app"
```

#### Frontend

```bash
cd frontend
npm ci
npm run build
# Then deploy the dist/ folder
```

## Important Notes

1. **Never commit `.env` files with production secrets to git**
2. **FRONTEND_URL is required** - Email service will fail without it
3. **AZURE_REDIRECT_URI must match** the one configured in Azure AD
4. **CORS origins** - Backend currently allows all origins (`*`), which works but consider restricting for better security
5. **MongoDB connection** - Ensure your MongoDB Atlas allows connections from Cloud Run IP ranges

## Verifying Production Deployment

After deployment, verify:

1. **Backend health**: https://interns360-697140918049.europe-west1.run.app/docs
2. **Frontend loads**: https://interns360-frontend-697140918049.europe-west1.run.app
3. **API calls work**: Check browser network tab
4. **Azure SSO works**: Test login flow
5. **Email service works**: Test password reset or welcome emails

## Troubleshooting

### Issue: Emails not sending

**Cause**: `FRONTEND_URL` not set or incorrect

**Solution**: Set `FRONTEND_URL` environment variable in Cloud Run

### Issue: Azure SSO fails

**Cause**: `AZURE_REDIRECT_URI` doesn't match Azure AD configuration

**Solution**: Ensure redirect URI matches in both:
- Azure AD App Registration
- Backend `AZURE_REDIRECT_URI` env var
- Frontend `VITE_AZURE_REDIRECT_URI` build env var

### Issue: API calls fail (CORS errors)

**Cause**: Frontend trying to call wrong backend URL

**Solution**: Verify `VITE_API_URL` was correctly set during build

### Issue: "localhost" appears in production

**Cause**: Environment variables not set, falling back to defaults

**Solution**:
1. Check Cloud Run environment variables are set
2. Redeploy with correct variables
3. For frontend, rebuild with correct `VITE_*` variables

## Security Best Practices

1. Use **Google Secret Manager** for sensitive values:
   - MONGODB_URL
   - SECRET_KEY
   - AZURE_SECRET_KEY
   - SENDER_MAIL credentials

2. Restrict **CORS origins** to specific domains instead of `*`

3. Enable **Cloud Run authentication** for sensitive endpoints

4. Use **HTTPS only** - already enforced by Cloud Run

5. Regularly rotate **JWT secret keys** and **Azure client secrets**

## Monitoring

Monitor your deployment:

1. **Cloud Run Logs**: Check for errors
2. **Error Reporting**: Set up error tracking
3. **Uptime Monitoring**: Set up health check alerts
4. **Performance**: Monitor response times and memory usage
