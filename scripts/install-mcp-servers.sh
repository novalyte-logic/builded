#!/bin/bash

# MCP Server Installation Script for Novalyte™ AI Admin Dashboard
# This script installs all required external MCP servers

set -e

echo "🚀 Installing MCP Servers for Novalyte™ AI Admin Dashboard..."
echo ""

# Core Data & Infrastructure
echo "📊 Installing Core Data & Infrastructure servers..."
npm install -g @modelcontextprotocol/server-bigquery
npm install -g @modelcontextprotocol/server-postgres
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-git

# Communication & Activation
echo "📧 Installing Communication & Activation servers..."
npm install -g @modelcontextprotocol/server-gmail
npm install -g @modelcontextprotocol/server-slack
npm install -g @modelcontextprotocol/server-twilio

# Research & Scraping
echo "🔍 Installing Research & Scraping servers..."
npm install -g @modelcontextprotocol/server-web-search
npm install -g @modelcontextprotocol/server-web-fetch

echo ""
echo "✅ All external MCP servers installed!"
echo ""
echo "📝 Next steps:"
echo "1. Configure environment variables in .env.local"
echo "2. Add MCP servers to Cursor Settings (see MCP_SETUP_GUIDE.md)"
echo "3. Restart Cursor to activate servers"
echo ""
echo "🔧 Custom Novalyte MCP servers are already implemented:"
echo "   - novalyte-dealflow-mcp (http://localhost:3000/api/admin/mcp/dealflow)"
echo "   - novalyte-market-intel-mcp (http://localhost:3000/api/admin/mcp/market-intel)"
echo "   - novalyte-workforce-mcp (http://localhost:3000/api/admin/mcp/workforce)"
echo ""

