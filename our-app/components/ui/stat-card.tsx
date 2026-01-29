'use client'

import { motion } from 'framer-motion'
import { Paper, Text, Group, ThemeIcon, Stack } from '@mantine/core'
import type { TablerIcon } from '@tabler/icons-react'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: TablerIcon
  trend?: {
    value: number
    label: string
  }
  color?: string
}

export function StatCard({ title, value, description, icon: Icon, trend, color = 'violet' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper className="p-4 lg:p-5 h-full bg-card border border-border" withBorder={false}>
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Text size="sm" c="dimmed" fw={500}>
              {title}
            </Text>
            <Text size="xl" fw={700} className="text-foreground">
              {value}
            </Text>
            {description && (
              <Text size="xs" c="dimmed">
                {description}
              </Text>
            )}
            {trend && (
              <Text size="xs" c={trend.value >= 0 ? 'teal' : 'red'} fw={500}>
                {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
              </Text>
            )}
          </Stack>
          <ThemeIcon size="lg" radius="lg" variant="light" color={color}>
            <Icon size={20} stroke={1.5} />
          </ThemeIcon>
        </Group>
      </Paper>
    </motion.div>
  )
}
