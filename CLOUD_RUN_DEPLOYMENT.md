# Cloud Run Deployment Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Run the setup script
```bash
cd /Users/jamilyakasai/Documents/manual-buildd-main
chmod +x setup-cloud-run.sh
./setup-cloud-run.sh
```

This will:
- ✅ Enable required GCP APIs
- ✅ Create a service account for GitHub Actions
- ✅ Grant necessary permissions
- ✅ Generate a service account key
- ✅ Display the key to copy

### Step 2: Add GitHub Secret

1. Go to your GitHub repo: `Settings` → `Secrets and variables` → `Actions`
2. Click `New repository secret`
3. Name: `GCP_SA_KEY`
4. Value: Paste the entire JSON from the setup script output
5. Click `Add secret`

### Step 3: Push to trigger deployment
```bash
git add .
git commit -m "feat: setup Cloud Run auto-deployment"
git push origin main
```

**That's it!** 🎉 Every push to `main` will now auto-deploy to Cloud Run.

---

## 📋 What's Been Fixed

### 1. Dockerfile ✅
- Multi-stage build for smaller images
- Optimized for Next.js standalone mode
- Proper user permissions
- Cloud Run port 8080

### 2. Health Check API ✅
- Created `/api/health` endpoint
- Returns JSON health status
- Used by Cloud Run health checks

### 3. GitHub Actions Workflow ✅
- Auto-deploy on every push to `main`
- Uses Service Account Key (no WIF needed)
- Builds and pushes to GCR
- Deploys to Cloud Run with proper config

### 4. Next.js Config ✅
- Already has `output: 'standalone'` ✅
- Ready for Docker builds

---

## 🧪 Test Locally First (Optional)

```bash
chmod +x test-docker-build.sh
./test-docker-build.sh
```

Then run:
```bash
docker run -p 8080:8080 novalyte-admin-test:local
```

Visit: http://localhost:8080

---

## 🔧 Manual Deploy (if needed)

```bash
# Build and push
docker build -t gcr.io/manually-built/novalyte-admin:latest .
docker push gcr.io/manually-built/novalyte-admin:latest

# Deploy
gcloud run deploy novalyte-admin \
  --image gcr.io/manually-built/novalyte-admin:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 2Gi \
  --project manually-built
```

---

## 📊 View Deployment

After deployment, get your URL:
```bash
gcloud run services describe novalyte-admin \
  --region us-central1 \
  --format 'value(status.url)'
```

---

## 🔐 Security Notes

- ⚠️ **Delete** `gcp-sa-key.json` after adding to GitHub
- ⚠️ Never commit the key file to git
- ✅ Key is already in `.gitignore`

---

## 🐛 Troubleshooting

### Build fails?
```bash
# Check logs
docker build -t test . --progress=plain

# Or use Cloud Build
gcloud builds submit --tag gcr.io/manually-built/novalyte-admin
```

### Deployment fails?
```bash
# Check Cloud Run logs
gcloud run services logs read novalyte-admin --region us-central1

# Check service status
gcloud run services describe novalyte-admin --region us-central1
```

### GitHub Action fails?
1. Check if `GCP_SA_KEY` secret is set correctly
2. Verify service account has correct permissions
3. Check GitHub Actions logs for specific error

---

## 🎯 Next Steps After First Deployment

1. Add environment variables (if needed):
```bash
gcloud run services update novalyte-admin \
  --update-env-vars "API_KEY=xxx,OTHER_VAR=yyy" \
  --region us-central1
```

2. Set up custom domain:
```bash
gcloud run domain-mappings create \
  --service novalyte-admin \
  --domain your-domain.com \
  --region us-central1
```

3. Configure authentication (optional):
```bash
gcloud run services update novalyte-admin \
  --no-allow-unauthenticated \
  --region us-central1
```
