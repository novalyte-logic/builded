# MCP Server Installation Guide for Novalyte™ AI Admin Dashboard

This guide will help you install and configure all required MCP (Model Context Protocol) servers for the Novalyte™ AI Admin Dashboard.

## Overview

The Novalyte Admin Dashboard requires the following MCP servers:

### Core Data & Infrastructure
- **BigQuery MCP** - Query demand, intent, marketplace events
- **PostgreSQL MCP** - Read/write clinic, vendor, workforce data
- **Filesystem MCP** - Full codebase refactor control
- **Git MCP** - GitHub repository browsing + PR context

### Communication & Activation
- **Gmail MCP** - Clinic outreach + vendor communication
- **Slack MCP** - Internal alerts: demand spikes, staffing issues
- **Twilio MCP** - Custom-built SMS activation layer

### Research & Scraping
- **Web Search MCP** - Competitor + market research
- **Web Fetch MCP** - Scrape vendor pricing, clinic sites

### Custom Novalyte MCP Servers
- **novalyte-dealflow-mcp** - Daily lead harvesting, market trends, predictive demand
- **novalyte-market-intel-mcp** - Market intelligence and trend analysis
- **novalyte-workforce-mcp** - Workforce exchange and staffing intelligence

---

## Installation Methods

### Method 1: Using Cursor Settings UI (Recommended)

1. **Open Cursor Settings**:
   - Press `Cmd + ,` (Mac) or `Ctrl + ,` (Windows/Linux)
   - Or go to `Cursor` → `Settings`

2. **Navigate to MCP Servers**:
   - Click on `Features` → `Model Context Protocol`
   - Or search for "MCP" in settings

3. **Add Each Server**:
   - Click `+ Add MCP Server`
   - For each server below, use the configuration provided

### Method 2: Manual Configuration File

Cursor reads MCP server configuration from:
- **macOS**: `~/Library/Application Support/Cursor/User/globalStorage/mcp.json`
- **Windows**: `%APPDATA%\Cursor\User\globalStorage\mcp.json`
- **Linux**: `~/.config/Cursor/User/globalStorage/mcp.json`

You can manually edit this file or use the provided `.cursor/mcp-config.json` as a reference.

---

## Server Configurations

### 1. BigQuery MCP

**Purpose**: Query demand, intent, and marketplace events from BigQuery

**Installation**:
```bash
npm install -g @modelcontextprotocol/server-bigquery
```

**Cursor Configuration**:
```json
{
  "name": "bigquery",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-bigquery"],
  "env": {
    "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/your/service-account-key.json",
    "GOOGLE_CLOUD_PROJECT": "your-project-id"
  }
}
```

**Environment Variables**:
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to your Google Cloud service account JSON key
- `GOOGLE_CLOUD_PROJECT`: Your Google Cloud project ID

**Setup**:
1. Create a service account in Google Cloud Console
2. Download the JSON key file
3. Set the path in `GOOGLE_APPLICATION_CREDENTIALS`

---

### 2. PostgreSQL MCP

**Purpose**: Read/write clinic, vendor, and workforce data

**Installation**:
```bash
npm install -g @modelcontextprotocol/server-postgres
```

**Cursor Configuration**:
```json
{
  "name": "postgres",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres"],
  "env": {
    "POSTGRES_CONNECTION_STRING": "postgresql://user:password@localhost:5432/novalyte"
  }
}
```

**Environment Variables**:
- `POSTGRES_CONNECTION_STRING`: Full PostgreSQL connection string

**Setup**:
1. Ensure PostgreSQL is running
2. Create database: `createdb novalyte`
3. Set connection string in environment variable

---

### 3. Filesystem MCP

**Purpose**: Full codebase refactor control

**Installation**:
```bash
npm install -g @modelcontextprotocol/server-filesystem
```

**Cursor Configuration**:
```json
{
  "name": "filesystem",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem"],
  "env": {
    "ALLOWED_DIRECTORIES": "/Users/jamilyakasai/Documents/manual-buildd-main"
  }
}
```

**Environment Variables**:
- `ALLOWED_DIRECTORIES`: Comma-separated list of allowed directories (use `${PWD}` for current directory)

---

### 4. Git MCP

**Purpose**: GitHub repository browsing + PR context

**Installation**:
```bash
npm install -g @modelcontextprotocol/server-git
```

