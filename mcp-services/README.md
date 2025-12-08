# Novalyte MCP Services - Cloud Run Deployment

Cloud Run-ready Express server providing REST API endpoints for Novalyte MCP services.

## Endpoints

### Health Check
```
GET /health
```

### Dealflow Spikes
```
GET /dealflow/spikes?region=Texas&treatment=TRT&days=30&threshold=1.5
```

**Query Parameters:**
- `region` (required): Region to analyze (e.g., "Texas", "Miami, FL")
- `treatment` (optional): Treatment types to filter (array)
- `days` (optional, default: 30): Lookback window (1-365)
- `threshold` (optional, default: 1.5): Spike threshold multiplier (1.0-10.0)

### Market Intelligence Trends
```
GET /market-intel/trends?treatment=TRT&region=ALL&days=90&granularity=weekly
```

**Query Parameters:**
- `treatment` (optional): Treatment types to analyze (array, default: ["ALL"])
- `region` (optional, default: "ALL"): Region filter
- `days` (optional, default: 90): Lookback window (1-730)
- `granularity` (optional, default: "weekly"): "daily" | "weekly" | "monthly"

### Workforce Matches
```
GET /workforce/matches?shiftIds=shift1,shift2&region=Texas&minScore=50
```

**Query Parameters:**
- `shiftIds` (required): Array of shift IDs to match
- `region` (optional): Region filter for staff search
- `minScore` (optional, default: 50): Minimum compatibility score (0-100)

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Google Cloud credentials (ADC)

### Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

3. Set up Application Default Credentials:
```bash
gcloud auth application-default login
```

4. Run development server:
```bash
npm run dev
```

Server will run on `http://localhost:8080`

## Build

```bash
npm run build
```

## Deployment to Cloud Run

### Prerequisites
- Google Cloud SDK installed
- Project configured: `gcloud config set project YOUR_PROJECT_ID`
- Service account with BigQuery and Cloud Run permissions

### Deploy

**Option 1: Using deploy script**
```bash
chmod +x deploy.sh
./deploy.sh production
```

**Option 2: Manual deployment**
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
  --set-env-vars "GOOGLE_CLOUD_PROJECT=your-project-id,BIGQUERY_DATASET=novalyte,NODE_ENV=production" \
  --set-secrets "POSTGRES_CONNECTION_STRING=postgres-connection-string:latest"
```

### Environment Variables

Set via Cloud Run:
- `GOOGLE_CLOUD_PROJECT`: Your GCP project ID
- `BIGQUERY_DATASET`: BigQuery dataset name (default: "novalyte")
- `NODE_ENV`: "production"

Set via Secret Manager:
- `POSTGRES_CONNECTION_STRING`: PostgreSQL connection string

### Service Account

Create service account with required permissions:
```bash
gcloud iam service-accounts create novalyte-mcp-services \
  --display-name="Novalyte MCP Services"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:novalyte-mcp-services@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/bigquery.dataViewer"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:novalyte-mcp-services@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/bigquery.jobUser"
```

## Testing

### Health Check
```bash
curl https://your-service-url.run.app/health
```

### Dealflow Spikes
```bash
curl "https://your-service-url.run.app/dealflow/spikes?region=Texas&days=30"
```

### Market Trends
```bash
curl "https://your-service-url.run.app/market-intel/trends?treatment=TRT&days=90"
```

### Workforce Matches
```bash
curl "https://your-service-url.run.app/workforce/matches?shiftIds=shift1,shift2&minScore=50"
```

## Database Schema

### BigQuery Tables

**demand_signals**
- `region` (STRING)
- `treatment` (STRING)
- `timestamp` (TIMESTAMP)
- `demand_index` (FLOAT)
- `search_volume` (FLOAT)

**trend_data**
- `treatment` (STRING)
- `region` (STRING)
- `timestamp` (TIMESTAMP)
- `search_volume` (FLOAT)
- `demand_index` (FLOAT)

### PostgreSQL Tables

**clinics**
- `id` (UUID)
- `name` (VARCHAR)
- `city` (VARCHAR)
- `state` (VARCHAR)

**shifts**
- `id` (UUID)
- `clinic_id` (UUID)
- `start_time` (TIMESTAMP)
- `end_time` (TIMESTAMP)
- `required_role_type` (VARCHAR)
- `required_skills` (TEXT[])
- `treatment_type` (VARCHAR)

**staff**
- `id` (UUID)
- `display_name` (VARCHAR)
- `role_type` (VARCHAR)
- `skills` (TEXT[])
- `preferred_regions` (TEXT[])
- `city` (VARCHAR)
- `state` (VARCHAR)
- `years_experience` (INTEGER)
- `availability_status` (VARCHAR)

## Architecture

- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: Application Default Credentials (ADC)
- **Database**: BigQuery (analytics) + PostgreSQL (operational)
- **Deployment**: Google Cloud Run
- **Port**: 8080

## Error Handling

All endpoints include:
- Input validation
- Error handling middleware
- Safe parameter parsing
- Structured error responses

## Monitoring

- Health check endpoint for Cloud Run health monitoring
- Structured logging for debugging
- Error tracking via Cloud Logging

