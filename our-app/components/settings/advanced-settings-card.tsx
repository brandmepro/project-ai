'use client'

import { useState, useEffect } from 'react'
import { Group, Text, Stack, Switch, Select, Button, Box, Collapse } from '@mantine/core'
import { IconSettings, IconChevronDown, IconChevronUp, IconTrash, IconRefresh } from '@tabler/icons-react'
import { SettingsSectionCard } from './settings-section-card'
import {
  useUsersControllerGetAdvancedSettings,
  useUsersControllerUpdateAdvancedSettings,
  useUsersControllerResetAllSettings,
} from '@businesspro/api-client'
import { useQueryClient } from '@tanstack/react-query'

interface AdvancedSettingsCardProps {
  index?: number
}

export function AdvancedSettingsCard({ index }: AdvancedSettingsCardProps) {
  const queryClient = useQueryClient()
  const { data: advancedSettings } = useUsersControllerGetAdvancedSettings()
  const updateMutation = useUsersControllerUpdateAdvancedSettings()
  const resetMutation = useUsersControllerResetAllSettings()

  const [opened, setOpened] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [apiLogs, setApiLogs] = useState(false)
  const [betaFeatures, setBetaFeatures] = useState(false)
  const [aiModelTesting, setAiModelTesting] = useState(false)
  const [imageQuality, setImageQuality] = useState('high')
  const [cacheDuration, setCacheDuration] = useState('7')

  useEffect(() => {
    if (advancedSettings) {
      const settings = advancedSettings as any
      setDebugMode(settings.debugMode !== undefined ? settings.debugMode : false)
      setApiLogs(settings.apiLogs !== undefined ? settings.apiLogs : false)
      setBetaFeatures(settings.betaFeatures !== undefined ? settings.betaFeatures : false)
      setAiModelTesting(settings.aiModelTesting !== undefined ? settings.aiModelTesting : false)
      setImageQuality(settings.imageQuality || 'high')
      setCacheDuration(String(settings.cacheDuration || 7))
    }
  }, [advancedSettings])

  const handleUpdate = async (field: string, value: any) => {
    try {
      await updateMutation.mutateAsync({
        data: { [field]: value } as any,
      })
      queryClient.invalidateQueries({ queryKey: ['/api/v1/users/settings/advanced'] })
    } catch (error) {
      console.error('Failed to update advanced settings:', error)
    }
  }

  const handleResetAll = async () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      try {
        await resetMutation.mutateAsync()
        // Invalidate all settings queries
        queryClient.invalidateQueries({ queryKey: ['/api/v1/users/settings'] })
        queryClient.invalidateQueries({ queryKey: ['/api/v1/users/preferences'] })
        queryClient.invalidateQueries({ queryKey: ['/api/v1/users/notifications'] })
      } catch (error) {
        console.error('Failed to reset settings:', error)
      }
    }
  }

  return (
    <SettingsSectionCard
      title="Advanced Settings"
      description="Developer options and performance tuning"
      icon={IconSettings}
      index={index}
    >
      {/* Expand/Collapse Toggle */}
      <Button
        variant="subtle"
        color="gray"
        fullWidth
        rightSection={opened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        onClick={() => setOpened(!opened)}
      >
        {opened ? 'Hide' : 'Show'} Advanced Options
      </Button>

      <Collapse in={opened}>
        <Stack gap="md" mt="md">
          {/* Developer Options */}
          <Box>
            <Text size="sm" fw={500} mb="sm" className="text-foreground">
              Developer Options
            </Text>
            <Stack gap="sm">
              <Group justify="space-between">
                <Box style={{ flex: 1 }}>
                  <Text size="sm" className="text-foreground">
                    Enable debug mode
                  </Text>
                  <Text size="xs" c="dimmed">
                    Show detailed error messages
                  </Text>
                </Box>
                <Switch
                  checked={debugMode}
                  onChange={(e) => {
                    const value = e.currentTarget.checked
                    setDebugMode(value)
                    handleUpdate('debugMode', value)
                  }}
                  color="orange"
                />
              </Group>

              <Group justify="space-between">
                <Box style={{ flex: 1 }}>
                  <Text size="sm" className="text-foreground">
                    Show API request logs
                  </Text>
                  <Text size="xs" c="dimmed">
                    Log all API requests in console
                  </Text>
                </Box>
                <Switch
                  checked={apiLogs}
                  onChange={(e) => {
                    const value = e.currentTarget.checked
                    setApiLogs(value)
                    handleUpdate('apiLogs', value)
                  }}
                  color="orange"
                />
              </Group>
            </Stack>
          </Box>

          {/* Experimental Features */}
          <Box>
            <Text size="sm" fw={500} mb="sm" className="text-foreground">
              Experimental Features
            </Text>
            <Stack gap="sm">
              <Group justify="space-between">
                <Box style={{ flex: 1 }}>
                  <Text size="sm" className="text-foreground">
                    Beta features access
                  </Text>
                  <Text size="xs" c="dimmed">
                    Try unreleased features (may be unstable)
                  </Text>
                </Box>
                <Switch
                  checked={betaFeatures}
                  onChange={(e) => {
                    const value = e.currentTarget.checked
                    setBetaFeatures(value)
                    handleUpdate('betaFeatures', value)
                  }}
                  color="orange"
                />
              </Group>

              <Group justify="space-between">
                <Box style={{ flex: 1 }}>
                  <Text size="sm" className="text-foreground">
                    AI model testing
                  </Text>
                  <Text size="xs" c="dimmed">
                    Test experimental AI models
                  </Text>
                </Box>
                <Switch
                  checked={aiModelTesting}
                  onChange={(e) => {
                    const value = e.currentTarget.checked
                    setAiModelTesting(value)
                    handleUpdate('aiModelTesting', value)
                  }}
                  color="orange"
                />
              </Group>
            </Stack>
          </Box>

          {/* Performance */}
          <Box>
            <Text size="sm" fw={500} mb="sm" className="text-foreground">
              Performance
            </Text>
            <Stack gap="sm">
              <Select
                label="Image quality"
                description="Balance between quality and loading speed"
                value={imageQuality}
                onChange={(value) => {
                  const val = value || 'high'
                  setImageQuality(val)
                  handleUpdate('imageQuality', val)
                }}
                data={[
                  { value: 'low', label: 'Low (Faster loading)' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High (Better quality)' },
                  { value: 'original', label: 'Original (Largest size)' },
                ]}
              />

              <Select
                label="Cache duration"
                description="How long to store cached data"
                value={cacheDuration}
                onChange={(value) => {
                  const val = value || '7'
                  setCacheDuration(val)
                  handleUpdate('cacheDuration', Number(val))
                }}
                data={[
                  { value: '1', label: '1 day' },
                  { value: '3', label: '3 days' },
                  { value: '7', label: '7 days (Recommended)' },
                  { value: '14', label: '14 days' },
                  { value: '30', label: '30 days' },
                ]}
              />
            </Stack>
          </Box>

          {/* Danger Zone */}
          <Box className="p-4 rounded-lg border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
            <Text size="sm" fw={600} c="red" mb="sm">
              Danger Zone
            </Text>
            <Stack gap="xs">
              <Button
                variant="light"
                color="red"
                fullWidth
                leftSection={<IconRefresh size={16} />}
                size="xs"
                loading={resetMutation.isPending}
                onClick={handleResetAll}
              >
                Reset All Settings to Default
              </Button>
              <Button
                variant="light"
                color="red"
                fullWidth
                leftSection={<IconTrash size={16} />}
                size="xs"
              >
                Clear All Cache
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Collapse>
    </SettingsSectionCard>
  )
}
