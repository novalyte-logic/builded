'use client'

import { DollarSign, TrendingUp, Users, ShoppingBag } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface FunnelStep {
  step: string
  visitors: number
  cost: number
  revenue: number
  netProfit: number
  conversionRate: number
}

interface FunnelEconomicsProps {
  steps: FunnelStep[]
}

export default function FunnelEconomics({ steps }: FunnelEconomicsProps) {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-white">Funnel Economics Stack</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-accent border-b border-dark-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Step
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Visitors
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Cost per Step
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Net Profit
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Conversion Rate
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {steps.map((step, idx) => (
              <tr key={idx} className="hover:bg-dark-hover transition-colors">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs text-primary font-medium">{idx + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{step.step}</span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                  {step.visitors.toLocaleString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                  {formatCurrency(step.cost)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-status-live font-medium">
                  {formatCurrency(step.revenue)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`text-sm font-medium ${
                      step.netProfit >= 0 ? 'text-status-live' : 'text-status-offline'
                    }`}
                  >
                    {formatCurrency(step.netProfit)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-dark-accent rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${step.conversionRate * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-white">{(step.conversionRate * 100).toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

