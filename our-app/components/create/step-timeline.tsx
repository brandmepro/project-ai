'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Paper, 
  Text, 
  Stack, 
  Box, 
  Select, 
  Chip, 
  Group,
  Switch,
  Badge,
} from '@mantine/core'
import { DatePickerInput, TimeInput } from '@mantine/dates'
import { 
  IconBuilding, 
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandWhatsapp,
  IconMapPin,
  IconTarget, 
  IconMoodSmile,
  IconLanguage,
  IconPalette,
  IconCalendar,
  IconCheck,
  IconCoffee,
  IconShoppingBag,
  IconScissors,
  IconBarbell,
  IconStethoscope,
  IconToolsKitchen2,
  IconShirt,
  IconCup,
  IconSparkles,
  IconUsers,
  IconTrendingUp,
  IconGift,
  IconPercentage,
  IconBriefcase,
  IconMicrophone2,
  IconPaint,
  IconStar,
} from '@tabler/icons-react'
import { useAppStore, type BusinessType, type Platform, type ContentGoal, type Tone, type Language, type VisualStyle } from '@/lib/store'
import { getSmartPreset, isUsingSmartPreset } from '@/lib/smart-presets'
import { notifications } from '@mantine/notifications'

const steps = [
  { 
    id: 0, 
    title: 'Business Type', 
    icon: IconBuilding,
    description: 'Select your business category'
  },
  { 
    id: 1, 
    title: 'Platform', 
    icon: IconBrandInstagram,
    description: 'Choose where to post'
  },
  { 
    id: 2, 
    title: 'Content Goal', 
    icon: IconTarget,
    description: 'What do you want to achieve?'
  },
  { 
    id: 3, 
    title: 'Tone & Style', 
    icon: IconMoodSmile,
    description: 'Set the mood'
  },
  { 
    id: 4, 
    title: 'Language', 
    icon: IconLanguage,
    description: 'Choose your language'
  },
  { 
    id: 5, 
    title: 'Visual Style', 
    icon: IconPalette,
    description: 'Pick your aesthetic'
  },
  { 
    id: 6, 
    title: 'Schedule', 
    icon: IconCalendar,
    description: 'When to publish'
  },
]

const businessTypes: { value: BusinessType; label: string; icon: any; color: string; category: string }[] = [
  { value: 'cafe', label: 'Cafe', icon: IconCoffee, color: 'brown', category: 'Food & Beverage' },
  { value: 'kirana', label: 'Kirana Store', icon: IconShoppingBag, color: 'orange', category: 'Retail' },
  { value: 'salon', label: 'Beauty Salon', icon: IconScissors, color: 'pink', category: 'Beauty & Wellness' },
  { value: 'gym', label: 'Fitness Center', icon: IconBarbell, color: 'red', category: 'Fitness' },
  { value: 'clinic', label: 'Healthcare', icon: IconStethoscope, color: 'blue', category: 'Healthcare' },
  { value: 'restaurant', label: 'Restaurant', icon: IconToolsKitchen2, color: 'orange', category: 'Food & Beverage' },
  { value: 'boutique', label: 'Fashion Boutique', icon: IconShirt, color: 'violet', category: 'Fashion' },
  { value: 'tea-shop', label: 'Tea Shop', icon: IconCup, color: 'teal', category: 'Food & Beverage' },
]

const platforms: { value: Platform; label: string; icon: any; color: string }[] = [
  { value: 'instagram', label: 'Instagram', icon: IconBrandInstagram, color: 'pink' },
  { value: 'facebook', label: 'Facebook', icon: IconBrandFacebook, color: 'blue' },
  { value: 'whatsapp', label: 'WhatsApp Status', icon: IconBrandWhatsapp, color: 'green' },
  { value: 'google-business', label: 'Google Business', icon: IconMapPin, color: 'red' },
]

const contentGoals: { value: ContentGoal; label: string; icon: any; color: string }[] = [
  { value: 'promotion', label: 'Promotion', icon: IconSparkles, color: 'violet' },
  { value: 'awareness', label: 'Awareness', icon: IconUsers, color: 'blue' },
  { value: 'engagement', label: 'Engagement', icon: IconTrendingUp, color: 'green' },
  { value: 'festival', label: 'Festival', icon: IconGift, color: 'orange' },
  { value: 'offer', label: 'Offer / Sale', icon: IconPercentage, color: 'red' },
]

