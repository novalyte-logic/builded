#!/bin/bash

# Cloud Run Deployment Setup Script
# This script helps you set up everything needed for Cloud Run deployment

set -e

echo "🚀 Cloud Run Deployment Setup"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_ID="manually-built"
SERVICE_NAME="novalyte-admin"
REGION="us-central1"
SA_NAME="github-actions-deployer"

echo "📋 Configuration:"
echo "  Project ID: $PROJECT_ID"
echo "  Service Name: $SERVICE_NAME"
echo "  Region: $REGION"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo -e "${GREEN}✓${NC} gcloud CLI found"

# Set project
echo ""
echo "Setting GCP project..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo ""
echo "🔧 Enabling required APIs (this may take a few minutes)..."
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  containerregistry.googleapis.com \
  --project=$PROJECT_ID

echo -e "${GREEN}✓${NC} APIs enabled"

# Create service account
echo ""
echo "👤 Creating service account for GitHub Actions..."
gcloud iam service-accounts create $SA_NAME \
  --display-name="GitHub Actions Deployer" \
  --project=$PROJECT_ID 2>/dev/null || echo "Service account already exists"

SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
echo -e "${GREEN}✓${NC} Service account: $SA_EMAIL"

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

echo -e "${GREEN}✓${NC} Permissions granted"

# Create and download key
echo ""
echo "🔐 Creating service account key..."
KEY_FILE="gcp-sa-key.json"

gcloud iam service-accounts keys create $KEY_FILE \
  --iam-account=$SA_EMAIL \
  --project=$PROJECT_ID

echo -e "${GREEN}✓${NC} Key created: $KEY_FILE"

# Show the key content (base64 for easy copy-paste)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}📋 NEXT STEPS:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Go to your GitHub repository settings:"
echo "   https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions"
echo ""
echo "2. Click 'New repository secret'"
echo ""
echo "3. Name: GCP_SA_KEY"
echo ""
echo "4. Value: Copy the ENTIRE content below (including curly braces):"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━ COPY THIS ━━━━━━━━━━━━━━━${NC}"
cat $KEY_FILE
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "5. Click 'Add secret'"
echo ""
echo "6. Push code to 'main' branch and it will auto-deploy!"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo "   - Keep this key file secure and delete it after adding to GitHub"
echo "   - Never commit this file to git"
echo ""
echo -e "${RED}🗑️  To delete the key file after setup:${NC}"
echo "   rm $KEY_FILE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