**Cursor Configuration**:
```json
{
  "name": "git",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-git"],
  "env": {
    "GIT_REPO_PATH": "/Users/jamilyakasai/Documents/manual-buildd-main"
  }
}
```

**Environment Variables**:
- `GIT_REPO_PATH`: Path to your Git repository

---

### 5. Gmail MCP

**Purpose**: Clinic outreach + vendor communication

**Installation**:
```bash
npm install -g @modelcontextprotocol/server-gmail
```

**Cursor Configuration**:
```json
{
  "name": "gmail",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-gmail"],
  "env": {
    "GMAIL_CLIENT_ID": "your-client-id",
    "GMAIL_CLIENT_SECRET": "your-client-secret",
    "GMAIL_REFRESH_TOKEN": "your-refresh-token"
  }
}
```

**Environment Variables**:
- `GMAIL_CLIENT_ID`: Google OAuth client ID
- `GMAIL_CLIENT_SECRET`: Google OAuth client secret
- `GMAIL_REFRESH_TOKEN`: OAuth refresh token

**Setup**:
1. Create OAuth credentials in Google Cloud Console
2. Authorize the application
3. Obtain refresh token

---

### 6. Slack MCP

**Purpose**: Internal alerts: demand spikes, staffing issues

**Installation**:
```bash
npm install -g @modelcontextprotocol/server-slack
```

**Cursor Configuration**:
```json
{
  "name": "slack",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-slack"],
  "env": {
    "SLACK_BOT_TOKEN": "xoxb-your-bot-token",
    "SLACK_CHANNEL_ID": "C1234567890"
  }
}
```

**Environment Variables**:
- `SLACK_BOT_TOKEN`: Slack bot token (starts with `xoxb-`)
- `SLACK_CHANNEL_ID`: Default channel ID for notifications

**Setup**:
1. Create a Slack app at https://api.slack.com/apps
2. Install the app to your workspace
3. Copy the bot token
4. Get channel ID from Slack

---

### 7. Twilio MCP

**Purpose**: Custom-built SMS activation layer

**Installation**:
```bash
npm install -g @modelcontextprotocol/server-twilio
```

**Cursor Configuration**:
```json
{
  "name": "twilio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-twilio"],
  "env": {
    "TWILIO_ACCOUNT_SID": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "TWILIO_AUTH_TOKEN": "your-auth-token",
    "TWILIO_PHONE_NUMBER": "+1234567890"
  }
}
```

**Environment Variables**:
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number

**Setup**:
1. Sign up for Twilio account
2. Get Account SID and Auth Token from dashboard
3. Purchase a phone number

---

### 8. Web Search MCP

**Purpose**: Competitor + market research

**Installation**:
```bash
npm install -g @modelcontextprotocol/server-web-search
```

**Cursor Configuration**:
```json
{
  "name": "web-search",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-web-search"],
  "env": {
    "SERPER_API_KEY": "your-serper-api-key"
  }
}
```

