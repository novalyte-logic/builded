export interface AuditEntry {
  id: string
  timestamp: Date
  action: string
  details: Record<string, any>
  signature: string
  operator: string
}

async function createSHA256Hash(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function createAuditEntry(
  action: string,
  details: Record<string, any>,
  operator: string = 'superadmin'
): Promise<AuditEntry> {
  const timestamp = new Date()
  const entry = {
    id: crypto.randomUUID(),
    timestamp,
    action,
    details,
    operator,
  }

  // Create SHA-256 signature
  const signature = await createSHA256Hash(JSON.stringify(entry))

  return {
    ...entry,
    signature,
  }
}

export async function verifyAuditEntry(entry: AuditEntry): Promise<boolean> {
  const { signature, ...entryWithoutSig } = entry
  const expectedSignature = await createSHA256Hash(JSON.stringify(entryWithoutSig))
  return signature === expectedSignature
}

