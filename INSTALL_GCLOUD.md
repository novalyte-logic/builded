# Install Google Cloud SDK

## Quick Install (macOS)

### Option 1: Using curl (Recommended)
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

### Option 2: Using Homebrew
```bash
brew install --cask google-cloud-sdk
gcloud init
```

### Option 3: Manual Download
1. Visit: https://cloud.google.com/sdk/docs/install
2. Download the macOS installer
3. Run the installer
4. Run `gcloud init`

## After Installation

1. **Authenticate:**
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

2. **Set Project:**
   ```bash
   gcloud config set project manually-built
   ```

3. **Enable Required APIs:**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

4. **Deploy:**
   ```bash
   ./deploy-to-cloud-run.sh
   ```

## Verify Installation

```bash
gcloud --version
gcloud config list
```

## Troubleshooting

- If `gcloud` command not found, add to PATH:
  ```bash
  export PATH=$PATH:~/google-cloud-sdk/bin
  echo 'export PATH=$PATH:~/google-cloud-sdk/bin' >> ~/.zshrc
  ```
