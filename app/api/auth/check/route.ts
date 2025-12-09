import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false })
    }

    // In production, validate the session token properly
    // For now, just check if it exists
    return NextResponse.json({
      authenticated: true,
      role: 'SUPERADMIN',
      userId: 'mock-user'
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
}