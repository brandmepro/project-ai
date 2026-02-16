'use client'

import React, { useState, useCallback } from "react"
import { Sidebar } from './sidebar'
import { Header } from './header'
import { MobileNav } from './mobile-nav'
import { useAppStore } from '@/lib/store'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'
import { ToastProvider, useToast } from '@/components/ui/toast-notification'
import { useMediaQuery } from '@mantine/hooks'

interface AppLayoutProps {
  children: React.ReactNode
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const { sidebarCollapsed } = useAppStore()
  const isMobile = useMediaQuery('(max-width: 1023px)')
  const { showToast } = useToast()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = useCallback(async () => {
    // Simulate API refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Increment key to trigger re-renders in child components
    setRefreshKey(prev => prev + 1)
    
    // Dispatch custom event for pages to listen to
    window.dispatchEvent(new CustomEvent('app-refresh'))
    
    showToast({
      type: 'success',
      title: 'Content refreshed',
      message: 'Your data is now up to date',
      duration: 2000,
    })
  }, [showToast])

  const mainContent = (
    <div className="main-content-area flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6" key={refreshKey}>
        {children}
      </main>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div
        className="flex flex-col min-h-screen transition-all duration-200 ease-in-out"
        style={{
          marginLeft: 0,
        }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media (min-width: 1024px) {
                .main-content-area {
                  margin-left: ${sidebarCollapsed ? '72px' : '240px'};
                }
              }
            `
          }}
        />
        
        {isMobile ? (
          <PullToRefresh onRefresh={handleRefresh}>
            {mainContent}
          </PullToRefresh>
        ) : (
          mainContent
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  )
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ToastProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </ToastProvider>
  )
}
