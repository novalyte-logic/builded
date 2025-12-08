'use client'

import { useEffect, useState } from 'react'
import LeadFullContextView from '@/components/LeadFullContextView'
import StatusBadge from '@/components/StatusBadge'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const leadId = params.id as string

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Lead Details</h1>
            <p className="text-gray-400">Complete context for lead {leadId}</p>
          </div>
          <StatusBadge status="live" />
        </div>
      </div>

      <LeadFullContextView leadId={leadId} />
    </div>
  )
}

