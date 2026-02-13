'use client'

import { useState, useEffect } from 'react'
import {
  Modal,
  Stack,
  Group,
  Text,
  Button,
  Switch,
  Box,
  Badge,
  TextInput,
  Divider,
  Paper,
} from '@mantine/core'
import {
  IconSparkles,
  IconClock,
  IconTrendingUp,
  IconUsers,
  IconCheck,
} from '@tabler/icons-react'
import {
  useUsersControllerGetSchedulingSettings,
  useUsersControllerUpdateSchedulingSettings,
} from '@businesspro/api-client'
import { useQueryClient } from '@tanstack/react-query'

interface SchedulingModalProps {
  opened: boolean
  onClose: () => void
}

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const aiRecommendedSchedule = [
  {
    day: 'Monday',
    times: ['09:00', '14:00', '19:00'],
    engagement: 'High',
    reason: 'Peak engagement at start of week',
  },
  {
    day: 'Tuesday',
    times: ['09:00', '14:00', '19:00'],
    engagement: 'High',
    reason: 'Consistent mid-week activity',
  },
  {
    day: 'Wednesday',
    times: ['09:00', '14:00', '19:00'],
    engagement: 'Very High',
    reason: 'Highest engagement day',
  },
  {
    day: 'Thursday',
    times: ['09:00', '14:00', '19:00'],
    engagement: 'High',
    reason: 'Strong pre-weekend engagement',
  },
  {
    day: 'Friday',
    times: ['09:00', '14:00', '19:00'],
    engagement: 'High',
    reason: 'End of week momentum',
  },
  {
    day: 'Saturday',
    times: ['11:00', '17:00'],
    engagement: 'Medium',
    reason: 'Weekend leisure browsing',
  },
  {
    day: 'Sunday',
    times: ['11:00', '17:00'],
    engagement: 'Medium',
    reason: 'Relaxed weekend engagement',
  },
]

