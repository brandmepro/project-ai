'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Paper, 
  Text, 
  Stack, 
  Box, 
  Avatar, 
  Group,
  Badge,
  ActionIcon,
  Skeleton,
  Button,
} from '@mantine/core'
import { 
  IconHeart, 
  IconMessageCircle, 
  IconSend, 
  IconBookmark,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandWhatsapp,
  IconBuildingStore,
  IconRefresh,
  IconSparkles,
} from '@tabler/icons-react'
import { useAppStore, type Platform } from '@/lib/store'
import { useAIControllerGenerateWithTask } from '@businesspro/api-client'

const platformIcons: Record<Platform, typeof IconBrandInstagram> = {
  instagram: IconBrandInstagram,
  facebook: IconBrandFacebook,
  whatsapp: IconBrandWhatsapp,
  'google-business': IconBuildingStore,
}

const platformNames: Record<Platform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp Status',
  'google-business': 'Google Business',
}

// Mock AI-generated captions based on settings
const generateCaption = (businessType: string | null, goal: string | null, tone: string | null, language: string | null): { caption: string; hashtags: string[] } => {
  if (!businessType) {
    return { caption: 'Select your options to generate AI-powered content...', hashtags: [] }
  }

  const captions: Record<string, Record<string, string>> = {
    cafe: {
      friendly: 'Start your day with a smile and our freshly brewed coffee! Nothing beats the aroma of morning bliss.',
      professional: 'Experience premium coffee crafted with expertise. Our beans are sourced from the finest estates.',
      fun: 'Coffee time = happy time! Come grab your cup of joy and let the caffeine work its magic!',
      minimal: 'Good coffee. Good mood. Simple pleasures.',
    },
    salon: {
      friendly: 'Ready for a fresh new look? Our stylists are here to make you feel amazing!',
      professional: 'Transform your style with our expert team. Precision cuts and premium treatments await.',
      fun: 'New hair, who dis? Book your appointment and get ready to turn heads!',
      minimal: 'Your style. Elevated.',
    },
    kirana: {
      friendly: 'Your neighborhood store with everything you need! Fresh products, friendly faces.',
      professional: 'Quality groceries at competitive prices. Serving our community with dedication.',
      fun: 'Need it? We got it! Your one-stop shop for all things awesome!',
      minimal: 'Fresh. Local. Trusted.',
    },
    gym: {
      friendly: 'Every rep counts! Join us and let\'s crush those fitness goals together!',
      professional: 'State-of-the-art equipment. Expert trainers. Results that speak for themselves.',
      fun: 'Sweat now, selfie later! Your fitness journey starts here!',
      minimal: 'Train. Transform. Triumph.',
    },
  }

  const defaultCaption = 'Discover what makes us special! Visit us today and experience the difference.'
  const toneKey = tone || 'friendly'
  const caption = captions[businessType]?.[toneKey] || defaultCaption

  const hashtags = [
    businessType,
    goal || 'business',
    'localbusiness',
    'supportlocal',
    language === 'hindi' ? 'indianbusiness' : 'smallbusiness',
  ]

  return { caption, hashtags }
}

interface ContentPreviewProps {
  className?: string
}

