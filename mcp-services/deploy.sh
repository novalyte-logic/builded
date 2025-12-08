#!/bin/bash

# Novalyte MCP Services - Cloud Run Deployment Script
# 
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e

ENVIRONMENT=${1:-production}
SERVICE_NAME="novalyte-mcp-services"
REGION="us-central1"
PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-$(gcloud config get-value project)}

if [ -z "$PROJECT_ID" ]; then
  echo "Error: GOOGLE_CLOUD_PROJECT not set and no default project configured"
  exit 1
fi

echo "🚀 Deploying Novalyte MCP Services to Cloud Run"
echo "   Project: $PROJECT_ID"
echo "   Service: $SERVICE_NAME"
echo "   Region: $REGION"
echo "   Environment: $ENVIRONMENT"
echo ""

# Build and deploy
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0 \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=$PROJECT_ID,BIGQUERY_DATASET=novalyte,NODE_ENV=production" \
  --set-secrets "POSTGRES_CONNECTION_STRING=postgres-connection-string:latest" \
  --service-account novalyte-mcp-services@$PROJECT_ID.iam.gserviceaccount.com \
  --project $PROJECT_ID

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Service URL:"
gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'
echo ""
echo "Test health endpoint:"
echo "curl \$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')/health"

