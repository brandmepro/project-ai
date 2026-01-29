'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  IconLayoutDashboard,
  IconSparkles,
  IconPhoto,
  IconChartBar,
  IconUser,
} from '@tabler/icons-react'

const mainNavItems = [
  { href: '/dashboard', label: 'Home', icon: IconLayoutDashboard },
  { href: '/analytics', label: 'Analytics', icon: IconChartBar },
  { href: '/create', label: 'Create', icon: IconSparkles, primary: true },
  { href: '/content', label: 'Content', icon: IconPhoto },
  { href: '/profile', label: 'Profile', icon: IconUser },
]

export function MobileNav() {
  const pathname = usePathname()

  // Haptic feedback function
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg px-2 pb-safe lg:hidden">
      <div className="flex items-center justify-around py-2">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon

          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={triggerHaptic}
                className="flex flex-col items-center -mt-6"
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                >
                  <Icon size={24} stroke={1.5} />
                </motion.div>
                <span className="mt-1 text-[10px] font-semibold text-primary">
                  {item.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={triggerHaptic}
              className="flex flex-col items-center py-1 px-3 active:scale-95 transition-transform"
            >
              <motion.div
                whileTap={{ scale: 0.8, y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className={`
                  flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-primary/15 shadow-sm shadow-primary/10' 
                    : 'active:bg-secondary/50'
                  }
                `}
              >
                <Icon
                  size={22}
                  stroke={isActive ? 2 : 1.5}
                  className={`transition-colors duration-200 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
              </motion.div>
              <span className={`
                mt-0.5 text-[10px] transition-all duration-200
                ${isActive 
                  ? 'font-semibold text-primary' 
                  : 'font-medium text-muted-foreground'
                }
              `}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