export function ContentPreview({ className }: ContentPreviewProps) {
  const { createFlow, businessName, updateCreateFlow } = useAppStore()
  const [isGenerating, setIsGenerating] = useState(false)
  
  const activePlatform = createFlow.platforms[0] || 'instagram'
  const PlatformIcon = platformIcons[activePlatform]
  
  const generateMutation = useAIControllerGenerateWithTask()

  const handleAIGeneration = async () => {
    if (!createFlow.businessType || !createFlow.contentGoal) {
      // Fallback to mock data if not enough info
      const { caption, hashtags } = generateCaption(
        createFlow.businessType,
        createFlow.contentGoal,
        createFlow.tone,
        createFlow.language
      )
      updateCreateFlow({ 
        generatedCaption: caption,
        generatedHashtags: hashtags,
      })
      return
    }

    setIsGenerating(true)
    try {
      const response: any = await generateMutation.mutateAsync({
        data: {
          taskType: createFlow.contentGoal || 'awareness',
          businessType: createFlow.businessType,
          tone: createFlow.tone || 'friendly',
          language: createFlow.language || 'english',
          platform: activePlatform,
        }
      })
      
      // Extract caption and hashtags from AI response
      const result = response?.data || response
      updateCreateFlow({ 
        generatedCaption: result.content || result.caption || generateCaption(createFlow.businessType, createFlow.contentGoal, createFlow.tone, createFlow.language).caption,
        generatedHashtags: result.hashtags || generateCaption(createFlow.businessType, createFlow.contentGoal, createFlow.tone, createFlow.language).hashtags,
      })
    } catch (error) {
      console.error('AI generation failed, using fallback:', error)
      // Fallback to mock data
      const { caption, hashtags } = generateCaption(
        createFlow.businessType,
        createFlow.contentGoal,
        createFlow.tone,
        createFlow.language
      )
      updateCreateFlow({ 
        generatedCaption: caption,
        generatedHashtags: hashtags,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (createFlow.businessType && createFlow.contentGoal && createFlow.tone && createFlow.language) {
      handleAIGeneration()
    }
  }, [createFlow.businessType, createFlow.tone, createFlow.contentGoal, createFlow.language])

  const handleRegenerate = () => {
    handleAIGeneration()
  }

  return (
    <Paper className={`p-4 lg:p-6 bg-card border border-border ${className}`} withBorder={false}>
      <Group justify="space-between" mb="lg">
        <Stack gap={4}>
          <Text fw={600} size="lg" className="text-foreground">
            Live Preview
          </Text>
          <Text size="xs" c="dimmed">
            Real-time preview of your content
          </Text>
        </Stack>
        
        {createFlow.platforms.length > 0 && (
          <Group gap="xs">
            {createFlow.platforms.map((platform) => {
              const Icon = platformIcons[platform]
              const isActive = platform === activePlatform
              return (
                <ActionIcon
                  key={platform}
                  variant={isActive ? 'filled' : 'light'}
                  color="violet"
                  size="sm"
                  aria-label={platformNames[platform]}
                >
                  <Icon size={14} />
                </ActionIcon>
              )
            })}
          </Group>
        )}
      </Group>

      {/* Phone Frame */}
      <Box className="max-w-sm mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {/* Phone Border */}
          <Box className="rounded-[2rem] border-4 border-gray-800 bg-gray-800 p-1 shadow-xl">
            {/* Screen */}
            <Box className="rounded-[1.75rem] bg-white overflow-hidden">
              {/* App Header */}
              <Box className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <Group gap="xs">
                  <PlatformIcon size={20} className="text-foreground" />
                  <Text size="sm" fw={600} className="text-gray-900">
                    {platformNames[activePlatform]}
                  </Text>
                </Group>
                <Badge size="xs" variant="light" color="green">
                  Preview
                </Badge>
              </Box>

              {/* Post Header */}
              <Box className="flex items-center gap-3 px-4 py-3">
                <Avatar size="md" radius="xl" color="violet">
                  {businessName.charAt(0)}
                </Avatar>
                <Stack gap={0}>
                  <Text size="sm" fw={600} className="text-gray-900">
                    {businessName}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {createFlow.scheduledDate 
                      ? `Scheduled for ${new Date(createFlow.scheduledDate).toLocaleDateString()}`
                      : 'Just now'
                    }
                  </Text>
                </Stack>
              </Box>

              {/* Image Area */}
              <Box className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Stack align="center" gap="md">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <IconSparkles size={40} className="text-primary" />
                        </motion.div>
                        <Text size="sm" c="dimmed">
                          Generating content...
                        </Text>
                      </Stack>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center p-6"
                    >
                      <Stack align="center" gap="sm">
                        <Box className="h-20 w-20 rounded-2xl bg-white/80 flex items-center justify-center shadow-lg">
                          <Text size="xl" fw={700} className="text-primary">
                            {businessName.charAt(0)}
                          </Text>
                        </Box>
                        {createFlow.visualStyle && (
                          <Badge variant="light" color="violet" size="sm">
                            {createFlow.visualStyle} style
                          </Badge>
                        )}
                      </Stack>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>

              {/* Actions */}
              <Group className="px-4 py-3" gap="lg">
                <Group gap="sm">
                  <IconHeart size={22} className="text-gray-700" />
                  <IconMessageCircle size={22} className="text-gray-700" />
                  <IconSend size={22} className="text-gray-700" />
                </Group>
                <Box className="flex-1" />
                <IconBookmark size={22} className="text-gray-700" />
              </Group>

              {/* Caption */}
              <Box className="px-4 pb-4">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="skeleton"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Skeleton height={12} mb="xs" width="100%" />
                      <Skeleton height={12} mb="xs" width="80%" />
                      <Skeleton height={12} width="60%" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="caption"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Text size="sm" className="text-gray-900 leading-relaxed">
                        <Text span fw={600}>{businessName}</Text>{' '}
                        {createFlow.generatedCaption || 'Your AI-generated caption will appear here...'}
                      </Text>
                      {createFlow.generatedHashtags.length > 0 && (
                        <Text size="sm" c="blue" mt="xs">
                          {createFlow.generatedHashtags.map(h => `#${h}`).join(' ')}
                        </Text>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Box>

      {/* Regenerate Button */}
      <Group justify="center" mt="lg">
        <Button
          variant="light"
          color="violet"
          leftSection={<IconRefresh size={16} />}
          onClick={handleRegenerate}
          loading={isGenerating}
          disabled={!createFlow.businessType}
        >
          Regenerate Content
        </Button>
      </Group>
    </Paper>
  )
}
