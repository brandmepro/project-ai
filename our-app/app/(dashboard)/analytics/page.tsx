'use client'

import { useState } from 'react'
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
  Loader,
  Center,
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
import {
  useAnalyticsControllerGetOverview,
  useAnalyticsControllerGetEngagement,
  useAnalyticsControllerGetPlatforms,
  useAnalyticsControllerGetTopContent,
} from '@businesspro/api-client'

const platformIcons = {
  instagram: IconBrandInstagram,
  facebook: IconBrandFacebook,
  whatsapp: IconBrandWhatsapp,
  'google-business': IconBrandInstagram,
}

const platformColors = {
  instagram: 'pink',
  facebook: 'blue',
  whatsapp: 'green',
  'google-business': 'orange',
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')

  const { data: overview, isLoading: overviewLoading } = useAnalyticsControllerGetOverview({ range: dateRange })
  const { data: engagement, isLoading: engagementLoading } = useAnalyticsControllerGetEngagement({ range: dateRange })
  const { data: platforms, isLoading: platformsLoading } = useAnalyticsControllerGetPlatforms({ range: dateRange })
  const { data: topContent, isLoading: topContentLoading } = useAnalyticsControllerGetTopContent()

  const isLoading = overviewLoading || engagementLoading || platformsLoading || topContentLoading

  if (isLoading) {
    return (
      <Center h="50vh">
        <Loader size="lg" />
      </Center>
    )
  }

  const maxEngagement = engagement ? Math.max(...engagement.map((d: any) => d.engagement)) : 1

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
            value={dateRange}
            onChange={(value) => setDateRange(value as '7d' | '30d' | '90d')}
            className="w-40"
          />
        </Group>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <Center py="xl">
          <Loader size="lg" color="violet" />
        </Center>
      )}

      {/* Stats Grid */}
      {!isLoading && overview && (
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" mb="xl">
          <StatCard
            title="Total Engagement"
            value={overview.totalEngagement.toLocaleString()}
            icon={IconThumbUp}
            color="violet"
            trend={{ value: overview.engagementGrowth, label: 'vs last period' }}
          />
          <StatCard
            title="Total Reach"
            value={overview.totalReach.toLocaleString()}
            icon={IconEye}
            color="blue"
            trend={{ value: overview.reachGrowth, label: 'vs last period' }}
          />
          <StatCard
            title="Posts Published"
            value={overview.postsPublished}
            icon={IconShare}
            color="green"
            trend={{ value: overview.postsGrowth, label: 'vs last period' }}
          />
          <StatCard
            title="Followers"
            value={overview.followers.toLocaleString()}
            icon={IconUsers}
            color="pink"
            trend={{ value: overview.followersGrowth, label: 'vs last period' }}
          />
        </SimpleGrid>
      )}

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
              {(engagement || []).map((data: any, index: number) => (
                <motion.div
                  key={data.day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
                >
                  <Group gap="sm" wrap="nowrap">
                    <Text size="sm" fw={500} className="w-16 text-foreground">
                      {new Date(data.day).toLocaleDateString('en-US', { weekday: 'short' })}
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
              {platforms && platforms.map((stat, index) => {
                const Icon = platformIcons[stat.platform as keyof typeof platformIcons]?.icon || IconUsers
                const color = platformIcons[stat.platform as keyof typeof platformIcons]?.color || 'gray'
                const totalEngagement = platforms.reduce((acc, s) => acc + s.engagement, 0)
                const percentage = totalEngagement > 0 ? Math.round((stat.engagement / totalEngagement) * 100) : 0
                
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
                          style={{ backgroundColor: `var(--mantine-color-${color}-1)` }}
                        >
                          <Icon size={20} style={{ color: `var(--mantine-color-${color}-6)` }} />
                        </Box>
                        <Stack gap={0}>
                          <Text size="sm" fw={500} className="text-foreground" tt="capitalize">
                            {stat.platform.replace('-', ' ')}
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
                          sections={[{ value: percentage, color: color }]}
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
            {(topContent || []).map((content: any, index: number) => (
              <motion.div
                key={content.id}
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

                  <Badge size="sm" variant="light" color={platformColors[content.platform as keyof typeof platformColors] || 'gray'}>
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
