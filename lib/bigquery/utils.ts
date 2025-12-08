/**
 * BigQuery Utility Functions
 * 
 * Client-safe utility functions that don't require BigQuery SDK.
 * Can be imported in both server and client components.
 */

/**
 * Helper for date range queries (client-safe)
 */
export interface DateRange {
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
}

export function getDateRange(days: number = 30): DateRange {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  }
}

