/**
 * Workforce Intelligence Service
 * 
 * AI-powered analysis and recommendations for workforce deployment
 */

import 'server-only'

interface MarketOpportunityInput {
  internalRequests: any[]
  externalJobsFeed: any[]
  practitioners: any[]
}

interface DeploymentInput {
  opportunities: any[]
  availablePractitioners: any[]
  revenueHistory: any[]
}

interface WeeklySummaryInput {
  requests: any[]
  practitioners: any[]
  bookings: any[]
  opportunities: any[]
}

interface AlertsInput {
  currentRequests: any[]
  practitioners: any[]
  historicalRequests: any[]
  opportunities: any[]
}

/**
 * Analyze market opportunities using AI
 * Combines internal demand, external demand, and supply data
 */
export async function analyzeMarketOpportunities(
  input: MarketOpportunityInput
): Promise<any[]> {
  const systemPrompt = `You are a workforce intelligence AI for Novalyte™ AI, a men's health platform staffing marketplace.
Analyze market opportunities by combining internal demand, external job postings, and practitioner supply.
Return JSON array of opportunities with: city, state, metro, topRoles (array), opportunityLevel (Critical/High/Moderate),
internalDemandScore (0-100), externalDemandScore (0-100), supplyScore (0-100), novalyteOpportunityScore (0-100),
avgBillRate (number), recommendation (2-3 sentence text), projectedMonthlyRevenue (optional number).`

  // For now, return mock opportunities with AI-generated recommendations
  // In production, would pass actual data to Gemini
  const mockOpportunities = [
    {
      city: 'Miami',
      state: 'FL',
      metro: 'South Florida',
      topRoles: ['NP', 'PA', 'IV Nurse'],
      opportunityLevel: 'Critical',
      internalDemandScore: 88,
      externalDemandScore: 92,
      supplyScore: 42,
      novalyteOpportunityScore: 95,
      avgBillRate: 145,
      recommendation:
        'Deploy 2-3 temp NPs for TRT/Weight Loss in Miami over the next 30 days. High demand, low local supply, above-average bill rates. External job postings show 45% increase in healthcare staffing needs.',
      projectedMonthlyRevenue: 85000,
    },
    {
      city: 'Los Angeles',
      state: 'CA',
      metro: 'Greater Los Angeles',
      topRoles: ['NP', 'RN', 'MD'],
      opportunityLevel: 'Critical',
      internalDemandScore: 92,
      externalDemandScore: 85,
      supplyScore: 38,
      novalyteOpportunityScore: 93,
      avgBillRate: 155,
      recommendation:
        'Critical shortage of hormone specialists and NPs. Deploy 3-4 practitioners immediately. High bill rates ($150+/hr) justify priority placement fees. Market saturation low despite high demand.',
      projectedMonthlyRevenue: 120000,
    },
    {
      city: 'Dallas',
      state: 'TX',
      metro: 'DFW Metroplex',
      topRoles: ['RN', 'IV Nurse', 'NP'],
      opportunityLevel: 'High',
      internalDemandScore: 75,
      externalDemandScore: 78,
      supplyScore: 55,
      novalyteOpportunityScore: 78,
      avgBillRate: 105,
      recommendation:
        'Strong demand for IV therapy nurses and RNs. Moderate supply but growing gap. Focus on 2-3 IV specialists for immediate deployment. Competitive rates but steady volume.',
      projectedMonthlyRevenue: 65000,
    },
    {
      city: 'Phoenix',
      state: 'AZ',
      metro: 'Phoenix Metro',
      topRoles: ['NP', 'PA'],
      opportunityLevel: 'High',
      internalDemandScore: 72,
      externalDemandScore: 68,
      supplyScore: 48,
      novalyteOpportunityScore: 72,
      avgBillRate: 125,
      recommendation:
        'Growing demand for weight loss and hormone specialists. Deploy 2 NPs over next 45 days. Moderate urgency but strong revenue potential.',
      projectedMonthlyRevenue: 72000,
    },
    {
      city: 'Atlanta',
      state: 'GA',
      metro: 'Metro Atlanta',
      topRoles: ['PA', 'NP'],
      opportunityLevel: 'Moderate',
      internalDemandScore: 65,
      externalDemandScore: 58,
      supplyScore: 52,
      novalyteOpportunityScore: 58,
      avgBillRate: 115,
      recommendation:
        'Steady demand for PAs and NPs in hormone therapy. Balanced market, focus on quality placements over volume. 1-2 practitioners recommended.',
      projectedMonthlyRevenue: 48000,
    },
  ]

  // Generate AI recommendations for each opportunity
  // In production, would call Gemini AI here
  // For now, use mock opportunities with pre-generated recommendations
  const opportunitiesWithAI = mockOpportunities.map((opp) => ({
    ...opp,
    recommendation: opp.recommendation, // In production, would be AI-generated
  }))

  return opportunitiesWithAI
}

