/**
 * Admin Marketplace API Route
 * 
 * GET /api/admin/marketplace - List products with filters
 * POST /api/admin/marketplace - Create new product
 */

import { NextRequest, NextResponse } from 'next/server'
import { MarketplaceProduct } from '@/lib/types/marketplace'
import { createAuditLog, createVersionSnapshot } from '@/lib/services/audit-service'

// Mock data store (replace with database)
const products: MarketplaceProduct[] = []

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const for_who = searchParams.get('for_who')
    const recurring = searchParams.get('recurring')
    const price_band = searchParams.get('price_band')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')

    let filteredProducts = [...products]

    // Apply filters
    if (category) {
      filteredProducts = filteredProducts.filter((p) => p.category === category)
    }

    if (for_who) {
      filteredProducts = filteredProducts.filter((p) => p.for_who === for_who)
    }

    if (recurring !== null) {
      const isRecurring = recurring === 'true'
      filteredProducts = filteredProducts.filter((p) => p.recurring === isRecurring)
    }

    if (price_band) {
      filteredProducts = filteredProducts.filter((p) => p.price_band === price_band)
    }

    if (tag) {
      filteredProducts = filteredProducts.filter((p) => p.use_case_tags.includes(tag))
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredProducts = filteredProducts.filter((p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.short_description.toLowerCase().includes(searchLower) ||
        p.vendor_name.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({
      products: filteredProducts,
      total: filteredProducts.length,
    })
  } catch (error: any) {
    console.error('Marketplace API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const product: MarketplaceProduct = {
      id: crypto.randomUUID(),
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
      category: body.category || 'Supplements',
      subcategory: body.subcategory || null,
      for_who: body.for_who || 'Both',
      use_case_tags: body.use_case_tags || [],
      short_description: body.short_description || '',
      long_description: body.long_description || '',
      price: body.price || 0,
      price_band: body.price_band || '$',
      recurring: body.recurring || false,
      protocol_type: body.protocol_type || 'Baseline',
      recommended_stack_ids: body.recommended_stack_ids || [],
      is_featured: body.is_featured || false,
      show_in_marketplace: body.show_in_marketplace ?? true,
      vendor_name: body.vendor_name || '',
      vendor_contact_email: body.vendor_contact_email || null,
      inventory_status: body.inventory_status || 'in_stock',
      seo_title: body.seo_title || null,
      seo_meta_description: body.seo_meta_description || null,
      metrics_snapshot_json: null,
      created_at: new Date(),
      updated_at: new Date(),
    }

    products.push(product)

    // Create audit log
    await createAuditLog('MarketplaceProduct', product.id, 'create', undefined, product)

    // Create initial version snapshot
    await createVersionSnapshot('MarketplaceProduct', product.id, product, 'Initial creation')

    return NextResponse.json({ product }, { status: 201 })
  } catch (error: any) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Failed to create product', details: error.message },
      { status: 500 }
    )
  }
}

