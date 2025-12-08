/**
 * Admin Assessments API Route
 * 
 * GET /api/admin/assessments - List assessments with filters
 * 
 * Protected by admin auth (implement middleware)
 */

import { NextRequest, NextResponse } from 'next/server'
import { processAssessmentCompletion, syncAssessmentProgress } from '@/lib/services/assessment-sync'

// Mock data store (replace with actual DB/ORM in production)
const assessments: any[] = []

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const path = searchParams.get('path') || searchParams.get('flow_type')
    const flow_type = searchParams.get('flow_type') || searchParams.get('path')
    const risk_level = searchParams.get('risk_level')
    const predicted_ltv_band = searchParams.get('predicted_ltv_band')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // TODO: Replace with actual database query
    // This is a placeholder structure
    let filteredAssessments = [...assessments]

    // Apply filters
    if (status) {
      filteredAssessments = filteredAssessments.filter((a) => a.status === status)
    }

    if (flow_type || path) {
      const flowTypeFilter = flow_type || path
      filteredAssessments = filteredAssessments.filter((a) => 
        a.flow_type === flowTypeFilter || a.path === flowTypeFilter
      )
    }

    if (risk_level) {
      filteredAssessments = filteredAssessments.filter((a) => a.risk_level === risk_level)
    }

    if (predicted_ltv_band) {
      filteredAssessments = filteredAssessments.filter((a) => a.predicted_ltv_band === predicted_ltv_band)
    }

    if (startDate && endDate) {
      filteredAssessments = filteredAssessments.filter((a) => {
        const createdAt = new Date(a.created_at)
        return createdAt >= new Date(startDate) && createdAt <= new Date(endDate)
      })
    }

    // Sort by created_at desc (newest first)
    filteredAssessments.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return NextResponse.json({
      assessments: filteredAssessments,
      total: filteredAssessments.length,
    })
  } catch (error: any) {
    console.error('Assessments API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessments', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/assessments - Create assessment (for sync from frontend)
 * 
 * Called when assessment is saved/completed from app.novalyte.io
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.status) {
      return NextResponse.json(
        { error: 'Missing required field: status' },
        { status: 400 }
      )
    }

    // flow_type is preferred, but path is accepted as fallback
    if (!body.flow_type && !body.path) {
      return NextResponse.json(
        { error: 'Missing required field: flow_type or path' },
        { status: 400 }
      )
    }

    const assessment = {
      id: body.id || crypto.randomUUID(),
      user_id: body.user_id || null,
      created_at: body.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: body.status,
      flow_type: body.flow_type || body.path || 'GENERAL',
      path: body.flow_type || body.path || 'GENERAL', // Legacy alias
      answers_json: body.answers_json || body.answers || {},
      ai_summary_json: body.ai_summary_json || null,
      risk_level: body.risk_level || null,
      predicted_ltv_band: body.predicted_ltv_band || null,
      city: body.city || null,
      country: body.country || null,
      acquisition_channel: body.acquisition_channel || null,
      metadata: body.metadata || {},
    }

    // Save to database (mock)
    assessments.push(assessment)

    // If assessment is completed, trigger AI scoring and lead creation
    if (body.status === 'completed') {
      try {
        const result = await processAssessmentCompletion(assessment.id, assessment)
        
        // Update assessment with AI results
        const updatedIndex = assessments.findIndex((a) => a.id === assessment.id)
        if (updatedIndex !== -1) {
          assessments[updatedIndex] = result.assessment
        } else {
          assessments.push(result.assessment)
        }

        // Save lead if created
        if (result.lead) {
          // TODO: Save to leads database/array
          // leads.push(result.lead)
        }

        return NextResponse.json({
          assessment: result.assessment,
          lead: result.lead,
        }, { status: 201 })
      } catch (error: any) {
        console.error('Error processing assessment completion:', error)
        // Return assessment without AI processing if error
        return NextResponse.json({ assessment }, { status: 201 })
      }
    }

    // If in progress, just sync progress
    if (body.status === 'in_progress') {
      try {
        const synced = await syncAssessmentProgress(assessment.id, {
          flow_type: body.flow_type || body.path,
          answers_json: body.answers_json || body.answers,
          city: body.city,
          country: body.country,
          acquisition_channel: body.acquisition_channel,
          currentStep: body.metadata?.currentStep,
          totalSteps: body.metadata?.totalSteps,
        })
        const updatedIndex = assessments.findIndex((a) => a.id === synced.id)
        if (updatedIndex !== -1) {
          assessments[updatedIndex] = synced
        } else {
          assessments.push(synced)
        }
        return NextResponse.json({ assessment: synced }, { status: 201 })
      } catch (error: any) {
        console.error('Error syncing assessment progress:', error)
      }
    }

    return NextResponse.json({ assessment }, { status: 201 })
  } catch (error: any) {
    console.error('Create assessment error:', error)
    return NextResponse.json(
      { error: 'Failed to create assessment', details: error.message },
      { status: 500 }
    )
  }
}

