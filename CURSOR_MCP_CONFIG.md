# Cursor MCP Server Configuration

This file contains the exact JSON configuration you need to paste into Cursor's MCP settings.

## How to Use

1. Open Cursor Settings (`Cmd + ,` or `Ctrl + ,`)
2. Navigate to `Features` → `Model Context Protocol`
3. Click `+ Add MCP Server` for each server below
4. Copy the JSON configuration for each server

---

## External MCP Servers

### 1. BigQuery MCP

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

### 2. PostgreSQL MCP

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

### 3. Filesystem MCP

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

### 4. Git MCP

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

### 5. Gmail MCP

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

### 6. Slack MCP

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

### 7. Twilio MCP

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

### 8. Web Search MCP

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

### 9. Web Fetch MCP

```json
{
  "name": "web-fetch",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-web-fetch"],
  "env": {}
}
```

---

## Custom Novalyte MCP Servers

### 10. Novalyte Dealflow MCP

```json
{
  "name": "novalyte-dealflow-mcp",
  "type": "http",
  "url": "http://localhost:3000/api/admin/mcp/dealflow",
  "env": {}
}
```

**Status**: ✅ Implemented  
**Location**: `/app/api/admin/mcp/dealflow/route.ts`  
**Tools Available**:
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

### 11. Novalyte Market Intel MCP

```json
{
  "name": "novalyte-market-intel-mcp",
  "type": "http",
  "url": "http://localhost:3000/api/admin/mcp/market-intel",
  "env": {}
}
```

**Status**: ✅ Implemented  
**Location**: `/app/api/admin/mcp/market-intel/route.ts`  
**Tools Available**:
- `google_trends_service_interest`
- `bigquery_clinic_search`
- `bigquery_region_demand`
- `ads_intel_clinic_activity`
- `vertex_market_brain`
- `vertex_clinic_outreach_brain`

### 12. Novalyte Workforce MCP

```json
{
  "name": "novalyte-workforce-mcp",
  "type": "http",
  "url": "http://localhost:3000/api/admin/mcp/workforce",
  "env": {}
}
```

**Status**: ✅ Implemented  
**Location**: `/app/api/admin/mcp/workforce/route.ts`  
**Tools Available**:
- `find_clinic_jobs_by_region`
- `enrich_clinic_from_job`
- `find_nurses_seeking_temp_work`
- `enrich_candidate_fit`
- `generate_workforce_matches`
- `vertex_workforce_outreach_brain`
- `export_workforce_batch`

---

## Installation Steps

### Step 1: Install External MCP Servers

Run the installation script:

```bash
npm run mcp:install
```

Or install manually:

```bash
npm install -g @modelcontextprotocol/server-bigquery
npm install -g @modelcontextprotocol/server-postgres
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-git
npm install -g @modelcontextprotocol/server-gmail
npm install -g @modelcontextprotocol/server-slack
npm install -g @modelcontextprotocol/server-twilio
npm install -g @modelcontextprotocol/server-web-search
npm install -g @modelcontextprotocol/server-web-fetch
```

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in all required environment variables
3. Update paths in Cursor MCP configurations above

### Step 3: Add Servers to Cursor

1. Open Cursor Settings (`Cmd + ,` or `Ctrl + ,`)
2. Go to `Features` → `Model Context Protocol`
3. For each server above:
   - Click `+ Add MCP Server`
   - Paste the JSON configuration
   - Update environment variable paths/values
   - Save

### Step 4: Start Dev Server (for Custom Servers)

```bash
npm run dev
```

This starts the Next.js server on `http://localhost:3000`, making custom MCP servers accessible.

### Step 5: Verify Installation

Run the verification script:

```bash
npm run mcp:verify
```

### Step 6: Restart Cursor

After adding all servers, restart Cursor to activate them.

---

## Verification Checklist

- [ ] All external MCP servers installed globally via npm
- [ ] Environment variables configured in `.env.local`
- [ ] All servers added to Cursor Settings
- [ ] Next.js dev server running (`npm run dev`)
- [ ] Custom MCP endpoints accessible
- [ ] Cursor restarted
- [ ] All servers show as "Active" in Cursor Settings
- [ ] Tool schemas loading correctly

---

## Troubleshooting

### Custom Servers Not Connecting

1. **Check Dev Server**: Ensure `npm run dev` is running
2. **Test Endpoints**: Visit `http://localhost:3000/api/admin/mcp/dealflow` in browser
3. **Check CORS**: Ensure CORS is configured for MCP requests
4. **Check Type**: Ensure `"type": "http"` is set for custom servers

### External Servers Not Working

1. **Check Installation**: Run `npm list -g | grep @modelcontextprotocol`
2. **Check Environment Variables**: Verify all required env vars are set
3. **Check Logs**: Look at Cursor's MCP server logs for errors
4. **Test Manually**: Run `npx -y @modelcontextprotocol/server-<name>` to test

### Tool Schemas Not Loading

1. **Restart Cursor**: Sometimes required after adding servers
2. **Check Server Status**: Ensure servers show as "Active"
3. **Check URL/Command**: Verify URLs and commands are correct
4. **Check Permissions**: Ensure file paths are accessible

---

## Next Steps

Once all servers are installed and configured:

1. ✅ Test tools from `/admin/dealflow` page
2. ✅ Test tools from `/admin/market-intelligence` page  
3. ✅ Test tools from `/admin/workforce` page
4. ✅ Verify tool schemas are accessible in Cursor
5. ✅ Test actual tool calls from admin pages

---

## Support

- **External MCP Servers**: Check npm package documentation
- **Custom Servers**: See `/lib/mcp/` directory for implementation
- **Cursor Configuration**: [Cursor MCP Docs](https://docs.cursor.com/advanced/model-context-protocol)