const tones: { value: Tone; label: string; icon: any; color: string }[] = [
  { value: 'friendly', label: 'Friendly', icon: IconMoodSmile, color: 'green' },
  { value: 'professional', label: 'Professional', icon: IconBriefcase, color: 'blue' },
  { value: 'fun', label: 'Fun', icon: IconMicrophone2, color: 'orange' },
  { value: 'minimal', label: 'Minimal', icon: IconPaint, color: 'gray' },
]

const languages: { value: Language; label: string; icon: any; color: string }[] = [
  { value: 'english', label: 'English', icon: IconLanguage, color: 'blue' },
  { value: 'hinglish', label: 'Hinglish', icon: IconLanguage, color: 'orange' },
  { value: 'hindi', label: 'Hindi', icon: IconLanguage, color: 'green' },
]

const visualStyles: { value: VisualStyle; label: string; icon: any; color: string }[] = [
  { value: 'clean', label: 'Clean', icon: IconPaint, color: 'blue' },
  { value: 'festive', label: 'Festive', icon: IconGift, color: 'orange' },
  { value: 'modern', label: 'Modern', icon: IconStar, color: 'violet' },
  { value: 'bold', label: 'Bold', icon: IconSparkles, color: 'red' },
]

interface StepTimelineProps {
  className?: string
  mobileMode?: boolean
}