/**
 * Generate AI deployment recommendations
 * Optimizes revenue, role mix, and deployment locations
 */
export async function generateDeploymentRecommendations(
  input: DeploymentInput
): Promise<any[]> {
  const systemPrompt = `You are a workforce deployment strategist for Novalyte™ AI.
Generate deployment recommendations optimizing for revenue, role mix, and geographic distribution.
Return JSON array with: city, state, metro, bestRoles (array of {role, recommendedFTE, reasoning}),
totalRecommendedFTE (number), expectedMonthlyRevenue (number), expectedPlacementFees (number),
explanation (2-3 sentence text), priority (High/Medium/Low), deploymentTimeline (string like "30-45 days"),
constraints (array of strings).`

  const mockRecommendations = [
    {
      city: 'Miami',
      state: 'FL',
      metro: 'South Florida',
      bestRoles: [
        {
          role: 'NP',
          recommendedFTE: 2.5,
          reasoning: 'Critical shortage, high TRT/Weight Loss demand, premium rates',
        },
        {
          role: 'IV Nurse',
          recommendedFTE: 1.0,
          reasoning: 'Growing IV therapy market, moderate competition',
        },
      ],
      totalRecommendedFTE: 3.5,
      expectedMonthlyRevenue: 85000,
      expectedPlacementFees: 12750,
      explanation:
        'Based on current demand and supply, allocating 2.5 NPs and 1 IV Nurse to Miami clinics is projected to generate $85,000 in monthly fees. Critical NP shortage with 88+ internal demand score justifies immediate deployment.',
      priority: 'High',
      deploymentTimeline: '30 days',
      constraints: [
        'Practitioners must be bilingual (English/Spanish) preferred',
        'Background checks must be current and verified',
        'Willingness to travel within 50-mile radius',
      ],
    },
    {
      city: 'Los Angeles',
      state: 'CA',
      metro: 'Greater Los Angeles',
      bestRoles: [
        {
          role: 'NP',
          recommendedFTE: 2.0,
          reasoning: 'Highest demand, premium rates, hormone specialist shortage',
        },
        {
          role: 'MD',
          recommendedFTE: 0.5,
          reasoning: 'High-value placements, specialized hormone protocols',
        },
        {
          role: 'RN',
          recommendedFTE: 1.5,
          reasoning: 'Strong demand for clinical support, good availability',
        },
      ],
      totalRecommendedFTE: 4.0,
      expectedMonthlyRevenue: 120000,
      expectedPlacementFees: 18000,
      explanation:
        'Based on current demand and supply, allocating 2 NPs, 0.5 MD, and 1.5 RNs to Los Angeles clinics is projected to generate $120,000 in monthly fees. Highest internal demand (92/100) with lowest supply (38/100) creates premium opportunity.',
      priority: 'High',
      deploymentTimeline: '45 days',
      constraints: [
        'California license required for all practitioners',
        'DEA registration mandatory for prescribing roles',
        'Competitive market, focus on quality over quantity',
      ],
    },
    {
      city: 'Dallas',
      state: 'TX',
      metro: 'DFW Metroplex',
      bestRoles: [
        {
          role: 'IV Nurse',
          recommendedFTE: 2.0,
          reasoning: 'High IV therapy demand, moderate supply, steady volume',
        },
        {
          role: 'RN',
          recommendedFTE: 1.0,
          reasoning: 'Consistent demand for clinical support',
        },
      ],
      totalRecommendedFTE: 3.0,
      expectedMonthlyRevenue: 65000,
      expectedPlacementFees: 9750,
      explanation:
        'Based on current demand and supply, allocating 2 IV nurses and 1 RN to Dallas clinics is projected to generate $65,000 in monthly fees. Strong IV therapy demand (75/100) with moderate supply supports steady deployment.',
      priority: 'Medium',
      deploymentTimeline: '30-45 days',
      constraints: [
        'Texas nursing license required',
        'IV certification strongly preferred',
        'Flexibility for weekend shifts',
      ],
    },
  ]

  // Generate AI explanations for each recommendation
  // In production, would call Gemini AI here
  // For now, use mock recommendations with pre-generated explanations
  const recommendationsWithAI = mockRecommendations.map((rec) => ({
    ...rec,
    explanation: rec.explanation, // In production, would be AI-generated
  }))

  return recommendationsWithAI
}

/**
 * Generate weekly workforce summary in business language
 * Uses Gemini to create human-readable summary
 */
