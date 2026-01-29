'use client'

import { motion } from 'framer-motion'
import { Paper, Text, Group, Badge, Stack, Avatar, Box, ActionIcon } from '@mantine/core'
import { IconBrandInstagram, IconBrandFacebook, IconBrandWhatsapp, IconBuildingStore, IconDotsVertical } from '@tabler/icons-react'
import { useAppStore, type Platform, type ContentStatus } from '@/lib/store'

const platformIcons: Record<Platform, typeof IconBrandInstagram> = {
  instagram: IconBrandInstagram,
  facebook: IconBrandFacebook,
  whatsapp: IconBrandWhatsapp,
  'google-business': IconBuildingStore,
}

const platformColors: Record<Platform, string> = {
  instagram: 'pink',
  facebook: 'blue',
  whatsapp: 'green',
  'google-business': 'orange',
}

const statusColors: Record<ContentStatus, string> = {
  draft: 'gray',
  scheduled: 'violet',
  posted: 'green',
}

export function RecentContent() {
  const { contents } = useAppStore()
  const recentContents = contents.slice(0, 4)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Paper className="p-4 lg:p-5 bg-card border border-border" withBorder={false}>
        <Group justify="space-between" mb="md">
          <Text fw={600} size="lg" className="text-foreground">Recent Content</Text>
          <Badge variant="light" color="violet">
            {contents.length} total
          </Badge>
        </Group>

        <Stack gap="sm">
          {recentContents.map((content, index) => {
            const PlatformIcon = platformIcons[content.platform]
            
            return (
              <motion.div
                key={content.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.1 * index }}
              >
                <Box className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <Avatar size="md" radius="md" color={platformColors[content.platform]}>
                    <PlatformIcon size={20} />
                  </Avatar>
                  
                  <Box className="flex-1 min-w-0">
                    <Text size="sm" fw={500} truncate className="text-foreground">
                      {content.caption.substring(0, 50)}...
                    </Text>
                    <Text size="xs" c="dimmed">
                      {content.scheduledDate || content.createdAt}
                    </Text>
                  </Box>

                  <Group gap="xs">
                    <Badge size="sm" variant="light" color={statusColors[content.status]}>
                      {content.status}
                    </Badge>
                    <ActionIcon variant="subtle" size="sm">
                      <IconDotsVertical size={14} />
                    </ActionIcon>
                  </Group>
                </Box>
              </motion.div>
            )
          })}
        </Stack>
      </Paper>
    </motion.div>
  )
}
