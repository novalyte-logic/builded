# Novalyte™ AI "God's Eye" Admin Dashboard

Mission Control for Men's Health AI Platform - Superadmin Intelligence Dashboard

## Overview

This is a complete intelligence system admin dashboard for the Novalyte™ AI ecosystem. It provides comprehensive monitoring and control capabilities for:

- **Patient Intelligence Engine** - Full patient funnel & assessment analytics
- **Men's Clinic Network Intelligence** - Nationwide clinic performance monitoring
- **Marketplace & Vendor Intelligence** - Vendor performance & marketplace demand analytics
- **AI Reasoning & Safety Controls** - AI logs, reasoning chains, and safety override management
- **Revenue Intelligence & Forecasting** - Real-time revenue, forecasts, and leak detection
- **Infrastructure Health Monitoring** - System logs, latency graphs, and uptime monitors

## Features

✅ **Fixed Left-Side Navigation Rail** - Easy access to all system modules
✅ **Dark-Matte Interface** - Professional, high-security aesthetic
✅ **Real-Time Metrics** - Auto-refreshing data every 3-5 seconds
✅ **Status Badges** - Live / Degraded / Offline indicators
✅ **Superadmin Controls** - Full system access with no RBAC restrictions
✅ **Mission Control Aesthetic** - War room-style interface

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
/app
  /ai-core          - AI Reasoning & Safety Controls
  /clinics          - Men's Clinic Network Intelligence
  /health           - Infrastructure Health Monitoring
  /logs             - System Logs
  /marketplace      - Marketplace & Vendor Intelligence
  /patients         - Patient Intelligence Engine
  /revenue          - Revenue Intelligence & Forecasting
  /settings         - Superadmin Settings & Controls
  page.tsx          - System Overview

/components
  Sidebar.tsx       - Fixed navigation sidebar
  MetricCard.tsx    - Reusable metric display component
  StatusBadge.tsx   - Status indicator component
  RealtimeChart.tsx - Real-time streaming charts

/lib
  utils.ts          - Utility functions
```

## Key Pages

### System Overview (`/`)
- Key metrics across all systems
- Real-time charts for patient registrations and revenue
- Core services status
- Recent alerts

### Patients (`/patients`)
- Patient funnel analytics
- Assessment completion rates
- Recent patient activity list
- Full patient search and filtering

### Clinics (`/clinics`)
- Nationwide clinic network status
- Clinic performance metrics
- Patient distribution
- Network alerts

### Marketplace (`/marketplace`)
- Vendor performance tracking
- Top products analytics
- Demand curves
- Sales velocity metrics

### AI Core (`/ai-core`)
- AI module controls (enable/disable)
- Reasoning chain logs
- Safety flag management
- Query volume and latency monitoring

### Revenue (`/revenue`)
- Real-time revenue streams
- Revenue forecasting
- Leak detection
- Transaction analytics

### Logs (`/logs`)
- Complete system activity logs
- Filterable by level and module
- Real-time log streaming
- Export functionality

### System Health (`/health`)
- Component health status
- Latency distribution
- Request volume monitoring
- CPU and memory usage

### Settings (`/settings`)
- System announcements
- AI recalibration controls
- Monitoring and alert configuration
- Maintenance mode

## Technologies

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Real-time chart visualization
- **Lucide React** - Icon library

## Design System

### Colors
- **Dark Background**: `#0a0a0a`
- **Dark Surface**: `#111111`
- **Dark Border**: `#1a1a1a`
- **Primary Blue**: `#3b82f6`
- **Status Live**: `#10b981` (green)
- **Status Degraded**: `#f59e0b` (yellow)
- **Status Offline**: `#ef4444` (red)

### Auto-Refresh
All metrics auto-refresh every 3-5 seconds to provide real-time intelligence.

## Superadmin Access

This dashboard assumes **single operator (superadmin)** access. All features are fully accessible without any role-based access control (RBAC) restrictions.

## License

Proprietary - Novalyte™ AI Platform

