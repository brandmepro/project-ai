'use client'

import { motion } from 'framer-motion'
import { Text, Stack, SimpleGrid } from '@mantine/core'
import { SubscriptionCard } from '@/components/settings/subscription-card'
import { AISettingsCard } from '@/components/settings/ai-settings-card'
import { AIAnalyticsCard } from '@/components/settings/ai-analytics-card'
import { SchedulingCard } from '@/components/settings/scheduling-card'
import { PlatformManagementCard } from '@/components/settings/platform-management-card'
import { AnalyticsSettingsCard } from '@/components/settings/analytics-settings-card'
import { DataPrivacyCard } from '@/components/settings/data-privacy-card'
import { AdvancedSettingsCard } from '@/components/settings/advanced-settings-card'

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Stack gap={4} mb="xl">
          <Text size="xl" fw={700} className="text-foreground">
            Settings
          </Text>
          <Text size="sm" c="dimmed">
            Manage app preferences, billing, and integrations
          </Text>
        </Stack>
      </motion.div>

      {/* Settings Grid */}
      <Stack gap="lg">
        {/* Priority Section - Full Width */}
        <SubscriptionCard index={0} />

        {/* AI Usage Analytics - Full Width */}
        <AIAnalyticsCard index={1} />

        {/* Main Settings Grid - 2 Columns on Large Screens */}
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <AISettingsCard index={2} />
          <SchedulingCard index={3} />
          <PlatformManagementCard index={4} />
          <AnalyticsSettingsCard index={5} />
          <DataPrivacyCard index={6} />
          <AdvancedSettingsCard index={7} />
        </SimpleGrid>
      </Stack>
    </div>
  )
}
