#!/bin/bash

# Test local Docker build before deploying

echo "🧪 Testing Docker build locally..."

# Build the image
docker build -t novalyte-admin-test:local .

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 To test locally, run:"
    echo "   docker run -p 8080:8080 novalyte-admin-test:local"
    echo ""
    echo "Then visit: http://localhost:8080"
else
    echo "❌ Build failed!"
    exit 1
fi
