/**
 * SmartQueryAssistant Component
 * 
 * Universal, dynamic "Smart Query Suggestion Layer" that works across ALL MCP servers.
 * Premium, cinematic autocomplete experience with intelligent suggestions.
 */

'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  History,
  Database,
  Lightbulb,
  Zap,
  ChevronRight,
  Search,
  Brain,
  TrendingUp,
  MapPin,
  Clock,
  Target,
  AlertCircle,
  BarChart3,
} from 'lucide-react'
import clsx from 'clsx'
import {
  QuerySuggestion,
  DatasetSuggestion,
  SmartQueryAssistantProps,
  IntentVector,
} from '@/lib/smart-query/types'
import { useSmartSuggestions } from '@/lib/smart-query/hooks'

// ============================================================================
// Intent Icons Mapping
// ============================================================================

const INTENT_ICONS: Record<keyof IntentVector, React.ReactNode> = {
  region: <MapPin className="w-3 h-3" />,
  treatment: <Target className="w-3 h-3" />,
  time: <Clock className="w-3 h-3" />,
  comparison: <BarChart3 className="w-3 h-3" />,
  ranking: <TrendingUp className="w-3 h-3" />,
  trend: <Zap className="w-3 h-3" />,
  alert: <AlertCircle className="w-3 h-3" />,
}

const INTENT_LABELS: Record<keyof IntentVector, string> = {
  region: 'Regional',
  treatment: 'Treatment',
  time: 'Temporal',
  comparison: 'Comparison',
  ranking: 'Ranking',
  trend: 'Trend',
  alert: 'Alert',
}

// ============================================================================
// Source Badge Component
// ============================================================================

function SourceBadge({ source }: { source: QuerySuggestion['source'] }) {
  const config = {
    ai: { icon: <Sparkles className="w-3 h-3" />, label: 'AI', color: 'text-purple-400 bg-purple-400/10' },
    history: { icon: <History className="w-3 h-3" />, label: 'Recent', color: 'text-blue-400 bg-blue-400/10' },
    manifest: { icon: <Lightbulb className="w-3 h-3" />, label: 'Smart', color: 'text-yellow-400 bg-yellow-400/10' },
    pattern: { icon: <Zap className="w-3 h-3" />, label: 'Pattern', color: 'text-cyan-400 bg-cyan-400/10' },
  }[source]

  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
      config.color
    )}>
      {config.icon}
      {config.label}
    </span>
  )
}

// ============================================================================
// Confidence Bar Component
// ============================================================================

function ConfidenceBar({ confidence }: { confidence: number }) {
  return (
    <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${confidence * 100}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </div>
  )
}

// ============================================================================
// Intent Indicator Component
// ============================================================================

