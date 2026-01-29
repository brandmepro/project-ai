'use client'

import { motion } from 'framer-motion'
import { 
  Paper, 
  Text, 
  Group, 
  Badge, 
  Box, 
  ActionIcon, 
  Menu,
  Stack,
} from '@mantine/core'
import { 
  IconBrandInstagram, 
  IconBrandFacebook, 
  IconBrandWhatsapp, 
  IconBuildingStore,
  IconDotsVertical,
  IconEdit,
  IconCopy,
  IconTrash,
  IconCalendar,
} from '@tabler/icons-react'
import { type ContentItem, type Platform, type ContentStatus } from '@/lib/store'

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

interface ContentCardProps {
  content: ContentItem
  viewMode: 'grid' | 'list'
  onEdit?: (id: string) => void
  onDuplicate?: (id: string) => void
  onDelete?: (id: string) => void
}

export function ContentCard({ content, viewMode, onEdit, onDuplicate, onDelete }: ContentCardProps) {
  const PlatformIcon = platformIcons[content.platform]

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        whileHover={{ backgroundColor: 'var(--mantine-color-gray-0)' }}
      >
        <Box className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-all">
          {/* Thumbnail */}
          <Box className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 shrink-0 flex items-center justify-center">
            <Text fw={600} className="text-primary">
              {content.businessType.charAt(0).toUpperCase()}
            </Text>
          </Box>

          {/* Content */}
          <Box className="flex-1 min-w-0">
            <Text size="sm" fw={500} truncate className="text-foreground">
              {content.caption}
            </Text>
            <Group gap="xs" mt="xs">
              <Badge size="xs" variant="light" color={platformColors[content.platform]} leftSection={<PlatformIcon size={10} />}>
                {content.platform}
              </Badge>
              <Badge size="xs" variant="light" color={statusColors[content.status]}>
                {content.status}
              </Badge>
              {content.scheduledDate && (
                <Badge size="xs" variant="light" color="gray" leftSection={<IconCalendar size={10} />}>
                  {content.scheduledDate}
                </Badge>
              )}
            </Group>
          </Box>

          {/* Actions */}
          <Menu shadow="md" position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" size="sm">
                <IconDotsVertical size={14} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => onEdit?.(content.id)}>
                Edit
              </Menu.Item>
              <Menu.Item leftSection={<IconCopy size={14} />} onClick={() => onDuplicate?.(content.id)}>
                Duplicate
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => onDelete?.(content.id)}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Box>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
    >
      <Paper className="overflow-hidden border border-border hover:border-primary/30 transition-all" withBorder={false}>
        {/* Image */}
        <Box className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 relative">
          <Box className="absolute inset-0 flex items-center justify-center">
            <Box className="h-12 w-12 rounded-xl bg-white/80 flex items-center justify-center shadow-lg">
              <Text fw={700} className="text-primary">
                {content.businessType.charAt(0).toUpperCase()}
              </Text>
            </Box>
          </Box>
          
          {/* Platform Badge */}
          <Box className="absolute top-2 left-2">
            <Badge 
              size="xs" 
              variant="filled" 
              color={platformColors[content.platform]}
              leftSection={<PlatformIcon size={10} />}
            >
              {content.platform}
            </Badge>
          </Box>

          {/* Menu */}
          <Box className="absolute top-2 right-2">
            <Menu shadow="md" position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="filled" size="sm" color="dark" className="bg-black/50 hover:bg-black/70">
                  <IconDotsVertical size={14} className="text-white" />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => onEdit?.(content.id)}>
                  Edit
                </Menu.Item>
                <Menu.Item leftSection={<IconCopy size={14} />} onClick={() => onDuplicate?.(content.id)}>
                  Duplicate
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => onDelete?.(content.id)}>
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Box>
        </Box>

        {/* Content */}
        <Stack gap="xs" p="sm">
          <Text size="sm" fw={500} lineClamp={2} className="text-foreground">
            {content.caption}
          </Text>
          
          <Group justify="space-between">
            <Badge size="xs" variant="light" color={statusColors[content.status]}>
              {content.status}
            </Badge>
            <Text size="xs" c="dimmed">
              {content.scheduledDate || content.createdAt}
            </Text>
          </Group>
        </Stack>
      </Paper>
    </motion.div>
  )
}