**Environment Variables**:
- `SERPER_API_KEY`: Serper API key (get from https://serper.dev)

**Setup**:
1. Sign up at https://serper.dev
2. Get API key from dashboard

---

### 9. Web Fetch MCP

**Purpose**: Scrape vendor pricing, clinic sites

**Installation**:
```bash
npm install -g @modelcontextprotocol/server-web-fetch
```

**Cursor Configuration**:
```json
{
  "name": "web-fetch",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-web-fetch"],
  "env": {}
}
```

**No environment variables required** - works out of the box.

---

### 10. Novalyte Dealflow MCP (Custom)

**Purpose**: Daily lead harvesting, market trends, predictive demand

**Status**: ✅ Already implemented in `/app/api/admin/mcp/dealflow`

**Cursor Configuration**:
```json
{
  "name": "novalyte-dealflow-mcp",
  "type": "http",
  "url": "http://localhost:3000/api/admin/mcp/dealflow",
  "env": {}
}
```

**Setup**:
1. Ensure Next.js dev server is running (`npm run dev`)
2. Server is available at `http://localhost:3000/api/admin/mcp/dealflow`
3. No additional configuration needed

**Available Tools**:
- `export_dealflow_batch`
- `find_mens_clinics_by_region`
- `enrich_clinic_profile`
- `ads_presence_snapshot`
- `market_trends_insights`
- `predict_clinic_demand`
- `predict_region_hotspots`
- `vertex_outreach_brain`
- `vertex_dealflow_ranker`
- `generate_daily_dealflow_snapshot`

---

### 11. Novalyte Market Intel MCP (Custom)

**Purpose**: Market intelligence and trend analysis

**Status**: ✅ Already implemented in `/app/api/admin/mcp/market-intel`

**Cursor Configuration**:
```json
{
  "name": "novalyte-market-intel-mcp",
  "type": "http",
  "url": "http://localhost:3000/api/admin/mcp/market-intel",
  "env": {}
}
```

**Setup**:
1. Ensure Next.js dev server is running (`npm run dev`)
2. Server is available at `http://localhost:3000/api/admin/mcp/market-intel`

**Available Tools**:
- `google_trends_service_interest`
- `bigquery_clinic_search`
- `bigquery_region_demand`
- `ads_intel_clinic_activity`
- `vertex_market_brain`
- `vertex_clinic_outreach_brain`

---

### 12. Novalyte Workforce MCP (Custom)

**Purpose**: Workforce exchange and staffing intelligence

**Status**: ✅ Already implemented in `/app/api/admin/mcp/workforce`

**Cursor Configuration**:
```json
{
  "name": "novalyte-workforce-mcp",
  "type": "http",
  "url": "http://localhost:3000/api/admin/mcp/workforce",
  "env": {}
}
```

**Setup**:
1. Ensure Next.js dev server is running (`npm run dev`)
2. Server is available at `http://localhost:3000/api/admin/mcp/workforce`

**Available Tools**:
- `find_clinic_jobs_by_region`
- `enrich_clinic_from_job`
- `find_nurses_seeking_temp_work`
- `enrich_candidate_fit`
- `generate_workforce_matches`
- `vertex_workforce_outreach_brain`
- `export_workforce_batch`

---

## Quick Installation Script

Create a `.env.local` file in the project root with all required environment variables:

```bash
# BigQuery
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
GOOGLE_CLOUD_PROJECT=your-project-id

# PostgreSQL
POSTGRES_CONNECTION_STRING=postgresql://user:password@localhost:5432/novalyte

# Gmail
GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token

# Slack
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_CHANNEL_ID=C1234567890

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Web Search
SERPER_API_KEY=your-serper-api-key
```

---

## Verification Steps

After installation, verify each MCP server:

1. **Open Cursor Settings** → `Features` → `Model Context Protocol`
2. **Check Server Status**: Each server should show as "Active" or "Connected"
3. **Test Custom Servers**: 
   - Start dev server: `npm run dev`
   - Verify endpoints are accessible:
     - `http://localhost:3000/api/admin/mcp/dealflow`
     - `http://localhost:3000/api/admin/mcp/market-intel`
     - `http://localhost:3000/api/admin/mcp/workforce`
4. **Test Tool Schemas**: In Cursor, try using MCP tools to verify they're accessible

---

## Troubleshooting

### Server Not Connecting

1. **Check Environment Variables**: Ensure all required env vars are set
2. **Check Server Logs**: Look for errors in Cursor's MCP server logs
3. **Verify Installation**: Run `npx -y @modelcontextprotocol/server-<name>` manually
4. **Check Ports**: Ensure ports aren't blocked by firewall

### Custom Servers Not Working

1. **Verify Dev Server**: Ensure `npm run dev` is running
2. **Check API Routes**: Test endpoints in browser or with curl
3. **Check CORS**: Ensure CORS is configured for MCP requests
4. **Check Authentication**: Verify admin authentication is working

### Tool Schemas Not Loading

1. **Restart Cursor**: Sometimes a restart is needed after adding servers
2. **Check Server Type**: Ensure `type: "http"` is set for custom servers
3. **Verify URL**: Ensure URLs are correct and accessible

---

## Next Steps

After installation:

1. ✅ All MCP servers are active
2. ✅ Custom Novalyte servers are accessible
3. ✅ Tool schemas are loaded
4. ✅ Test tools from `/admin/dealflow`, `/admin/market-intelligence`, and `/admin/workforce` pages

---

## Support

For issues with:
- **External MCP Servers**: Check respective npm package documentation
- **Custom Novalyte Servers**: Check `/lib/mcp/` directory for implementation details
- **Cursor Configuration**: Refer to [Cursor MCP Documentation](https://docs.cursor.com/advanced/model-context-protocol)

