#!/bin/bash

# Alternative Cloud Run Setup - Uses your personal credentials or creates new SA

set -e

echo "🚀 Alternative Cloud Run Setup"
echo "=============================="
echo ""

PROJECT_ID="manually-built"
SERVICE_NAME="novalyte-admin"
REGION="us-central1"

# Try different service account names to avoid restrictions
SA_NAME="github-deployer-$(date +%s)"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
KEY_FILE="gcp-sa-key.json"

echo "📋 Configuration:"
echo "  Project ID: $PROJECT_ID"
echo "  Service Name: $SERVICE_NAME"
echo "  Region: $REGION"
echo ""

# Set project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  containerregistry.googleapis.com \
  --project=$PROJECT_ID

echo "✅ APIs enabled"

# Create a fresh service account with unique name
echo ""
echo "👤 Creating new service account: $SA_NAME"
gcloud iam service-accounts create $SA_NAME \
  --display-name="GitHub Actions Deployer $(date +%Y%m%d)" \
  --project=$PROJECT_ID

echo "✅ Service account created: $SA_EMAIL"

# Wait a bit for the service account to propagate
echo "⏳ Waiting for service account to be ready..."
sleep 5

# Grant necessary permissions
echo ""
echo "🔑 Granting IAM permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin" \
  --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/storage.admin" \
  --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser" \
  --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/cloudbuild.builds.builder" \
  --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/artifactregistry.writer" \
  --condition=None

echo "✅ Permissions granted"

# Try to create key with retry
echo ""
echo "🔐 Creating service account key..."
sleep 3

MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if gcloud iam service-accounts keys create $KEY_FILE \
        --iam-account=$SA_EMAIL \
        --project=$PROJECT_ID 2>/dev/null; then
        echo "✅ Key created successfully!"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo "⚠️  Attempt $RETRY_COUNT failed, retrying in 5 seconds..."
            sleep 5
        else
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "❌ Could not create service account key automatically"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            echo "🔧 ALTERNATIVE SOLUTION: Use Workload Identity Federation"
            echo ""
            echo "This is MORE SECURE and doesn't require keys!"
            echo ""
            echo "Run this command instead:"
            echo ""
            echo "  chmod +x setup-workload-identity.sh && ./setup-workload-identity.sh"
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            exit 1
        fi
    fi
done

# Success! Show the key
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ SUCCESS! ✨"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Go to GitHub repo settings:"
echo "   https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions"
echo ""
echo "2. Click 'New repository secret'"
echo ""
echo "3. Name: GCP_SA_KEY"
echo ""
echo "4. Value: Copy EVERYTHING below:"
echo ""
echo "━━━━━━━━━━━━━━ COPY THIS ━━━━━━━━━━━━━━"
cat $KEY_FILE
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "5. Click 'Add secret'"
echo ""
echo "6. Push code to trigger deployment!"
echo ""
echo "🗑️  Delete key file after setup:"
echo "   rm $KEY_FILE"
echo ""
