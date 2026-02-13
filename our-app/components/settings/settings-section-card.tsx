'use client'

import { Paper, Group, Text, Stack, Badge } from '@mantine/core'
import { motion } from 'framer-motion'
import type { TablerIcon } from '@tabler/icons-react'

interface SettingsSectionCardProps {
  title: string
  description?: string
  icon: TablerIcon
  children: React.ReactNode
  highlight?: boolean
  badge?: string
  index?: number
}

export function SettingsSectionCard({
  title,
  description,
  icon: Icon,
  children,
  highlight,
  badge,
  index = 0,
}: SettingsSectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="h-full"
    >
      <Paper 
        className={`p-4 lg:p-5 bg-card border border-border h-full ${
          highlight ? 'ring-2 ring-primary/20 shadow-lg' : ''
        }`}
        withBorder={false}
      >
        <Group gap="xs" mb="lg" justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <Icon size={20} className="text-primary" />
            <Text fw={600} size="lg" className="text-foreground">
              {title}
            </Text>
          </Group>
          {badge && (
            <Badge size="sm" variant="light" color="violet">
              {badge}
            </Badge>
          )}
        </Group>
        
        {description && (
          <Text size="sm" c="dimmed" mb="md">
            {description}
          </Text>
        )}
        
        <Stack gap="md">
          {children}
        </Stack>
      </Paper>
    </motion.div>
  )
}
