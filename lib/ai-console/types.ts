export type ConsoleMode = 'BIGQUERY' | 'VERTEX' | 'PLAYBOOK';

export type QueryPresetKey =
  | 'none'
  | 'trt_cohort_tx_30d'
  | 'service_line_by_state_30d';

export interface ConsoleState {
  mode: ConsoleMode;
  preset: QueryPresetKey;
  dataset: string; // e.g. "novalyte_core"
  maxRows: number; // 100, 200, 500, 1000
  sql: string;
}

export interface BigQueryResultColumn {
  name: string;
  type: string;
}

export interface BigQueryResultRow {
  // values as stringified (for flexible table rendering)
  [columnName: string]: string | number | boolean | null;
}

export interface BigQueryResultPayload {
  columns: BigQueryResultColumn[];
  rows: BigQueryResultRow[];
  totalRows: number;
  jobId: string;
  executionMs: number;
}

export interface ErrorPayload {
  message: string;
  code?: string;
  details?: unknown;
}
