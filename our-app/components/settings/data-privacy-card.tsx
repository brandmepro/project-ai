'use client'

import { useState, useEffect } from 'react'
import { Group, Text, Stack, Switch, Select, Button, Box, Anchor } from '@mantine/core'
import { IconLock, IconDownload, IconTrash, IconAlertTriangle, IconFileText } from '@tabler/icons-react'
import { SettingsSectionCard } from './settings-section-card'
import {
  useUsersControllerGetPrivacySettings,
  useUsersControllerUpdatePrivacySettings,
} from '@businesspro/api-client'
import { useQueryClient } from '@tanstack/react-query'

interface DataPrivacyCardProps {
  index?: number
}

export function DataPrivacyCard({ index }: DataPrivacyCardProps) {
  const queryClient = useQueryClient()
  const { data: privacySettings } = useUsersControllerGetPrivacySettings()
  const updateMutation = useUsersControllerUpdatePrivacySettings()

  const [storeDrafts, setStoreDrafts] = useState(true)
  const [cacheContent, setCacheContent] = useState(true)
  const [analyticsCollection, setAnalyticsCollection] = useState(true)
  const [profileVisibility, setProfileVisibility] = useState('public')
  const [shareAnalytics, setShareAnalytics] = useState('team')

  useEffect(() => {
    if (privacySettings) {
      const settings = privacySettings as any
      setStoreDrafts(settings.storeDrafts !== undefined ? settings.storeDrafts : true)
      setCacheContent(settings.cacheContent !== undefined ? settings.cacheContent : true)
      setAnalyticsCollection(settings.analyticsCollection !== undefined ? settings.analyticsCollection : true)
      setProfileVisibility(settings.profileVisibility || 'public')
      setShareAnalytics(settings.shareAnalytics || 'team')
    }
  }, [privacySettings])

  const handleUpdate = async (field: string, value: any) => {
    try {
      await updateMutation.mutateAsync({
        data: { [field]: value } as any,
      })
      queryClient.invalidateQueries({ queryKey: ['/api/v1/users/settings/privacy'] })
    } catch (error) {
      console.error('Failed to update privacy settings:', error)
    }
  }

  return (
    <SettingsSectionCard
      title="Data & Privacy"
      description="Manage your data and privacy preferences"
      icon={IconLock}
      index={index}
    >
      {/* Data Management */}
      <Box>
        <Text size="sm" fw={500} mb="sm" className="text-foreground">
          Data Management
        </Text>
        <Stack gap="sm">
          <Group justify="space-between">
            <Box style={{ flex: 1 }}>
              <Text size="sm" className="text-foreground">
                Store content drafts
              </Text>
              <Text size="xs" c="dimmed">
                Save drafts in cloud for access anywhere
              </Text>
            </Box>
            <Switch
              checked={storeDrafts}
              onChange={(e) => {
                const value = e.currentTarget.checked
                setStoreDrafts(value)
                handleUpdate('storeDrafts', value)
              }}
              color="violet"
            />
          </Group>

          <Group justify="space-between">
            <Box style={{ flex: 1 }}>
              <Text size="sm" className="text-foreground">
                Cache generated content
              </Text>
              <Text size="xs" c="dimmed">
                Faster access to previously generated content
              </Text>
            </Box>
            <Switch
              checked={cacheContent}
              onChange={(e) => {
                const value = e.currentTarget.checked
                setCacheContent(value)
                handleUpdate('cacheContent', value)
              }}
              color="violet"
            />
          </Group>

          <Group justify="space-between">
            <Box style={{ flex: 1 }}>
              <Text size="sm" className="text-foreground">
                Analytics data collection
              </Text>
              <Text size="xs" c="dimmed">
                Help us improve with usage analytics
              </Text>
            </Box>
            <Switch
              checked={analyticsCollection}
              onChange={(e) => {
                const value = e.currentTarget.checked
                setAnalyticsCollection(value)
                handleUpdate('analyticsCollection', value)
              }}
              color="violet"
            />
          </Group>
        </Stack>
      </Box>

      {/* Privacy Settings */}
      <Box>
        <Text size="sm" fw={500} mb="sm" className="text-foreground">
          Privacy Settings
        </Text>
        <Stack gap="sm">
          <Select
            label="Profile visibility"
            description="Control who can see your profile"
            value={profileVisibility}
            onChange={(value) => {
              const val = value || 'public'
              setProfileVisibility(val)
              handleUpdate('profileVisibility', val)
            }}
            data={[
              { value: 'public', label: 'Public' },
              { value: 'team', label: 'Team only' },
              { value: 'private', label: 'Private' },
            ]}
          />

          <Select
            label="Share analytics with"
            description="Who can view your analytics data"
            value={shareAnalytics}
            onChange={(value) => {
              const val = value || 'team'
              setShareAnalytics(val)
              handleUpdate('shareAnalytics', val)
            }}
            data={[
              { value: 'public', label: 'Public' },
              { value: 'team', label: 'Team only' },
              { value: 'private', label: 'Only me' },
            ]}
          />
        </Stack>
      </Box>

      {/* Data Export & Deletion */}
      <Box>
        <Text size="sm" fw={500} mb="sm" className="text-foreground">
          Data Export & Deletion
        </Text>
        <Stack gap="xs">
          <Button
            variant="light"
            color="blue"
            fullWidth
            leftSection={<IconDownload size={16} />}
          >
            Export My Data
          </Button>
          <Button
            variant="light"
            color="orange"
            fullWidth
            leftSection={<IconTrash size={16} />}
          >
            Delete All Content
          </Button>
          <Button
            variant="light"
            color="red"
            fullWidth
            leftSection={<IconAlertTriangle size={16} />}
          >
            Request Account Deletion
          </Button>
        </Stack>
      </Box>

      {/* Compliance */}
      <Box className="p-3 rounded-lg bg-secondary/30">
        <Text size="xs" fw={500} mb="xs" className="text-foreground">
          Legal & Compliance
        </Text>
        <Stack gap="xs">
          <Anchor
            size="xs"
            c="violet"
            href="#"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <IconFileText size={12} />
            View Privacy Policy
          </Anchor>
          <Anchor
            size="xs"
            c="violet"
            href="#"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <IconFileText size={12} />
            View Terms of Service
          </Anchor>
        </Stack>
      </Box>
    </SettingsSectionCard>
  )
}
