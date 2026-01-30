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
  IconTarget, 
  IconMoodSmile,
  IconLanguage,
  IconPalette,
  IconCalendar,
  IconCheck,
} from '@tabler/icons-react'
import { useAppStore, type BusinessType, type Platform, type ContentGoal, type Tone, type Language, type VisualStyle } from '@/lib/store'

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

const businessTypes: { value: BusinessType; label: string }[] = [
  { value: 'cafe', label: 'Cafe / Coffee Shop' },
  { value: 'kirana', label: 'Kirana / General Store' },
  { value: 'salon', label: 'Salon / Beauty Parlor' },
  { value: 'gym', label: 'Gym / Fitness Center' },
  { value: 'clinic', label: 'Clinic / Healthcare' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'boutique', label: 'Boutique / Fashion' },
  { value: 'tea-shop', label: 'Tea Shop / Chai Stall' },
]

const platforms: { value: Platform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'whatsapp', label: 'WhatsApp Status' },
  { value: 'google-business', label: 'Google Business' },
]

const contentGoals: { value: ContentGoal; label: string }[] = [
  { value: 'promotion', label: 'Promotion' },
  { value: 'awareness', label: 'Awareness' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'festival', label: 'Festival' },
  { value: 'offer', label: 'Offer / Sale' },
]

const tones: { value: Tone; label: string }[] = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'fun', label: 'Fun' },
  { value: 'minimal', label: 'Minimal' },
]

const languages: { value: Language; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'hinglish', label: 'Hinglish' },
  { value: 'hindi', label: 'Hindi' },
]

const visualStyles: { value: VisualStyle; label: string }[] = [
  { value: 'clean', label: 'Clean' },
  { value: 'festive', label: 'Festive' },
  { value: 'modern', label: 'Modern' },
  { value: 'bold', label: 'Bold' },
]

interface StepTimelineProps {
  className?: string
  mobileMode?: boolean
}

export function StepTimeline({ className, mobileMode = false }: StepTimelineProps) {
  const { createFlow, setCreateFlowStep, updateCreateFlow } = useAppStore()

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
      case 0: return businessTypes.find(b => b.value === createFlow.businessType)?.label
      case 1: return createFlow.platforms.map(p => platforms.find(pl => pl.value === p)?.label).join(', ')
      case 2: return contentGoals.find(g => g.value === createFlow.contentGoal)?.label
      case 3: return tones.find(t => t.value === createFlow.tone)?.label
      case 4: return languages.find(l => l.value === createFlow.language)?.label
      case 5: return visualStyles.find(v => v.value === createFlow.visualStyle)?.label
      case 6: return createFlow.scheduledDate ? new Date(createFlow.scheduledDate).toLocaleDateString() : null
      default: return null
    }
  }

  const renderStepContent = (stepId: number) => {
    switch (stepId) {
      case 0:
        return (
          <Select
            placeholder="Select business type"
            data={businessTypes}
            value={createFlow.businessType}
            onChange={(value) => updateCreateFlow({ businessType: value as BusinessType })}
            size="sm"
            searchable
          />
        )
      case 1:
        return (
          <Chip.Group
            multiple
            value={createFlow.platforms}
            onChange={(value) => updateCreateFlow({ platforms: value as Platform[] })}
          >
            <Group gap="xs">
              {platforms.map((platform) => (
                <Chip key={platform.value} value={platform.value} variant="light" color="violet">
                  {platform.label}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        )
      case 2:
        return (
          <Chip.Group
            value={createFlow.contentGoal || ''}
            onChange={(value) => updateCreateFlow({ contentGoal: value as ContentGoal })}
          >
            <Group gap="xs">
              {contentGoals.map((goal) => (
                <Chip key={goal.value} value={goal.value} variant="light" color="violet">
                  {goal.label}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        )
      case 3:
        return (
          <Chip.Group
            value={createFlow.tone || ''}
            onChange={(value) => updateCreateFlow({ tone: value as Tone })}
          >
            <Group gap="xs">
              {tones.map((tone) => (
                <Chip key={tone.value} value={tone.value} variant="light" color="violet">
                  {tone.label}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        )
      case 4:
        return (
          <Chip.Group
            value={createFlow.language || ''}
            onChange={(value) => updateCreateFlow({ language: value as Language })}
          >
            <Group gap="xs">
              {languages.map((lang) => (
                <Chip key={lang.value} value={lang.value} variant="light" color="violet">
                  {lang.label}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        )
      case 5:
        return (
          <Chip.Group
            value={createFlow.visualStyle || ''}
            onChange={(value) => updateCreateFlow({ visualStyle: value as VisualStyle })}
          >
            <Group gap="xs">
              {visualStyles.map((style) => (
                <Chip key={style.value} value={style.value} variant="light" color="violet">
                  {style.label}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
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
                value={createFlow.scheduledDate}
                onChange={(date) => updateCreateFlow({ scheduledDate: date })}
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
                    {isCompleted ? (
                      <IconCheck size={16} stroke={2} />
                    ) : (
                      <Icon size={16} stroke={1.5} />
                    )}
                  </Box>
                  
                  <Box className="flex-1 min-w-0">
                    <Group gap="xs" justify="space-between">
                      <Text size="sm" fw={500} className="text-foreground">
                        {step.title}
                      </Text>
                      {isCompleted && !isActive && summary && (
                        <Badge size="xs" variant="light" color="violet">
                          {summary.length > 15 ? `${summary.substring(0, 15)}...` : summary}
                        </Badge>
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
