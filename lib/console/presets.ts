export type ServiceLine = 'TRT' | 'WEIGHT_LOSS' | 'IV_THERAPY'

export interface BigQueryPreset {
  id: string
  name: string
  description: string
  sqlTemplate: string
  defaultParams?: {
    serviceLine?: ServiceLine | 'ALL'
    state?: string
    dateRange?: '7d' | '30d' | '90d'
    maxRows?: number
  }
}

export interface VertexMacro {
  id: string
  name: string
  description: string
  mode: 'DATA_ANALYST' | 'GROWTH_STRATEGIST' | 'EXPERIMENT_BUILDER'
  systemPrompt: string
  userTemplate: string
}

export const BIGQUERY_PRESETS: BigQueryPreset[] = [
  {
    id: 'trt_cohort_tx_30d',
    name: 'TRT Cohort Breakdown — Texas (30d)',
    description: 'Counts TRT leads and qualified leads in Texas by age bracket for last 30 days.',
    sqlTemplate: `
WITH window AS (
  SELECT
    state,
    age_bracket,
    service_line,
    status,
    created_at
  FROM \`{{dataset}}.leads\`
  WHERE service_line = '{{serviceLine}}'
    AND state = '{{state}}'
    AND created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL {{dateRangeDays}} DAY)
)
SELECT
  state,
  age_bracket,
  COUNT(*) AS lead_count,
  COUNTIF(status IN ('QUALIFIED','BOOKED')) AS qualified_count
FROM window
GROUP BY state, age_bracket
ORDER BY lead_count DESC
LIMIT {{maxRows}};
    `,
    defaultParams: {
      serviceLine: 'TRT',
      state: 'TX',
      dateRange: '30d',
      maxRows: 100,
    },
  },
  {
    id: 'service_line_by_state_30d',
    name: 'Service Line Breakdown by State (30d)',
    description: 'Leads and qualified leads by state and service line, last 30 days.',
    sqlTemplate: `
SELECT
  state,
  service_line,
  COUNT(*) AS leads,
  COUNTIF(status IN ('QUALIFIED','BOOKED')) AS qualified
FROM \`{{dataset}}.leads\`
WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL {{dateRangeDays}} DAY)
GROUP BY state, service_line
ORDER BY leads DESC
LIMIT {{maxRows}};
    `,
    defaultParams: {
      dateRange: '30d',
      maxRows: 200,
    },
  },
]

export const VERTEX_MACROS: VertexMacro[] = [
  {
    id: 'summarize_cohort_trt',
    name: 'Summarize TRT Cohort Performance',
    description: 'Explain TRT performance by state and date range with 2–3 takeaways.',
    mode: 'DATA_ANALYST',
    systemPrompt:
      'You are a senior data analyst for Novalyte. Provide concise, data-grounded summaries.',
    userTemplate:
      'You are analyzing TRT performance in {{state}} over {{dateRange}}.\n\nHere is the BigQuery result as JSON:\n\n{{data}}\n\nExplain plainly with 2–3 key takeaways and one recommended action.',
  },
  {
    id: 'summarize_service_line_state',
    name: 'Summarize Service Line by State',
    description: 'Summarize leads/qualified by service line and state.',
    mode: 'DATA_ANALYST',
    systemPrompt:
      'You are a senior data analyst for Novalyte. Summaries should be crisp and actionable.',
    userTemplate:
      'Given this state + service line breakdown for {{dateRange}}:\n\n{{data}}\n\nHighlight the top 3 states, any anomalies, and one action.',
  },
]

