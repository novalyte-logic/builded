type CategoryRecord = {
  id: string
  name: string
  slug: string
  productCount: number
  views: number
  ctr: number
  addToStack: number
  priority: number
  isVisible: boolean
  updatedAt: string
}

type AuditLog = {
  id: string
  userId: string
  entity: 'category'
  entityId: string
  field: 'priority' | 'visibility'
  oldValue: unknown
  newValue: unknown
  timestamp: string
}

const categories: CategoryRecord[] = [
  {
    id: 'cat_supplements',
    name: 'Supplements',
    slug: 'supplements',
    productCount: 45,
    views: 12500,
    ctr: 0.32,
    addToStack: 0.18,
    priority: 1,
    isVisible: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_equipment',
    name: 'Equipment',
    slug: 'equipment',
    productCount: 23,
    views: 8900,
    ctr: 0.28,
    addToStack: 0.15,
    priority: 2,
    isVisible: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_diagnostics',
    name: 'Diagnostics',
    slug: 'diagnostics',
    productCount: 12,
    views: 5600,
    ctr: 0.35,
    addToStack: 0.22,
    priority: 3,
    isVisible: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_digital_health',
    name: 'Digital Health',
    slug: 'digital-health',
    productCount: 8,
    views: 3200,
    ctr: 0.25,
    addToStack: 0.12,
    priority: 4,
    isVisible: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_home_gym',
    name: 'Home Gym',
    slug: 'home-gym',
    productCount: 15,
    views: 7800,
    ctr: 0.3,
    addToStack: 0.2,
    priority: 5,
    isVisible: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_health_tech_devices',
    name: 'Health Tech Devices',
    slug: 'health-tech-devices',
    productCount: 19,
    views: 10200,
    ctr: 0.33,
    addToStack: 0.19,
    priority: 6,
    isVisible: true,
    updatedAt: new Date().toISOString(),
  },
]

const auditLog: AuditLog[] = []

const rateLimitBuckets = new Map<string, { count: number; windowStart: number }>()
const WINDOW_MS = 60_000
const WINDOW_LIMIT = 30

export function getCategories(): CategoryRecord[] {
  return categories.slice().sort((a, b) => a.priority - b.priority)
}

export function updateCategoryPriority(id: string, priority: number, userId: string): CategoryRecord | null {
  const cat = categories.find((c) => c.id === id)
  if (!cat) return null
  const oldValue = cat.priority
  cat.priority = priority
  cat.updatedAt = new Date().toISOString()
  logAudit({ id, userId, field: 'priority', oldValue, newValue: priority })
  return cat
}

export function updateCategoryVisibility(id: string, isVisible: boolean, userId: string): CategoryRecord | null {
  const cat = categories.find((c) => c.id === id)
  if (!cat) return null
  const oldValue = cat.isVisible
  cat.isVisible = isVisible
  cat.updatedAt = new Date().toISOString()
  logAudit({ id, userId, field: 'visibility', oldValue, newValue: isVisible })
  return cat
}

function logAudit({
  id,
  userId,
  field,
  oldValue,
  newValue,
}: {
  id: string
  userId: string
  field: 'priority' | 'visibility'
  oldValue: unknown
  newValue: unknown
}) {
  auditLog.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    entity: 'category',
    entityId: id,
    field,
    oldValue,
    newValue,
    timestamp: new Date().toISOString(),
  })
  if (auditLog.length > 200) auditLog.pop()
}

export function getAuditLog() {
  return auditLog
}

export function assertAdminAuth(req: Request) {
  const token = req.headers.get('x-novalyte-admin')
  const expected = process.env.ADMIN_SUPER_TOKEN
  if (!expected || token !== expected) {
    throw new Response('Unauthorized', { status: 401 })
  }
}

export function enforceRateLimit(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const bucket = rateLimitBuckets.get(ip) || { count: 0, windowStart: now }
  if (now - bucket.windowStart > WINDOW_MS) {
    bucket.count = 0
    bucket.windowStart = now
  }
  bucket.count += 1
  rateLimitBuckets.set(ip, bucket)
  if (bucket.count > WINDOW_LIMIT) {
    throw new Response('Rate limit exceeded', { status: 429 })
  }
}

export type { CategoryRecord }

