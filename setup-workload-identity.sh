#!/bin/bash

# Setup Workload Identity Federation (More secure, no keys needed!)

set -e

echo "🔐 Workload Identity Federation Setup"
echo "======================================"
echo ""
echo "This is MORE SECURE than service account keys!"
echo "No keys to manage or rotate 🎉"
echo ""

PROJECT_ID="manually-built"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_NAME="novalyte-admin"
REGION="us-central1"
POOL_NAME="github-pool"
PROVIDER_NAME="github-provider"
SA_NAME="github-wif-deployer"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Get GitHub repo info
echo "📋 Enter your GitHub repository information:"
echo ""
read -p "GitHub Username: " GITHUB_USER
read -p "Repository Name: " GITHUB_REPO
echo ""

REPO_FULL="${GITHUB_USER}/${GITHUB_REPO}"

echo "Configuration:"
echo "  Project ID: $PROJECT_ID"
echo "  Project Number: $PROJECT_NUMBER"
echo "  GitHub Repo: $REPO_FULL"
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
  iam.googleapis.com \
  cloudresourcemanager.googleapis.com \
  iamcredentials.googleapis.com \
  sts.googleapis.com \
  --project=$PROJECT_ID

echo "✅ APIs enabled"

# Create service account
echo ""
echo "👤 Creating service account..."
gcloud iam service-accounts create $SA_NAME \
  --display-name="GitHub WIF Deployer" \
  --project=$PROJECT_ID 2>/dev/null || echo "Service account already exists"

echo "✅ Service account: $SA_EMAIL"

# Grant permissions
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

# Create Workload Identity Pool
echo ""
echo "🔧 Creating Workload Identity Pool..."
gcloud iam workload-identity-pools create $POOL_NAME \
  --location="global" \
  --display-name="GitHub Actions Pool" \
  --project=$PROJECT_ID 2>/dev/null || echo "Pool already exists"

POOL_ID="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}"
echo "✅ Pool created: $POOL_ID"

# Create Workload Identity Provider
echo ""
echo "🔧 Creating Workload Identity Provider for GitHub..."
gcloud iam workload-identity-pools providers create-oidc $PROVIDER_NAME \
  --location="global" \
  --workload-identity-pool=$POOL_NAME \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository_owner == '${GITHUB_USER}'" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --project=$PROJECT_ID 2>/dev/null || echo "Provider already exists"

PROVIDER_ID="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/providers/${PROVIDER_NAME}"
echo "✅ Provider created: $PROVIDER_ID"

# Allow GitHub to impersonate the service account
echo ""
echo "🔗 Binding Workload Identity..."
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${POOL_ID}/attribute.repository/${REPO_FULL}" \
  --project=$PROJECT_ID

echo "✅ Binding complete"

# Create updated GitHub Actions workflow
echo ""
echo "📝 Creating updated GitHub Actions workflow..."

cat > /Users/jamilyakasai/Documents/manual-buildd-main/.github/workflows/deploy-cloudrun.yml << EOF
name: Deploy to Cloud Run (Workload Identity)

on:
  push:
    branches:
      - main

env:
  PROJECT_ID: $PROJECT_ID
  SERVICE_NAME: $SERVICE_NAME
  REGION: $REGION
  IMAGE_NAME: gcr.io/$PROJECT_ID/$SERVICE_NAME
  WORKLOAD_IDENTITY_PROVIDER: $PROVIDER_ID
  SERVICE_ACCOUNT: $SA_EMAIL

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    permissions:
      contents: read
      id-token: write
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: \${{ env.WORKLOAD_IDENTITY_PROVIDER }}
          service_account: \${{ env.SERVICE_ACCOUNT }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker to use gcloud
        run: |
          gcloud auth configure-docker gcr.io

      - name: Build Docker image
        run: |
          docker build -t \${{ env.IMAGE_NAME }}:\${{ github.sha }} .
          docker tag \${{ env.IMAGE_NAME }}:\${{ github.sha }} \${{ env.IMAGE_NAME }}:latest

      - name: Push Docker image to GCR
        run: |
          docker push \${{ env.IMAGE_NAME }}:\${{ github.sha }}
          docker push \${{ env.IMAGE_NAME }}:latest

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy \${{ env.SERVICE_NAME }} \\
            --image \${{ env.IMAGE_NAME }}:\${{ github.sha }} \\
            --region \${{ env.REGION }} \\
            --platform managed \\
            --allow-unauthenticated \\
            --port 8080 \\
            --memory 2Gi \\
            --cpu 2 \\
            --timeout 300 \\
            --max-instances 10 \\
            --min-instances 0 \\
            --set-env-vars "NODE_ENV=production" \\
            --project \${{ env.PROJECT_ID }}

      - name: Show deployment URL
        run: |
          echo "🎉 Deployment successful!"
          gcloud run services describe \${{ env.SERVICE_NAME }} \\
            --region \${{ env.REGION }} \\
            --format 'value(status.url)' \\
            --project \${{ env.PROJECT_ID }}
EOF

echo "✅ Workflow file updated"

# Git commit and push
echo ""
echo "📦 Committing and pushing changes..."
cd /Users/jamilyakasai/Documents/manual-buildd-main
git add .github/workflows/deploy-cloudrun.yml
git commit -m "feat: setup Workload Identity Federation for Cloud Run

- Use WIF instead of service account keys (more secure)
- No keys to manage or rotate
- Auto-deploy on every push to main" || echo "Nothing to commit"

git push origin main

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ WORKLOAD IDENTITY FEDERATION SETUP COMPLETE! ✨"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 NO GitHub secrets needed!"
echo "🔐 More secure than service account keys"
echo "🚀 Auto-deploys on every push to main"
echo ""
echo "Configuration:"
echo "  Workload Identity Provider: $PROVIDER_ID"
echo "  Service Account: $SA_EMAIL"
echo "  GitHub Repo: $REPO_FULL"
echo ""
echo "✅ Push to 'main' branch to trigger deployment!"
echo ""
