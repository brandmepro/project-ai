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
    currentY.current = startY.current
    setIsPulling(false) // Don't set pulling yet, wait for movement
  }, [disabled, isRefreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return
    
    const container = containerRef.current
    if (!container) return
    
    // If user is scrolling down in content, don't interfere
    if (container.scrollTop > 0) {
      pullDistance.set(0)
      setIsPulling(false)
      return
    }
    
    currentY.current = e.touches[0].clientY
    const diff = currentY.current - startY.current
    
    // Only activate pull-to-refresh when pulling down (positive diff) at top
    if (diff > 0 && container.scrollTop === 0) {
      setIsPulling(true)
      const dampedDiff = Math.min(MAX_PULL, diff * 0.5)
      pullDistance.set(dampedDiff)
      
      // Prevent default only when actually pulling
      if (dampedDiff > 5) {
        e.preventDefault()
      }
    } else {
      // Allow normal scrolling
      pullDistance.set(0)
      setIsPulling(false)
    }
  }, [disabled, isRefreshing, pullDistance])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) {
      setIsPulling(false)
      pullDistance.set(0)
      return
    }
    
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
      className="relative overflow-y-auto overscroll-y-contain lg:overscroll-auto"
      style={{
        height: '100vh',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
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
