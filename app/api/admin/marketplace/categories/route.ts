import { NextResponse } from 'next/server'
import {
  assertAdminAuth,
  enforceRateLimit,
  getCategories,
  CategoryRecord,
} from '../store'

export async function GET(request: Request) {
  try {
    assertAdminAuth(request)
    enforceRateLimit(request)
    const categories = getCategories()
    return NextResponse.json({ categories })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Error fetching categories', error)
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 })
  }
}

export type AdminMarketplaceCategoriesResponse = {
  categories: CategoryRecord[]
}

