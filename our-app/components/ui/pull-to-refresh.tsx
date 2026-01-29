'use client'

import React from "react"

import { useState, useRef, useCallback, type ReactNode } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { IconRefresh } from '@tabler/icons-react'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  disabled?: boolean
}

const THRESHOLD = 80
const MAX_PULL = 120

export function PullToRefresh({ children, onRefresh, disabled = false }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)
  
  const pullDistance = useMotionValue(0)
  const opacity = useTransform(pullDistance, [0, THRESHOLD], [0, 1])
  const scale = useTransform(pullDistance, [0, THRESHOLD], [0.5, 1])
  const rotate = useTransform(pullDistance, [0, MAX_PULL], [0, 360])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return
    
    const container = containerRef.current
    if (!container || container.scrollTop > 0) return
    
    startY.current = e.touches[0].clientY
    setIsPulling(true)
  }, [disabled, isRefreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return
    
    const container = containerRef.current
    if (!container || container.scrollTop > 0) {
      pullDistance.set(0)
      return
    }
    
    currentY.current = e.touches[0].clientY
    const diff = Math.max(0, currentY.current - startY.current)
    const dampedDiff = Math.min(MAX_PULL, diff * 0.5)
    pullDistance.set(dampedDiff)
  }, [isPulling, disabled, isRefreshing, pullDistance])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return
    
    setIsPulling(false)
    const distance = pullDistance.get()
    
    if (distance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true)
      pullDistance.set(THRESHOLD)
      
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        pullDistance.set(0)
      }
    } else {
      pullDistance.set(0)
    }
  }, [isPulling, disabled, isRefreshing, pullDistance, onRefresh])

  return (
    <div 
      ref={containerRef}
      className="relative h-full overflow-y-auto overscroll-none lg:overscroll-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            className="absolute left-0 right-0 top-0 z-50 flex items-center justify-center pointer-events-none"
            style={{ 
              height: pullDistance,
              opacity 
            }}
          >
            <motion.div
              className={`
                flex h-10 w-10 items-center justify-center rounded-full
                ${isRefreshing ? 'bg-primary' : 'bg-card border border-border'}
                shadow-lg
              `}
              style={{ scale }}
            >
              <motion.div
                style={{ rotate: isRefreshing ? undefined : rotate }}
                animate={isRefreshing ? { rotate: 360 } : undefined}
                transition={isRefreshing ? { 
                  repeat: Number.POSITIVE_INFINITY, 
                  duration: 1, 
                  ease: 'linear' 
                } : undefined}
              >
                <IconRefresh 
                  size={20} 
                  className={isRefreshing ? 'text-primary-foreground' : 'text-primary'} 
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Content */}
      <motion.div style={{ y: pullDistance }}>
        {children}
      </motion.div>
    </div>
  )
}
