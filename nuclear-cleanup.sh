#!/bin/bash

# Ultimate cleanup script - removes ALL heavy unnecessary files

echo "🔥 NUCLEAR CLEANUP - Removing all heavy unnecessary files..."

cd /Users/jamilyakasai/Documents/manual-buildd-main

# 1. Remove from git tracking first
echo "📦 Step 1: Removing files from git tracking..."
git rm -r --cached DockerDesktop/ 2>/dev/null || echo "DockerDesktop not in git"
git rm -r --cached google-cloud-sdk/ 2>/dev/null || echo "google-cloud-sdk not in git"
git rm -r --cached .next/ 2>/dev/null || echo ".next not in git"
git rm -r --cached node_modules/ 2>/dev/null || echo "node_modules not in git"
git rm -r --cached .vscode/ 2>/dev/null || echo ".vscode not in git"
git rm -r --cached .cursor/ 2>/dev/null || echo ".cursor not in git"
find . -name .DS_Store -print0 | xargs -0 git rm -f --cached 2>/dev/null || echo ".DS_Store cleaned"

# 2. Delete heavy files from local disk
echo "💣 Step 2: DELETING heavy files from disk..."

# Delete 245GB Docker file
if [ -d "DockerDesktop" ]; then
    echo "Deleting DockerDesktop/ (245GB)..."
    rm -rf DockerDesktop/
    echo "✅ DockerDesktop deleted"
fi

# Delete Google Cloud SDK
if [ -d "google-cloud-sdk" ]; then
    echo "Deleting google-cloud-sdk/..."
    rm -rf google-cloud-sdk/
    echo "✅ google-cloud-sdk deleted"
fi

# Delete .next build folder
if [ -d ".next" ]; then
    echo "Deleting .next/ build folder..."
    rm -rf .next/
    echo "✅ .next deleted"
fi

# Delete node_modules (can be reinstalled)
if [ -d "node_modules" ]; then
    echo "Deleting node_modules/ (can reinstall with npm install)..."
    rm -rf node_modules/
    echo "✅ node_modules deleted"
fi

# Delete IDE folders
if [ -d ".vscode" ]; then
    rm -rf .vscode/
    echo "✅ .vscode deleted"
fi

if [ -d ".cursor" ]; then
    rm -rf .cursor/
    echo "✅ .cursor deleted"
fi

# Delete all .DS_Store files
echo "Cleaning .DS_Store files..."
find . -name .DS_Store -type f -delete
echo "✅ .DS_Store files deleted"

# 3. Add and commit changes
echo "💾 Step 3: Committing changes..."
git add .gitignore
git add -A
git commit -m "chore: remove all heavy unnecessary files

- Removed 245GB Docker.raw file
- Removed google-cloud-sdk
- Removed build artifacts and node_modules
- Removed IDE configs
- Updated .gitignore
- Cleaned .DS_Store files

These can be reinstalled/rebuilt as needed:
- npm install (for node_modules)
- npm run build (for .next)
- gcloud CLI install (for google-cloud-sdk)"

# 4. Pull and push
echo "⬇️  Step 4: Pulling from main..."
git pull origin main --rebase || {
    echo "⚠️  Pull conflict - resolve manually then run: git push origin main"
    exit 1
}

echo "⬆️  Step 5: Pushing to GitHub..."
git push origin main || {
    echo "⚠️  Push failed - check credentials and try: git push origin main"
    exit 1
}

echo ""
echo "✨✨✨ CLEANUP COMPLETE! ✨✨✨"
echo ""
echo "📊 Freed up approximately 245GB+ of disk space"
echo "🚀 Repository is now clean and pushed to GitHub"
echo ""
echo "⚠️  To restore functionality:"
echo "   - Run: npm install (to restore node_modules)"
echo "   - Run: npm run build (to rebuild .next)"
echo ""
