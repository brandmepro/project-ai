'use client'

import { useState, useEffect } from 'react'
import { Group, Text, Stack, Switch, Select, Button, Box, Badge } from '@mantine/core'
import { IconCalendarEvent, IconEdit, IconSparkles } from '@tabler/icons-react'
import { SettingsSectionCard } from './settings-section-card'
import { SchedulingModal } from './scheduling-modal'
import {
  useUsersControllerGetSchedulingSettings,
  useUsersControllerUpdateSchedulingSettings,
} from '@businesspro/api-client'
import { useQueryClient } from '@tanstack/react-query'

interface SchedulingCardProps {
  index?: number
}

export function SchedulingCard({ index }: SchedulingCardProps) {
  const queryClient = useQueryClient()
  const { data: schedulingSettings } = useUsersControllerGetSchedulingSettings()
  const updateMutation = useUsersControllerUpdateSchedulingSettings()

  const [modalOpened, setModalOpened] = useState(false)
  const [autoScheduling, setAutoScheduling] = useState(true)
  const [optimizeTiming, setOptimizeTiming] = useState(true)
  const [minBuffer, setMinBuffer] = useState('2')
  const [maxPostsPerDay, setMaxPostsPerDay] = useState('3')

  useEffect(() => {
    if (schedulingSettings) {
      const settings = schedulingSettings as any
      setAutoScheduling(settings.autoScheduling !== undefined ? settings.autoScheduling : true)
      setOptimizeTiming(settings.optimizeTiming !== undefined ? settings.optimizeTiming : true)
      setMinBuffer(String(settings.minBuffer || 2))
      setMaxPostsPerDay(String(settings.maxPostsPerDay || 3))
    }
  }, [schedulingSettings])

  const handleUpdate = async (field: string, value: any) => {
    try {
      await updateMutation.mutateAsync({
        data: { [field]: value } as any,
      })
      queryClient.invalidateQueries({ queryKey: ['/api/v1/users/settings/scheduling'] })
    } catch (error) {
      console.error('Failed to update scheduling settings:', error)
    }
  }

  return (
    <SettingsSectionCard
      title="Auto-Scheduling Settings"
      description="Configure automatic posting schedule and optimization"
      icon={IconCalendarEvent}
      index={index}
    >
      {/* Smart Scheduling Toggles */}
      <Stack gap="sm">
        <Group justify="space-between">
          <Box style={{ flex: 1 }}>
            <Text size="sm" fw={500} className="text-foreground">
              Enable auto-scheduling
            </Text>
            <Text size="xs" c="dimmed">
              Automatically schedule posts to queue
            </Text>
          </Box>
          <Switch
            checked={autoScheduling}
            onChange={(e) => {
              const value = e.currentTarget.checked
              setAutoScheduling(value)
              handleUpdate('autoScheduling', value)
            }}
            color="violet"
          />
        </Group>

        <Group justify="space-between">
          <Box style={{ flex: 1 }}>
            <Text size="sm" fw={500} className="text-foreground">
              Optimize for best posting times
            </Text>
            <Text size="xs" c="dimmed">
              AI picks optimal times based on audience
            </Text>
          </Box>
          <Switch
            checked={optimizeTiming}
            onChange={(e) => {
              const value = e.currentTarget.checked
              setOptimizeTiming(value)
              handleUpdate('optimizeTiming', value)
            }}
            color="violet"
            disabled={!autoScheduling}
          />
        </Group>
      </Stack>

      {/* Posting Schedule */}
      <Box className="p-4 rounded-lg bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 border border-violet-200 dark:border-violet-800">
        <Group justify="space-between" align="flex-start" mb="sm">
          <Stack gap={4}>
            <Group gap="xs">
              <IconSparkles size={16} className="text-violet-600 dark:text-violet-400" />
              <Text size="sm" fw={600} className="text-foreground">
                AI-Optimized Schedule
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              Mon-Fri: 9:00 AM, 2:00 PM, 7:00 PM
            </Text>
            <Text size="xs" c="dimmed">
              Sat-Sun: 11:00 AM, 5:00 PM
            </Text>
          </Stack>
          <Button
            variant="subtle"
            color="violet"
            size="xs"
            leftSection={<IconEdit size={14} />}
            onClick={() => setModalOpened(true)}
          >
            Edit
          </Button>
        </Group>
        <Group gap="xs">
          <Badge size="sm" variant="light" color="green">
            +34% better engagement
          </Badge>
          <Badge size="sm" variant="dot" color="violet">
            Active
          </Badge>
        </Group>
      </Box>

      {/* Content Queue Settings */}
      <Box>
        <Text size="sm" fw={500} mb="sm" className="text-foreground">
          Content Queue
        </Text>
        <Stack gap="sm">
          <Select
            label="Minimum buffer"
            description="Keep posts scheduled this far in advance"
            value={minBuffer}
            onChange={(value) => {
              const val = value || '2'
              setMinBuffer(val)
              handleUpdate('minBuffer', Number(val))
            }}
            data={[
              { value: '1', label: '1 day' },
              { value: '2', label: '2 days' },
              { value: '3', label: '3 days' },
              { value: '7', label: '1 week' },
            ]}
          />

          <Select
            label="Maximum posts per day"
            description="Limit daily scheduled posts"
            value={maxPostsPerDay}
            onChange={(value) => {
              const val = value || '3'
              setMaxPostsPerDay(val)
              handleUpdate('maxPostsPerDay', Number(val))
            }}
            data={[
              { value: '1', label: '1 post' },
              { value: '2', label: '2 posts' },
              { value: '3', label: '3 posts' },
              { value: '5', label: '5 posts' },
              { value: '10', label: '10 posts' },
            ]}
          />
        </Stack>
      </Box>

      {/* Scheduling Modal */}
      <SchedulingModal opened={modalOpened} onClose={() => setModalOpened(false)} />
    </SettingsSectionCard>
  )
}
