'use client'

interface ScenarioSliderProps {
  value: number
  onChange: (value: number) => void
  labels: string[]
}

export default function ScenarioSlider({ value, onChange, labels }: ScenarioSliderProps) {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <h3 className="text-sm font-medium text-white mb-4">Forecast Scenario</h3>
      <div className="flex items-center gap-4 mb-4">
        {labels.map((label, index) => (
          <button
            key={index}
            onClick={() => onChange(index)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              value === index
                ? 'bg-primary text-white'
                : 'bg-dark-accent text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <input
        type="range"
        min="0"
        max={labels.length - 1}
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-primary"
      />
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        {labels.map((label, index) => (
          <span key={index} className={value === index ? 'text-primary font-medium' : ''}>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