function IntentIndicator({ intentVector }: { intentVector: IntentVector | null }) {
  if (!intentVector) return null

  const topIntents = Object.entries(intentVector)
    .filter(([, score]) => score > 0.3)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  if (topIntents.length === 0) return null

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-accent/40 border-b border-white/5">
      <Brain className="w-3 h-3 text-gray-500" />
      <span className="text-[10px] text-gray-500 uppercase tracking-wide">Intent:</span>
      <div className="flex items-center gap-1">
        {topIntents.map(([intent, score]) => (
          <span
            key={intent}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-gray-400"
            style={{ opacity: 0.5 + score * 0.5 }}
          >
            {INTENT_ICONS[intent as keyof IntentVector]}
            {INTENT_LABELS[intent as keyof IntentVector]}
          </span>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Query Suggestion Item Component
// ============================================================================

interface SuggestionItemProps {
  suggestion: QuerySuggestion
  isSelected: boolean
  onSelect: () => void
  index: number
}

function SuggestionItem({ suggestion, isSelected, onSelect, index }: SuggestionItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.15, delay: index * 0.03 }}
    >
      <button
        onClick={onSelect}
        className={clsx(
          'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-150',
          'hover:bg-primary/10 focus:bg-primary/10 focus:outline-none',
          isSelected && 'bg-primary/15 border-l-2 border-primary'
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm text-white truncate">{suggestion.text}</span>
          </div>
          <div className="flex items-center gap-2">
            <SourceBadge source={suggestion.source} />
            {suggestion.metadata?.datasetHint && (
              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                <Database className="w-2.5 h-2.5" />
                {suggestion.metadata.datasetHint}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ConfidenceBar confidence={suggestion.confidence} />
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </div>
      </button>
    </motion.div>
  )
}

// ============================================================================
// Dataset Suggestion Item Component
// ============================================================================

interface DatasetItemProps {
  dataset: DatasetSuggestion
  onSelect: () => void
  index: number
}

function DatasetItem({ dataset, onSelect, index }: DatasetItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: index * 0.05 }}
    >
      <button
        onClick={onSelect}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors text-left"
      >
        <Database className="w-3.5 h-3.5 text-primary/60" />
        <div className="flex-1 min-w-0">
          <span className="text-xs text-gray-300 truncate block">{dataset.name}</span>
          <span className="text-[10px] text-gray-500 truncate block">{dataset.description}</span>
        </div>
        <div className="flex items-center gap-1">
          {dataset.matchedTerms.slice(0, 2).map(term => (
            <span key={term} className="text-[9px] px-1 py-0.5 bg-primary/10 text-primary rounded">
              {term}
            </span>
          ))}
        </div>
      </button>
    </motion.div>
  )
}

// ============================================================================
// Main SmartQueryAssistant Component
// ============================================================================

export default function SmartQueryAssistant({
  engineProps,
  currentQuery,
  onQueryChange,
  maxSuggestions = 8,
  maxDatasetSuggestions = 4,
  showDatasets = true,
  showIntentAnalysis = true,
  className,
  dropdownPosition = 'below',
  onSuggestionSelect,
  onDatasetSelect,
  onFocus,
  onBlur,
}: SmartQueryAssistantProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get suggestions from hook
  const {
    suggestions,
    datasetSuggestions,
    intentVector,
    isLoading,
  } = useSmartSuggestions(engineProps, currentQuery, {
    debounceMs: 150,
    enableAI: true,
    maxSuggestions,
  })

  // Show dropdown when focused and has content
  const showDropdown = isFocused && (
    suggestions.length > 0 || 
    datasetSuggestions.length > 0 || 
    isLoading ||
    currentQuery.length > 0
  )

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setIsFocused(false)
        inputRef.current?.blur()
        break
      case 'Tab':
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          e.preventDefault()
          handleSelectSuggestion(suggestions[selectedIndex])
        }
        break
    }
  }, [showDropdown, selectedIndex, suggestions])

  // Handle suggestion selection
  const handleSelectSuggestion = useCallback((suggestion: QuerySuggestion) => {
    onQueryChange(suggestion.text)
    onSuggestionSelect?.(suggestion)
    setIsFocused(false)
    setSelectedIndex(-1)
  }, [onQueryChange, onSuggestionSelect])

  // Handle dataset selection
  const handleSelectDataset = useCallback((dataset: DatasetSuggestion) => {
    // Append dataset name to query
    const newQuery = currentQuery.trim() 
      ? `${currentQuery} from ${dataset.name}`
      : dataset.name
    onQueryChange(newQuery)
    onDatasetSelect?.(dataset)
  }, [currentQuery, onQueryChange, onDatasetSelect])

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true)
    onFocus?.()
  }, [onFocus])

  // Handle blur
  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Don't blur if clicking within dropdown
    if (dropdownRef.current?.contains(e.relatedTarget as Node)) {
      return
    }
    setIsFocused(false)
    setSelectedIndex(-1)
    onBlur?.()
  }, [onBlur])

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedIndex(-1)
  }, [suggestions])

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={clsx('relative', className)}>
      {/* Input Field */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
          ) : (
            <Search className="w-4 h-4 text-gray-500" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={currentQuery}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Type a query or select a suggestion..."
          className={clsx(
            'w-full pl-10 pr-4 py-3 bg-dark-accent/40 border rounded-lg text-white text-sm',
            'placeholder-gray-500/60 focus:outline-none transition-all duration-200',
            isFocused 
              ? 'border-primary/50 ring-2 ring-primary/20' 
              : 'border-white/10 hover:border-white/20'
          )}
        />

        {/* AI Badge */}
        {engineProps.selectedTool && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">
              {engineProps.selectedTool.replace(/_/g, ' ')}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: dropdownPosition === 'below' ? -10 : 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropdownPosition === 'below' ? -10 : 10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={clsx(
              'absolute left-0 right-0 z-50 mt-2 overflow-hidden',
              'bg-dark-surface/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl',
              dropdownPosition === 'above' && 'bottom-full mb-2'
            )}
          >
            {/* Intent Indicator */}
            {showIntentAnalysis && <IntentIndicator intentVector={intentVector} />}

            {/* Suggestions Section */}
            <div className="max-h-[320px] overflow-y-auto">
              {suggestions.length > 0 ? (
                <div className="py-1">
                  <div className="px-3 py-1.5 flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wide">
                    <Sparkles className="w-3 h-3" />
                    Query Suggestions
                  </div>
                  {suggestions.slice(0, maxSuggestions).map((suggestion, index) => (
                    <SuggestionItem
                      key={suggestion.id}
                      suggestion={suggestion}
                      isSelected={selectedIndex === index}
                      onSelect={() => handleSelectSuggestion(suggestion)}
                      index={index}
                    />
                  ))}
                </div>
              ) : !isLoading && currentQuery.length > 0 ? (
                <div className="px-3 py-6 text-center">
                  <div className="text-gray-500 text-sm">No suggestions found</div>
                  <div className="text-gray-600 text-xs mt-1">Try a different query or select a tool</div>
                </div>
              ) : isLoading ? (
                <div className="px-3 py-6 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block mb-2"
                  >
                    <Sparkles className="w-5 h-5 text-primary" />
                  </motion.div>
                  <div className="text-gray-400 text-sm">Generating suggestions...</div>
                </div>
              ) : null}
            </div>

            {/* Dataset Suggestions Section */}
            {showDatasets && datasetSuggestions.length > 0 && (
              <div className="border-t border-white/5 px-3 py-2 bg-dark-accent/20">
                <div className="flex items-center gap-2 mb-2 text-[10px] text-gray-500 uppercase tracking-wide">
                  <Database className="w-3 h-3" />
                  Relevant Datasets
                </div>
                <div className="space-y-0.5">
                  {datasetSuggestions.slice(0, maxDatasetSuggestions).map((dataset, index) => (
                    <DatasetItem
                      key={dataset.id}
                      dataset={dataset}
                      onSelect={() => handleSelectDataset(dataset)}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Footer Hint */}
            <div className="px-3 py-2 bg-dark-accent/30 border-t border-white/5 flex items-center justify-between">
              <div className="text-[10px] text-gray-600">
                <kbd className="px-1 py-0.5 bg-white/5 rounded text-gray-500">↑↓</kbd> navigate
                <span className="mx-2">•</span>
                <kbd className="px-1 py-0.5 bg-white/5 rounded text-gray-500">↵</kbd> select
                <span className="mx-2">•</span>
                <kbd className="px-1 py-0.5 bg-white/5 rounded text-gray-500">esc</kbd> close
              </div>
              {isLoading && (
                <div className="flex items-center gap-1 text-[10px] text-primary">
                  <Brain className="w-3 h-3 animate-pulse" />
                  AI analyzing...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