export function SchedulingModal({ opened, onClose }: SchedulingModalProps) {
  const queryClient = useQueryClient()
  const { data: schedulingSettings } = useUsersControllerGetSchedulingSettings()
  const updateMutation = useUsersControllerUpdateSchedulingSettings()

  const [isAuto, setIsAuto] = useState(true)
  const [schedule, setSchedule] = useState(aiRecommendedSchedule)

  useEffect(() => {
    if (schedulingSettings) {
      const settings = schedulingSettings as any
      setIsAuto(settings.optimizeTiming !== undefined ? settings.optimizeTiming : true)
      // If custom schedule exists, update the display
      if (settings.postingSchedule) {
        const customSchedule = aiRecommendedSchedule.map((day) => ({
          ...day,
          times: settings.postingSchedule[day.day.toLowerCase()] || day.times,
        }))
        setSchedule(customSchedule)
      }
    }
  }, [schedulingSettings])

  const handleSave = async () => {
    try {
      const postingSchedule = schedule.reduce((acc, day) => {
        acc[day.day.toLowerCase()] = day.times
        return acc
      }, {} as Record<string, string[]>)

      await updateMutation.mutateAsync({
        data: {
          optimizeTiming: isAuto,
          postingSchedule,
        } as any,
      })
      queryClient.invalidateQueries({ queryKey: ['/api/v1/users/settings/scheduling'] })
      onClose()
    } catch (error) {
      console.error('Failed to save schedule:', error)
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconClock size={20} className="text-primary" />
          <Text fw={600} size="lg">
            Posting Schedule
          </Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="lg">
        {/* Auto/Manual Toggle */}
        <Box className="p-4 rounded-lg bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 border border-violet-200 dark:border-violet-800">
          <Group justify="space-between" mb="sm">
            <Box style={{ flex: 1 }}>
              <Group gap="xs">
                <IconSparkles size={18} className="text-violet-600 dark:text-violet-400" />
                <Text size="sm" fw={600} className="text-foreground">
                  AI-Optimized Schedule
                </Text>
                <Badge size="xs" variant="light" color="violet">
                  Recommended
                </Badge>
              </Group>
              <Text size="xs" c="dimmed" mt={4}>
                Let AI pick the best times based on your audience engagement
              </Text>
            </Box>
            <Switch
              checked={isAuto}
              onChange={(e) => setIsAuto(e.currentTarget.checked)}
              color="violet"
              size="md"
            />
          </Group>

          {isAuto && (
            <Box className="p-3 rounded-lg bg-white/50 dark:bg-black/20">
              <Group gap="xs" mb="xs">
                <IconTrendingUp size={14} className="text-green-600" />
                <Text size="xs" fw={500} c="green">
                  +34% better engagement
                </Text>
              </Group>
              <Text size="xs" c="dimmed">
                Based on analysis of 1,247 posts from similar cafes
              </Text>
            </Box>
          )}
        </Box>

        {/* Schedule View */}
        {isAuto ? (
          <Stack gap="sm">
            <Group gap="xs" mb="xs">
              <IconUsers size={16} className="text-primary" />
              <Text size="sm" fw={500} className="text-foreground">
                AI-Recommended Times
              </Text>
            </Group>

            {schedule.map((day) => (
              <Paper
                key={day.day}
                className="p-3 bg-secondary/30 border border-border"
                withBorder={false}
              >
                <Group justify="space-between" align="flex-start">
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Group gap="xs">
                      <Text size="sm" fw={500} className="text-foreground">
                        {day.day}
                      </Text>
                      <Badge
                        size="xs"
                        variant="dot"
                        color={
                          day.engagement === 'Very High'
                            ? 'green'
                            : day.engagement === 'High'
                            ? 'violet'
                            : 'gray'
                        }
                      >
                        {day.engagement}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {day.reason}
                    </Text>
                    <Group gap="xs" mt={4}>
                      {day.times.map((time) => (
                        <Badge
                          key={time}
                          size="sm"
                          variant="light"
                          color="violet"
                          leftSection={<IconClock size={12} />}
                        >
                          {time}
                        </Badge>
                      ))}
                    </Group>
                  </Stack>

                  <IconCheck
                    size={18}
                    className="text-green-600 dark:text-green-400 flex-shrink-0"
                  />
                </Group>
              </Paper>
            ))}

            {/* AI Insights */}
            <Box className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <Group gap="xs" mb="sm">
                <IconSparkles size={16} className="text-blue-600" />
                <Text size="sm" fw={600} className="text-foreground">
                  Why these times?
                </Text>
              </Group>
              <Stack gap="xs">
                <Text size="xs" className="text-foreground">
                  • <strong>Morning (9 AM):</strong> Catch commuters and morning browsers
                </Text>
                <Text size="xs" className="text-foreground">
                  • <strong>Afternoon (2 PM):</strong> Lunch break scrolling peak time
                </Text>
                <Text size="xs" className="text-foreground">
                  • <strong>Evening (7 PM):</strong> After-work relaxation period
                </Text>
                <Text size="xs" className="text-foreground">
                  • <strong>Weekend (11 AM, 5 PM):</strong> Leisure browsing patterns
                </Text>
              </Stack>
            </Box>
          </Stack>
        ) : (
          <Stack gap="sm">
            <Group gap="xs" mb="xs">
              <IconClock size={16} className="text-primary" />
              <Text size="sm" fw={500} className="text-foreground">
                Custom Schedule
              </Text>
            </Group>

            {daysOfWeek.map((day) => (
              <Box key={day}>
                <Group gap="sm" align="flex-start">
                  <Text
                    size="sm"
                    fw={500}
                    className="text-foreground"
                    style={{ minWidth: '100px' }}
                  >
                    {day}
                  </Text>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <TextInput
                      type="time"
                      placeholder="Add time"
                      size="xs"
                      leftSection={<IconClock size={14} />}
                    />
                  </Stack>
                </Group>
                {day !== 'Sunday' && <Divider my="xs" />}
              </Box>
            ))}

            <Text size="xs" c="dimmed" ta="center" mt="sm">
              Note: Manual schedules may have lower engagement than AI-optimized times
            </Text>
          </Stack>
        )}

        {/* Actions */}
        <Group justify="flex-end">
          <Button variant="light" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="filled" 
            color="violet" 
            onClick={handleSave}
            loading={updateMutation.isPending}
          >
            Save Schedule
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
