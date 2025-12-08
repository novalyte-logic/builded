/**
 * Audit Log and Version History Models
 * 
 * Tracks all changes made by Superadmin for compliance and rollback
 */

export type EntityType = 'ClinicProfile' | 'MarketplaceProduct' | 'GlobalSetting' | 'Taxonomy'

export type AuditAction = 'create' | 'update' | 'delete' | 'toggle_visibility' | 'feature' | 'verify'

export interface AuditLog {
  id: string
  entity_type: EntityType
  entity_id: string
  action: AuditAction
  changed_by: string // Always "superadmin" for now
  changed_at: Date
  diff_json: {
    old_values?: Record<string, any>
    new_values: Record<string, any>
    reason?: string
  }
}

export interface VersionHistory {
  id: string
  entity_type: EntityType
  entity_id: string
  version_number: number
  snapshot_json: Record<string, any> // Full entity snapshot
  created_at: Date
  label: string | null // e.g., "SEO pass", "Post-campaign tuning"
}

