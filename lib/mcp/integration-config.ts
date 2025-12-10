/**
 * External Integration URLs Configuration
 * 
 * Centralized configuration for external service URLs used in the MCP dashboard.
 */

export const INTEGRATION_URLS: Record<string, string> = {
  bigquery: 'https://console.cloud.google.com/bigquery',
  'vertex-ai': 'https://console.cloud.google.com/vertex-ai',
  firestore: 'https://console.cloud.google.com/firestore',
  stripe: 'https://dashboard.stripe.com/',
  n8n: process.env.N8N_URL || 'https://app.n8n.cloud/',
}

/**
 * Get the external URL for an integration
 */
export function getIntegrationUrl(integrationId: string): string {
  return INTEGRATION_URLS[integrationId] || '#'
}

