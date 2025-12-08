/**
 * Audit Service
 * 
 * Handles audit logging and version history for Superadmin edits
 */

import { AuditLog, VersionHistory, EntityType, AuditAction } from '@/lib/types/audit'

// Mock data stores (replace with database in production)
const auditLogs: AuditLog[] = []
const versionHistory: VersionHistory[] = []

/**
 * Create Audit Log Entry
 */
export async function createAuditLog(
  entityType: EntityType,
  entityId: string,
  action: AuditAction,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>,
  reason?: string
): Promise<AuditLog> {
  const auditLog: AuditLog = {
    id: crypto.randomUUID(),
    entity_type: entityType,
    entity_id: entityId,
    action,
    changed_by: 'superadmin',
    changed_at: new Date(),
    diff_json: {
      old_values: oldValues,
      new_values: newValues || {},
      reason,
    },
  }

  auditLogs.push(auditLog)

  // TODO: Save to database
  // await db.auditLogs.create(auditLog)

  return auditLog
}

/**
 * Create Version History Snapshot
 */
export async function createVersionSnapshot(
  entityType: EntityType,
  entityId: string,
  snapshot: Record<string, any>,
  label?: string
): Promise<VersionHistory> {
  // Get current max version for this entity
  const existingVersions = versionHistory.filter(
    (v) => v.entity_type === entityType && v.entity_id === entityId
  )
  const maxVersion = existingVersions.length > 0
    ? Math.max(...existingVersions.map((v) => v.version_number))
    : 0

  const version: VersionHistory = {
    id: crypto.randomUUID(),
    entity_type: entityType,
    entity_id: entityId,
    version_number: maxVersion + 1,
    snapshot_json: snapshot,
    created_at: new Date(),
    label: label || null,
  }

  versionHistory.push(version)

  // TODO: Save to database
  // await db.versionHistory.create(version)

  return version
}

/**
 * Get Version History for Entity
 */
export async function getVersionHistory(
  entityType: EntityType,
  entityId: string
): Promise<VersionHistory[]> {
  const versions = versionHistory
    .filter((v) => v.entity_type === entityType && v.entity_id === entityId)
    .sort((a, b) => b.version_number - a.version_number)

  // TODO: Replace with database query
  // return await db.versionHistory.find({ entity_type: entityType, entity_id: entityId })

  return versions
}

/**
 * Get Audit Logs for Entity
 */
export async function getAuditLogs(
  entityType: EntityType,
  entityId: string,
  limit: number = 50
): Promise<AuditLog[]> {
  const logs = auditLogs
    .filter((l) => l.entity_type === entityType && l.entity_id === entityId)
    .sort((a, b) => b.changed_at.getTime() - a.changed_at.getTime())
    .slice(0, limit)

  // TODO: Replace with database query
  // return await db.auditLogs.find({ entity_type: entityType, entity_id: entityId }).limit(limit)

  return logs
}

/**
 * Helper: Get all mock audit logs (for API routes)
 */
export function getMockAuditLogs(): AuditLog[] {
  return auditLogs
}

/**
 * Helper: Get all mock version history (for API routes)
 */
export function getMockVersionHistory(): VersionHistory[] {
  return versionHistory
}

