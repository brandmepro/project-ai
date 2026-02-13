'use client'

import { useState, useEffect } from 'react'
import { Group, Text, Stack, Switch, Select, SegmentedControl, Box } from '@mantine/core'
import { IconSparkles } from '@tabler/icons-react'
import { SettingsSectionCard } from './settings-section-card'
import {
  useUsersControllerGetAiSettings,
  useUsersControllerUpdateAiSettings,
} from '@businesspro/api-client'
import { useQueryClient } from '@tanstack/react-query'

interface AISettingsCardProps {
  index?: number
}

export function AISettingsCard({ index }: AISettingsCardProps) {
  const queryClient = useQueryClient()
  const { data: aiSettings } = useUsersControllerGetAiSettings()
  const updateMutation = useUsersControllerUpdateAiSettings()

  const [aiPriority, setAiPriority] = useState('balanced')
  const [autoEnhance, setAutoEnhance] = useState(true)
  const [smartHashtags, setSmartHashtags] = useState(true)
  const [contentNotifications, setContentNotifications] = useState(true)
  const [experimentalFeatures, setExperimentalFeatures] = useState(false)
  const [visualStyle, setVisualStyle] = useState('clean')
  const [captionLength, setCaptionLength] = useState('medium')
  const [emojiUsage, setEmojiUsage] = useState('moderate')

  useEffect(() => {
    if (aiSettings) {
      const settings = aiSettings as any
      setAiPriority(settings.aiPriority || 'balanced')
      setAutoEnhance(settings.autoEnhance !== undefined ? settings.autoEnhance : true)
      setSmartHashtags(settings.smartHashtags !== undefined ? settings.smartHashtags : true)
      setContentNotifications(settings.contentNotifications !== undefined ? settings.contentNotifications : true)
      setExperimentalFeatures(settings.experimentalFeatures !== undefined ? settings.experimentalFeatures : false)
      setVisualStyle(settings.visualStyle || 'clean')
      setCaptionLength(settings.captionLength || 'medium')
      setEmojiUsage(settings.emojiUsage || 'moderate')
    }
  }, [aiSettings])

  const handleUpdate = async (field: string, value: any) => {
    try {
      await updateMutation.mutateAsync({
        data: { [field]: value } as any,
      })
      queryClient.invalidateQueries({ queryKey: ['/api/v1/users/settings/ai'] })
    } catch (error) {
      console.error('Failed to update AI settings:', error)
    }
  }

  return (
    <SettingsSectionCard
      title="AI & Content Settings"
      description="Configure AI generation preferences and defaults"
      icon={IconSparkles}
      index={index}
    >
      {/* AI Model Preference */}
      <Box>
        <Text size="sm" fw={500} mb="xs" className="text-foreground">
          AI Model Preference
        </Text>
        <SegmentedControl
          fullWidth
          value={aiPriority}
          onChange={(value) => {
            setAiPriority(value)
            handleUpdate('aiPriority', value)
          }}
          data={[
            { label: 'Speed', value: 'speed' },
            { label: 'Balanced', value: 'balanced' },
            { label: 'Quality', value: 'quality' },
          ]}
          color="violet"
        />
        <Text size="xs" c="dimmed" mt="xs">
          {aiPriority === 'speed' && 'Fastest generation with good quality'}
          {aiPriority === 'balanced' && 'Balance between speed and quality'}
          {aiPriority === 'quality' && 'Best quality, may take longer'}
        </Text>
      </Box>

      {/* Content Generation Toggles */}
      <Box>
        <Text size="sm" fw={500} mb="sm" className="text-foreground">
          Content Generation
        </Text>
        <Stack gap="sm">
          <Group justify="space-between">
            <Box style={{ flex: 1 }}>
              <Text size="sm" className="text-foreground">
                Auto-enhance captions
              </Text>
              <Text size="xs" c="dimmed">
                Improve captions with AI suggestions
              </Text>
            </Box>
            <Switch
              checked={autoEnhance}
              onChange={(e) => {
                const value = e.currentTarget.checked
                setAutoEnhance(value)
                handleUpdate('autoEnhance', value)
              }}
              color="violet"
            />
          </Group>

          <Group justify="space-between">
            <Box style={{ flex: 1 }}>
              <Text size="sm" className="text-foreground">
                Smart hashtag suggestions
              </Text>
              <Text size="xs" c="dimmed">
                Automatically suggest relevant hashtags
              </Text>
            </Box>
            <Switch
              checked={smartHashtags}
              onChange={(e) => {
                const value = e.currentTarget.checked
                setSmartHashtags(value)
                handleUpdate('smartHashtags', value)
              }}
              color="violet"
            />
          </Group>

          <Group justify="space-between">
            <Box style={{ flex: 1 }}>
              <Text size="sm" className="text-foreground">
                Content idea notifications
              </Text>
              <Text size="xs" c="dimmed">
                Get notified of trending content ideas
              </Text>
            </Box>
            <Switch
              checked={contentNotifications}
              onChange={(e) => {
                const value = e.currentTarget.checked
                setContentNotifications(value)
                handleUpdate('contentNotifications', value)
              }}
              color="violet"
            />
          </Group>

          <Group justify="space-between">
            <Box style={{ flex: 1 }}>
              <Text size="sm" className="text-foreground">
                Experimental features
              </Text>
              <Text size="xs" c="dimmed">
                Try new AI features before release
              </Text>
            </Box>
            <Switch
              checked={experimentalFeatures}
              onChange={(e) => {
                const value = e.currentTarget.checked
                setExperimentalFeatures(value)
                handleUpdate('experimentalFeatures', value)
              }}
              color="orange"
            />
          </Group>
        </Stack>
      </Box>

      {/* Default Settings */}
      <Box>
        <Text size="sm" fw={500} mb="sm" className="text-foreground">
          Default Settings
        </Text>
        <Stack gap="sm">
          <Select
            label="Visual Style"
            value={visualStyle}
            onChange={(value) => {
              const val = value || 'clean'
              setVisualStyle(val)
              handleUpdate('visualStyle', val)
            }}
            data={[
              { value: 'clean', label: 'Clean & Minimal' },
              { value: 'festive', label: 'Festive & Colorful' },
              { value: 'modern', label: 'Modern & Sleek' },
              { value: 'bold', label: 'Bold & Vibrant' },
            ]}
          />

          <Select
            label="Caption Length"
            value={captionLength}
            onChange={(value) => {
              const val = value || 'medium'
              setCaptionLength(val)
              handleUpdate('captionLength', val)
            }}
            data={[
              { value: 'short', label: 'Short (50-100 words)' },
              { value: 'medium', label: 'Medium (100-200 words)' },
              { value: 'long', label: 'Long (200+ words)' },
            ]}
          />

          <Select
            label="Emoji Usage"
            value={emojiUsage}
            onChange={(value) => {
              const val = value || 'moderate'
              setEmojiUsage(val)
              handleUpdate('emojiUsage', val)
            }}
            data={[
              { value: 'none', label: 'None' },
              { value: 'minimal', label: 'Minimal' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'heavy', label: 'Heavy' },
            ]}
          />
        </Stack>
      </Box>
    </SettingsSectionCard>
  )
}
