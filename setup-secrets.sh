#!/bin/bash
# =============================================================================
# GCP Secret Manager Setup Script
# This script creates all required secrets in GCP Secret Manager
# =============================================================================

set -e

echo "🔐 Setting up GCP Secret Manager for Interns360"
echo "================================================"

# Get project details
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: No GCP project selected. Run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

echo "📋 Project ID: $PROJECT_ID"
echo "📋 Project Number: $PROJECT_NUMBER"
echo ""

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable secretmanager.googleapis.com --quiet
gcloud services enable run.googleapis.com --quiet
gcloud services enable cloudbuild.googleapis.com --quiet
echo "✅ APIs enabled"
echo ""

# Function to create or update a secret
create_or_update_secret() {
  SECRET_NAME=$1
  SECRET_PROMPT=$2

  echo "🔑 Setting up secret: $SECRET_NAME"

  # Check if secret already exists
  if gcloud secrets describe $SECRET_NAME &>/dev/null; then
    echo "   Secret '$SECRET_NAME' already exists."
    read -p "   Do you want to update it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "   Skipping $SECRET_NAME"
      return
    fi
  fi

  # Prompt for secret value
  echo "   $SECRET_PROMPT"
  read -s -p "   Enter value: " SECRET_VALUE
  echo

  if [ -z "$SECRET_VALUE" ]; then
    echo "   ⚠️  Skipping empty value for $SECRET_NAME"
    return
  fi

  # Create or update secret
  if gcloud secrets describe $SECRET_NAME &>/dev/null; then
    echo -n "$SECRET_VALUE" | gcloud secrets versions add $SECRET_NAME --data-file=-
    echo "   ✅ Secret '$SECRET_NAME' updated"
  else
    echo -n "$SECRET_VALUE" | gcloud secrets create $SECRET_NAME --data-file=-
    echo "   ✅ Secret '$SECRET_NAME' created"
  fi
}

# Create secrets
echo "📝 Creating/updating secrets..."
echo "================================"
echo ""

create_or_update_secret "mongodb-url" "MongoDB connection string (mongodb+srv://...)"
create_or_update_secret "jwt-secret-key" "JWT secret key (min 32 characters)"
create_or_update_secret "azure-secret-key" "Azure AD client secret"

echo ""
echo "🔐 Setting up IAM permissions..."
echo "================================"
echo ""

# Grant Cloud Build service account access to secrets
echo "📌 Granting Cloud Build access to secrets..."
for SECRET_NAME in mongodb-url jwt-secret-key azure-secret-key; do
  if gcloud secrets describe $SECRET_NAME &>/dev/null; then
    gcloud secrets add-iam-policy-binding $SECRET_NAME \
      --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
      --role="roles/secretmanager.secretAccessor" \
      --quiet
    echo "   ✅ Cloud Build can access '$SECRET_NAME'"
  fi
done

echo ""

# Grant Cloud Run service account access to secrets
echo "📌 Granting Cloud Run access to secrets..."
for SECRET_NAME in mongodb-url jwt-secret-key azure-secret-key; do
  if gcloud secrets describe $SECRET_NAME &>/dev/null; then
    gcloud secrets add-iam-policy-binding $SECRET_NAME \
      --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
      --role="roles/secretmanager.secretAccessor" \
      --quiet
    echo "   ✅ Cloud Run can access '$SECRET_NAME'"
  fi
done

echo ""
echo "✅ Secret Manager setup complete!"
echo ""
echo "📋 Summary:"
echo "   - Secrets created in Secret Manager"
echo "   - Cloud Build service account has access"
echo "   - Cloud Run service account has access"
echo ""
echo "🚀 Next steps:"
echo "   1. Review substitutions in cloudbuild.yaml or cloudbuild-with-secrets.yaml"
echo "   2. Deploy your application:"
echo "      gcloud builds submit --config=cloudbuild-with-secrets.yaml"
echo ""
echo "📖 To view your secrets:"
echo "   gcloud secrets list"
echo ""
echo "📖 To update a secret:"
echo "   echo -n 'new-value' | gcloud secrets versions add SECRET_NAME --data-file=-"
echo ""
