#!/bin/bash
# Deploy Novalyte Dashboard to Cloud Run

set -e

PROJECT_ID="manually-built"
SERVICE_NAME="novalyte-gods-eye-dashboard"
REGION="us-central1"

echo "🚀 Deploying Novalyte Dashboard to Cloud Run..."
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install it first:"
    echo "   macOS: curl https://sdk.cloud.google.com | bash"
    echo "   Or visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set project
echo "📋 Setting GCP project..."
gcloud config set project $PROJECT_ID

# Authenticate (if needed)
echo "🔐 Checking authentication..."
gcloud auth application-default login || echo "⚠️  Authentication may be required"

# Deploy to Cloud Run
echo "📦 Building and deploying..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0 \
  --set-env-vars "NODE_ENV=production,GOOGLE_CLOUD_PROJECT=$PROJECT_ID" \
  --port 3000

echo ""
echo "✅ Deployment complete!"
echo "🌐 Service URL will be displayed above"
