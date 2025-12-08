import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')

    if (!session) {
      return NextResponse.json({ authenticated: false })
    }

    // In a real app, validate the session token here
    // For now, if the cookie exists, user is authenticated
    return NextResponse.json({ authenticated: true })
  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
}

