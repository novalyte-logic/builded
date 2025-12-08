# Cloud Run Deployment Command

## Quick Deploy

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

## Step-by-Step Deployment

### 1. Set Project
```bash
gcloud config set project YOUR_PROJECT_ID
```

### 2. Create Secret (if not exists)
```bash
echo -n "postgresql://user:password@host:5432/database" | \
  gcloud secrets create postgres-connection-string \
    --data-file=- \
    --replication-policy="automatic"
```

### 3. Grant Secret Access
```bash
gcloud secrets add-iam-policy-binding postgres-connection-string \
  --member="serviceAccount:novalyte-mcp-services@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 4. Create Service Account (if not exists)
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

### 5. Deploy
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
  --set-secrets "POSTGRES_CONNECTION_STRING=postgres-connection-string:latest" \
  --service-account novalyte-mcp-services@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### 6. Get Service URL
```bash
gcloud run services describe novalyte-mcp-services \
  --region us-central1 \
  --format 'value(status.url)'
```

### 7. Test Health Endpoint
```bash
SERVICE_URL=$(gcloud run services describe novalyte-mcp-services --region us-central1 --format 'value(status.url)')
curl $SERVICE_URL/health
```

## Environment Variables

| Variable | Source | Description |
|----------|--------|-------------|
| `GOOGLE_CLOUD_PROJECT` | Env var | GCP project ID |
| `BIGQUERY_DATASET` | Env var | BigQuery dataset name |
| `NODE_ENV` | Env var | Environment (production) |
| `POSTGRES_CONNECTION_STRING` | Secret | PostgreSQL connection string |
| `PORT` | Auto-set | Cloud Run sets to 8080 |

## Service Configuration

- **Memory**: 512Mi (adjust if needed)
- **CPU**: 1 (adjust if needed)
- **Timeout**: 300 seconds (5 minutes)
- **Max Instances**: 10 (scale up if needed)
- **Min Instances**: 0 (scale to zero when idle)
- **Concurrency**: Default (80 requests per instance)

## Authentication

The service is deployed with `--allow-unauthenticated` for simplicity. For production, consider:

1. **Remove `--allow-unauthenticated`**
2. **Add authentication**:
```bash
gcloud run services update novalyte-mcp-services \
  --region us-central1 \
  --no-allow-unauthenticated
```

3. **Use service account or API key** for authenticated requests

## Monitoring

View logs:
```bash
gcloud run services logs read novalyte-mcp-services --region us-central1
```

View metrics:
```bash
gcloud run services describe novalyte-mcp-services --region us-central1
```

