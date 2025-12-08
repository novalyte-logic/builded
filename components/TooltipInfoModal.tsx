'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'

interface TooltipInfoModalProps {
  title: string
  description: string
  howTo: string
  examples: string[]
}

export default function TooltipInfoModal({ title, description, howTo, examples }: TooltipInfoModalProps) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  
  return (
    <> 
      <div
        className="relative inline-flex"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setOpen(true)
          }}
          className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition"
          aria-label={`Learn more about ${title}`}
        >
          <Info className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute left-1/2 top-full mt-2 -translate-x-1/2 z-40"
            >
              <div className="max-w-xs rounded-lg bg-black/80 text-white text-xs px-3 py-2 shadow-xl border border-white/10">
                <p className="font-semibold text-white mb-1">{title}</p>
                <p className="text-gray-200">{description}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[#0f0f15] border border-white/10 rounded-2xl p-6 shadow-2xl text-white"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="text-gray-200 mt-2">{description}</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-white transition"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-white">How to use this module</h4>
                  <p className="text-gray-200 mt-1 leading-relaxed">{howTo}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Example use cases</h4>
                  <ul className="mt-2 space-y-1 text-gray-200 list-disc list-inside">
                    {examples.map((ex, idx) => (
                      <li key={idx}>{ex}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setOpen(false)}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium',
                    'bg-white/10 hover:bg-white/15 text-white transition'
                  )}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}