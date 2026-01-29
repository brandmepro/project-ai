'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconCheck, IconX, IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, 'id'>) => void
  hideToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const toastConfig: Record<ToastType, { icon: typeof IconCheck; bgClass: string; iconClass: string }> = {
  success: { 
    icon: IconCheck, 
    bgClass: 'bg-emerald-500/10 border-emerald-500/20',
    iconClass: 'bg-emerald-500 text-white'
  },
  error: { 
    icon: IconX, 
    bgClass: 'bg-red-500/10 border-red-500/20',
    iconClass: 'bg-red-500 text-white'
  },
  warning: { 
    icon: IconAlertTriangle, 
    bgClass: 'bg-amber-500/10 border-amber-500/20',
    iconClass: 'bg-amber-500 text-white'
  },
  info: { 
    icon: IconInfoCircle, 
    bgClass: 'bg-primary/10 border-primary/20',
    iconClass: 'bg-primary text-primary-foreground'
  },
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])
    
    // Auto dismiss
    setTimeout(() => {
      hideToast(id)
    }, toast.duration || 3000)
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-96 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const config = toastConfig[toast.type]
            const Icon = config.icon
            
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 500, 
                  damping: 30 
                }}
                className={`
                  pointer-events-auto
                  flex items-start gap-3 p-4 rounded-xl border backdrop-blur-lg
                  ${config.bgClass}
                  bg-card/95 shadow-xl
                `}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.iconClass}`}>
                  <Icon size={16} stroke={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{toast.title}</p>
                  {toast.message && (
                    <p className="text-xs text-muted-foreground mt-0.5">{toast.message}</p>
                  )}
                </div>
                <button
                  onClick={() => hideToast(toast.id)}
                  className="shrink-0 p-1 rounded-full hover:bg-secondary/50 transition-colors"
                >
                  <IconX size={14} className="text-muted-foreground" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
