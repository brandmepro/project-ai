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
} from '@tabler/icons-react'
import { useAIControllerGetModelsByCapability } from '@businesspro/api-client'

interface ModelInfoModalProps {
  opened: boolean
  onClose: () => void
}

export function ModelInfoModal({ opened, onClose }: ModelInfoModalProps) {
  const [activeTab, setActiveTab] = useState<string>('text')

  const { data: textModels } = useAIControllerGetModelsByCapability('text')
  const { data: visionModels } = useAIControllerGetModelsByCapability('vision')
  const { data: imageGenModels } = useAIControllerGetModelsByCapability('image_generation')

  const renderModelCard = (model: any) => (
    <Paper key={model.modelId} className="p-4 bg-card border border-border" withBorder={false}>
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
            {model.provider} • Priority: {model.priorityRank}
          </Text>
        </Stack>
        <Badge
          size="sm"
          color={model.costBucket === 'low' ? 'green' : model.costBucket === 'high' ? 'orange' : 'blue'}
        >
          {model.costBucket.toUpperCase()} COST
        </Badge>
      </Group>

      <Text size="xs" c="dimmed" mb="sm">
        {model.description}
      </Text>

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
            {model.costPer1mInput ? `$${model.costPer1mInput.toFixed(2)}/1M` : 'N/A'}
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
            {model.costPer1mOutput ? `$${model.costPer1mOutput.toFixed(2)}/1M` : 'N/A'}
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
              ${model.imageGenCost.toFixed(3)}/img
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
              {model.useCases.map((useCase: string) => (
                <Badge key={useCase} size="xs" variant="dot">
                  {useCase.replace(/_/g, ' ')}
                </Badge>
              ))}
            </Group>
          </div>
        </>
      )}

      {/* Providers */}
      {model.availableProviders && model.availableProviders.length > 0 && (
        <>
          <Divider my="sm" />
          <div>
            <Text size="xs" c="dimmed" mb={4}>
              Available on:
            </Text>
            <Group gap={4}>
              {model.availableProviders.map((provider: string) => (
                <Badge key={provider} size="xs" variant="outline">
                  {provider}
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
        Explore all AI models available for content generation. Our system automatically selects the best model for each task.
      </Text>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'text')}>
        <Tabs.List>
          <Tabs.Tab value="text" leftSection={<IconSparkles size={16} />}>
            Text Models
          </Tabs.Tab>
          <Tabs.Tab value="vision" leftSection={<IconEye size={16} />}>
            Vision Models
          </Tabs.Tab>
          <Tabs.Tab value="image" leftSection={<IconPhoto size={16} />}>
            Image Gen
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="text" pt="md">
          <Stack gap="md">
            {textModels?.data?.map(renderModelCard) || (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                No models available
              </Text>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="vision" pt="md">
          <Stack gap="md">
            {visionModels?.data?.map(renderModelCard) || (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                No vision models available
              </Text>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="image" pt="md">
          <Stack gap="md">
            {imageGenModels?.data?.map(renderModelCard) || (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                No image generation models available
              </Text>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  )
}
