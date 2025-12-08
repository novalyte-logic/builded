'use client'

import MetricCard from './MetricCard'
import Explainer from './Explainer'
import { ReactNode } from 'react'

interface MetricCardWithExplainerProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  change?: number
  explainerTitle: string
  explainerWhat: string
  explainerWhy: string
  explainerHow: string[]
}

export default function MetricCardWithExplainer({
  title,
  value,
  subtitle,
  icon,
  change,
  explainerTitle,
  explainerWhat,
  explainerWhy,
  explainerHow,
}: MetricCardWithExplainerProps) {
  return (
    <Explainer
      title={explainerTitle}
      what={explainerWhat}
      why={explainerWhy}
      how={explainerHow}
      position="top"
    >
      <div>
        <MetricCard
          title={title}
          value={value}
          subtitle={subtitle}
          icon={icon}
          change={change}
        />
      </div>
    </Explainer>
  )
}

