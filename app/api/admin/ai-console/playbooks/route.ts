import { NextRequest, NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';
import { VertexAI } from '@google-cloud/vertexai';
import type { BigQueryResultPayload } from '@/lib/ai-console/types';

type PlaybookRequestBody = {
  key: string; // e.g. "trt_lead_quality_tx_30d"
  params?: Record<string, unknown>;
};

type PlaybookResponsePayload = {
  title: string;
  summary: string;
  insights: string[];
  rawDataPreview?: BigQueryResultPayload;
};

const PLAYBOOKS = {
  trt_lead_quality_tx_30d: {
    title: 'TRT Lead Quality Snapshot (TX) – 30d',
    description: 'Analyzes TRT lead quality in Texas over 30 days',
    bigQuerySql: `
      SELECT
        state,
        city,
        COUNT(*) AS lead_count,
        AVG(age) AS avg_age,
        AVG(BMI) AS avg_bmi,
        COUNTIF(status IN ('QUALIFIED','BOOKED')) AS qualified_count
      FROM \`${process.env.NOVALYTE_GCP_PROJECT}.novalyte_core.leads\`
      WHERE service_line = 'TRT'
        AND state = 'TX'
        AND created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
      GROUP BY state, city
      ORDER BY lead_count DESC
      LIMIT 50;
    `,
    vertexPrompt: `Analyze this TRT lead quality data from Texas over the last 30 days. Provide a summary of lead quality, qualification rates by city, and key insights for improving lead conversion.

Data:
{{data}}

Response format:
- Summary paragraph
- Bullet point insights
- One recommended action`,
  },
  service_line_radar_30d: {
    title: 'Men\'s Health Service-Line Radar – 30d',
    description: 'Radar view of service line performance across states',
    bigQuerySql: `
      SELECT
        state,
        service_line,
        COUNT(*) AS leads,
        COUNTIF(status IN ('QUALIFIED','BOOKED')) AS qualified,
        ROUND(COUNTIF(status IN ('QUALIFIED','BOOKED')) / COUNT(*) * 100, 1) AS conversion_rate
      FROM \`${process.env.NOVALYTE_GCP_PROJECT}.novalyte_core.leads\`
      WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
      GROUP BY state, service_line
      ORDER BY leads DESC
      LIMIT 100;
    `,
    vertexPrompt: `Analyze this men's health service line performance data across states over the last 30 days. Identify top-performing service lines, regional differences, and trends.

Data:
{{data}}

Response format:
- Summary paragraph
- Bullet point insights on top service lines and regional patterns
- One strategic recommendation`,
  },
};

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const user = await getCurrentUser();
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { key }: PlaybookRequestBody = await req.json();

    if (!key || !PLAYBOOKS[key as keyof typeof PLAYBOOKS]) {
      return NextResponse.json({ message: 'Invalid playbook key' }, { status: 400 });
    }

    const playbook = PLAYBOOKS[key as keyof typeof PLAYBOOKS];

    // 1. Run BigQuery
    const bigquery = new BigQuery({
      projectId: process.env.NOVALYTE_GCP_PROJECT,
    });

    const [rows] = await bigquery.query({
      query: playbook.bigQuerySql,
      maximumBytesBilled: '2000000000',
    });

    // Map rows
    const columns = Object.keys(rows[0] || {}).map(name => ({ name, type: 'STRING' }));
    const mappedRows = rows.map((row: any) => {
      const out: Record<string, any> = {};
      columns.forEach(col => {
        out[col.name] = row[col.name];
      });
      return out;
    });

    const rawData: BigQueryResultPayload = {
      columns,
      rows: mappedRows,
      totalRows: rows.length,
      jobId: 'playbook-' + Date.now(),
      executionMs: 0,
    };

    // 2. Feed to Vertex AI
    const vertexAI = new VertexAI({
      project: process.env.NOVALYTE_GCP_PROJECT!,
      location: process.env.NOVALYTE_GCP_LOCATION || 'us-central1',
    });

    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
    });

    const prompt = playbook.vertexPrompt.replace('{{data}}', JSON.stringify(mappedRows, null, 2));
    const result = await generativeModel.generateContent(prompt);
    const aiResponse = result.response.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';

    // Parse AI response into summary and insights
    const lines = aiResponse.split('\n').filter((line: string) => line.trim());
    const summary = lines[0] || 'Analysis complete.';
    const insights = lines.slice(1).map((line: string) => line.replace(/^[-*]\s*/, '')).filter((line: string) => line);

    // Log usage
    console.log(`Playbook executed by user ${user.id}: ${key}`);

    return NextResponse.json({
      title: playbook.title,
      summary,
      insights,
      rawDataPreview: rawData,
    });
  } catch (error: any) {
    console.error('Playbook execution error', error);
    return NextResponse.json(
      {
        message: 'Playbook execution failed',
        code: error.code,
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// Helper
async function getCurrentUser() {
  return { id: 'mock-user', role: 'SUPERADMIN' };
}
