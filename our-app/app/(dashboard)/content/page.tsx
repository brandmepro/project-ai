'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Text, 
  Stack, 
  Group, 
  Button, 
  SegmentedControl, 
  Select,
  SimpleGrid,
  TextInput,
  Box,
  Badge,
} from '@mantine/core'
import { 
  IconPlus, 
  IconLayoutGrid, 
  IconLayoutList,
  IconSearch,
  IconFilter,
} from '@tabler/icons-react'
import Link from 'next/link'
import { ContentCard } from '@/components/content/content-card'
import { useAppStore, type Platform, type ContentStatus } from '@/lib/store'

export default function ContentPage() {
  const { contents, deleteContent } = useAppStore()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const filteredContents = contents.filter((content) => {
    const matchesSearch = content.caption.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPlatform = !platformFilter || content.platform === platformFilter
    const matchesStatus = !statusFilter || content.status === statusFilter
    return matchesSearch && matchesPlatform && matchesStatus
  })

  const handleDelete = (id: string) => {
    deleteContent(id)
  }

  const handleDuplicate = (id: string) => {
    const content = contents.find(c => c.id === id)
    if (content) {
      // Would typically add a duplicated version
      console.log('Duplicate:', id)
    }
  }

  const handleEdit = (id: string) => {
    console.log('Edit:', id)
  }

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
              Content Library
            </Text>
            <Text size="sm" c="dimmed">
              Manage all your generated content
            </Text>
          </Stack>

          <Button
            component={Link}
            href="/create"
            variant="gradient"
            gradient={{ from: 'violet', to: 'indigo' }}
            leftSection={<IconPlus size={18} />}
          >
            Create New
          </Button>
        </Group>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Box className="p-4 rounded-xl bg-card border border-border mb-6">
          <Group justify="space-between" wrap="wrap" gap="md">
            <Group gap="sm" wrap="wrap">
              <TextInput
                placeholder="Search content..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64"
              />
              
              <Select
                placeholder="Platform"
                leftSection={<IconFilter size={16} />}
                data={[
                  { value: 'instagram', label: 'Instagram' },
                  { value: 'facebook', label: 'Facebook' },
                  { value: 'whatsapp', label: 'WhatsApp' },
                  { value: 'google-business', label: 'Google Business' },
                ]}
                value={platformFilter}
                onChange={setPlatformFilter}
                clearable
                className="w-40"
              />

              <Select
                placeholder="Status"
                data={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'posted', label: 'Posted' },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                clearable
                className="w-32"
              />
            </Group>

            <Group gap="sm">
              <Badge variant="light" color="violet">
                {filteredContents.length} items
              </Badge>
              
              <SegmentedControl
                value={viewMode}
                onChange={(value) => setViewMode(value as 'grid' | 'list')}
                data={[
                  { value: 'grid', label: <IconLayoutGrid size={16} /> },
                  { value: 'list', label: <IconLayoutList size={16} /> },
                ]}
              />
            </Group>
          </Group>
        </Box>
      </motion.div>

      {/* Content Grid/List */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
              {filteredContents.map((content, index) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <ContentCard
                    content={content}
                    viewMode="grid"
                    onEdit={handleEdit}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </SimpleGrid>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Stack gap="sm">
              {filteredContents.map((content, index) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <ContentCard
                    content={content}
                    viewMode="list"
                    onEdit={handleEdit}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredContents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-16"
        >
          <Box className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <IconSearch size={28} className="text-primary" />
          </Box>
          <Text size="lg" fw={600} className="text-foreground" mb="xs">
            No content found
          </Text>
          <Text size="sm" c="dimmed" mb="lg">
            {searchQuery || platformFilter || statusFilter 
              ? 'Try adjusting your filters'
              : 'Start creating content to see it here'
            }
          </Text>
          <Button
            component={Link}
            href="/create"
            variant="light"
            color="violet"
          >
            Create Content
          </Button>
        </motion.div>
      )}
    </div>
  )
}
