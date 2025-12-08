import type { BigQueryPreset, VertexMacro, ServiceLine } from './presets'
import { BIGQUERY_PRESETS, VERTEX_MACROS } from './presets'

export interface PlaybookDefinition {
  id: string
  name: string
  description: string
  bigQueryPresetId: string
  vertexMacroId: string
  params?: {
    serviceLine?: ServiceLine
    state?: string
    dateRange?: '7d' | '30d' | '90d'
    maxRows?: number
  }
}

export const PLAYBOOKS: PlaybookDefinition[] = [
  {
    id: 'trt_cohort_tx_30d_playbook',
    name: 'TRT Cohort Breakdown – Texas (30d)',
    description: 'Run cohort breakdown for TRT in Texas for the last 30 days and summarize via Vertex AI.',
    bigQueryPresetId: 'trt_cohort_tx_30d',
    vertexMacroId: 'summarize_cohort_trt',
    params: {
      serviceLine: 'TRT',
      state: 'TX',
      dateRange: '30d',
      maxRows: 100,
    },
  },
  {
    id: 'service_line_state_30d_playbook',
    name: 'Service Line vs State (30d)',
    description: 'Summarize leads and qualified leads by state and service line (30d).',
    bigQueryPresetId: 'service_line_by_state_30d',
    vertexMacroId: 'summarize_service_line_state',
    params: {
      dateRange: '30d',
      maxRows: 200,
    },
  },
]

export function findPreset(id: string): BigQueryPreset | undefined {
  return BIGQUERY_PRESETS.find((p) => p.id === id)
}

export function findMacro(id: string): VertexMacro | undefined {
  return VERTEX_MACROS.find((m) => m.id === id)
}

export function findPlaybook(id: string): PlaybookDefinition | undefined {
  return PLAYBOOKS.find((p) => p.id === id)
}