export async function generateWeeklyWorkforceSummary(
  input: WeeklySummaryInput
): Promise<{
  text: string
  keyHighlights: Array<{
    metric: string
    value: string
    trend?: 'up' | 'down' | 'stable'
  }>
  recommendedActions: string[]
}> {
  // Mock data for summary generation
  // In production, would analyze actual data
  
  const mockSummary = {
    text:
      'Demand for temporary NPs in Miami and Dallas has increased 46% this week. You have 12 underutilized NPs within 150 miles who match. Suggest deploying 4 to Miami and 3 to Dallas for highest margin. Based on current demand and supply, allocating 3 IV nurses and 1 NP to Austin clinics is projected to generate $24,000 in monthly fees.',
    keyHighlights: [
      { metric: 'NP Demand Growth', value: '+46%', trend: 'up' as const },
      { metric: 'Underutilized NPs', value: '12 available', trend: 'stable' as const },
      { metric: 'Projected Monthly Fees', value: '$24,000', trend: 'up' as const },
    ],
    recommendedActions: [
      'Deploy 4 NPs to Miami for TRT/Weight Loss coverage',
      'Deploy 3 NPs to Dallas for hormone therapy support',
      'Allocate 3 IV nurses and 1 NP to Austin clinics',
      'Activate idle practitioner pool in South Florida region',
    ],
  }

  // In production, would call Gemini with:
  // const prompt = `Generate a weekly workforce summary in business language based on:
  // - Request trends: ${analyzeTrends(input.requests)}
  // - Practitioner availability: ${analyzeAvailability(input.practitioners)}
  // - Booking patterns: ${analyzeBookings(input.bookings)}
  // - Market opportunities: ${input.opportunities}
  // 
  // Return a 2-3 sentence summary in plain business language, 3 key highlights with metrics, 
  // and 3-5 recommended actions. Keep tone clinical, operational, and revenue-aware.`

  return mockSummary
}

/**
 * Generate workforce alerts based on demand spikes, opportunities, and idle practitioners
 */
export async function generateWorkforceAlerts(
  input: AlertsInput
): Promise<
  Array<{
    id: string
    type: 'demand_spike' | 'high_value_opportunity' | 'idle_practitioners'
    severity: 'critical' | 'high' | 'medium'
    title: string
    message: string
    timestamp: string
    actionable: boolean
    actionItems?: string[]
  }>
> {
  // Mock alerts - in production would analyze actual data
  const mockAlerts = [
    {
      id: 'alert-1',
      type: 'demand_spike' as const,
      severity: 'critical' as const,
      title: 'Demand Spike Detected: Dallas NP Shortage',
      message:
        'ALERT: Surge in temp NP demand in Dallas. 5 urgent requests unfilled > 24 hours. Week-over-week increase of 67%.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      actionable: true,
      actionItems: [
        'Activate 3 available NPs within 100-mile radius',
        'Contact Dallas-area clinics to confirm urgent needs',
        'Consider priority placement fee to accelerate matching',
      ],
    },
    {
      id: 'alert-2',
      type: 'high_value_opportunity' as const,
      severity: 'high' as const,
      title: 'High-Value Opportunity: NYC Locum MDs',
      message:
        'Opportunity: Locum MD shifts in NYC trending at $240/hr with poor coverage. Deploy more MDs.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      actionable: true,
      actionItems: [
        'Reach out to 4 qualified MDs with NYC licenses',
        'Highlight premium rates and consistent demand',
        'Target clinics with highest bill rates first',
      ],
    },
    {
      id: 'alert-3',
      type: 'idle_practitioners' as const,
      severity: 'medium' as const,
      title: 'Idle Practitioner Pool: 12 Underutilized NPs',
      message:
        '12 NPs with high availability scores have 0 placements in last 30 days. Target Miami and Dallas clinics.',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      actionable: true,
      actionItems: [
        'Match idle NPs to open requests in Miami/Dallas',
        'Send personalized outreach highlighting demand',
        'Offer priority placement incentives',
      ],
    },
    {
      id: 'alert-4',
      type: 'demand_spike' as const,
      severity: 'high' as const,
      title: 'Miami IV Nurse Demand Increasing',
      message: 'IV therapy nurse requests in Miami increased 34% week-over-week. 8 requests pending.',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      actionable: true,
      actionItems: ['Activate 2 IV-certified nurses', 'Review pending requests for immediate matching'],
    },
  ]

  // In production, would analyze:
  // 1. Demand spikes: Compare current week requests vs previous week by city/role
  // 2. High-value opportunities: Find cities with high opportunity scores and bill rates
  // 3. Idle practitioners: Find practitioners with availability_score > threshold but 0 bookings in last 30 days

  return mockAlerts
}

