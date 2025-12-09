import { NextRequest, NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';
import type { BigQueryResultPayload } from '@/lib/ai-console/types';

type BigQueryRequestBody = {
  sql: string;
  dataset?: string; // default "novalyte_core"
  maxRows?: number; // safe cap like 1000
};

const FORBIDDEN_KEYWORDS = ['DELETE', 'DROP', 'TRUNCATE', 'INSERT', 'UPDATE', 'CREATE', 'ALTER'];

function isQuerySafe(sql: string): boolean {
  const upper = sql.toUpperCase();
  return !FORBIDDEN_KEYWORDS.some((kw) => upper.includes(kw));
}

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const user = await getCurrentUser();
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { sql, dataset, maxRows }: BigQueryRequestBody = await req.json();

    if (!sql || typeof sql !== 'string') {
      return NextResponse.json({ message: 'SQL is required' }, { status: 400 });
    }

    if (!isQuerySafe(sql)) {
      return NextResponse.json(
        { message: 'Only read-only SELECT queries are allowed in this console.' },
        { status: 400 }
      );
    }

    const cappedMaxRows = Math.min(maxRows ?? 200, 1000);

    const bigquery = new BigQuery({
      projectId: process.env.NOVALYTE_GCP_PROJECT,
    });

    const started = Date.now();
    const [job] = await bigquery.createQueryJob({
      query: sql,
      useLegacySql: false,
      maximumBytesBilled: '2000000000', // 2 GB cap or whatever you choose
    });
    const [rows] = await job.getQueryResults({ maxResults: cappedMaxRows });
    const ended = Date.now();

    const [metadata] = await job.getMetadata();
    const schemaFields = metadata.statistics?.query?.schema?.fields ?? metadata.schema?.fields ?? [];

    const columns = schemaFields.map((field: { name: string; type: string }) => ({
      name: field.name,
      type: field.type,
    }));

    const mappedRows = rows.map((row: any) => {
      const out: Record<string, string | number | boolean | null> = {};
      columns.forEach((col: { name: string; type: string }) => {
        const value = row[col.name];
        out[col.name] =
          value === null || value === undefined ? null : typeof value === 'object' ? JSON.stringify(value) : value;
      });
      return out;
    });

    // Log usage
    console.log(`BigQuery console query by user ${user.id}: ${sql.substring(0, 100)}...`);

    const payload: BigQueryResultPayload = {
      columns,
      rows: mappedRows,
      totalRows: Number(metadata.statistics?.query?.totalRows ?? rows.length),
      jobId: job.id!,
      executionMs: ended - started,
    };

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error('BigQuery console error', error);
    return NextResponse.json(
      {
        message: 'BigQuery query failed',
        code: error.code,
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// Helper function - need to implement auth
async function getCurrentUser() {
  // Implement based on your auth system
  // For now, assume a mock
  return { id: 'mock-user', role: 'SUPERADMIN' };
}
