import { NextResponse } from 'next/server'

export async function GET() {
  const csv = 'metric,value\nTotal Inferences,3421000\nAvg Latency,124ms\n'
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="ai-monitoring-report.csv"',
    },
  })
}

