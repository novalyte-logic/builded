#!/bin/bash

# Master Setup Script - Cleanup + Cloud Run Setup
# This does everything in one go!

set -e

echo "🎯 MASTER SETUP SCRIPT"
echo "====================="
echo ""
echo "This will:"
echo "  1. ✨ Clean up heavy files (245GB+)"
echo "  2. 🚀 Setup Cloud Run deployment"
echo "  3. 📦 Commit and push to GitHub"
echo "  4. 🤖 Enable auto-deploy on every push"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

PROJECT_DIR="/Users/jamilyakasai/Documents/manual-buildd-main"
cd $PROJECT_DIR

# ============================================
# STEP 1: CLEANUP
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 STEP 1: Cleaning up heavy files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Remove from git tracking
git rm -r --cached DockerDesktop/ 2>/dev/null || echo "DockerDesktop not in git"
git rm -r --cached google-cloud-sdk/ 2>/dev/null || echo "google-cloud-sdk not in git"
git rm -r --cached .next/ 2>/dev/null || echo ".next not in git"
git rm -r --cached node_modules/ 2>/dev/null || echo "node_modules not in git"
git rm -r --cached .vscode/ 2>/dev/null || echo ".vscode not in git"
git rm -r --cached .cursor/ 2>/dev/null || echo ".cursor not in git"
find . -name .DS_Store -print0 | xargs -0 git rm -f --cached 2>/dev/null || true

# Delete from disk
echo "Deleting heavy files from disk..."
[ -d "DockerDesktop" ] && rm -rf DockerDesktop/ && echo "✅ Deleted DockerDesktop/ (245GB)"
[ -d "google-cloud-sdk" ] && rm -rf google-cloud-sdk/ && echo "✅ Deleted google-cloud-sdk/"
[ -d ".next" ] && rm -rf .next/ && echo "✅ Deleted .next/"
[ -d "node_modules" ] && rm -rf node_modules/ && echo "✅ Deleted node_modules/"
[ -d ".vscode" ] && rm -rf .vscode/ && echo "✅ Deleted .vscode/"
[ -d ".cursor" ] && rm -rf .cursor/ && echo "✅ Deleted .cursor/"
find . -name .DS_Store -type f -delete && echo "✅ Deleted .DS_Store files"

echo "✅ Cleanup complete!"

# ============================================
# STEP 2: CLOUD RUN SETUP
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 STEP 2: Setting up Cloud Run..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PROJECT_ID="manually-built"
SERVICE_NAME="novalyte-admin"
REGION="us-central1"
SA_NAME="github-actions-deployer"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
KEY_FILE="gcp-sa-key.json"

# Check gcloud
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set project
gcloud config set project $PROJECT_ID

# Enable APIs
echo "Enabling required APIs..."
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  containerregistry.googleapis.com \
  --project=$PROJECT_ID

# Create service account
echo "Creating service account..."
gcloud iam service-accounts create $SA_NAME \
  --display-name="GitHub Actions Deployer" \
  --project=$PROJECT_ID 2>/dev/null || echo "Service account already exists"

# Grant permissions
echo "Granting IAM permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin" \
  --condition=None > /dev/null

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/storage.admin" \
  --condition=None > /dev/null

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser" \
  --condition=None > /dev/null

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/cloudbuild.builds.builder" \
  --condition=None > /dev/null

# Create key
echo "Creating service account key..."
gcloud iam service-accounts keys create $KEY_FILE \
  --iam-account=$SA_EMAIL \
  --project=$PROJECT_ID

echo "✅ Cloud Run setup complete!"

# ============================================
# STEP 3: GIT COMMIT & PUSH
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 STEP 3: Committing and pushing..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Stage all changes
git add -A

# Commit
git commit -m "chore: cleanup and setup Cloud Run auto-deployment

- Remove 245GB+ of unnecessary files
- Setup optimized Dockerfile for Cloud Run
- Add health check API endpoint
- Configure GitHub Actions for auto-deploy
- Update .gitignore for security

Auto-deploys on every push to main branch!" || echo "Nothing to commit"

# Push
git push origin main

echo "✅ Pushed to GitHub!"

# ============================================
# FINAL INSTRUCTIONS
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ SETUP COMPLETE! ✨"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 FINAL STEP: Add GitHub Secret"
echo ""
echo "1. Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions"
echo "2. Click 'New repository secret'"
echo "3. Name: GCP_SA_KEY"
echo "4. Value: Copy EVERYTHING below:"
echo ""
echo "━━━━━━━━━━━━━━ COPY THIS ━━━━━━━━━━━━━━"
cat $KEY_FILE
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "5. Click 'Add secret'"
echo ""
echo "🎉 After adding the secret, every push to 'main' will auto-deploy!"
echo ""
echo "🗑️  IMPORTANT: Delete the key file after setup:"
echo "   rm $KEY_FILE"
echo ""
echo "📊 To restore dependencies later:"
echo "   npm install"
echo ""
