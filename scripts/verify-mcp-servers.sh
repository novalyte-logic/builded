#!/bin/bash

# MCP Server Verification Script
# Verifies that all MCP servers are properly installed and accessible

set -e

echo "🔍 Verifying MCP Server Installation..."
echo ""

# Check external MCP servers
echo "📦 Checking external MCP servers..."

servers=(
  "@modelcontextprotocol/server-bigquery"
  "@modelcontextprotocol/server-postgres"
  "@modelcontextprotocol/server-filesystem"
  "@modelcontextprotocol/server-git"
  "@modelcontextprotocol/server-gmail"
  "@modelcontextprotocol/server-slack"
  "@modelcontextprotocol/server-twilio"
  "@modelcontextprotocol/server-web-search"
  "@modelcontextprotocol/server-web-fetch"
)

for server in "${servers[@]}"; do
  if npm list -g "$server" &>/dev/null; then
    echo "  ✅ $server"
  else
    echo "  ❌ $server (not installed)"
  fi
done

echo ""
echo "🔧 Checking custom Novalyte MCP servers..."

# Check if Next.js dev server is running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "  ✅ Next.js dev server is running on port 3000"
  
  # Test custom endpoints
  echo ""
  echo "  Testing custom MCP endpoints..."
  
  endpoints=(
    "http://localhost:3000/api/admin/mcp/dealflow"
    "http://localhost:3000/api/admin/mcp/market-intel"
    "http://localhost:3000/api/admin/mcp/workforce"
  )
  
  for endpoint in "${endpoints[@]}"; do
    if curl -s -o /dev/null -w "%{http_code}" "$endpoint" | grep -q "200\|400\|405"; then
      echo "    ✅ $endpoint (accessible)"
    else
      echo "    ❌ $endpoint (not accessible)"
    fi
  done
else
  echo "  ⚠️  Next.js dev server is not running"
  echo "     Start it with: npm run dev"
fi

echo ""
echo "📋 Summary:"
echo "  - External servers: Check npm global packages above"
echo "  - Custom servers: Ensure dev server is running and test endpoints"
echo ""
echo "💡 To configure servers in Cursor:"
echo "   1. Open Cursor Settings → Features → Model Context Protocol"
echo "   2. Add each server using configurations from MCP_SETUP_GUIDE.md"
echo "   3. Restart Cursor"
echo ""

