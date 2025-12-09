import { QueryPresetKey } from './types';

export const BIGQUERY_PRESETS: Record<
  Exclude<QueryPresetKey, 'none'>,
  { label: string; sql: string }
> = {
  trt_cohort_tx_30d: {
    label: 'TRT Cohort Breakdown — Texas (30d)',
    sql: `
      -- TRT cohort breakdown in Texas (last 30 days)
      SELECT
        state,
        city,
        COUNT(*) AS lead_count,
        AVG(age) AS avg_age,
        AVG(BMI) AS avg_bmi
      FROM \`${process.env.NOVALYTE_GCP_PROJECT}.novalyte_core.leads\`
      WHERE service_line = 'TRT'
        AND state = 'TX'
        AND created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
      GROUP BY state, city
      ORDER BY lead_count DESC
      LIMIT 200;
    `,
  },
  service_line_by_state_30d: {
    label: 'Service Line Breakdown by State (30d)',
    sql: `
      -- Service line breakdown by state (last 30 days)
      SELECT
        state,
        service_line,
        COUNT(*) AS lead_count
      FROM \`${process.env.NOVALYTE_GCP_PROJECT}.novalyte_core.leads\`
      WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
      GROUP BY state, service_line
      ORDER BY lead_count DESC
      LIMIT 500;
    `,
  },
};
