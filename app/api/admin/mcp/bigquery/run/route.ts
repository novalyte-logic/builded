import { NextRequest, NextResponse } from 'next/server'
import { bigquery } from '@/lib/bigquery/client'

type BigQueryColumn = {
  name: string
  type: string
}

const MAX_ROWS_CAP = 1000

function stripLeadingNoise(sql: string) {
  // Remove block comments and line comments, then trim
  const withoutBlock = sql.replace(/\/\*[\s\S]*?\*\//g, '')
  const withoutLine = withoutBlock.replace(/--[^\n]*/g, '')
  return withoutLine.trim()
}

function isReadOnly(sql: string) {
  const cleaned = stripLeadingNoise(sql)
  const normalized = cleaned.toUpperCase()
  return normalized.startsWith('SELECT') || normalized.startsWith('WITH')
}

export async function POST(req: NextRequest) {
  try {
    const {
      sql,
      maxRows = 200,
      dataset,
    }: { sql?: string; maxRows?: number; dataset?: string } = await req.json()

    if (!sql || !sql.trim()) {
      return NextResponse.json({ error: 'SQL is required' }, { status: 400 })
    }

    if (!isReadOnly(sql)) {
      return NextResponse.json(
        { error: 'Only read-only SELECT/WITH queries are allowed.' },
        { status: 400 }
      )
    }

    const clampedMaxRows = Math.min(Math.max(Number(maxRows) || 200, 1), MAX_ROWS_CAP)

    const queryOptions: any = {
      query: sql,
      useLegacySql: false,
      location: process.env.BIGQUERY_REGION || 'us-west1',
      maxResults: clampedMaxRows,
    }

    const defaultDataset =
      dataset ||
      process.env.BQ_DEFAULT_DATASET ||
      process.env.BIGQUERY_DATASET_ID ||
      undefined

    if (defaultDataset) {
      queryOptions.defaultDataset = { datasetId: defaultDataset }
    }

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

    return NextResponse.json({
      columns,
      rows,
      totalRows,
      executionMs,
    })
  } catch (error: any) {
    console.error('BigQuery query failed:', error)
    return NextResponse.json(
      { error: 'BigQuery query failed. Check syntax or permissions.' },
      { status: 500 }
    )
  }
}

