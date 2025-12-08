# Quick Start - Novalyte MCP Services

## 🚀 Ready-to-Paste Deployment

### 1. Install Dependencies
```bash
cd mcp-services
npm install
```

### 2. Set Up Environment
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### 3. Set Up Google Cloud
```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

### 4. Deploy to Cloud Run

**One-Command Deploy:**
```bash
gcloud run deploy novalyte-mcp-services \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0 \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,BIGQUERY_DATASET=novalyte,NODE_ENV=production" \
  --set-secrets "POSTGRES_CONNECTION_STRING=postgres-connection-string:latest"
```

**Or use the deploy script:**
```bash
chmod +x deploy.sh
./deploy.sh production
```

### 5. Test Endpoints

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe novalyte-mcp-services --region us-central1 --format 'value(status.url)')

# Health check
curl $SERVICE_URL/health

# Dealflow spikes
curl "$SERVICE_URL/dealflow/spikes?region=Texas&days=30"

# Market trends
curl "$SERVICE_URL/market-intel/trends?treatment=TRT&days=90"

# Workforce matches
curl "$SERVICE_URL/workforce/matches?shiftIds=shift1,shift2&minScore=50"
```

## 📋 File Structure

```
mcp-services/
├── src/
│   └── server.ts          # Express server with 3 endpoints
├── package.json           # Dependencies + scripts
├── tsconfig.json          # TypeScript configuration
├── Dockerfile             # Cloud Run container
├── deploy.sh              # Deployment script
├── .env.example           # Environment template
├── .dockerignore          # Docker ignore rules
├── .gcloudignore          # GCloud ignore rules
└── README.md              # Full documentation
```

## ✅ What's Included

- ✅ Express.js server with TypeScript
- ✅ 3 REST API endpoints (dealflow, market-intel, workforce)
- ✅ BigQuery integration (ADC authentication)
- ✅ PostgreSQL integration
- ✅ Error handling & validation
- ✅ Health check endpoint
- ✅ Dockerfile for Cloud Run
- ✅ Deployment scripts
- ✅ Environment configuration

## 🔧 Prerequisites

- Node.js 18+
- Google Cloud SDK
- PostgreSQL database
- BigQuery dataset
- Service account with proper permissions

## 📚 Full Documentation

See `README.md` for complete documentation.

