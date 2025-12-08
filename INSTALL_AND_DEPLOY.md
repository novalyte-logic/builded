# Install Google Cloud SDK and Deploy

## Step 1: Install Google Cloud SDK

### macOS Installation

**Option A: Using Homebrew (Recommended)**
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Google Cloud SDK
brew install --cask google-cloud-sdk
```

**Option B: Manual Installation**
```bash
# Download and install
curl https://sdk.cloud.google.com | bash

# Restart your shell or run:
exec -l $SHELL
```

## Step 2: Initialize and Authenticate

```bash
# Initialize gcloud
gcloud init

# Or manually authenticate
gcloud auth login
gcloud auth application-default login

# Set the project
gcloud config set project manually-built
```

## Step 3: Enable Required APIs

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

## Step 4: Deploy to Cloud Run

```bash
cd /Users/jamilyakasai/Documents/manual-buildd-main

# Deploy using the script
chmod +x deploy-cloud-run.sh
./deploy-cloud-run.sh
```

**OR manually:**

```bash
gcloud run deploy novalyte-gods-eye-dashboard \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0 \
  --set-env-vars "NODE_ENV=production,GOOGLE_CLOUD_PROJECT=manually-built"
```

## Step 5: Get Service URL

```bash
gcloud run services describe novalyte-gods-eye-dashboard \
  --region us-central1 \
  --format 'value(status.url)'
```

## Quick Install Script

Run this to install gcloud and prepare for deployment:

```bash
# Install Homebrew (if needed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Google Cloud SDK
brew install --cask google-cloud-sdk

# Initialize
gcloud init
gcloud auth application-default login
gcloud config set project manually-built

# Enable APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Deploy
cd /Users/jamilyakasai/Documents/manual-buildd-main
./deploy-cloud-run.sh
```

