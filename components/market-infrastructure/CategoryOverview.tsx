'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { formatCurrency, formatNumber } from '@/lib/utils'
import Explainer from '../Explainer'

interface CategoryData {
  name: string
  revenue30d: number
  orders30d: number
  avgOrderValue: number
  color: string
}

interface CategoryOverviewProps {
  categories: CategoryData[]
  selectedCategory: string | null
  onCategoryClick: (category: string | null) => void
}

export default function CategoryOverview({
  categories,
  selectedCategory,
  onCategoryClick,
}: CategoryOverviewProps) {
  // Prepare data for mini donut chart (total revenue breakdown)
  const chartData = categories.map((cat) => ({
    name: cat.name,
    value: cat.revenue30d,
    color: cat.color,
  }))

  const totalRevenue = categories.reduce((sum, cat) => sum + cat.revenue30d, 0)
  const totalOrders = categories.reduce((sum, cat) => sum + cat.orders30d, 0)

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6 flex flex-col" style={{ minHeight: '600px' }}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Category Overview</h3>
        <p className="text-xs text-gray-400">Click a category to filter products</p>
      </div>

      {/* Mini Revenue Donut Chart */}
      <div className="mb-6 h-48 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#111',
                border: '1px solid #1a1a1a',
                borderRadius: '6px',
                color: '#fff',
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', color: '#999' }}
              iconSize={10}
              formatter={(value) => (
                <span style={{ color: '#999', fontSize: '11px' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category Tiles */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {categories.map((category) => (
          <div
            key={category.name}
            onClick={() =>
              onCategoryClick(selectedCategory === category.name ? null : category.name)
            }
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedCategory === category.name
                ? 'bg-primary/10 border-primary/50'
                : 'bg-dark-accent border-dark-border hover:border-primary/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-white">{category.name}</h4>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
            </div>

            {/* Mini Revenue Bar Chart */}
            <div className="mb-3">
              <div className="w-full bg-dark-surface rounded-full h-2 mb-1">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${(category.revenue30d / totalRevenue) * 100}%`,
                    backgroundColor: category.color,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Revenue Share</span>
                <span>{((category.revenue30d / totalRevenue) * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <Explainer
                title="Revenue (30d)"
                what={`Total revenue generated from ${category.name} products in the last 30 days.`}
                why="Shows which categories drive the most revenue and deserve more promotion."
                how={[
                  'Sum of all orders for products in this category',
                  'Includes completed transactions only',
                  'Key metric for category prioritization',
                ]}
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Revenue (30d)</span>
                  <span className="text-white font-medium">
                    {formatCurrency(category.revenue30d)}
                  </span>
                </div>
              </Explainer>

              <Explainer
                title="Orders (30d)"
                what={`Total number of orders placed for ${category.name} products in the last 30 days.`}
                why="Indicates category demand and purchase frequency."
                how={[
                  'Count of unique orders',
                  'One order may contain multiple products',
                  'Helps understand buying patterns',
                ]}
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Orders (30d)</span>
                  <span className="text-white font-medium">{formatNumber(category.orders30d)}</span>
                </div>
              </Explainer>

              <Explainer
                title="Avg Order Value"
                what={`Average amount spent per order in the ${category.name} category.`}
                why="Higher AOV means better revenue per customer. Helps optimize pricing and bundling strategies."
                how={[
                  'Calculated: Total Revenue / Number of Orders',
                  'Excludes refunds and cancellations',
                  'Key metric for category profitability',
                ]}
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Avg Order Value</span>
                  <span className="text-white font-medium">
                    {formatCurrency(category.avgOrderValue)}
                  </span>
                </div>
              </Explainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

