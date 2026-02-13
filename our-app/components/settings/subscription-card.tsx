'use client'

import { Group, Text, Stack, Button, Badge, Progress, Box } from '@mantine/core'
import { IconCreditCard, IconArrowUpRight, IconReceipt, IconCreditCardPay } from '@tabler/icons-react'
import { SettingsSectionCard } from './settings-section-card'
import Link from 'next/link'

interface SubscriptionCardProps {
  index?: number
}

export function SubscriptionCard({ index }: SubscriptionCardProps) {
  // TODO: Replace with actual API data
  const currentPlan = 'Free'
  const postsUsed = 3
  const postsLimit = 5
  const aiGenerationsUsed = 12
  const nextBillingDate = 'Feb 28, 2026'

  const planColors = {
    free: 'gray',
    starter: 'blue',
    pro: 'violet'
  }

  const isPro = currentPlan.toLowerCase() === 'pro'

  return (
    <SettingsSectionCard
      title="Subscription & Billing"
      description="Manage your plan and payment details"
      icon={IconCreditCard}
      highlight
      index={index}
    >
      {/* Current Plan */}
      <Box className="p-4 rounded-lg bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 border border-violet-200 dark:border-violet-800">
        <Group justify="space-between" align="flex-start" mb="md">
          <Stack gap={4}>
            <Group gap="xs">
              <Text size="lg" fw={600} className="text-foreground">
                {currentPlan} Plan
              </Text>
              <Badge 
                size="sm" 
                variant="filled" 
                color={planColors[currentPlan.toLowerCase() as keyof typeof planColors]}
              >
                Active
              </Badge>
            </Group>
            <Text size="xs" c="dimmed">
              {currentPlan === 'Free' ? 'No billing' : `Next billing: ${nextBillingDate}`}
            </Text>
          </Stack>
          <Link href="/pricing">
            <Button 
              variant="light" 
              color="violet" 
              size="xs"
              rightSection={<IconArrowUpRight size={14} />}
            >
              {currentPlan === 'Free' ? 'Upgrade' : 'Manage'}
            </Button>
          </Link>
        </Group>

        {/* Usage Stats */}
        <Stack gap="sm">
          <Box>
            <Group justify="space-between" mb={4}>
              <Text size="xs" fw={500} className="text-foreground">
                Posts this month
              </Text>
              <Text size="xs" c="dimmed">
                {postsUsed}/{postsLimit}
              </Text>
            </Group>
            <Progress 
              value={(postsUsed / postsLimit) * 100} 
              color="violet" 
              size="sm"
              radius="xl"
            />
          </Box>

          {isPro && (
            <Box>
              <Group justify="space-between" mb={4}>
                <Text size="xs" fw={500} className="text-foreground">
                  AI Generations
                </Text>
                <Text size="xs" c="dimmed">
                  {aiGenerationsUsed}/∞
                </Text>
              </Group>
              <Progress 
                value={100} 
                color="indigo" 
                size="sm"
                radius="xl"
              />
            </Box>
          )}
        </Stack>
      </Box>

      {/* Quick Actions */}
      <Stack gap="xs">
        <Button 
          variant="light" 
          color="gray" 
          fullWidth
          leftSection={<IconReceipt size={16} />}
          disabled
        >
          View Billing History
        </Button>
        <Button 
          variant="light" 
          color="gray" 
          fullWidth
          leftSection={<IconCreditCardPay size={16} />}
          disabled
        >
          Update Payment Method
        </Button>
      </Stack>
    </SettingsSectionCard>
  )
}