export function StepTimeline({ className, mobileMode = false }: StepTimelineProps) {
  const { createFlow, setCreateFlowStep, updateCreateFlow, applySmartPreset } = useAppStore()

  const handleBusinessTypeChange = (value: string | null) => {
    if (!value) return
    
    const businessType = value as BusinessType
    updateCreateFlow({ businessType })
    
    // Show smart preset notification with button
    const preset = getSmartPreset(businessType)
    const businessLabel = businessTypes.find(b => b.value === businessType)?.label
    
    notifications.show({
      id: 'smart-preset-offer',
      title: '✨ Smart Defaults Available',
      message: `Click "Use Smart Defaults" to optimize settings for ${businessLabel}`,
      color: 'violet',
      autoClose: 5000,
    })
  }

  const isStepCompleted = (stepId: number) => {
    switch (stepId) {
      case 0: return !!createFlow.businessType
      case 1: return createFlow.platforms.length > 0
      case 2: return !!createFlow.contentGoal
      case 3: return !!createFlow.tone
      case 4: return !!createFlow.language
      case 5: return !!createFlow.visualStyle
      case 6: return !!createFlow.scheduledDate
      default: return false
    }
  }

  const getStepSummary = (stepId: number) => {
    switch (stepId) {
      case 0: return businessTypes.find(b => b.value === createFlow.businessType)
      case 1: return createFlow.platforms.length
      case 2: return contentGoals.find(g => g.value === createFlow.contentGoal)
      case 3: return tones.find(t => t.value === createFlow.tone)
      case 4: return languages.find(l => l.value === createFlow.language)
      case 5: return visualStyles.find(v => v.value === createFlow.visualStyle)
      case 6: return createFlow.scheduledDate ? new Date(createFlow.scheduledDate).toLocaleDateString() : null
      default: return null
    }
  }

  const renderStepContent = (stepId: number) => {
    switch (stepId) {
      case 0:
        return (
          <Stack gap="sm">
            <Select
              placeholder="Select business type"
              data={businessTypes.map(b => ({
                value: b.value,
                label: b.label,
              }))}
              value={createFlow.businessType}
              onChange={handleBusinessTypeChange}
              size="md"
              searchable
              leftSection={
                createFlow.businessType ? (
                  (() => {
                    const selected = businessTypes.find(b => b.value === createFlow.businessType)
                    if (selected) {
                      const Icon = selected.icon
                      return <Icon size={16} className="text-muted-foreground" />
                    }
                    return null
                  })()
                ) : (
                  <IconBuilding size={16} className="text-muted-foreground" />
                )
              }
              rightSection={
                createFlow.businessType ? (
                  (() => {
                    const selected = businessTypes.find(b => b.value === createFlow.businessType)
                    if (selected) {
                      return (
                        <Badge size="sm" color={selected.color} variant="light">
                          {selected.category}
                        </Badge>
                      )
                    }
                    return null
                  })()
                ) : null
              }
              classNames={{
                input: 'border-border bg-secondary/30 hover:bg-secondary/50 transition-colors',
                option: 'hover:bg-secondary/80',
              }}
              styles={{
                input: {
                  borderRadius: '8px',
                },
              }}
              renderOption={({ option }) => {
                const business = businessTypes.find(b => b.value === option.value)
                if (!business) return option.label
                const Icon = business.icon
                return (
                  <Group wrap="nowrap" gap="sm" className="py-1">
                    <Box className={`p-2 rounded-lg bg-${business.color}-50 dark:bg-${business.color}-950`}>
                      <Icon size={18} className={`text-${business.color}-600 dark:text-${business.color}-400`} />
                    </Box>
                    <Box className="flex-1">
                      <Text size="sm" fw={500}>{business.label}</Text>
                      <Text size="xs" c="dimmed">{business.category}</Text>
                    </Box>
                    <Badge size="xs" color={business.color} variant="light">
                      {business.category.split(' ')[0]}
                    </Badge>
                  </Group>
                )
              }}
            />
            
            {createFlow.businessType && isUsingSmartPreset(createFlow.businessType, {
              platforms: createFlow.platforms,
              contentGoal: createFlow.contentGoal,
              tone: createFlow.tone,
              language: createFlow.language,
              visualStyle: createFlow.visualStyle,
            }) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Box className="p-2 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <Group gap="xs">
                    <IconCheck size={14} className="text-green-600 dark:text-green-400" />
                    <Text size="xs" className="text-green-700 dark:text-green-300">
                      Using smart defaults
                    </Text>
                  </Group>
                </Box>
              </motion.div>
            )}
          </Stack>
        )
      case 1:
        return (
          <Group gap="xs">
            {platforms.map((platform) => {
              const Icon = platform.icon
              const isSelected = createFlow.platforms.includes(platform.value)
              return (
                <Box
                  key={platform.value}
                  onClick={() => {
                    const newPlatforms = isSelected
                      ? createFlow.platforms.filter(p => p !== platform.value)
                      : [...createFlow.platforms, platform.value]
                    updateCreateFlow({ platforms: newPlatforms as Platform[] })
                  }}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
                    ${isSelected 
                      ? `bg-${platform.color}-100 dark:bg-${platform.color}-950 border-2 border-${platform.color}-500` 
                      : 'bg-secondary/50 border-2 border-transparent hover:border-border'
                    }
                  `}
                >
                  <Icon size={18} className={isSelected ? `text-${platform.color}-600 dark:text-${platform.color}-400` : 'text-muted-foreground'} />
                  <Text size="sm" fw={500} className={isSelected ? 'text-foreground' : 'text-muted-foreground'}>
                    {platform.label}
                  </Text>
                </Box>
              )
            })}
          </Group>
        )
      case 2:
        return (
          <Group gap="xs">
            {contentGoals.map((goal) => {
              const Icon = goal.icon
              const isSelected = createFlow.contentGoal === goal.value
              return (
                <Box
                  key={goal.value}
                  onClick={() => updateCreateFlow({ contentGoal: goal.value as ContentGoal })}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
                    ${isSelected 
                      ? `bg-${goal.color}-100 dark:bg-${goal.color}-950 border-2 border-${goal.color}-500` 
                      : 'bg-secondary/50 border-2 border-transparent hover:border-border'
                    }
                  `}
                >
                  <Icon size={18} className={isSelected ? `text-${goal.color}-600 dark:text-${goal.color}-400` : 'text-muted-foreground'} />
                  <Text size="sm" fw={500} className={isSelected ? 'text-foreground' : 'text-muted-foreground'}>
                    {goal.label}
                  </Text>
                </Box>
              )
            })}
          </Group>
        )
      case 3:
        return (
          <Group gap="xs">
            {tones.map((tone) => {
              const Icon = tone.icon
              const isSelected = createFlow.tone === tone.value
              return (
                <Box
                  key={tone.value}
                  onClick={() => updateCreateFlow({ tone: tone.value as Tone })}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
                    ${isSelected 
                      ? `bg-${tone.color}-100 dark:bg-${tone.color}-950 border-2 border-${tone.color}-500` 
                      : 'bg-secondary/50 border-2 border-transparent hover:border-border'
                    }
                  `}
                >
                  <Icon size={18} className={isSelected ? `text-${tone.color}-600 dark:text-${tone.color}-400` : 'text-muted-foreground'} />
                  <Text size="sm" fw={500} className={isSelected ? 'text-foreground' : 'text-muted-foreground'}>
                    {tone.label}
                  </Text>
                </Box>
              )
            })}
          </Group>
        )
      case 4:
        return (
          <Group gap="xs">
            {languages.map((lang) => {
              const Icon = lang.icon
              const isSelected = createFlow.language === lang.value
              return (
                <Box
                  key={lang.value}
                  onClick={() => updateCreateFlow({ language: lang.value as Language })}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
                    ${isSelected 
                      ? `bg-${lang.color}-100 dark:bg-${lang.color}-950 border-2 border-${lang.color}-500` 
                      : 'bg-secondary/50 border-2 border-transparent hover:border-border'
                    }
                  `}
                >
                  <Icon size={18} className={isSelected ? `text-${lang.color}-600 dark:text-${lang.color}-400` : 'text-muted-foreground'} />
                  <Text size="sm" fw={500} className={isSelected ? 'text-foreground' : 'text-muted-foreground'}>
                    {lang.label}
                  </Text>
                </Box>
              )
            })}
          </Group>
        )
      case 5:
        return (
          <Group gap="xs">
            {visualStyles.map((style) => {
              const Icon = style.icon
              const isSelected = createFlow.visualStyle === style.value
              return (
                <Box
                  key={style.value}
                  onClick={() => updateCreateFlow({ visualStyle: style.value as VisualStyle })}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
                    ${isSelected 
                      ? `bg-${style.color}-100 dark:bg-${style.color}-950 border-2 border-${style.color}-500` 
                      : 'bg-secondary/50 border-2 border-transparent hover:border-border'
                    }
                  `}
                >
                  <Icon size={18} className={isSelected ? `text-${style.color}-600 dark:text-${style.color}-400` : 'text-muted-foreground'} />
                  <Text size="sm" fw={500} className={isSelected ? 'text-foreground' : 'text-muted-foreground'}>
                    {style.label}
                  </Text>
                </Box>
              )
            })}
          </Group>
        )
      case 6:
        return (
          <Stack gap="md">
            <Box>
              <Text size="xs" fw={500} mb={6} className="text-foreground">
                Publication Date
              </Text>
              <DatePickerInput
                placeholder="Select date"
                value={createFlow.scheduledDate as Date | null}
                onChange={(date) => updateCreateFlow({ scheduledDate: date as Date | null })}
                minDate={new Date()}
                size="md"
                leftSection={<IconCalendar size={16} className="text-primary" />}
                valueFormat="DD MMM YYYY"
                classNames={{
                  input: 'border-border bg-secondary/30 hover:bg-secondary/50 transition-colors',
                  day: 'hover:bg-primary/10 data-[selected]:bg-primary data-[selected]:text-primary-foreground',
                }}
                styles={{
                  input: {
                    borderRadius: '8px',
                  },
                }}
                popoverProps={{
                  shadow: 'lg',
                  radius: 'md',
                }}
              />
            </Box>
            
            <Box>
              <Text size="xs" fw={500} mb={6} className="text-foreground">
                Publication Time
              </Text>
              <TimeInput
                placeholder="HH:MM"
                value={createFlow.scheduledTime || ''}
                onChange={(e) => updateCreateFlow({ scheduledTime: e.target.value })}
                size="md"
                classNames={{
                  input: 'border-border bg-secondary/30 hover:bg-secondary/50 transition-colors',
                }}
                styles={{
                  input: {
                    borderRadius: '8px',
                  },
                }}
              />
            </Box>

            <Box className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <Group gap="sm" wrap="nowrap">
                <Switch 
                  size="sm" 
                  color="violet"
                  checked={false}
                  classNames={{
                    track: 'cursor-pointer',
                  }}
                />
                <Box className="flex-1">
                  <Text size="xs" fw={500} className="text-foreground">
                    Auto-suggest best time
                  </Text>
                  <Text size="xs" c="dimmed" className="text-muted-foreground">
                    AI will recommend optimal posting time
                  </Text>
                </Box>
              </Group>
            </Box>

            {createFlow.scheduledDate && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Box className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <Group gap="xs">
                    <IconCheck size={14} className="text-green-600 dark:text-green-400" />
                    <Text size="xs" className="text-green-700 dark:text-green-300">
                      Scheduled for <strong>{new Date(createFlow.scheduledDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric' 
                      })}</strong>
                      {createFlow.scheduledTime && ` at ${createFlow.scheduledTime}`}
                    </Text>
                  </Group>
                </Box>
              </motion.div>
            )}
          </Stack>
        )
      default:
        return null
    }
  }

  return (
    <Paper className={`p-4 bg-card border border-border h-full overflow-y-auto ${className}`} withBorder={false}>
      <Text fw={600} size="lg" mb="md" className="text-foreground sticky top-0 bg-card pb-2 z-10">
        Content Settings
      </Text>
      
      <Stack gap="xs">
        {steps.map((step) => {
          const isActive = createFlow.currentStep === step.id
          const isCompleted = isStepCompleted(step.id)
          const Icon = step.icon
          const summary = getStepSummary(step.id)

          return (
            <motion.div
              key={step.id}
              initial={false}
              animate={{ 
                backgroundColor: isActive ? 'var(--mantine-color-violet-0)' : 'transparent'
              }}
              transition={{ duration: 0.15 }}
            >
              <Box
                className={`
                  rounded-lg border transition-all cursor-pointer
                  ${isActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-transparent hover:border-border hover:bg-secondary/30'
                  }
                `}
                onClick={() => setCreateFlowStep(step.id)}
              >
                {/* Step Header */}
                <Box className="flex items-center gap-3 p-3">
                  <Box
                    className={`
                      flex h-8 w-8 items-center justify-center rounded-lg shrink-0
                      ${isCompleted 
                        ? 'bg-primary text-primary-foreground' 
                        : isActive 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-secondary text-muted-foreground'
                      }
                    `}
                  >
                    <Text size="sm" fw={600}>
                      {step.id + 1}
                    </Text>
                  </Box>
                  
                  <Box className="flex-1 min-w-0">
                    <Group gap="xs" justify="space-between">
                      <Text size="sm" fw={500} className="text-foreground">
                        {step.title}
                      </Text>
                      {isCompleted && !isActive && summary && (
                        (() => {
                          if (step.id === 0 && typeof summary === 'object' && 'label' in summary) {
                            const business = summary as typeof businessTypes[number]
                            const BIcon = business.icon
                            return (
                              <Group gap="xs">
                                <BIcon size={14} className="text-muted-foreground" />
                                <Badge size="xs" variant="light" color={business.color}>
                                  {business.label}
                                </Badge>
                              </Group>
                            )
                          }
                          if (step.id === 1 && typeof summary === 'number') {
                            return (
                              <Badge size="xs" variant="light" color="violet">
                                {summary} platform{summary > 1 ? 's' : ''}
                              </Badge>
                            )
                          }
                          if (typeof summary === 'object' && 'label' in summary) {
                            const item = summary as { label: string; icon: any; color: string }
                            const ItemIcon = item.icon
                            return (
                              <Group gap="xs">
                                <ItemIcon size={14} className="text-muted-foreground" />
                                <Badge size="xs" variant="light" color={item.color}>
                                  {item.label}
                                </Badge>
                              </Group>
                            )
                          }
                          return (
                            <Badge size="xs" variant="light" color="violet">
                              {String(summary).length > 15 ? `${String(summary).substring(0, 15)}...` : String(summary)}
                            </Badge>
                          )
                        })()
                      )}
                    </Group>
                    {isActive && (
                      <Text size="xs" c="dimmed">
                        {step.description}
                      </Text>
                    )}
                  </Box>
                </Box>

                {/* Step Content */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <Box className="px-3 pb-3 pt-1">
                        {renderStepContent(step.id)}
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            </motion.div>
          )
        })}
      </Stack>
    </Paper>
  )
}
