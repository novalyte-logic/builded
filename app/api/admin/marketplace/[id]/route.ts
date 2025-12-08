/**
 * Admin Marketplace Product Detail API Route
 * 
 * GET /api/admin/marketplace/:id - Get product by ID
 * PATCH /api/admin/marketplace/:id - Update product
 * DELETE /api/admin/marketplace/:id - Delete product (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server'
import { MarketplaceProduct } from '@/lib/types/marketplace'
import { createAuditLog, createVersionSnapshot } from '@/lib/services/audit-service'

// Mock data store (replace with database)
const products: MarketplaceProduct[] = []

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = products.find((p) => p.id === params.id)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error: any) {
    console.error('Product detail API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product', details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    const productIndex = products.findIndex((p) => p.id === productId)

    if (productIndex === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const oldProduct = { ...products[productIndex] }
    const updates = await request.json()

    // Update product
    const updatedProduct: MarketplaceProduct = {
      ...products[productIndex],
      ...updates,
      updated_at: new Date(),
    }

    products[productIndex] = updatedProduct

    // Determine action type
    const action = updates.show_in_marketplace !== oldProduct.show_in_marketplace || 
                   updates.is_featured !== oldProduct.is_featured
      ? 'toggle_visibility'
      : 'update'

    // Create audit log
    await createAuditLog(
      'MarketplaceProduct',
      productId,
      action,
      oldProduct,
      updatedProduct,
      updates.reason || 'Product updated'
    )

    // Create version snapshot if requested
    if (updates.create_version_snapshot) {
      await createVersionSnapshot(
        'MarketplaceProduct',
        productId,
        updatedProduct,
        updates.version_label || 'Manual update'
      )
    }

    return NextResponse.json({ product: updatedProduct })
  } catch (error: any) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: 'Failed to update product', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    const productIndex = products.findIndex((p) => p.id === productId)

    if (productIndex === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const product = products[productIndex]

    // Soft delete: mark as hidden
    products[productIndex] = {
      ...product,
      show_in_marketplace: false,
      updated_at: new Date(),
    }

    // Create audit log
    await createAuditLog(
      'MarketplaceProduct',
      productId,
      'delete',
      product,
      products[productIndex],
      'Product soft-deleted (hidden from marketplace)'
    )

    return NextResponse.json({ message: 'Product deleted', product: products[productIndex] })
  } catch (error: any) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product', details: error.message },
      { status: 500 }
    )
  }
}

