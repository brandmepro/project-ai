'use client'

import { useState } from 'react'
import {
  Modal,
  Text,
  Stack,
  Group,
  Badge,
  Tabs,
  ScrollArea,
  Divider,
  Paper,
  Tooltip,
  Table,
  TextInput,
  Select,
} from '@mantine/core'
import {
  IconSparkles,
  IconCurrencyDollar,
  IconClock,
  IconEye,
  IconPhoto,
  IconWorld,
  IconBolt,
  IconBrain,
  IconCheck,
  IconSearch,
} from '@tabler/icons-react'
import { useAIControllerGetAllModels } from '@businesspro/api-client'

interface ModelInfoModalProps {
  opened: boolean
  onClose: () => void
}

export function ModelInfoModal({ opened, onClose }: ModelInfoModalProps) {
  const [activeTab, setActiveTab] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [providerFilter, setProviderFilter] = useState<string | null>(null)

  const { data: allModels, isLoading } = useAIControllerGetAllModels({
    active: 'true',
    provider: '',
    type: '',
  })

  const models = (allModels || []) as any[]

  // Filter models based on search and provider
  const filteredModels = models.filter((model: any) => {
    const matchesSearch = !searchQuery || 
      model.modelName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.provider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesProvider = !providerFilter || model.provider === providerFilter
    
    return matchesSearch && matchesProvider
  }) || []

  // Filter by tab
  const getModelsForTab = () => {
    if (activeTab === 'all') return filteredModels
    if (activeTab === 'text') return filteredModels.filter((m: any) => m.capabilities?.includes('text-generation'))
    if (activeTab === 'vision') return filteredModels.filter((m: any) => m.supportsVision)
    if (activeTab === 'image') return filteredModels.filter((m: any) => m.supportsImageGen)
    return filteredModels
  }

  const displayModels = getModelsForTab()

  // Get unique providers for filter
  const providers = Array.from(new Set(models.map((m: any) => m.provider).filter(Boolean))) as string[]

  const renderModelCard = (model: any) => (
    <Paper key={model.id} className="p-4 bg-card border border-border" withBorder={false}>
      <Group justify="space-between" mb="sm">
        <Stack gap={2}>
          <Group gap="xs">
            <Text fw={600} className="text-foreground">
              {model.modelName}
            </Text>
            {model.isRecommended && (
              <Tooltip label="Recommended for production">
                <Badge size="xs" color="green" leftSection={<IconCheck size={10} />}>
                  Recommended
                </Badge>
              </Tooltip>
            )}
          </Group>
          <Text size="xs" c="dimmed">
            {model.provider} • ID: {model.modelId}
          </Text>
        </Stack>
        <Badge
          size="sm"
          color={
            model.costBucket === 'free' || model.costBucket === 'ultra-low' || model.costBucket === 'low' 
              ? 'green' 
              : model.costBucket === 'high' || model.costBucket === 'premium' 
              ? 'orange' 
              : 'blue'
          }
        >
          {model.costBucket?.toUpperCase() || 'UNKNOWN'}
        </Badge>
      </Group>

      {model.description && (
        <Text size="xs" c="dimmed" mb="sm" lineClamp={2}>
          {model.description}
        </Text>
      )}

      <Divider my="sm" />

      {/* Capabilities */}
      <Group gap={4} mb="sm">
        {model.supportsVision && (
          <Tooltip label="Vision Support">
            <Badge size="xs" variant="light" leftSection={<IconEye size={10} />}>
              Vision
            </Badge>
          </Tooltip>
        )}
        {model.supportsImageGen && (
          <Tooltip label="Image Generation">
            <Badge size="xs" variant="light" leftSection={<IconPhoto size={10} />}>
              Image Gen
            </Badge>
          </Tooltip>
        )}
        {model.supportsWebSearch && (
          <Tooltip label="Web Search">
            <Badge size="xs" variant="light" leftSection={<IconWorld size={10} />}>
              Web Search
            </Badge>
          </Tooltip>
        )}
        {model.supportsFunctionCalling && (
          <Tooltip label="Function Calling">
            <Badge size="xs" variant="light">
              Functions
            </Badge>
          </Tooltip>
        )}
        {model.supportsJsonMode && (
          <Tooltip label="JSON Mode">
            <Badge size="xs" variant="light">
              JSON
            </Badge>
          </Tooltip>
        )}
        {model.supportsStreaming && (
          <Tooltip label="Streaming">
            <Badge size="xs" variant="light">
              Stream
            </Badge>
          </Tooltip>
        )}
      </Group>

      {/* Stats */}
      <Group gap="lg">
        <div>
          <Group gap={4} mb={2}>
            <IconClock size={12} className="text-muted-foreground" />
            <Text size="xs" c="dimmed">
              Latency
            </Text>
          </Group>
          <Text size="xs" fw={500}>
            {model.latencyMs ? `${model.latencyMs}ms` : 'N/A'}
          </Text>
        </div>
        <div>
          <Group gap={4} mb={2}>
            <IconBolt size={12} className="text-muted-foreground" />
            <Text size="xs" c="dimmed">
              Throughput
            </Text>
          </Group>
          <Text size="xs" fw={500}>
            {model.throughputTps ? `${model.throughputTps} tps` : 'N/A'}
          </Text>
        </div>
        <div>
          <Group gap={4} mb={2}>
            <IconBrain size={12} className="text-muted-foreground" />
            <Text size="xs" c="dimmed">
              Context
            </Text>
          </Group>
          <Text size="xs" fw={500}>
            {model.contextWindow ? `${(model.contextWindow / 1000).toFixed(0)}K` : 'N/A'}
          </Text>
        </div>
      </Group>

      <Divider my="sm" />

      {/* Costs */}
      <Group gap="lg">
        <div>
          <Group gap={4} mb={2}>
            <IconCurrencyDollar size={12} className="text-green-500" />
            <Text size="xs" c="dimmed">
              Input Cost
            </Text>
          </Group>
          <Text size="xs" fw={500}>
            {model.costPer1mInput ? `$${Number(model.costPer1mInput).toFixed(4)}/1M` : 'N/A'}
          </Text>
        </div>
        <div>
          <Group gap={4} mb={2}>
            <IconCurrencyDollar size={12} className="text-orange-500" />
            <Text size="xs" c="dimmed">
              Output Cost
            </Text>
          </Group>
          <Text size="xs" fw={500}>
            {model.costPer1mOutput ? `$${Number(model.costPer1mOutput).toFixed(4)}/1M` : 'N/A'}
          </Text>
        </div>
        {model.imageGenCost && (
          <div>
            <Group gap={4} mb={2}>
              <IconPhoto size={12} className="text-blue-500" />
              <Text size="xs" c="dimmed">
                Image Cost
              </Text>
            </Group>
            <Text size="xs" fw={500}>
              ${Number(model.imageGenCost).toFixed(3)}/img
            </Text>
          </div>
        )}
      </Group>

      {/* Use Cases */}
      {model.useCases && model.useCases.length > 0 && (
        <>
          <Divider my="sm" />
          <div>
            <Text size="xs" c="dimmed" mb={4}>
              Best for:
            </Text>
            <Group gap={4}>
              {model.useCases.slice(0, 5).map((useCase: string) => (
                <Badge key={useCase} size="xs" variant="dot">
                  {useCase.replace(/_/g, ' ')}
                </Badge>
              ))}
            </Group>
          </div>
        </>
      )}
    </Paper>
  )

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Available AI Models"
      size="xl"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Text size="sm" c="dimmed" mb="lg">
        Explore all {models.length || 0} AI models available for content generation. Our system automatically selects the best model for each task.
      </Text>

      {/* Search and Filter */}
      <Group mb="md">
        <TextInput
          placeholder="Search models..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Filter by provider"
          data={[
            { value: '', label: 'All Providers' },
            ...providers.map((p) => ({ value: p, label: p }))
          ]}
          value={providerFilter || ''}
          onChange={(value) => setProviderFilter(value || null)}
          clearable
          style={{ width: 200 }}
        />
      </Group>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')}>
        <Tabs.List>
          <Tabs.Tab value="all" leftSection={<IconSparkles size={16} />}>
            All ({models.length || 0})
          </Tabs.Tab>
          <Tabs.Tab value="text" leftSection={<IconSparkles size={16} />}>
            Text
          </Tabs.Tab>
          <Tabs.Tab value="vision" leftSection={<IconEye size={16} />}>
            Vision
          </Tabs.Tab>
          <Tabs.Tab value="image" leftSection={<IconPhoto size={16} />}>
            Image Gen
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value={activeTab} pt="md">
          {isLoading ? (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              Loading models...
            </Text>
          ) : displayModels.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              No models available
            </Text>
          ) : (
            <Stack gap="md">
              {displayModels.map(renderModelCard)}
            </Stack>
          )}
        </Tabs.Panel>
      </Tabs>
    </Modal>
  )
}
