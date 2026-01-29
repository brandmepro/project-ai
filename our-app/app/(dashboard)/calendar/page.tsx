'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Text, 
  Stack, 
  Group, 
  Button, 
  SegmentedControl, 
  Paper,
  Box,
  Badge,
  ActionIcon,
  Drawer,
  Avatar,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { 
  IconPlus, 
  IconChevronLeft,
  IconChevronRight,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandWhatsapp,
  IconBuildingStore,
  IconX,
} from '@tabler/icons-react'
import Link from 'next/link'
import { useAppStore, type Platform, type ContentItem } from '@/lib/store'

const platformColors: Record<Platform, string> = {
  instagram: 'pink',
  facebook: 'blue',
  whatsapp: 'green',
  'google-business': 'orange',
}

const platformIcons: Record<Platform, typeof IconBrandInstagram> = {
  instagram: IconBrandInstagram,
  facebook: IconBrandFacebook,
  whatsapp: IconBrandWhatsapp,
  'google-business': IconBuildingStore,
}

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function CalendarPage() {
  const { contents } = useAppStore()
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false)

  const scheduledContents = contents.filter(c => c.status === 'scheduled' && c.scheduledDate)

  const getContentForDate = (dateStr: string) => {
    return scheduledContents.filter(c => c.scheduledDate === dateStr)
  }

  const handleContentClick = (content: ContentItem) => {
    setSelectedContent(content)
    openDrawer()
  }

  // Get week dates
  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  // Get month dates
  const getMonthDates = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const dates = []
    const startPadding = firstDay.getDay()
    
    // Add padding for previous month
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      dates.push({ date, isCurrentMonth: false })
    }
    
    // Add current month dates
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push({ date: new Date(year, month, i), isCurrentMonth: true })
    }
    
    // Add padding for next month
    const endPadding = 42 - dates.length
    for (let i = 1; i <= endPadding; i++) {
      dates.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }
    
    return dates
  }

  const formatDateStr = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const weekDates = getWeekDates()
  const monthDates = getMonthDates()

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Group justify="space-between" mb="lg" wrap="nowrap">
          <Stack gap={4}>
            <Text size="xl" fw={700} className="text-foreground">
              Content Calendar
            </Text>
            <Text size="sm" c="dimmed">
              View and manage your scheduled posts
            </Text>
          </Stack>

          <Button
            component={Link}
            href="/create"
            variant="gradient"
            gradient={{ from: 'violet', to: 'indigo' }}
            leftSection={<IconPlus size={18} />}
          >
            Schedule Post
          </Button>
        </Group>
      </motion.div>

      {/* Calendar Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Paper className="p-4 mb-6 bg-card border border-border" withBorder={false}>
          <Group justify="space-between">
            <Group gap="sm">
              <ActionIcon variant="subtle" onClick={() => navigateDate('prev')}>
                <IconChevronLeft size={18} />
              </ActionIcon>
              <Text fw={600} size="lg" className="min-w-[200px] text-center text-foreground">
                {viewMode === 'week' 
                  ? `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                }
              </Text>
              <ActionIcon variant="subtle" onClick={() => navigateDate('next')}>
                <IconChevronRight size={18} />
              </ActionIcon>
            </Group>

            <Group gap="md">
              <Button 
                variant="subtle" 
                size="xs"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <SegmentedControl
                value={viewMode}
                onChange={(value) => setViewMode(value as 'week' | 'month')}
                data={[
                  { value: 'week', label: 'Week' },
                  { value: 'month', label: 'Month' },
                ]}
              />
            </Group>
          </Group>
        </Paper>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Paper className="p-4 bg-card border border-border overflow-hidden" withBorder={false}>
          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day) => (
              <Box key={day} className="text-center py-2">
                <Text size="xs" fw={600} c="dimmed">
                  {day}
                </Text>
              </Box>
            ))}
          </div>

          {/* Calendar Cells */}
          {viewMode === 'week' ? (
            <div className="grid grid-cols-7 gap-1">
              {weekDates.map((date, index) => {
                const dateStr = formatDateStr(date)
                const dayContents = getContentForDate(dateStr)
                const isToday = formatDateStr(new Date()) === dateStr

                return (
                  <motion.div
                    key={dateStr}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <Box 
                      className={`
                        min-h-[120px] p-2 rounded-lg border transition-colors
                        ${isToday ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}
                      `}
                    >
                      <Text 
                        size="sm" 
                        fw={isToday ? 700 : 500}
                        c={isToday ? 'violet' : undefined}
                        className="text-foreground"
                      >
                        {date.getDate()}
                      </Text>
                      
                      <Stack gap={4} mt="xs">
                        {dayContents.slice(0, 3).map((content) => {
                          const PlatformIcon = platformIcons[content.platform]
                          return (
                            <Box
                              key={content.id}
                              className="p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity"
                              style={{ backgroundColor: `var(--mantine-color-${platformColors[content.platform]}-1)` }}
                              onClick={() => handleContentClick(content)}
                            >
                              <Group gap={4} wrap="nowrap">
                                <PlatformIcon size={12} style={{ color: `var(--mantine-color-${platformColors[content.platform]}-6)` }} />
                                <Text size="xs" truncate className="flex-1">
                                  {content.scheduledTime || '09:00'}
                                </Text>
                              </Group>
                            </Box>
                          )
                        })}
                        {dayContents.length > 3 && (
                          <Text size="xs" c="dimmed" ta="center">
                            +{dayContents.length - 3} more
                          </Text>
                        )}
                      </Stack>
                    </Box>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {monthDates.map(({ date, isCurrentMonth }, index) => {
                const dateStr = formatDateStr(date)
                const dayContents = getContentForDate(dateStr)
                const isToday = formatDateStr(new Date()) === dateStr

                return (
                  <motion.div
                    key={`${dateStr}-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15, delay: Math.min(index * 0.01, 0.3) }}
                  >
                    <Box 
                      className={`
                        min-h-[80px] p-1.5 rounded-lg border transition-colors
                        ${!isCurrentMonth ? 'opacity-40' : ''}
                        ${isToday ? 'border-primary bg-primary/5' : 'border-transparent hover:border-border'}
                      `}
                    >
                      <Text 
                        size="xs" 
                        fw={isToday ? 700 : 400}
                        c={isToday ? 'violet' : isCurrentMonth ? undefined : 'dimmed'}
                      >
                        {date.getDate()}
                      </Text>
                      
                      <Stack gap={2} mt={4}>
                        {dayContents.slice(0, 2).map((content) => (
                          <Box
                            key={content.id}
                            className="h-1.5 rounded-full cursor-pointer"
                            style={{ backgroundColor: `var(--mantine-color-${platformColors[content.platform]}-5)` }}
                            onClick={() => handleContentClick(content)}
                          />
                        ))}
                        {dayContents.length > 2 && (
                          <Text size="xs" c="dimmed" ta="center">
                            +{dayContents.length - 2}
                          </Text>
                        )}
                      </Stack>
                    </Box>
                  </motion.div>
                )
              })}
            </div>
          )}
        </Paper>
      </motion.div>

      {/* Content Preview Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        position="right"
        size="md"
        title={
          <Text fw={600}>Scheduled Post</Text>
        }
      >
        {selectedContent && (
          <Stack gap="md">
            <Box className="aspect-square rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Avatar size="xl" color="violet">
                {selectedContent.businessType.charAt(0).toUpperCase()}
              </Avatar>
            </Box>

            <Stack gap="xs">
              <Group gap="xs">
                <Badge color={platformColors[selectedContent.platform]}>
                  {selectedContent.platform}
                </Badge>
                <Badge color="violet">
                  {selectedContent.scheduledDate} at {selectedContent.scheduledTime || '09:00'}
                </Badge>
              </Group>

              <Text size="sm" className="text-foreground">
                {selectedContent.caption}
              </Text>

              <Text size="xs" c="blue">
                {selectedContent.hashtags.map(h => `#${h}`).join(' ')}
              </Text>
            </Stack>

            <Group mt="md">
              <Button variant="light" color="violet" flex={1}>
                Edit
              </Button>
              <Button variant="filled" color="violet" flex={1}>
                Reschedule
              </Button>
            </Group>
          </Stack>
        )}
      </Drawer>
    </div>
  )
}
