'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Paper,
  Text,
  Stack,
  Group,
  Badge,
  Progress,
  Skeleton,
  SimpleGrid,
  Divider,
  Tooltip,
  ActionIcon,
} from '@mantine/core'
import {
  IconSparkles,
  IconCurrencyDollar,
  IconClock,
  IconChartBar,
  IconRefresh,
  IconTrendingUp,
  IconBolt,
} from '@tabler/icons-react'
import { useAIControllerGetAnalytics } from '@businesspro/api-client'
import { QUERY_CONFIG } from '@/lib/query-config'

interface AIAnalyticsCardProps {
  index: number
}

export function AIAnalyticsCard({ index }: AIAnalyticsCardProps) {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today')
  
  // Convert period to days
  const daysMap = {
    today: 1,
    week: 7,
    month: 30,
  }
  
  const { data: analytics, isLoading, refetch } = useAIControllerGetAnalytics(
    { days: daysMap[period] }
  )

  const stats = (analytics as any)?.data || {}

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.3,
      },
    },
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      style={{ height: '100%' }}
    >
      <Paper className="p-6 bg-card border border-border h-full" withBorder={false}>
        <Group justify="space-between" mb="lg">
          <Group gap="sm">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <IconChartBar size={20} className="text-primary" />
            </div>
            <Stack gap={2}>
              <Text fw={600} size="lg" className="text-foreground">
                AI Usage Analytics
              </Text>
              <Text size="xs" c="dimmed">
                Track your AI model usage and costs
              </Text>
            </Stack>
          </Group>
          <Group gap="xs">
            {['today', 'week', 'month'].map((p) => (
              <Badge
                key={p}
                size="sm"
                variant={period === p ? 'filled' : 'light'}
                style={{ cursor: 'pointer' }}
                onClick={() => setPeriod(p as any)}
              >
                {p === 'today' ? 'Today' : p === 'week' ? '7 Days' : '30 Days'}
              </Badge>
            ))}
            <Tooltip label="Refresh">
              <ActionIcon variant="subtle" onClick={() => refetch()}>
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <Stack gap="md">
          {/* Total Requests */}
          <div>
            <Group justify="space-between" mb={8}>
              <Text size="sm" c="dimmed">
                Total AI Requests
              </Text>
              {isLoading ? (
                <Skeleton width={60} height={20} />
              ) : (
                <Text fw={600} size="xl" className="text-foreground">
                  {stats.totalRequests?.toLocaleString() || 0}
                </Text>
              )}
            </Group>
          </div>

          {/* Total Cost */}
          <div>
            <Group justify="space-between" mb={8}>
              <Group gap="xs">
                <IconCurrencyDollar size={16} className="text-muted-foreground" />
                <Text size="sm" c="dimmed">
                  Total Cost
                </Text>
              </Group>
              {isLoading ? (
                <Skeleton width={80} height={20} />
              ) : (
                <Text fw={600} size="lg" className="text-foreground">
                  ${(stats.totalCost || 0).toFixed(4)}
                </Text>
              )}
            </Group>
          </div>

          {/* Tokens Used */}
          <div>
            <Group justify="space-between" mb={8}>
              <Text size="sm" c="dimmed">
                Tokens Processed
              </Text>
              {isLoading ? (
                <Skeleton width={100} height={20} />
              ) : (
                <Text fw={600} className="text-foreground">
                  {(stats.totalTokens || 0).toLocaleString()}
                </Text>
              )}
            </Group>
          </div>

          <Divider />

          {/* Model Usage Breakdown */}
          <div>
            <Text size="sm" fw={500} mb="sm" className="text-foreground">
              Model Usage
            </Text>
            <Stack gap="xs">
              {isLoading ? (
                <>
                  <Skeleton height={40} />
                  <Skeleton height={40} />
                  <Skeleton height={40} />
                </>
              ) : stats.modelBreakdown && stats.modelBreakdown.length > 0 ? (
                stats.modelBreakdown.map((model: any) => (
                  <div key={model.model}>
                    <Group justify="space-between" mb={4}>
                      <Group gap="xs">
                        <IconSparkles size={14} className="text-primary" />
                        <Text size="xs" fw={500}>
                          {model.modelName || model.model}
                        </Text>
                      </Group>
                      <Group gap="sm">
                        <Tooltip label="Requests">
                          <Badge size="xs" variant="light">
                            {model.count}
                          </Badge>
                        </Tooltip>
                        <Tooltip label="Avg Duration">
                          <Group gap={4}>
                            <IconClock size={12} className="text-muted-foreground" />
                            <Text size="xs" c="dimmed">
                              {model.avgDuration || 0}ms
                            </Text>
                          </Group>
                        </Tooltip>
                        <Tooltip label="Cost">
                          <Text size="xs" c="dimmed">
                            ${(model.cost || 0).toFixed(4)}
                          </Text>
                        </Tooltip>
                      </Group>
                    </Group>
                    <Progress
                      value={(model.count / (stats.totalRequests || 1)) * 100}
                      size="xs"
                      color={model.costBucket === 'low' ? 'green' : model.costBucket === 'high' ? 'orange' : 'blue'}
                    />
                  </div>
                ))
              ) : (
                <Text size="xs" c="dimmed" ta="center" py="md">
                  No AI requests yet
                </Text>
              )}
            </Stack>
          </div>

          <Divider />

          {/* Performance Stats */}
          <SimpleGrid cols={3} spacing="xs">
            <div>
              <Group gap={4} mb={4}>
                <IconBolt size={14} className="text-yellow-500" />
                <Text size="xs" c="dimmed">
                  Avg Speed
                </Text>
              </Group>
              {isLoading ? (
                <Skeleton width={60} height={18} />
              ) : (
                <Text size="sm" fw={600} className="text-foreground">
                  {stats.avgDuration || 0}ms
                </Text>
              )}
            </div>
            <div>
              <Group gap={4} mb={4}>
                <IconCurrencyDollar size={14} className="text-green-500" />
                <Text size="xs" c="dimmed">
                  Avg Cost
                </Text>
              </Group>
              {isLoading ? (
                <Skeleton width={60} height={18} />
              ) : (
                <Text size="sm" fw={600} className="text-foreground">
                  ${(stats.avgCost || 0).toFixed(4)}
                </Text>
              )}
            </div>
            <div>
              <Group gap={4} mb={4}>
                <IconTrendingUp size={14} className="text-blue-500" />
                <Text size="xs" c="dimmed">
                  Success Rate
                </Text>
              </Group>
              {isLoading ? (
                <Skeleton width={60} height={18} />
              ) : (
                <Text size="sm" fw={600} className="text-foreground">
                  {stats.successRate || 100}%
                </Text>
              )}
            </div>
          </SimpleGrid>
        </Stack>
      </Paper>
    </motion.div>
  )
}
