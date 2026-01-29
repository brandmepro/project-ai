'use client'

import { motion } from 'framer-motion'
import { 
  Text, 
  Stack, 
  Group, 
  SimpleGrid,
  Paper,
  Box,
  Select,
  Progress,
  RingProgress,
  Badge,
} from '@mantine/core'
import { 
  IconTrendingUp,
  IconEye,
  IconThumbUp,
  IconShare,
  IconUsers,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandWhatsapp,
} from '@tabler/icons-react'
import { StatCard } from '@/components/ui/stat-card'
import { useAppStore } from '@/lib/store'

// Mock analytics data
const mockAnalytics = {
  totalEngagement: 2847,
  engagementGrowth: 18,
  totalReach: 12543,
  reachGrowth: 24,
  postsPublished: 28,
  postsGrowth: 12,
  followers: 1250,
  followersGrowth: 8,
}

const platformStats = [
  { platform: 'Instagram', posts: 12, engagement: 1245, icon: IconBrandInstagram, color: 'pink' },
  { platform: 'Facebook', posts: 8, engagement: 892, icon: IconBrandFacebook, color: 'blue' },
  { platform: 'WhatsApp', posts: 8, engagement: 710, icon: IconBrandWhatsapp, color: 'green' },
]

const weeklyData = [
  { day: 'Mon', posts: 4, engagement: 320 },
  { day: 'Tue', posts: 3, engagement: 280 },
  { day: 'Wed', posts: 5, engagement: 450 },
  { day: 'Thu', posts: 4, engagement: 380 },
  { day: 'Fri', posts: 6, engagement: 520 },
  { day: 'Sat', posts: 3, engagement: 410 },
  { day: 'Sun', posts: 3, engagement: 487 },
]

const topContent = [
  { title: 'Morning Coffee Special', engagement: 523, platform: 'instagram' },
  { title: 'Republic Day Offer', engagement: 412, platform: 'facebook' },
  { title: 'New Menu Launch', engagement: 389, platform: 'instagram' },
]

export default function AnalyticsPage() {
  const { contents } = useAppStore()
  const maxEngagement = Math.max(...weeklyData.map(d => d.engagement))

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Group justify="space-between" mb="lg" wrap="nowrap">
          <Stack gap={4}>
            <Text size="xl" fw={700} className="text-foreground">
              Analytics
            </Text>
            <Text size="sm" c="dimmed">
              Track your social media performance
            </Text>
          </Stack>

          <Select
            data={[
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: '90d', label: 'Last 90 days' },
            ]}
            defaultValue="30d"
            className="w-40"
          />
        </Group>
      </motion.div>

      {/* Stats Grid */}
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" mb="xl">
        <StatCard
          title="Total Engagement"
          value={mockAnalytics.totalEngagement.toLocaleString()}
          icon={IconThumbUp}
          color="violet"
          trend={{ value: mockAnalytics.engagementGrowth, label: 'vs last period' }}
        />
        <StatCard
          title="Total Reach"
          value={mockAnalytics.totalReach.toLocaleString()}
          icon={IconEye}
          color="blue"
          trend={{ value: mockAnalytics.reachGrowth, label: 'vs last period' }}
        />
        <StatCard
          title="Posts Published"
          value={mockAnalytics.postsPublished}
          icon={IconShare}
          color="green"
          trend={{ value: mockAnalytics.postsGrowth, label: 'vs last period' }}
        />
        <StatCard
          title="Followers"
          value={mockAnalytics.followers.toLocaleString()}
          icon={IconUsers}
          color="pink"
          trend={{ value: mockAnalytics.followersGrowth, label: 'vs last period' }}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mb="xl">
        {/* Weekly Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Paper className="p-5 bg-card border border-border h-full" withBorder={false}>
            <Text fw={600} size="lg" mb="lg" className="text-foreground">
              Weekly Engagement
            </Text>
            
            <Stack gap="md">
              {weeklyData.map((data, index) => (
                <motion.div
                  key={data.day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
                >
                  <Group gap="sm" wrap="nowrap">
                    <Text size="sm" fw={500} className="w-10 text-foreground">
                      {data.day}
                    </Text>
                    <Box className="flex-1">
                      <Progress 
                        value={(data.engagement / maxEngagement) * 100} 
                        color="violet"
                        size="lg"
                        radius="md"
                      />
                    </Box>
                    <Text size="sm" c="dimmed" className="w-16 text-right">
                      {data.engagement}
                    </Text>
                  </Group>
                </motion.div>
              ))}
            </Stack>
          </Paper>
        </motion.div>

        {/* Platform Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Paper className="p-5 bg-card border border-border h-full" withBorder={false}>
            <Text fw={600} size="lg" mb="lg" className="text-foreground">
              Platform Performance
            </Text>
            
            <Stack gap="lg">
              {platformStats.map((stat, index) => {
                const Icon = stat.icon
                const totalEngagement = platformStats.reduce((acc, s) => acc + s.engagement, 0)
                const percentage = Math.round((stat.engagement / totalEngagement) * 100)
                
                return (
                  <motion.div
                    key={stat.platform}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.4 + index * 0.1 }}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="sm">
                        <Box 
                          className="flex h-10 w-10 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `var(--mantine-color-${stat.color}-1)` }}
                        >
                          <Icon size={20} style={{ color: `var(--mantine-color-${stat.color}-6)` }} />
                        </Box>
                        <Stack gap={0}>
                          <Text size="sm" fw={500} className="text-foreground">
                            {stat.platform}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {stat.posts} posts
                          </Text>
                        </Stack>
                      </Group>
                      
                      <Group gap="md">
                        <Stack gap={0} align="flex-end">
                          <Text size="sm" fw={600} className="text-foreground">
                            {stat.engagement.toLocaleString()}
                          </Text>
                          <Text size="xs" c="dimmed">
                            engagements
                          </Text>
                        </Stack>
                        <RingProgress
                          size={50}
                          thickness={4}
                          sections={[{ value: percentage, color: stat.color }]}
                          label={
                            <Text size="xs" ta="center" fw={600}>
                              {percentage}%
                            </Text>
                          }
                        />
                      </Group>
                    </Group>
                  </motion.div>
                )
              })}
            </Stack>
          </Paper>
        </motion.div>
      </SimpleGrid>

      {/* Top Performing Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Paper className="p-5 bg-card border border-border" withBorder={false}>
          <Group justify="space-between" mb="lg">
            <Text fw={600} size="lg" className="text-foreground">
              Top Performing Content
            </Text>
            <Badge variant="light" color="violet">
              Last 30 days
            </Badge>
          </Group>
          
          <Stack gap="sm">
            {topContent.map((content, index) => (
              <motion.div
                key={content.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.5 + index * 0.1 }}
              >
                <Box className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <Box className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Text size="sm" fw={700} c="violet">
                      #{index + 1}
                    </Text>
                  </Box>
                  
                  <Box className="flex-1 min-w-0">
                    <Text size="sm" fw={500} truncate className="text-foreground">
                      {content.title}
                    </Text>
                  </Box>

                  <Badge size="sm" variant="light" color={content.platform === 'instagram' ? 'pink' : 'blue'}>
                    {content.platform}
                  </Badge>

                  <Group gap="xs">
                    <IconTrendingUp size={14} className="text-green-500" />
                    <Text size="sm" fw={600} className="text-foreground">
                      {content.engagement}
                    </Text>
                  </Group>
                </Box>
              </motion.div>
            ))}
          </Stack>
        </Paper>
      </motion.div>
    </div>
  )
}
