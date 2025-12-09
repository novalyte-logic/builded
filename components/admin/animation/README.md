# Novalyte Animation Layer

Premium micro-interactions for the admin dashboard. Subtle, performant, and respectful of user preferences.

## Components

### `<AnimatedCard />`

Wraps any card component with smooth entrance and hover animations.

**Props:**
- `children` - React node to wrap
- `delay?: number` - Delay in seconds for staggered grids (default: 0)
- `className?: string` - Additional CSS classes
- All standard `div` props

**Features:**
- Fade-in + upward motion on mount (~200ms)
- Subtle scale (1.01) + shadow on hover
- Respects `prefers-reduced-motion`

**Example:**
```tsx
import AnimatedCard from '@/components/admin/animation/AnimatedCard'

<AnimatedCard delay={0.1}>
  <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
    <h3>KPI Card</h3>
  </div>
</AnimatedCard>
```

### `<StaggeredList />`

Reveals items in sequence with subtle animation.

**Props:**
- `items: React.ReactNode[]` - Array of items to animate
- `delayStep?: number` - Delay between items in seconds (default: 0.06)
- `className?: string` - Container CSS classes
- `itemClassName?: string` - Individual item CSS classes
- `direction?: 'vertical' | 'horizontal'` - Layout direction (default: 'vertical')

**Example:**
```tsx
import StaggeredList from '@/components/admin/animation/StaggeredList'

<StaggeredList
  items={spikes.map((spike, idx) => (
    <div key={idx} className="bg-dark-accent rounded-lg p-4">
      {spike.region}
    </div>
  ))}
  delayStep={0.05}
/>
```

### `<PageTransition />`

Lightweight page entrance wrapper.

**Props:**
- `children` - React node to wrap
- All standard `div` props

**Example:**
```tsx
import PageTransition from '@/components/admin/animation/PageTransition'

export default function MyPage() {
  return (
    <PageTransition>
      <h1>Page Content</h1>
    </PageTransition>
  )
}
```

## Integration Examples

### KPI Cards with Staggered Animation

```tsx
import AnimatedCard from '@/components/admin/animation/AnimatedCard'
import CinematicKPICard from '@/components/admin/CinematicKPICard'

<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  {kpis.map((kpi, index) => (
    <AnimatedCard key={index} delay={index * 0.05}>
      <CinematicKPICard {...kpi} />
    </AnimatedCard>
  ))}
</div>
```

### Table Rows with StaggeredList

```tsx
import StaggeredList from '@/components/admin/animation/StaggeredList'

<StaggeredList
  items={clinics.map((clinic) => (
    <tr key={clinic.id} className="hover:bg-dark-hover">
      <td>{clinic.name}</td>
      <td>{clinic.region}</td>
    </tr>
  ))}
  itemClassName="border-b border-dark-border"
/>
```

### Chart Cards

```tsx
import AnimatedCard from '@/components/admin/animation/AnimatedCard'

<AnimatedCard delay={0.1}>
  <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
    <Chart data={chartData} />
  </div>
</AnimatedCard>
```

## Performance Notes

- All animations use GPU-accelerated properties (opacity, transform)
- Durations are short (150-250ms) for instant feel
- Reduced motion preference is respected automatically
- No layout shifts or reflows

## Design Principles

1. **Subtle** - Micro-movements, not flashy
2. **Fast** - 150-250ms durations
3. **Respectful** - Honors `prefers-reduced-motion`
4. **Performant** - GPU-accelerated transforms only
5. **Consistent** - Uses centralized motion config

