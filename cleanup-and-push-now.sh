#!/bin/bash

# Simplified version - just cleanup and push, manual Cloud Run setup later

set -e

echo "🧹 CLEANUP & PUSH SCRIPT"
echo "========================"
echo ""
echo "This will:"
echo "  1. ✨ Clean up heavy files (245GB+)"
echo "  2. 📦 Commit and push to GitHub"
echo "  3. ℹ️  Give you instructions for Cloud Run setup"
echo ""

PROJECT_DIR="/Users/jamilyakasai/Documents/manual-buildd-main"
cd $PROJECT_DIR

# ============================================
# STEP 1: CLEANUP
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 STEP 1: Cleaning up heavy files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Remove from git tracking
git rm -r --cached DockerDesktop/ 2>/dev/null || echo "DockerDesktop not in git"
git rm -r --cached google-cloud-sdk/ 2>/dev/null || echo "google-cloud-sdk not in git"
git rm -r --cached .next/ 2>/dev/null || echo ".next not in git"
git rm -r --cached node_modules/ 2>/dev/null || echo "node_modules not in git"
git rm -r --cached .vscode/ 2>/dev/null || echo ".vscode not in git"
git rm -r --cached .cursor/ 2>/dev/null || echo ".cursor not in git"
find . -name .DS_Store -print0 | xargs -0 git rm -f --cached 2>/dev/null || true

# Delete from disk
echo "Deleting heavy files from disk..."
[ -d "DockerDesktop" ] && rm -rf DockerDesktop/ && echo "✅ Deleted DockerDesktop/ (245GB)"
[ -d "google-cloud-sdk" ] && rm -rf google-cloud-sdk/ && echo "✅ Deleted google-cloud-sdk/"
[ -d ".next" ] && rm -rf .next/ && echo "✅ Deleted .next/"
[ -d "node_modules" ] && rm -rf node_modules/ && echo "✅ Deleted node_modules/"
[ -d ".vscode" ] && rm -rf .vscode/ && echo "✅ Deleted .vscode/"
[ -d ".cursor" ] && rm -rf .cursor/ && echo "✅ Deleted .cursor/"
find . -name .DS_Store -type f -delete && echo "✅ Deleted .DS_Store files"

echo "✅ Cleanup complete!"

# ============================================
# STEP 2: GIT COMMIT & PUSH
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 STEP 2: Committing and pushing..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Stage all changes
git add -A

# Commit
git commit -m "chore: cleanup and setup Cloud Run auto-deployment

- Remove 245GB+ of unnecessary files
- Setup optimized Dockerfile for Cloud Run
- Add health check API endpoint
- Configure GitHub Actions for auto-deploy
- Update .gitignore for security

Ready for Cloud Run deployment!" || echo "Nothing new to commit"

# Push
echo ""
echo "Pushing to GitHub..."
git push origin main

echo "✅ Pushed to GitHub!"

# ============================================
# FINAL INSTRUCTIONS
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ CLEANUP COMPLETE! ✨"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Freed up ~245GB+ of disk space"
echo "🚀 Code pushed to GitHub with Cloud Run configuration"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 NEXT: Setup Cloud Run (2 options)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "OPTION 1: Install gcloud CLI and use automated setup"
echo "------------------------------------------------------"
echo "Run this command:"
echo ""
echo "  chmod +x install-gcloud-and-setup.sh && ./install-gcloud-and-setup.sh"
echo ""
echo ""
echo "OPTION 2: Manual setup (if you prefer)"
echo "---------------------------------------"
echo "1. Install gcloud CLI:"
echo "   brew install --cask google-cloud-sdk"
echo ""
echo "2. Authenticate:"
echo "   gcloud auth login"
echo "   gcloud config set project manually-built"
echo ""
echo "3. Run setup script:"
echo "   chmod +x setup-cloud-run.sh && ./setup-cloud-run.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 TIP: I recommend Option 1 - it does everything automatically!"
echo ""
