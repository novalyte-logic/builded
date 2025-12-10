#!/bin/bash

# Install gcloud CLI and run master setup

set -e

echo "📦 Installing gcloud CLI..."
echo "=============================="
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "Installing Homebrew first..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install gcloud CLI via Homebrew
echo "Installing gcloud CLI via Homebrew..."
brew install --cask google-cloud-sdk

# Add gcloud to PATH for this session
if [ -f "/opt/homebrew/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/path.bash.inc" ]; then
    source "/opt/homebrew/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/path.bash.inc"
elif [ -f "/usr/local/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/path.bash.inc" ]; then
    source "/usr/local/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/path.bash.inc"
fi

echo "✅ gcloud CLI installed!"
echo ""
echo "🔐 Now you need to authenticate with Google Cloud..."
echo ""

# Initialize gcloud
gcloud init

echo ""
echo "✅ gcloud setup complete!"
echo ""
echo "🚀 Now running the master setup script..."
echo ""

# Run the master setup
cd /Users/jamilyakasai/Documents/manual-buildd-main
chmod +x master-setup.sh
./master-setup.sh
