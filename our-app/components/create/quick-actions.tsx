'use client'

import { motion } from 'framer-motion'
import { Box, Text, Group, Button, Badge, Stack, Paper } from '@mantine/core'
import { 
  IconSparkles, 
  IconSettings, 
  IconWand,
  IconBolt,
  IconCheck,
  IconGift,
  IconPercentage,
  IconTrendingUp,
  IconPhoto,
} from '@tabler/icons-react'
import { useAppStore, type BusinessType } from '@/lib/store'
import { getSmartPreset, QUICK_TEMPLATES, isUsingSmartPreset } from '@/lib/smart-presets'
import { notifications } from '@mantine/notifications'

interface QuickActionsProps {
  onGenerateClick: () => void
  isGenerating?: boolean
}

export function QuickActions({ onGenerateClick, isGenerating = false }: QuickActionsProps) {
  const { createFlow, updateCreateFlow, applySmartPreset } = useAppStore()
  
  const hasBusinessType = !!createFlow.businessType
  const isReadyToGenerate = 
    createFlow.businessType && 
    createFlow.platforms.length > 0 && 
    createFlow.contentGoal &&
    createFlow.tone &&
    createFlow.language &&
    createFlow.visualStyle

  const usingSmartPreset = hasBusinessType && createFlow.businessType ? 
    isUsingSmartPreset(createFlow.businessType, {
      platforms: createFlow.platforms,
      contentGoal: createFlow.contentGoal,
      tone: createFlow.tone,
      language: createFlow.language,
      visualStyle: createFlow.visualStyle,
    }) : false

  const handleUseSmartDefaults = () => {
    if (!createFlow.businessType) {
      notifications.show({
        title: 'Select Business Type',
        message: 'Please select your business type first',
        color: 'yellow',
      })
      return
    }

    applySmartPreset(createFlow.businessType)
    
    const preset = getSmartPreset(createFlow.businessType)
    notifications.show({
      title: '✨ Smart Defaults Applied',
      message: preset.reason || 'Settings optimized for your business',
      color: 'violet',
    })
  }

  const handleQuickTemplate = (templateId: string) => {
    if (!createFlow.businessType) {
      notifications.show({
        title: 'Select Business Type',
        message: 'Please select your business type first',
        color: 'yellow',
      })
      return
    }

    const template = QUICK_TEMPLATES.find(t => t.id === templateId)
    if (!template) return

    updateCreateFlow({
      contentGoal: template.preset.contentGoal || createFlow.contentGoal,
      tone: template.preset.tone || createFlow.tone,
      visualStyle: template.preset.visualStyle || createFlow.visualStyle,
    })

    notifications.show({
      title: `${template.icon} ${template.name} Selected`,
      message: template.description,
      color: 'blue',
    })
  }

  const getTemplateIcon = (id: string) => {
    switch (id) {
      case 'festival': return IconGift
      case 'sale': return IconPercentage
      case 'daily': return IconTrendingUp
      case 'promotion': return IconPhoto
      default: return IconSparkles
    }
  }

  return (
    <Stack gap="md">
      {/* Smart Actions */}
      <Paper className="p-4 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 border border-violet-200 dark:border-violet-800" withBorder={false}>
        <Group justify="space-between" mb="md">
          <Box>
            <Group gap="xs" mb={4}>
              <IconWand size={18} className="text-violet-600 dark:text-violet-400" />
              <Text size="sm" fw={600} className="text-violet-900 dark:text-violet-100">
                Smart Actions
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              Let AI optimize your content settings
            </Text>
          </Box>
          {usingSmartPreset && (
            <Badge size="sm" color="green" leftSection={<IconCheck size={12} />}>
              Using Smart Defaults
            </Badge>
          )}
        </Group>

        <Group gap="xs">
          <Button
            variant={usingSmartPreset ? "light" : "gradient"}
            gradient={{ from: 'violet', to: 'indigo' }}
            leftSection={<IconBolt size={16} />}
            onClick={handleUseSmartDefaults}
            disabled={!hasBusinessType}
            size="sm"
            fullWidth
          >
            {usingSmartPreset ? 'Defaults Applied' : 'Use Smart Defaults'}
          </Button>

          <Button
            variant="gradient"
            gradient={{ from: 'violet', to: 'indigo' }}
            leftSection={<IconSparkles size={16} />}
            onClick={onGenerateClick}
            disabled={!isReadyToGenerate}
            loading={isGenerating}
            size="sm"
            fullWidth
          >
            Generate Now
          </Button>
        </Group>

        {hasBusinessType && createFlow.businessType && !usingSmartPreset && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Box className="mt-3 p-2 rounded-lg bg-violet-100/50 dark:bg-violet-900/20">
              <Text size="xs" className="text-violet-700 dark:text-violet-300">
                💡 Tip: {getSmartPreset(createFlow.businessType).reason}
              </Text>
            </Box>
          </motion.div>
        )}
      </Paper>

      {/* Quick Templates */}
      <Paper className="p-4 bg-card border border-border" withBorder={false}>
        <Group gap="xs" mb="sm">
          <IconSettings size={16} className="text-muted-foreground" />
          <Text size="sm" fw={600} className="text-foreground">
            Quick Templates
          </Text>
        </Group>
        
        <div className="grid grid-cols-2 gap-2">
          {QUICK_TEMPLATES.map((template) => {
            const Icon = getTemplateIcon(template.id)
            const isActive = 
              createFlow.contentGoal === template.preset.contentGoal &&
              createFlow.tone === template.preset.tone &&
              createFlow.visualStyle === template.preset.visualStyle

            return (
              <motion.button
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickTemplate(template.id)}
                className={`
                  p-3 rounded-lg border-2 transition-all text-left
                  ${isActive 
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-950' 
                    : 'border-border bg-secondary/30 hover:bg-secondary/50'
                  }
                `}
              >
                <Group gap="xs" mb={4}>
                  <Box className={`
                    p-1 rounded-md
                    ${isActive 
                      ? 'bg-violet-100 dark:bg-violet-900' 
                      : 'bg-secondary'
                    }
                  `}>
                    <Icon size={14} className={
                      isActive 
                        ? 'text-violet-600 dark:text-violet-400' 
                        : 'text-muted-foreground'
                    } />
                  </Box>
                  {isActive && (
                    <Badge size="xs" color="violet" variant="dot">
                      Active
                    </Badge>
                  )}
                </Group>
                <Text size="xs" fw={500} className="text-foreground" lineClamp={1}>
                  {template.name}
                </Text>
                <Text size="10px" c="dimmed" lineClamp={1}>
                  {template.description}
                </Text>
              </motion.button>
            )
          })}
        </div>
      </Paper>
    </Stack>
  )
}
