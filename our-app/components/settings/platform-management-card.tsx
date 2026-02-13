'use client'

import { useState, useEffect } from 'react'
import { Group, Text, Stack, Button, Box, Switch } from '@mantine/core'
import { 
  IconBrandInstagram, 
  IconBrandFacebook, 
  IconBrandWhatsapp, 
  IconBuildingStore,
  IconRefresh,
  IconSettings,
} from '@tabler/icons-react'
import { SettingsSectionCard } from './settings-section-card'
import {
  usePlatformsControllerGetAllConnections,
  useUsersControllerGetPlatformPreferences,
  useUsersControllerUpdatePlatformPreferences,
} from '@businesspro/api-client'
import { useQueryClient } from '@tanstack/react-query'

interface PlatformManagementCardProps {
  index?: number
}

const platformIcons = {
  instagram: IconBrandInstagram,
  facebook: IconBrandFacebook,
  whatsapp: IconBrandWhatsapp,
  'google-business': IconBuildingStore,
}

const platformColors = {
  instagram: 'pink',
  facebook: 'blue',
  whatsapp: 'green',
  'google-business': 'orange',
}

const platformNames = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp Business',
  'google-business': 'Google Business',
}

export function PlatformManagementCard({ index }: PlatformManagementCardProps) {
  const queryClient = useQueryClient()
  const { data: platforms } = usePlatformsControllerGetAllConnections()
  const { data: platformPreferences } = useUsersControllerGetPlatformPreferences()
  const updateMutation = useUsersControllerUpdatePlatformPreferences()

  const [autoCrosspost, setAutoCrosspost] = useState(true)
  const [platformOptimizations, setPlatformOptimizations] = useState(true)
  const [tagLocation, setTagLocation] = useState(false)

  useEffect(() => {
    if (platformPreferences) {
      const prefs = platformPreferences as any
      setAutoCrosspost(prefs.autoCrosspost !== undefined ? prefs.autoCrosspost : true)
      setPlatformOptimizations(prefs.platformOptimizations !== undefined ? prefs.platformOptimizations : true)
      setTagLocation(prefs.tagLocation !== undefined ? prefs.tagLocation : false)
    }
  }, [platformPreferences])

  const handleUpdate = async (field: string, value: any) => {
    try {
      await updateMutation.mutateAsync({
        data: { [field]: value } as any,
      })
      queryClient.invalidateQueries({ queryKey: ['/api/v1/users/settings/platforms'] })
    } catch (error) {
      console.error('Failed to update platform preferences:', error)
    }
  }

  return (
    <SettingsSectionCard
      title="Connected Platforms"
      description="Manage social media connections and preferences"
      icon={IconBrandInstagram}
      index={index}
    >
      {/* Platform Connections */}
      <Stack gap="sm">
        {['instagram', 'facebook', 'whatsapp', 'google-business'].map((platformKey) => {
          const Icon = platformIcons[platformKey as keyof typeof platformIcons]
          const color = platformColors[platformKey as keyof typeof platformColors]
          const name = platformNames[platformKey as keyof typeof platformNames]
          const connection = platforms ? (platforms as any[]).find((p: any) => p.platform === platformKey) : null
          const isConnected = connection?.isConnected || false

          return (
            <Box 
              key={platformKey}
              className="p-3 rounded-lg bg-secondary/50 border border-border"
            >
              <Group justify="space-between" align="flex-start">
                <Group gap="sm" align="flex-start">
                  <Box 
                    className="flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `var(--mantine-color-${color}-1)` }}
                  >
                    <Icon size={20} style={{ color: `var(--mantine-color-${color}-6)` }} />
                  </Box>
                  <Stack gap={4}>
                    <Text size="sm" fw={500} className="text-foreground">
                      {name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {isConnected ? (
                        <>
                          Connected
                          {connection?.connectedAt && (
                            <> · Last sync: 2 hours ago</>
                          )}
                        </>
                      ) : (
                        'Reach more audience'
                      )}
                    </Text>
                  </Stack>
                </Group>
                
                <Group gap="xs">
                  {isConnected ? (
                    <>
                      <Button
                        variant="subtle"
                        color="gray"
                        size="xs"
                        leftSection={<IconRefresh size={14} />}
                      >
                        Reconnect
                      </Button>
                      <Button
                        variant="subtle"
                        color="gray"
                        size="xs"
                        leftSection={<IconSettings size={14} />}
                      >
                        Settings
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="light"
                      color={color}
                      size="xs"
                    >
                      Connect
                    </Button>
                  )}
                </Group>
              </Group>
            </Box>
          )
        })}
      </Stack>

      {/* Platform Preferences */}
      <Box>
        <Text size="sm" fw={500} mb="sm" className="text-foreground">
          Platform Preferences
        </Text>
        <Stack gap="sm">
          <Group justify="space-between">
            <Box style={{ flex: 1 }}>
              <Text size="sm" className="text-foreground">
                Auto-crosspost to all platforms
              </Text>
              <Text size="xs" c="dimmed">
                Share content across all connected platforms
              </Text>
            </Box>
            <Switch
              checked={autoCrosspost}
              onChange={(e) => {
                const value = e.currentTarget.checked
                setAutoCrosspost(value)
                handleUpdate('autoCrosspost', value)
              }}
              color="violet"
            />
          </Group>

          <Group justify="space-between">
            <Box style={{ flex: 1 }}>
              <Text size="sm" className="text-foreground">
                Platform-specific optimizations
              </Text>
              <Text size="xs" c="dimmed">
                Adjust content for each platform's best practices
              </Text>
            </Box>
            <Switch
              checked={platformOptimizations}
              onChange={(e) => {
                const value = e.currentTarget.checked
                setPlatformOptimizations(value)
                handleUpdate('platformOptimizations', value)
              }}
              color="violet"
            />
          </Group>

          <Group justify="space-between">
            <Box style={{ flex: 1 }}>
              <Text size="sm" className="text-foreground">
                Tag business location
              </Text>
              <Text size="xs" c="dimmed">
                Automatically add location tags to posts
              </Text>
            </Box>
            <Switch
              checked={tagLocation}
              onChange={(e) => {
                const value = e.currentTarget.checked
                setTagLocation(value)
                handleUpdate('tagLocation', value)
              }}
              color="violet"
            />
          </Group>
        </Stack>
      </Box>
    </SettingsSectionCard>
  )
}
