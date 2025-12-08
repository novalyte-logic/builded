'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  LogOut,
  Store,
  Shield,
  Sliders,
  Briefcase,
  Code2,
} from 'lucide-react'
import clsx from 'clsx'
import TooltipInfoModal from './TooltipInfoModal'

type NavItem = {
  name: string
  href: string
  icon: typeof LayoutDashboard
  description: string
  howTo: string
  examples: string[]
}

type NavGroup = {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: 'Core Platform',
    items: [
      {
        name: 'System Overview',
        href: '/',
        icon: LayoutDashboard,
        description: 'Real-time mission control dashboard for the entire Novalyte AI platform',
        howTo:
          "Monitor key metrics, system health, and live data streams. Use this as your central command center to get a bird&apos;s eye view of all platform operations.",
        examples: [
          'Track patient registrations in real-time',
          'Monitor AI query processing rates',
          'View system health and uptime metrics',
        ],
      },
      {
        name: 'Patients',
        href: '/patients',
        icon: Users,
        description: 'Comprehensive patient database with AI-powered insights and segmentation',
        howTo:
          'View patient records, analyze cohorts by treatment goals, and track engagement metrics. Filter by demographics, LTV predictions, or risk levels.',
        examples: [
          'Identify high-value patient segments',
          'Track patient journey progression',
          'Monitor engagement and retention rates',
        ],
      },
      {
        name: 'Assessments',
        href: '/assessments',
        icon: FileText,
        description: 'AI-driven patient assessment queue with automated risk scoring and LTV prediction',
        howTo:
          'Review incoming assessments, approve AI-generated summaries, and monitor completion rates. The AI analyzes responses to predict patient outcomes.',
        examples: [
          'Process new patient assessments',
          'Review AI risk classifications',
          'Track assessment completion metrics',
        ],
      },
      {
        name: 'Leads',
        href: '/leads',
        icon: Users,
        description: 'Lead management system with full context view and conversion tracking',
        howTo:
          'Access complete lead histories including messages, interactions, and AI context. Track conversion funnel and optimize lead nurturing strategies.',
        examples: [
          'View lead interaction timelines',
          'Analyze conversion patterns',
          'Monitor lead quality by acquisition channel',
        ],
      },
      {
        name: 'Clinics',
        href: '/clinics',
        icon: Building2,
        description: 'Clinic network management with performance analytics and AI insights',
        howTo:
          'Monitor clinic performance, no-show rates, and revenue metrics. Identify top performers and areas needing improvement.',
        examples: [
          'Track clinic-level KPIs',
          'Analyze appointment fulfillment rates',
          'Review AI-generated performance insights',
        ],
      },
      {
        name: 'Clinics Control',
        href: '/clinics-control',
        icon: Building2,
        description: 'Administrative control panel for clinic onboarding and configuration',
        howTo:
          'Add new clinics, edit clinic details, manage service offerings, and configure operational parameters.',
        examples: ['Onboard new clinic partners', 'Update clinic service catalogs', 'Manage clinic contact information'],
      },
      {
        name: 'Marketplace',
        href: '/marketplace',
        icon: ShoppingBag,
        description: 'Product catalog with category-based organization and performance tracking',
        howTo:
          'Browse product inventory, monitor sales by category, and track product performance metrics across the marketplace.',
        examples: ['View product catalog by category', 'Monitor top-selling products', 'Analyze category performance trends'],
      },
    ],
  },
  {
    title: 'Marketplace Engine',
    items: [
      {
        name: 'Marketplace Control',
        href: '/marketplace-control',
        icon: ShoppingBag,
        description: 'Product management system for adding and editing marketplace inventory',
        howTo:
          'Create new products, update pricing and descriptions, manage inventory levels, and configure product attributes.',
        examples: [
          'Add new treatment products',
          'Update product pricing and descriptions',
          'Manage product categories and tags',
        ],
      },
      {
        name: 'Marketplace AI Engine',
        href: '/marketplace-optimization',
        icon: Sparkles,
        description: 'AI-powered marketplace optimization with real-time recommendations',
        howTo:
          'Review live performance metrics and AI-generated optimization suggestions. Implement pricing, bundling, and inventory recommendations.',
        examples: [
          'Apply AI pricing recommendations',
          'Optimize product positioning',
          'Implement dynamic bundling strategies',
        ],
      },
      {
        name: 'Vendor Supply Grade',
        href: '/vendors',
        icon: Store,
        description: 'Vendor scorecard system with AI-analyzed supply chain reliability metrics',
        howTo:
          'Monitor vendor performance grades, supply stability, and fulfillment metrics. Use AI insights to optimize vendor relationships.',
        examples: [
          'Evaluate vendor reliability scores',
          'Track supply chain health',
          'Identify at-risk vendor relationships',
        ],
      },
    ],
  },
  {
    title: 'Workforce',
    items: [
      {
        name: 'Workforce Exchange',
        href: '/workforce-exchange',
        icon: Briefcase,
        description: 'Practitioner marketplace connecting clinics with healthcare professionals',
        howTo:
          'Manage practitioner listings, process clinic booking requests, and monitor AI-powered matching results.',
        examples: [
          'Review practitioner availability',
          'Process clinic booking requests',
          'Monitor match quality scores',
        ],
      },
      {
        name: 'Workforce',
        href: '/admin/workforce',
        icon: Briefcase,
        description: 'Staffing demand and top practitioner matches across TRT, Weight Loss, and IV therapy',
        howTo:
          'Review clinic staffing requests, inspect top matches, and prioritize placements by role and region.',
        examples: [
          'See open staffing requests by state',
          'Evaluate best-fit practitioners',
          'Plan outreach for high-match candidates',
        ],
      },
      {
        name: 'Workforce Intelligence',
        href: '/workforce-intelligence',
        icon: Brain,
        description: 'AI-driven workforce analytics with demand forecasting and deployment optimization',
        howTo:
          'Analyze workforce supply/demand dynamics, review AI deployment recommendations, and track revenue per practitioner.',
        examples: [
          'Forecast workforce demand by role',
          'Optimize practitioner deployment',
          'Identify high-opportunity markets',
        ],
      },
    ],
  },
  {
    title: 'Intelligence & Growth',
    items: [
      {
        name: 'AI Core',
        href: '/ai-core',
        icon: Brain,
        description: 'Central AI reasoning engine powering strategic decisions across the platform',
        howTo:
          'Monitor AI model performance, review reasoning outputs, and track confidence scores for automated decisions.',
        examples: [
          'Audit AI decision reasoning',
          'Monitor model prediction accuracy',
          'Review confidence distributions',
        ],
      },
      {
        name: 'AI Monitoring',
        href: '/ai-monitoring',
        icon: Eye,
        description: 'Real-time AI inference monitoring with input signal tracking',
        howTo:
          'Monitor all AI model invocations, track input data quality, and debug inference issues in real-time.',
        examples: ['Track AI query volumes', 'Monitor inference latency', 'Debug model prediction issues'],
      },
      {
        name: 'AI Console',
        href: '/admin/ai-console',
        icon: Code2,
        description: 'Data & AI Console for BigQuery queries and Vertex AI experimentation',
        howTo:
          'Run admin-only BigQuery SQL, inspect results, and chat with Vertex AI from a single console.',
        examples: ['Execute internal SQL', 'Test Vertex prompts', 'Inspect analytics data quickly'],
      },
      {
        name: 'Demand & Opportunities',
        href: '/admin/insights/demand',
        icon: Target,
        description: 'Regional demand radar and opportunity ranking across TRT, Weight Loss, and IV Therapy',
        howTo:
          'Monitor where demand is surging, how supply compares, and prioritize outbound focus by state/service line.',
        examples: [
          'Identify top opportunity states',
          'Compare search interest vs clinic supply',
          'Plan outbound for underpenetrated regions',
        ],
      },
      {
        name: 'Growth Loop',
        href: '/growth-loop',
        icon: Repeat,
        description: 'Multi-phase growth engine tracking viral coefficients and network effects',
        howTo:
          'Monitor each phase of the growth loop, track viral metrics, and optimize for compounding user acquisition.',
        examples: ['Track viral coefficient trends', 'Monitor loop phase health', 'Optimize referral mechanics'],
      },
      {
        name: 'Market Domination',
        href: '/market-domination',
        icon: Target,
        description: 'Strategic market analysis with AI-identified expansion opportunities',
        howTo:
          'Analyze market coverage, identify underserved segments, and prioritize expansion opportunities based on AI scoring.',
        examples: ['Identify market gaps', 'Prioritize expansion targets', 'Track competitive positioning'],
      },
      {
        name: 'AI Intelligence',
        href: '/ai-intelligence',
        icon: Sparkles,
        description: 'Platform-wide AI insights aggregated from all intelligence modules',
        howTo:
          'Access consolidated AI recommendations, cross-module insights, and strategic intelligence reports.',
        examples: [
          'Review cross-platform insights',
          'Access strategic AI recommendations',
          'Monitor intelligence quality',
        ],
      },
      {
        name: 'Platform Intelligence',
        href: '/intelligence',
        icon: Brain,
        description: 'Unified intelligence layer combining data from all platform subsystems',
        howTo:
          'Access aggregated platform metrics, AI-powered trend analysis, and predictive insights across all modules.',
        examples: ['View unified platform metrics', 'Access predictive analytics', 'Monitor cross-system trends'],
      },
      {
        name: 'Communication Hub',
        href: '/communication',
        icon: MessageSquare,
        description: 'Centralized message management with thread tracking and AI context',
        howTo:
          'View all platform communications, track message threads, and access AI-generated conversation context.',
        examples: ['Manage message threads', 'Track communication history', 'Access conversation analytics'],
      },
      {
        name: 'Investor Board',
        href: '/investor-board',
        icon: BarChart3,
        description: 'Executive dashboard with AI-generated narratives for stakeholder reporting',
        howTo:
          'Access investor-ready metrics, AI-generated performance narratives, and forward-looking forecasts.',
        examples: ['Generate investor reports', 'Review growth projections', 'Access executive summaries'],
      },
    ],
  },
  {
    title: 'Revenue & Ads',
    items: [
      {
        name: 'Revenue',
        href: '/revenue',
        icon: DollarSign,
        description: 'Revenue analytics with leak detection and optimization opportunities',
        howTo:
          'Track revenue streams, identify leakage points, and monitor conversion economics across the funnel.',
        examples: ['Analyze revenue by channel', 'Detect revenue leakage', 'Optimize conversion economics'],
      },
      {
        name: 'Ads Intelligence',
        href: '/ads-intelligence',
        icon: TrendingUp,
        description: 'Advertising performance analytics across all marketing channels',
        howTo:
          'Monitor ad spend efficiency, track ROAS by platform, and analyze creative performance metrics.',
        examples: ['Compare platform performance', 'Track cost per acquisition', 'Analyze creative effectiveness'],
      },
      {
        name: 'Budget Auto-Scaling',
        href: '/budget-autoscaling',
        icon: Zap,
        description: 'AI-powered budget allocation that automatically scales spend based on performance',
        howTo:
          'Monitor automated budget adjustments, review scaling triggers, and track ROI improvements from dynamic allocation.',
        examples: ['View auto-scaling decisions', 'Track budget reallocation events', 'Monitor performance-driven spend'],
      },
      {
        name: 'Creative Fatigue',
        href: '/creative-fatigue',
        icon: AlertCircle,
        description: 'AI-based creative fatigue detection with performance degradation alerts',
        howTo:
          'Monitor ad creative performance over time, detect fatigue patterns, and receive refresh recommendations.',
        examples: ['Identify fatigued creatives', 'Track engagement decay rates', 'Schedule creative refreshes'],
      },
      {
        name: 'Profit Autopilot',
        href: '/profit-autopilot',
        icon: Rocket,
        description: 'Autonomous profit optimization engine with AI-driven strategic actions',
        howTo:
          'Enable autopilot mode to let AI automatically optimize for maximum profitability. Review action logs and override when needed.',
        examples: ['Enable autonomous optimization', 'Review AI action history', 'Monitor profit improvements'],
      },
    ],
  },
  {
    title: 'System & Settings',
    items: [
      {
        name: 'Logs',
        href: '/logs',
        icon: FileText,
        description: 'Real-time system event logs with filtering and search capabilities',
        howTo:
          'Monitor system events, filter by severity or module, and search logs for debugging and audit trails.',
        examples: ['Debug system issues', 'Audit user actions', 'Monitor error patterns'],
      },
      {
        name: 'System Health',
        href: '/health',
        icon: Activity,
        description: 'Infrastructure monitoring with service status and performance metrics',
        howTo:
          'Monitor all system services, track uptime, and receive alerts for degraded performance or outages.',
        examples: ['Check service status', 'Monitor system uptime', 'Track performance metrics'],
      },
      {
        name: 'Compliance & SEC',
        href: '/compliance',
        icon: Shield,
        description: 'Regulatory compliance tracking with AI-powered risk assessment',
        howTo:
          'Monitor compliance events, track audit trails, and review AI-identified risk factors for SEC reporting.',
        examples: ['Track compliance events', 'Review audit logs', 'Monitor regulatory risks'],
      },
      {
        name: 'Control Panel',
        href: '/control-panel',
        icon: Sliders,
        description: 'Master control center for platform-wide feature toggles and settings',
        howTo:
          'Enable or disable features, adjust system parameters, and control platform behavior across all modules.',
        examples: ['Toggle feature flags', 'Adjust system parameters', 'Control module behavior'],
      },
      {
        name: 'Global Settings',
        href: '/global-settings',
        icon: Settings,
        description: 'Platform-wide configuration and integration management',
        howTo:
          'Configure global platform settings, manage API integrations, and set default parameters for all modules.',
        examples: ['Configure API integrations', 'Set global defaults', 'Manage platform credentials'],
      },
      {
        name: 'Settings',
        href: '/settings',
        icon: Settings,
        description: 'User preferences and account configuration',
        howTo:
          'Update your profile, configure notification preferences, and manage account security settings.',
        examples: ['Update profile information', 'Configure notifications', 'Manage security settings'],
      },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-dark-surface border-r border-dark-border flex flex-col h-screen">
      <div className="p-6 border-b border-dark-border flex-shrink-0">
        <h1 className="text-xl font-bold text-white">
          Novalyte<sup className="text-xs text-gray-400">™</sup>
        </h1>
        <p className="text-xs text-gray-500 mt-1">God&apos;s Eye Admin</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
        {navGroups.map((group, groupIndex) => (
          <div key={group.title} className="space-y-1">
            <p className="px-4 text-[11px] tracking-wide text-gray-500 uppercase mt-4 mb-2">
              {group.title}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'text-gray-400 hover:text-white hover:bg-dark-hover'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1">{item.name}</span>
                    <div className="ml-auto">
                      <TooltipInfoModal
                        title={item.name}
                        description={item.description}
                        howTo={item.howTo}
                        examples={item.examples}
                      />
                    </div>
                  </Link>
                </div>
              )
            })}
            {groupIndex !== navGroups.length - 1 && <div className="h-px bg-dark-border my-3" />}
          </div>
        ))}
      </nav>
      
      <div className="p-4 border-t border-dark-border space-y-2 flex-shrink-0">
        <div className="px-4 py-2 bg-dark-accent rounded-lg">
          <p className="text-xs text-gray-400">Superadmin</p>
          <p className="text-sm font-medium text-white mt-1">Active</p>
        </div>
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' })
            window.location.href = '/login'
          }}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
