'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconLayoutDashboard,
  IconSparkles,
  IconPhoto,
  IconCalendar,
  IconChartBar,
  IconCreditCard,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react'
import { ActionIcon, Text, Tooltip, Box, Stack } from '@mantine/core'
import { useAppStore } from '@/lib/store'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: IconLayoutDashboard },
  { href: '/create', label: 'Create', icon: IconSparkles },
  { href: '/content', label: 'Content', icon: IconPhoto },
  { href: '/calendar', label: 'Calendar', icon: IconCalendar },
  { href: '/analytics', label: 'Analytics', icon: IconChartBar },
  { href: '/pricing', label: 'Pricing', icon: IconCreditCard },
  { href: '/settings', label: 'Settings', icon: IconSettings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 z-40 hidden h-screen border-r border-border bg-sidebar lg:flex flex-col"
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <IconSparkles size={18} className="text-primary-foreground" />
              </div>
              <Text fw={600} size="lg" className="text-foreground">
                Business Pro
              </Text>
            </motion.div>
          )}
        </AnimatePresence>
        
        {sidebarCollapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary mx-auto">
            <IconSparkles size={18} className="text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <Stack gap="xs">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon

            const linkContent = (
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
              >
                <Icon size={20} stroke={1.5} />
                <AnimatePresence mode="wait">
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )

            if (sidebarCollapsed) {
              return (
                <Tooltip 
                  key={item.href} 
                  label={item.label} 
                  position="right" 
                  withArrow
                  transitionProps={{ duration: 150 }}
                >
                  {linkContent}
                </Tooltip>
              )
            }

            return <Box key={item.href}>{linkContent}</Box>
          })}
        </Stack>
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-border p-3">
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={toggleSidebar}
          className="w-full"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <IconChevronRight size={18} />
          ) : (
            <IconChevronLeft size={18} />
          )}
        </ActionIcon>
      </div>
    </motion.aside>
  )
}
