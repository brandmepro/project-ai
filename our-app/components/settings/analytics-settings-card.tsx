'use client'

import { useState, useEffect } from 'react'
import { Group, Text, Stack, Switch, Select, Button, Box, Checkbox } from '@mantine/core'
import { IconChartLine, IconDownload, IconFileExport } from '@tabler/icons-react'
import { SettingsSectionCard } from './settings-section-card'
import {
  useUsersControllerGetAnalyticsSettings,
  useUsersControllerUpdateAnalyticsSettings,
} from '@businesspro/api-client'
import { useQueryClient } from '@tanstack/react-query'

interface AnalyticsSettingsCardProps {
  index?: number
}

export function AnalyticsSettingsCard({ index }: AnalyticsSettingsCardProps) {
  const queryClient = useQueryClient()
  const { data: analyticsSettings } = useUsersControllerGetAnalyticsSettings()
  const updateMutation = useUsersControllerUpdateAnalyticsSettings()

  const [weeklyReportDay, setWeeklyReportDay] = useState('monday')
  const [includeReach, setIncludeReach] = useState(true)
  const [includeEngagement, setIncludeEngagement] = useState(true)
  const [includeGrowth, setIncludeGrowth] = useState(true)
  const [includeTopPosts, setIncludeTopPosts] = useState(true)
  const [trackClicks, setTrackClicks] = useState(true)
  const [trackVisits, setTrackVisits] = useState(true)
  const [trackDemographics, setTrackDemographics] = useState(false)

  useEffect(() => {
    if (analyticsSettings) {
      const settings = analyticsSettings as any
      setWeeklyReportDay(settings.weeklyReportDay || 'monday')
      setIncludeReach(settings.includeReach !== undefined ? settings.includeReach : true)
      setIncludeEngagement(settings.includeEngagement !== undefined ? settings.includeEngagement : true)
      setIncludeGrowth(settings.includeGrowth !== undefined ? settings.includeGrowth : true)
      setIncludeTopPosts(settings.includeTopPosts !== undefined ? settings.includeTopPosts : true)
      setTrackClicks(settings.trackClicks !== undefined ? settings.trackClicks : true)
      setTrackVisits(settings.trackVisits !== undefined ? settings.trackVisits : true)
      setTrackDemographics(settings.trackDemographics !== undefined ? settings.trackDemographics : false)
    }
  }, [analyticsSettings])

  const handleUpdate = async (field: string, value: any) => {
    try {
      await updateMutation.mutateAsync({
        data: { [field]: value } as any,
      })
      queryClient.invalidateQueries({ queryKey: ['/api/v1/users/settings/analytics'] })
    } catch (error) {
      console.error('Failed to update analytics settings:', error)
    }
  }

  return (
    <SettingsSectionCard
      title="Analytics & Insights"
      description="Configure reports and data tracking preferences"
      icon={IconChartLine}
      index={index}
    >
      {/* Report Settings */}
      <Box>
        <Text size="sm" fw={500} mb="sm" className="text-foreground">
          Report Settings
        </Text>
        <Stack gap="sm">
          <Select
            label="Weekly Report Schedule"
            description="Receive automated performance summaries"
            value={weeklyReportDay}
            onChange={(value) => {
              const val = value || 'monday'
              setWeeklyReportDay(val)
              handleUpdate('weeklyReportDay', val)
            }}
            data={[
              { value: 'monday', label: 'Monday 9:00 AM' },
              { value: 'tuesday', label: 'Tuesday 9:00 AM' },
              { value: 'wednesday', label: 'Wednesday 9:00 AM' },
              { value: 'thursday', label: 'Thursday 9:00 AM' },
              { value: 'friday', label: 'Friday 9:00 AM' },
              { value: 'saturday', label: 'Saturday 9:00 AM' },
              { value: 'sunday', label: 'Sunday 9:00 AM' },
            ]}
          />

          <Box className="p-3 rounded-lg bg-secondary/30">
            <Text size="xs" fw={500} mb="sm" className="text-foreground">
              Include in reports
            </Text>
            <Stack gap="xs">
              <Checkbox
                label="Reach metrics"
                checked={includeReach}
                onChange={(e) => {
                  const value = e.currentTarget.checked
                  setIncludeReach(value)
                  handleUpdate('includeReach', value)
                }}
                color="violet"
                size="xs"
              />
              <Checkbox
                label="Engagement metrics"
                checked={includeEngagement}
                onChange={(e) => {
                  const value = e.currentTarget.checked
                  setIncludeEngagement(value)
                  handleUpdate('includeEngagement', value)
                }}
                color="violet"
                size="xs"
              />
              <Checkbox
                label="Growth trends"
                checked={includeGrowth}
                onChange={(e) => {
                  const value = e.currentTarget.checked
                  setIncludeGrowth(value)
                  handleUpdate('includeGrowth', value)
                }}
                color="violet"
                size="xs"
              />
              <Checkbox
                label="Top performing posts"
                checked={includeTopPosts}
                onChange={(e) => {
                  const value = e.currentTarget.checked
                  setIncludeTopPosts(value)
                  handleUpdate('includeTopPosts', value)
                }}
                color="violet"
                size="xs"
              />
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Data Tracking */}
      <Box>
        <Text size="sm" fw={500} mb="sm" className="text-foreground">
          Data Tracking
        </Text>
        <Stack gap="sm">
          <Group justify="space-between">
            <Box style={{ flex: 1 }}>
              <Text size="sm" className="text-foreground">
                Track link clicks
              </Text>
              <Text size="xs" c="dimmed">
                Monitor clicks on shared links
              </Text>
            </Box>
            <Switch
              checked={trackClicks}
              onChange={(e) => {
                const value = e.currentTarget.checked
                setTrackClicks(value)
                handleUpdate('trackClicks', value)
              }}
              color="violet"
            />
          </Group>

          <Group justify="space-between">
            <Box style={{ flex: 1 }}>
              <Text size="sm" className="text-foreground">
                Track profile visits
              </Text>
              <Text size="xs" c="dimmed">
                See who viewed your profile
              </Text>
            </Box>
            <Switch
              checked={trackVisits}
              onChange={(e) => {
                const value = e.currentTarget.checked
                setTrackVisits(value)
                handleUpdate('trackVisits', value)
              }}
              color="violet"
            />
          </Group>

          <Group justify="space-between">
            <Box style={{ flex: 1 }}>
              <Text size="sm" className="text-foreground">
                Track follower demographics
              </Text>
              <Text size="xs" c="dimmed">
                Analyze audience age, location, etc.
              </Text>
            </Box>
            <Switch
              checked={trackDemographics}
              onChange={(e) => {
                const value = e.currentTarget.checked
                setTrackDemographics(value)
                handleUpdate('trackDemographics', value)
              }}
              color="violet"
            />
          </Group>
        </Stack>
      </Box>

      {/* Export Options */}
      <Box>
        <Text size="sm" fw={500} mb="sm" className="text-foreground">
          Export Options
        </Text>
        <Stack gap="xs">
          <Button
            variant="light"
            color="violet"
            fullWidth
            leftSection={<IconDownload size={16} />}
          >
            Download This Month's Report
          </Button>
          <Button
            variant="light"
            color="gray"
            fullWidth
            leftSection={<IconFileExport size={16} />}
          >
            Export All Data (CSV)
          </Button>
        </Stack>
      </Box>
    </SettingsSectionCard>
  )
}
