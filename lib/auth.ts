/**
 * Authentication utilities
 * Simple session-based auth for superadmin access
 */

export async function isAuthenticated(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/check', {
      cache: 'no-store',
    })
    const data = await response.json()
    return data.authenticated === true
  } catch {
    return false
  }
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' })
  window.location.href = '/login'
}

