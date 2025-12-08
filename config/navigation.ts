/**
 * Central Navigation Configuration
 * 
 * Single source of truth for sidebar navigation across the entire Novalyte™ AI | God's Eye Admin Dashboard.
 * 
 * All routes, labels, and groupings are defined here to ensure 100% consistency.
 */

import {
  LayoutDashboard,
  Users,
  Building2,
  ShoppingBag,
  Brain,
  DollarSign,
  FileText,
  Activity,
  Settings,
  Eye,
  TrendingUp,
  Zap,
  AlertCircle,
  Rocket,
  BarChart3,
  Repeat,
  Target,
  Sparkles,
  MessageSquare,
  Store,
  Shield,
  Sliders,
  Briefcase,
  Code2,
  LucideIcon,
} from 'lucide-react'

export interface NavigationItem {
  id: string
  label: string
  href: string
  icon: LucideIcon
  description: string
  howTo: string
  examples: string[]
  badge?: string // e.g., "LIVE"
  groupKey: string // For collapsing/grouping
}

export interface NavigationSection {
  id: string
  label: string
  description?: string
  items: NavigationItem[]
}

/**
 * Complete navigation structure for the God's Eye Admin Dashboard
 */
export const navigationConfig: NavigationSection[] = [
  {
    id: 'core-platform',
    label: 'Core Platform',
    description: 'Core platform functionality and patient management',
    items: [
      {
        id: 'system-overview',
        label: 'System Overview',
        href: '/',
        icon: LayoutDashboard,
        description: 'Real-time mission control dashboard for the entire Novalyte AI platform',
        howTo: "Monitor key metrics, system health, and live data streams. Use this as your central command center to get a bird's eye view of all platform operations.",
        examples: [
          'Track patient registrations in real-time',
          'Monitor AI query processing rates',
          'View system health and uptime metrics',
        ],
        groupKey: 'core-platform',
      },
      {
        id: 'patients',
        label: 'Patients',
        href: '/patients',
        icon: Users,
        description: 'Comprehensive patient database with AI-powered insights and segmentation',
        howTo: 'View patient records, analyze cohorts by treatment goals, and track engagement metrics. Filter by demographics, LTV predictions, or risk levels.',
        examples: [
          'Identify high-value patient segments',
          'Track patient journey progression',
          'Monitor engagement and retention rates',
        ],
        groupKey: 'core-platform',
      },
      {
        id: 'assessments',
        label: 'Assessments',
        href: '/assessments',
        icon: FileText,
        description: 'AI-driven patient assessment queue with automated risk scoring and LTV prediction',
        howTo: 'Review incoming assessments, approve AI-generated summaries, and monitor completion rates. The AI analyzes responses to predict patient outcomes.',
        examples: [
          'Process new patient assessments',
          'Review AI risk classifications',
          'Track assessment completion metrics',
        ],
        groupKey: 'core-platform',
      },
      {
        id: 'leads',
        label: 'Leads',
        href: '/leads',
        icon: Users,
        description: 'Lead management system with full context view and conversion tracking',
        howTo: 'Access complete lead histories including messages, interactions, and AI context. Track conversion funnel and optimize lead nurturing strategies.',
        examples: [
          'View lead interaction timelines',
          'Analyze conversion patterns',
          'Monitor lead quality by acquisition channel',
        ],
        groupKey: 'core-platform',
      },
      {
        id: 'clinics',
        label: 'Clinics',
        href: '/clinics',
        icon: Building2,
        description: 'Clinic network management with performance analytics and AI insights',
        howTo: 'Monitor clinic performance, no-show rates, and revenue metrics. Identify top performers and areas needing improvement.',
        examples: [
          'Track clinic-level KPIs',
          'Analyze appointment fulfillment rates',
          'Review AI-generated performance insights',
        ],
        groupKey: 'core-platform',
      },
      {
        id: 'clinics-control',
        label: 'Clinics Control',
        href: '/clinics-control',
        icon: Building2,
        description: 'Administrative control panel for clinic onboarding and configuration',
        howTo: 'Add new clinics, edit clinic details, manage service offerings, and configure operational parameters.',
        examples: [
          'Onboard new clinic partners',
          'Update clinic service catalogs',
          'Manage clinic contact information',
        ],
        groupKey: 'core-platform',
      },
      {
        id: 'marketplace',
        label: 'Marketplace',
        href: '/marketplace',
        icon: ShoppingBag,
        description: 'Product catalog with category-based organization and performance tracking',
        howTo: 'Browse product inventory, monitor sales by category, and track product performance metrics across the marketplace.',
        examples: [
          'View product catalog by category',
          'Monitor top-selling products',
          'Analyze category performance trends',
        ],
        groupKey: 'core-platform',
      },
    ],
  },
  {
    id: 'marketplace-engine',
    label: 'Marketplace Engine',
    description: 'Marketplace management and optimization tools',
    items: [
      {
        id: 'marketplace-control',
        label: 'Marketplace Control',
        href: '/marketplace-control',
        icon: ShoppingBag,
        description: 'Product management system for adding and editing marketplace inventory',
        howTo: 'Create new products, update pricing and descriptions, manage inventory levels, and configure product attributes.',
        examples: [
          'Add new treatment products',
          'Update product pricing and descriptions',
          'Manage product categories and tags',
        ],
        groupKey: 'marketplace-engine',
      },
      {
        id: 'marketplace-optimization',
        label: 'Marketplace AI Engine',
        href: '/marketplace-optimization',
        icon: Sparkles,
        description: 'AI-powered marketplace optimization with real-time recommendations',
        howTo: 'Review live performance metrics and AI-generated optimization suggestions. Implement pricing, bundling, and inventory recommendations.',
        examples: [
          'Apply AI pricing recommendations',
          'Optimize product positioning',
          'Implement dynamic bundling strategies',
        ],
        groupKey: 'marketplace-engine',
      },
      {
        id: 'vendors',
        label: 'Vendor Supply Grade',
        href: '/vendors',
        icon: Store,
        description: 'Vendor scorecard system with AI-analyzed supply chain reliability metrics',
        howTo: 'Monitor vendor performance grades, supply stability, and fulfillment metrics. Use AI insights to optimize vendor relationships.',
        examples: [
          'Evaluate vendor reliability scores',
          'Track supply chain health',
          'Identify at-risk vendor relationships',
        ],
        groupKey: 'marketplace-engine',
      },
    ],
  },
  {
    id: 'workforce',
    label: 'Workforce',
    description: 'Workforce management and intelligence',
    items: [
      {
        id: 'workforce-exchange',
        label: 'Workforce Exchange',
        href: '/workforce-exchange',
        icon: Briefcase,
        description: 'Practitioner marketplace connecting clinics with healthcare professionals',
        howTo: 'Manage practitioner listings, process clinic booking requests, and monitor AI-powered matching results.',
        examples: [
          'Review practitioner availability',
          'Process clinic booking requests',
          'Monitor match quality scores',
        ],
        groupKey: 'workforce',
      },
      {
        id: 'workforce',
        label: 'Workforce',
        href: '/admin/workforce',
        icon: Briefcase,
        description: 'Staffing demand and top practitioner matches across TRT, Weight Loss, and IV therapy',
        howTo: 'Review clinic staffing requests, inspect top matches, and prioritize placements by role and region.',
        examples: [
          'See open staffing requests by state',
          'Evaluate best-fit practitioners',
          'Plan outreach for high-match candidates',
        ],
        groupKey: 'workforce',
      },
      {
        id: 'workforce-intelligence',
        label: 'Workforce Intelligence',
        href: '/workforce-intelligence',
        icon: Brain,
        description: 'AI-driven workforce analytics with demand forecasting and deployment optimization',
        howTo: 'Analyze workforce supply/demand dynamics, review AI deployment recommendations, and track revenue per practitioner.',
        examples: [
          'Forecast workforce demand by role',
          'Optimize practitioner deployment',
          'Identify high-opportunity markets',
        ],
        groupKey: 'workforce',
      },
    ],
  },
  {
    id: 'intelligence-growth',
    label: 'Intelligence & Growth',
    description: 'AI intelligence, market analysis, and growth tools',
    items: [
      {
        id: 'ai-core',
        label: 'AI Core',
        href: '/ai-core',
        icon: Brain,
        description: 'Central AI reasoning engine powering strategic decisions across the platform',
        howTo: 'Monitor AI model performance, review reasoning outputs, and track confidence scores for automated decisions.',
        examples: [
          'Audit AI decision reasoning',
          'Monitor model prediction accuracy',
          'Review confidence distributions',
        ],
        groupKey: 'intelligence-growth',
      },
      {
        id: 'ai-monitoring',
        label: 'AI Monitoring',
        href: '/ai-monitoring',
        icon: Eye,
        description: 'Real-time AI inference monitoring with input signal tracking',
        howTo: 'Monitor all AI model invocations, track input data quality, and debug inference issues in real-time.',
        examples: [
          'Track AI query volumes',
          'Monitor inference latency',
          'Debug model prediction issues',
        ],
        groupKey: 'intelligence-growth',
      },
      {
        id: 'ai-console',
        label: 'AI Console',
        href: '/admin/ai-console',
        icon: Code2,
        description: 'Data & AI Console for BigQuery queries and Vertex AI experimentation',
        howTo: 'Run admin-only BigQuery SQL, inspect results, and chat with Vertex AI from a single console.',
        examples: [
          'Execute internal SQL',
          'Test Vertex prompts',
          'Inspect analytics data quickly',
        ],
        groupKey: 'intelligence-growth',
      },
      {
        id: 'market-intelligence',
        label: 'Market Intelligence',
        href: '/admin/market-intelligence',
        icon: TrendingUp,
        description: 'Natural language market analysis for demand hotspots and clinic targeting',
        howTo: 'Ask questions about TRT/Weight Loss/IV demand by region, get clinic lists, and receive AI-powered deployment guidance.',
        examples: [
          'Find GLP-1 demand hotspots',
          'List clinics needing TRT patients in Texas',
          'Get guidance on where to deploy ads',
        ],
        groupKey: 'intelligence-growth',
      },
      {
        id: 'dealflow',
        label: 'Dealflow Console',
        href: '/admin/dealflow',
        icon: Target,
        description: 'Turn MCP intelligence into paying clients. Every day: targets + scripts → sales.',
        howTo: 'Export dealflow batches for high-demand regions, get ranked clinics with ready outreach scripts, and track your sales pipeline.',
        examples: [
          'Export TRT clinics in Texas with outreach packs',
          'Track email/LinkedIn/call outreach status',
          'Close 1-2 clinics before December',
        ],
        groupKey: 'intelligence-growth',
      },
      {
        id: 'dealflow-engine',
        label: 'Deal Flow Engine',
        href: '/admin/dealflow-engine',
        icon: Briefcase,
        description: 'Sales command center for signing clinics to Novalyte. Scan, analyze, and generate outreach.',
        howTo: 'Run deal-flow scans by region and service line, view ranked clinics with priority scores, and access AI-generated outreach packs.',
        examples: [
          'Scan TRT clinics in Texas',
          'View clinic funnel weaknesses',
          'Generate email/LinkedIn/call scripts',
        ],
        groupKey: 'intelligence-growth',
      },
      {
        id: 'dealflow-drops',
        label: 'Dealflow Drops',
        href: '/admin/dealflow-drops',
        icon: Rocket,
        description: 'Daily unified intelligence drop combining lead harvesting, market trends, and predictive demand modeling',
        howTo: 'View the daily dealflow drop with hot clinics, market moves, predictive alerts, and actionable recommendations. Refreshes automatically every 24 hours.',
        examples: [
          'Review top 5 clinics to contact today',
          'See market moves for ad deployment',
          'Check predictive alerts for upcoming demand',
        ],
        groupKey: 'intelligence-growth',
      },
      {
        id: 'demand-opportunities',
        label: 'Demand & Opportunities',
        href: '/admin/insights/demand',
        icon: Target,
        description: 'Regional demand radar and opportunity ranking across TRT, Weight Loss, and IV Therapy',
        howTo: 'Monitor where demand is surging, how supply compares, and prioritize outbound focus by state/service line.',
        examples: [
          'Identify top opportunity states',
          'Compare search interest vs clinic supply',
          'Plan outbound for underpenetrated regions',
        ],
        groupKey: 'intelligence-growth',
      },
      {
        id: 'growth-loop',
        label: 'Growth Loop',
        href: '/growth-loop',
        icon: Repeat,
        description: 'Multi-phase growth engine tracking viral coefficients and network effects',
        howTo: 'Monitor each phase of the growth loop, track viral metrics, and optimize for compounding user acquisition.',
        examples: [
          'Track viral coefficient trends',
          'Monitor loop phase health',
          'Optimize referral mechanics',
        ],
        groupKey: 'intelligence-growth',
      },
      {
        id: 'market-domination',
        label: 'Market Domination',
        href: '/market-domination',
        icon: Target,
        description: 'Strategic market analysis with AI-identified expansion opportunities',
        howTo: 'Analyze market coverage, identify underserved segments, and prioritize expansion opportunities based on AI scoring.',
        examples: [
          'Identify market gaps',
          'Prioritize expansion targets',
          'Track competitive positioning',
        ],
        groupKey: 'intelligence-growth',
      },
      {
        id: 'ai-intelligence',
        label: 'AI Intelligence',
        href: '/ai-intelligence',
        icon: Sparkles,
        description: 'Platform-wide AI insights aggregated from all intelligence modules',
        howTo: 'Access consolidated AI recommendations, cross-module insights, and strategic intelligence reports.',
        examples: [
          'Review cross-platform insights',
          'Access strategic AI recommendations',
          'Monitor intelligence quality',
        ],
        groupKey: 'intelligence-growth',
      },
      {
        id: 'platform-intelligence',
        label: 'Platform Intelligence',
        href: '/intelligence',
        icon: Brain,
        description: 'Unified intelligence layer combining data from all platform subsystems',
        howTo: 'Access aggregated platform metrics, AI-powered trend analysis, and predictive insights across all modules.',
        examples: [
          'View unified platform metrics',
          'Access predictive analytics',
          'Monitor cross-system trends',
        ],
        groupKey: 'intelligence-growth',
      },
      {
        id: 'communication',
        label: 'Communication Hub',
        href: '/communication',
        icon: MessageSquare,
        description: 'Centralized message management with thread tracking and AI context',
        howTo: 'View all platform communications, track message threads, and access AI-generated conversation context.',
        examples: [
          'Manage message threads',
          'Track communication history',
          'Access conversation analytics',
        ],
        groupKey: 'intelligence-growth',
      },
      {
        id: 'investor-board',
        label: 'Investor Board',
        href: '/investor-board',
        icon: BarChart3,
        description: 'Executive dashboard with AI-generated narratives for stakeholder reporting',
        howTo: 'Access investor-ready metrics, AI-generated performance narratives, and forward-looking forecasts.',
        examples: [
          'Generate investor reports',
          'Review growth projections',
          'Access executive summaries',
        ],
        groupKey: 'intelligence-growth',
      },
    ],
  },
  {
    id: 'revenue-ads',
    label: 'Revenue & Ads',
    description: 'Revenue analytics and advertising intelligence',
    items: [
      {
        id: 'revenue',
        label: 'Revenue',
        href: '/revenue',
        icon: DollarSign,
        description: 'Revenue analytics with leak detection and optimization opportunities',
        howTo: 'Track revenue streams, identify leakage points, and monitor conversion economics across the funnel.',
        examples: [
          'Analyze revenue by channel',
          'Detect revenue leakage',
          'Optimize conversion economics',
        ],
        groupKey: 'revenue-ads',
      },
      {
        id: 'ads-intelligence',
        label: 'Ads Intelligence',
        href: '/ads-intelligence',
        icon: TrendingUp,
        description: 'Advertising performance analytics across all marketing channels',
        howTo: 'Monitor ad spend efficiency, track ROAS by platform, and analyze creative performance metrics.',
        examples: [
          'Compare platform performance',
          'Track cost per acquisition',
          'Analyze creative effectiveness',
        ],
        groupKey: 'revenue-ads',
      },
      {
        id: 'budget-autoscaling',
        label: 'Budget Auto-Scaling',
        href: '/budget-autoscaling',
        icon: Zap,
        description: 'AI-powered budget allocation that automatically scales spend based on performance',
        howTo: 'Monitor automated budget adjustments, review scaling triggers, and track ROI improvements from dynamic allocation.',
        examples: [
          'View auto-scaling decisions',
          'Track budget reallocation events',
          'Monitor performance-driven spend',
        ],
        groupKey: 'revenue-ads',
      },
      {
        id: 'creative-fatigue',
        label: 'Creative Fatigue',
        href: '/creative-fatigue',
        icon: AlertCircle,
        description: 'AI-based creative fatigue detection with performance degradation alerts',
        howTo: 'Monitor ad creative performance over time, detect fatigue patterns, and receive refresh recommendations.',
        examples: [
          'Identify fatigued creatives',
          'Track engagement decay rates',
          'Schedule creative refreshes',
        ],
        groupKey: 'revenue-ads',
      },
      {
        id: 'profit-autopilot',
        label: 'Profit Autopilot',
        href: '/profit-autopilot',
        icon: Rocket,
        description: 'Autonomous profit optimization engine with AI-driven strategic actions',
        howTo: 'Enable autopilot mode to let AI automatically optimize for maximum profitability. Review action logs and override when needed.',
        examples: [
          'Enable autonomous optimization',
          'Review AI action history',
          'Monitor profit improvements',
        ],
        groupKey: 'revenue-ads',
      },
    ],
  },
  {
    id: 'system-settings',
    label: 'System & Settings',
    description: 'System administration and configuration',
    items: [
      {
        id: 'logs',
        label: 'Logs',
        href: '/logs',
        icon: FileText,
        description: 'Real-time system event logs with filtering and search capabilities',
        howTo: 'Monitor system events, filter by severity or module, and search logs for debugging and audit trails.',
        examples: [
          'Debug system issues',
          'Audit user actions',
          'Monitor error patterns',
        ],
        groupKey: 'system-settings',
      },
      {
        id: 'health',
        label: 'System Health',
        href: '/health',
        icon: Activity,
        description: 'Infrastructure monitoring with service status and performance metrics',
        howTo: 'Monitor all system services, track uptime, and receive alerts for degraded performance or outages.',
        examples: [
          'Check service status',
          'Monitor system uptime',
          'Track performance metrics',
        ],
        groupKey: 'system-settings',
      },
      {
        id: 'compliance',
        label: 'Compliance & SEC',
        href: '/compliance',
        icon: Shield,
        description: 'Regulatory compliance tracking with AI-powered risk assessment',
        howTo: 'Monitor compliance events, track audit trails, and review AI-identified risk factors for SEC reporting.',
        examples: [
          'Track compliance events',
          'Review audit logs',
          'Monitor regulatory risks',
        ],
        groupKey: 'system-settings',
      },
      {
        id: 'control-panel',
        label: 'Control Panel',
        href: '/control-panel',
        icon: Sliders,
        description: 'Master control center for platform-wide feature toggles and settings',
        howTo: 'Enable or disable features, adjust system parameters, and control platform behavior across all modules.',
        examples: [
          'Toggle feature flags',
          'Adjust system parameters',
          'Control module behavior',
        ],
        groupKey: 'system-settings',
      },
      {
        id: 'global-settings',
        label: 'Global Settings',
        href: '/global-settings',
        icon: Settings,
        description: 'Platform-wide configuration and integration management',
        howTo: 'Configure global platform settings, manage API integrations, and set default parameters for all modules.',
        examples: [
          'Configure API integrations',
          'Set global defaults',
          'Manage platform credentials',
        ],
        groupKey: 'system-settings',
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/settings',
        icon: Settings,
        description: 'User preferences and account configuration',
        howTo: 'Update your profile, configure notification preferences, and manage account security settings.',
        examples: [
          'Update profile information',
          'Configure notifications',
          'Manage security settings',
        ],
        groupKey: 'system-settings',
      },
    ],
  },
]

/**
 * Get all navigation items flattened
 */
export function getAllNavigationItems(): NavigationItem[] {
  return navigationConfig.flatMap((section) => section.items)
}

/**
 * Find navigation item by href
 */
export function findNavigationItemByHref(href: string): NavigationItem | undefined {
  return getAllNavigationItems().find((item) => item.href === href)
}

/**
 * Find navigation section containing a given href
 */
export function findNavigationSectionByHref(href: string): NavigationSection | undefined {
  return navigationConfig.find((section) =>
    section.items.some((item) => item.href === href || href.startsWith(`${item.href}/`))
  )
}

