'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Text, Stack, Button, Group, Box, Drawer, ScrollArea } from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { 
  IconSparkles, 
  IconBuilding, 
  IconBrandInstagram, 
  IconTarget, 
  IconMoodSmile,
  IconLanguage,
  IconPalette,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react'
import { ContentPreview } from '@/components/create/content-preview'
import { StepTimeline } from '@/components/create/step-timeline'
import { QuickActions } from '@/components/create/quick-actions'
import { useAppStore } from '@/lib/store'
import { useContentControllerCreate } from '@businesspro/api-client'
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/navigation'

const steps = [
  { id: 0, title: 'Business', icon: IconBuilding, shortTitle: 'Type' },
  { id: 1, title: 'Platform', icon: IconBrandInstagram, shortTitle: 'Platform' },
  { id: 2, title: 'Goal', icon: IconTarget, shortTitle: 'Goal' },
  { id: 3, title: 'Tone', icon: IconMoodSmile, shortTitle: 'Tone' },
  { id: 4, title: 'Language', icon: IconLanguage, shortTitle: 'Lang' },
  { id: 5, title: 'Style', icon: IconPalette, shortTitle: 'Style' },
  { id: 6, title: 'Schedule', icon: IconCalendar, shortTitle: 'Date' },
]

export default function CreatePage() {
  const { createFlow, resetCreateFlow, setCreateFlowStep } = useAppStore()
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false)
  const isMobile = useMediaQuery('(max-width: 1023px)')
  const router = useRouter()
  const createContentMutation = useContentControllerCreate()

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

  const completedSteps = steps.filter(s => isStepCompleted(s.id)).length

  const isReadyToGenerate = 
    createFlow.businessType && 
    createFlow.platforms.length > 0 && 
    createFlow.contentGoal &&
    createFlow.tone &&
    createFlow.language &&
    createFlow.visualStyle

  const handleStepTap = (stepId: number) => {
    setCreateFlowStep(stepId)
    openDrawer()
  }

  const goToPrevStep = () => {
    if (createFlow.currentStep > 0) {
      setCreateFlowStep(createFlow.currentStep - 1)
    }
  }

  const goToNextStep = () => {
    if (createFlow.currentStep < 6) {
      setCreateFlowStep(createFlow.currentStep + 1)
    }
  }

  const handleSaveAsDraft = async () => {
    if (!createFlow.generatedCaption) {
      notifications.show({
        title: 'Error',
        message: 'Please generate content first',
        color: 'red',
      })
      return
    }

    try {
      await createContentMutation.mutateAsync({
        data: {
          caption: createFlow.generatedCaption,
          hashtags: createFlow.generatedHashtags,
          platform: createFlow.platforms[0] as any,
          status: 'draft' as any,
          businessType: createFlow.businessType as any,
          contentGoal: createFlow.contentGoal as any,
          tone: createFlow.tone as any,
          language: createFlow.language as any,
          visualStyle: createFlow.visualStyle as any,
        }
      })
      
      notifications.show({
        title: 'Success',
        message: 'Content saved as draft',
        color: 'green',
      })
      
      resetCreateFlow()
      router.push('/content')
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save content',
        color: 'red',
      })
    }
  }

  const handleGenerateAndSchedule = async () => {
    if (!createFlow.generatedCaption || !createFlow.scheduledDate) {
      notifications.show({
        title: 'Error',
        message: 'Please generate content and set a schedule date first',
        color: 'red',
      })
      return
    }

    try {
      const scheduledFor = createFlow.scheduledTime 
        ? new Date(`${createFlow.scheduledDate.toISOString().split('T')[0]}T${createFlow.scheduledTime}`)
        : createFlow.scheduledDate

      await createContentMutation.mutateAsync({
        data: {
          caption: createFlow.generatedCaption,
          hashtags: createFlow.generatedHashtags,
          platform: createFlow.platforms[0] as any,
          status: 'scheduled' as any,
          businessType: createFlow.businessType as any,
          contentGoal: createFlow.contentGoal as any,
          tone: createFlow.tone as any,
          language: createFlow.language as any,
          visualStyle: createFlow.visualStyle as any,
          scheduledFor: scheduledFor,
        }
      })
      
      notifications.show({
        title: 'Success',
        message: 'Content scheduled successfully',
        color: 'green',
      })
      
      resetCreateFlow()
      router.push('/calendar')
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to schedule content',
        color: 'red',
      })
    }
  }

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="shrink-0"
      >
        <Stack gap={4} mb="md">
          <Text size="xl" fw={700} className="text-foreground">
            Create Content
          </Text>
          <Text size="sm" c="dimmed" className="hidden lg:block">
            Generate AI-powered posts for your social media
          </Text>
        </Stack>
      </motion.div>

      {/* Mobile Step Progress Bar */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4 shrink-0"
        >
          <Box className="bg-card rounded-xl border border-border p-3">
            {/* Progress indicator */}
            <Group justify="space-between" mb="xs">
              <Text size="xs" c="dimmed">{completedSteps} of 7 completed</Text>
              <Text size="xs" fw={600} className="text-primary">{Math.round((completedSteps / 7) * 100)}%</Text>
            </Group>
            
            {/* Progress bar */}
            <Box className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedSteps / 7) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </Box>
            
            {/* Horizontal scrollable steps */}
            <ScrollArea scrollbarSize={0} type="never">
              <div className="flex gap-2 pb-1">
                {steps.map((step) => {
                  const isActive = createFlow.currentStep === step.id
                  const isCompleted = isStepCompleted(step.id)
                  const Icon = step.icon

                  return (
                    <motion.button
                      key={step.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStepTap(step.id)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg shrink-0 transition-all
                        ${isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : isCompleted 
                            ? 'bg-primary/10 text-primary'
                            : 'bg-secondary text-muted-foreground'
                        }
                      `}
                    >
                      <div className={`
                        flex h-6 w-6 items-center justify-center rounded-md shrink-0
                        ${isActive 
                          ? 'bg-white/20' 
                          : isCompleted 
                            ? 'bg-primary/20' 
                            : 'bg-muted-foreground/10'
                        }
                      `}>
                        <Text size="10px" fw={700} className={isActive ? 'text-white' : ''}>
                          {step.id + 1}
                        </Text>
                      </div>
                      <Text size="xs" fw={500}>{step.shortTitle}</Text>
                    </motion.button>
                  )
                })}
              </div>
            </ScrollArea>
          </Box>
        </motion.div>
      )}

      {/* Main Content Area */}
      <Box className="flex gap-6 flex-1 min-h-0">
        {/* Center Preview */}
        <Box className="flex-1 min-w-0">
          <ContentPreview className="h-full overflow-y-auto" />
        </Box>

        {/* Desktop Right Panel */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-80 xl:w-96 shrink-0 flex flex-col gap-4 overflow-y-auto"
          >
            <QuickActions onGenerateClick={() => {}} isGenerating={false} />
            <StepTimeline className="flex-1" />
          </motion.div>
        )}
      </Box>

      {/* Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-4 shrink-0"
      >
        <Box className="p-3 lg:p-4 rounded-xl bg-card border border-border">
          {/* Mobile: simplified actions */}
          {isMobile ? (
            <Group justify="space-between" wrap="nowrap">
              <Button 
                variant="subtle" 
                color="gray"
                size="sm"
                onClick={resetCreateFlow}
              >
                Reset
              </Button>
              
              <Button
                variant="gradient"
                gradient={{ from: 'violet', to: 'indigo' }}
                leftSection={<IconSparkles size={16} />}
                disabled={!isReadyToGenerate}
                size="sm"
              >
                Generate
              </Button>
            </Group>
          ) : (
            <Group justify="space-between">
              <Button 
                variant="subtle" 
                color="gray"
                onClick={resetCreateFlow}
              >
                Reset
              </Button>
              
              <Group gap="sm">
                <Button 
                  variant="light" 
                  color="violet"
                  disabled={!createFlow.generatedCaption}
                  loading={createContentMutation.isPending}
                  onClick={handleSaveAsDraft}
                >
                  Save as Draft
                </Button>
                <Button
                  variant="gradient"
                  gradient={{ from: 'violet', to: 'indigo' }}
                  leftSection={<IconSparkles size={18} />}
                  disabled={!createFlow.generatedCaption || !createFlow.scheduledDate}
                  loading={createContentMutation.isPending}
                  onClick={handleGenerateAndSchedule}
                >
                  Generate & Schedule
                </Button>
              </Group>
            </Group>
          )}
        </Box>
      </motion.div>

      {/* Mobile Drawer for Step Details */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        position="bottom"
        size="75%"
        title={
          <Group gap="xs">
            <Box className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              {(() => {
                const Icon = steps[createFlow.currentStep]?.icon || IconBuilding
                return <Icon size={16} className="text-primary" />
              })()}
            </Box>
            <Text fw={600} size="lg" className="text-foreground">
              {steps[createFlow.currentStep]?.title}
            </Text>
          </Group>
        }
        styles={{
          content: {
            borderTopLeftRadius: 'var(--mantine-radius-xl)',
            borderTopRightRadius: 'var(--mantine-radius-xl)',
          },
        }}
      >
        <Box className="h-full flex flex-col">
          <Box className="flex-1 overflow-y-auto">
            <Stack gap="md">
              <QuickActions onGenerateClick={() => {}} isGenerating={false} />
              <StepTimeline className="h-full" mobileMode />
            </Stack>
          </Box>
          
          {/* Navigation buttons */}
          <Box className="shrink-0 p-4 border-t border-border bg-card">
            <Group justify="space-between">
              <Button
                variant="subtle"
                color="gray"
                leftSection={<IconChevronLeft size={16} />}
                onClick={goToPrevStep}
                disabled={createFlow.currentStep === 0}
              >
                Previous
              </Button>
              
              {createFlow.currentStep < 6 ? (
                <Button
                  variant="light"
                  color="violet"
                  rightSection={<IconChevronRight size={16} />}
                  onClick={goToNextStep}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  gradient={{ from: 'violet', to: 'indigo' }}
                  onClick={closeDrawer}
                >
                  Done
                </Button>
              )}
            </Group>
          </Box>
        </Box>
      </Drawer>
    </div>
  )
}
