#!/bin/bash

# Cleanup script to remove unnecessary files from git and push to GitHub

echo "🧹 Starting cleanup process..."

# Navigate to project directory
cd /Users/jamilyakasai/Documents/manual-buildd-main

# Remove files from git tracking (but keep them locally if needed)
echo "📦 Removing large files from git tracking..."

# Remove Docker files (245GB!)
if [ -d "DockerDesktop" ]; then
    git rm -r --cached DockerDesktop/ 2>/dev/null || echo "DockerDesktop already removed from git"
fi

# Remove Google Cloud SDK
if [ -d "google-cloud-sdk" ]; then
    git rm -r --cached google-cloud-sdk/ 2>/dev/null || echo "google-cloud-sdk already removed from git"
fi

# Remove .next build folder
if [ -d ".next" ]; then
    git rm -r --cached .next/ 2>/dev/null || echo ".next already removed from git"
fi

# Remove .DS_Store files
find . -name .DS_Store -print0 | xargs -0 git rm -f --cached 2>/dev/null || echo ".DS_Store files already removed"

# Remove IDE folders
if [ -d ".vscode" ]; then
    git rm -r --cached .vscode/ 2>/dev/null || echo ".vscode already removed from git"
fi

if [ -d ".cursor" ]; then
    git rm -r --cached .cursor/ 2>/dev/null || echo ".cursor already removed from git"
fi

# Stage the updated .gitignore
echo "✅ Staging .gitignore..."
git add .gitignore

# Commit the changes
echo "💾 Committing cleanup changes..."
git commit -m "chore: remove unnecessary files (Docker.raw, google-cloud-sdk, build artifacts, IDE configs)

- Remove 245GB Docker.raw file
- Remove google-cloud-sdk (should be installed separately)
- Remove build artifacts (.next)
- Remove IDE config folders (.vscode, .cursor)
- Update .gitignore to prevent future commits of these files"

# Pull latest changes from main
echo "⬇️  Pulling latest changes from main..."
git pull origin main --rebase || {
    echo "⚠️  Pull failed. You may need to resolve conflicts manually."
    exit 1
}

# Push to GitHub
echo "⬆️  Pushing to GitHub main..."
git push origin main || {
    echo "⚠️  Push failed. Please check your credentials and try again."
    exit 1
}

echo "✨ Cleanup complete! Your repository is now much cleaner."
echo "📊 Check your GitHub repository to confirm the changes."
