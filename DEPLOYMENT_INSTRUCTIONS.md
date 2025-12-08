# Cloud Run Deployment Instructions

## Prerequisites

1. **Google Cloud SDK installed**
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # Or download from: https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticate with Google Cloud**
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

3. **Set Project**
   ```bash
   gcloud config set project manually-built
   ```

## Build Locally (Optional)

```bash
npm install
npm run build
```

## Deploy to Cloud Run

### Option 1: Using the deployment script

```bash
chmod +x deploy-cloud-run.sh
./deploy-cloud-run.sh
```

### Option 2: Manual deployment

```bash
# Set project
gcloud config set project manually-built

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Build and deploy
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

## After Deployment

Get the service URL:
```bash
gcloud run services describe novalyte-gods-eye-dashboard \
  --region us-central1 \
  --format 'value(status.url)'
```

Test the deployment:
```bash
SERVICE_URL=$(gcloud run services describe novalyte-gods-eye-dashboard --region us-central1 --format 'value(status.url)')
curl $SERVICE_URL
```

## Environment Variables

The following environment variables are set automatically:
- `NODE_ENV=production`
- `GOOGLE_CLOUD_PROJECT=manually-built`
- `PORT=8080` (set by Cloud Run)

## Service Configuration

- **Memory**: 2Gi
- **CPU**: 2
- **Timeout**: 300 seconds (5 minutes)
- **Max Instances**: 10
- **Min Instances**: 0 (scales to zero when idle)
- **Region**: us-central1

## Monitoring

View logs:
```bash
gcloud run services logs read novalyte-gods-eye-dashboard --region us-central1
```

View service details:
```bash
gcloud run services describe novalyte-gods-eye-dashboard --region us-central1
```

