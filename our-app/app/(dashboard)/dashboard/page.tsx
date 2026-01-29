'use client'

import { motion } from 'framer-motion'
import { Text, Stack, SimpleGrid, Box } from '@mantine/core'
import { 
  IconSparkles, 
  IconCalendarEvent, 
  IconChartLine, 
  IconRocket,
  IconPhoto,
  IconTrendingUp,
} from '@tabler/icons-react'
import { StatCard } from '@/components/ui/stat-card'
import { CTACard } from '@/components/ui/cta-card'
import { RecentContent } from '@/components/dashboard/recent-content'
import { useAppStore } from '@/lib/store'

export default function DashboardPage() {
  const { businessName, contents } = useAppStore()
  
  const scheduledCount = contents.filter(c => c.status === 'scheduled').length
  const postedCount = contents.filter(c => c.status === 'posted').length
  
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Stack gap={4} mb="xl">
          <Text size="sm" c="dimmed" fw={500}>
            {greeting}
          </Text>
          <Text size="xl" fw={700} className="text-foreground">
            Welcome back, {businessName}
          </Text>
        </Stack>
      </motion.div>

      {/* Main CTA Cards */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mb="xl">
        <CTACard
          title="Create Content"
          description="Generate AI-powered posts for your social media in seconds"
          buttonText="Start Creating"
          buttonHref="/create"
          icon={IconSparkles}
          variant="primary"
        />
        <CTACard
          title="Generate Today's Post"
          description="Let AI create the perfect content for today based on trends"
          buttonText="Quick Generate"
          buttonHref="/create"
          icon={IconRocket}
          variant="secondary"
        />
      </SimpleGrid>

      {/* Stats Grid */}
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" mb="xl">
        <StatCard
          title="Scheduled Posts"
          value={scheduledCount}
          description="Ready to publish"
          icon={IconCalendarEvent}
          color="violet"
        />
        <StatCard
          title="AI Generated"
          value={contents.length}
          description="This week"
          icon={IconSparkles}
          color="indigo"
          trend={{ value: 23, label: 'vs last week' }}
        />
        <StatCard
          title="Posts Published"
          value={postedCount}
          description="This month"
          icon={IconPhoto}
          color="green"
        />
        <StatCard
          title="Engagement"
          value="+18%"
          description="Overall growth"
          icon={IconTrendingUp}
          color="teal"
          trend={{ value: 12, label: 'vs last month' }}
        />
      </SimpleGrid>

      {/* Content Grid */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <RecentContent />
        
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Box className="p-4 lg:p-5 rounded-xl bg-card border border-border h-full">
            <Text fw={600} size="lg" mb="md" className="text-foreground">
              Quick Actions
            </Text>
            
            <SimpleGrid cols={2} spacing="sm">
              {[
                { label: 'Instagram Post', icon: IconPhoto, color: 'pink' },
                { label: 'Facebook Update', icon: IconPhoto, color: 'blue' },
                { label: 'WhatsApp Status', icon: IconPhoto, color: 'green' },
                { label: 'Google Business', icon: IconPhoto, color: 'orange' },
              ].map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: 0.5 + (index * 0.05) }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <Box 
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `var(--mantine-color-${action.color}-1)` }}
                  >
                    <action.icon 
                      size={20} 
                      style={{ color: `var(--mantine-color-${action.color}-6)` }}
                    />
                  </Box>
                  <Text size="xs" fw={500} className="text-foreground">
                    {action.label}
                  </Text>
                </motion.button>
              ))}
            </SimpleGrid>
          </Box>
        </motion.div>
      </SimpleGrid>
    </div>
  )
}
