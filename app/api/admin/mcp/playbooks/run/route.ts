import { NextRequest, NextResponse } from 'next/server'
import { bigquery } from '@/lib/bigquery/client'
import { findPlaybook, findPreset, findMacro } from '@/lib/console/playbooks'
import type { BigQueryPreset } from '@/lib/console/presets'
import { runVertexChatConversation } from '@/lib/vertex-ai/service'

const MAX_ROWS_CAP = 1000

type BigQueryColumn = {
  name: string
  type: string
}

function stripLeadingNoise(sql: string) {
  const withoutBlock = sql.replace(/\/\*[\s\S]*?\*\//g, '')
  const withoutLine = withoutBlock.replace(/--[^\n]*/g, '')
  return withoutLine.trim()
}

function isReadOnly(sql: string) {
  const cleaned = stripLeadingNoise(sql)
  const normalized = cleaned.toUpperCase()
  return normalized.startsWith('SELECT') || normalized.startsWith('WITH')
}

function dateRangeToDays(range?: '7d' | '30d' | '90d') {
  if (range === '7d') return 7
  if (range === '90d') return 90
  return 30
}

function renderTemplate(sql: string, preset: BigQueryPreset, dataset: string, params: Record<string, any>) {
  const replacements: Record<string, string> = {
    '{{dataset}}': dataset,
    '{{serviceLine}}': params.serviceLine || preset.defaultParams?.serviceLine || 'TRT',
    '{{state}}': params.state || preset.defaultParams?.state || 'TX',
    '{{dateRangeDays}}': String(
      dateRangeToDays(params.dateRange || preset.defaultParams?.dateRange || '30d')
    ),
    '{{maxRows}}': String(
      Math.min(
        Math.max(params.maxRows || preset.defaultParams?.maxRows || 200, 1),
        MAX_ROWS_CAP
      )
    ),
  }

  let output = sql
  Object.entries(replacements).forEach(([key, value]) => {
    output = output.replace(new RegExp(key, 'g'), value)
  })
  return output
}

function serializeRows(rows: any[], limit = 50) {
  try {
    return JSON.stringify(rows.slice(0, limit), null, 2)
  } catch {
    return '[]'
  }
}

export async function POST(req: NextRequest) {
  try {
    const { playbookId } = (await req.json()) as { playbookId?: string }
    if (!playbookId) {
      return NextResponse.json({ error: 'playbookId is required' }, { status: 400 })
    }

    const playbook = findPlaybook(playbookId)
    if (!playbook) {
      return NextResponse.json({ error: 'Playbook not found' }, { status: 404 })
    }

    const preset = findPreset(playbook.bigQueryPresetId)
    const macro = findMacro(playbook.vertexMacroId)

    if (!preset || !macro) {
      return NextResponse.json({ error: 'Playbook configuration incomplete' }, { status: 400 })
    }

    const defaultDataset =
      process.env.BQ_DEFAULT_DATASET ||
      process.env.BIGQUERY_DATASET_ID ||
      process.env.INTERNAL_ANALYTICS_DATASET ||
      'novalyte_core'

    const sql = renderTemplate(
      preset.sqlTemplate,
      preset,
      defaultDataset,
      playbook.params || {}
    )

    if (!isReadOnly(sql)) {
      return NextResponse.json(
        { error: 'Only read-only SELECT/WITH queries are allowed.' },
        { status: 400 }
      )
    }

    const clampedMaxRows = Math.min(
      Math.max(playbook.params?.maxRows || preset.defaultParams?.maxRows || 200, 1),
      MAX_ROWS_CAP
    )

    const queryOptions: any = {
      query: sql,
      useLegacySql: false,
      location: process.env.BIGQUERY_REGION || 'us-west1',
      maxResults: clampedMaxRows,
    }
    queryOptions.defaultDataset = { datasetId: defaultDataset }

    let bqResult: {
      columns: BigQueryColumn[]
      rows: any[]
      totalRows: number
      executionMs?: number
    }

    try {
      const [job] = await bigquery.createQueryJob(queryOptions)
      const [rows, , queryResponse] = await job.getQueryResults({
        maxResults: queryOptions.maxResults,
      })
      const [metadata] = await job.getMetadata()

      const columns: BigQueryColumn[] =
        queryResponse?.schema?.fields?.map((field: any) => ({
          name: field.name,
          type: field.type,
        })) || []

      const totalRows = queryResponse?.totalRows ? Number(queryResponse.totalRows) : rows.length

      const stats = metadata?.statistics?.query
      const executionMs =
        stats?.startTime && stats?.endTime
          ? Number(stats.endTime) - Number(stats.startTime)
          : undefined

      bqResult = {
        columns,
        rows,
        totalRows,
        executionMs,
      }
    } catch (err: any) {
      console.error('Playbook BigQuery failed:', err)
      return NextResponse.json(
        { error: 'BigQuery failed', details: err?.message || 'Unknown error' },
        { status: 500 }
      )
    }

    const dataString = serializeRows(bqResult.rows)
    const userPrompt = macro.userTemplate
      .replace('{{data}}', dataString)
      .replace('{{state}}', playbook.params?.state || preset.defaultParams?.state || 'N/A')
      .replace('{{serviceLine}}', playbook.params?.serviceLine || preset.defaultParams?.serviceLine || 'N/A')
      .replace('{{dateRange}}', playbook.params?.dateRange || preset.defaultParams?.dateRange || '30d')

    let aiSummary = ''
    try {
      const ai = await runVertexChatConversation({
        mode: macro.mode,
        messages: [
          { role: 'system', content: macro.systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      })
      aiSummary = ai.reply
    } catch (err: any) {
      console.error('Playbook Vertex AI failed:', err)
      aiSummary = 'Vertex AI summary unavailable. Please retry or check logs.'
    }

    return NextResponse.json({
      playbookId,
      bigQuery: bqResult,
      aiSummary,
    })
  } catch (error: any) {
    console.error('Playbook run error:', error)
    return NextResponse.json({ error: 'Failed to run playbook' }, { status: 500 })
  }
}

