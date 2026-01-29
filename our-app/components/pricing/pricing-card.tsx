'use client'

import { motion } from 'framer-motion'
import { 
  Paper, 
  Text, 
  Stack, 
  Group, 
  Badge, 
  Button,
  List,
  ThemeIcon,
  Box,
} from '@mantine/core'
import { IconCheck, IconX } from '@tabler/icons-react'

export interface PricingFeature {
  text: string
  included: boolean
}

export interface PricingPlan {
  name: string
  price: number
  period: string
  description: string
  features: PricingFeature[]
  postsPerMonth: number
  platforms: number
  highlighted?: boolean
  badge?: string
}

interface PricingCardProps {
  plan: PricingPlan
  index: number
}

export function PricingCard({ plan, index }: PricingCardProps) {
  const isHighlighted = plan.highlighted

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Paper
        className={`
          p-6 h-full relative overflow-hidden
          ${isHighlighted 
            ? 'bg-gradient-to-br from-primary to-accent border-2 border-primary' 
            : 'bg-card border border-border'
          }
        `}
        withBorder={false}
      >
        {/* Badge */}
        {plan.badge && (
          <Badge
            className="absolute top-4 right-4"
            color={isHighlighted ? 'white' : 'violet'}
            variant={isHighlighted ? 'filled' : 'light'}
          >
            {plan.badge}
          </Badge>
        )}

        <Stack gap="lg" className="h-full">
          {/* Header */}
          <Stack gap={4}>
            <Text 
              size="lg" 
              fw={600}
              className={isHighlighted ? 'text-white' : 'text-foreground'}
            >
              {plan.name}
            </Text>
            <Text 
              size="sm"
              className={isHighlighted ? 'text-white/80' : 'text-muted-foreground'}
            >
              {plan.description}
            </Text>
          </Stack>

          {/* Price */}
          <Box>
            <Group gap={4} align="baseline">
              <Text 
                size="xs"
                className={isHighlighted ? 'text-white/80' : 'text-muted-foreground'}
              >
                Rs.
              </Text>
              <Text 
                fw={700} 
                className={`text-4xl ${isHighlighted ? 'text-white' : 'text-foreground'}`}
              >
                {plan.price === 0 ? 'Free' : plan.price.toLocaleString()}
              </Text>
              {plan.price > 0 && (
                <Text 
                  size="sm"
                  className={isHighlighted ? 'text-white/80' : 'text-muted-foreground'}
                >
                  /{plan.period}
                </Text>
              )}
            </Group>
          </Box>

          {/* Key Stats */}
          <Group gap="lg">
            <Stack gap={0}>
              <Text 
                size="xl" 
                fw={700}
                className={isHighlighted ? 'text-white' : 'text-foreground'}
              >
                {plan.postsPerMonth}
              </Text>
              <Text 
                size="xs"
                className={isHighlighted ? 'text-white/70' : 'text-muted-foreground'}
              >
                posts/month
              </Text>
            </Stack>
            <Stack gap={0}>
              <Text 
                size="xl" 
                fw={700}
                className={isHighlighted ? 'text-white' : 'text-foreground'}
              >
                {plan.platforms}
              </Text>
              <Text 
                size="xs"
                className={isHighlighted ? 'text-white/70' : 'text-muted-foreground'}
              >
                platforms
              </Text>
            </Stack>
          </Group>

          {/* Features */}
          <List 
            spacing="xs" 
            size="sm" 
            className="flex-1"
            center
          >
            {plan.features.map((feature, i) => (
              <List.Item
                key={i}
                icon={
                  <ThemeIcon 
                    size={18} 
                    radius="xl"
                    color={feature.included ? (isHighlighted ? 'white' : 'violet') : 'gray'}
                    variant={feature.included ? 'filled' : 'light'}
                  >
                    {feature.included ? (
                      <IconCheck size={12} stroke={3} />
                    ) : (
                      <IconX size={12} stroke={3} />
                    )}
                  </ThemeIcon>
                }
                className={`
                  ${feature.included 
                    ? (isHighlighted ? 'text-white' : 'text-foreground')
                    : (isHighlighted ? 'text-white/50' : 'text-muted-foreground')
                  }
                `}
              >
                {feature.text}
              </List.Item>
            ))}
          </List>

          {/* CTA */}
          <Button
            fullWidth
            size="md"
            variant={isHighlighted ? 'white' : 'filled'}
            color={isHighlighted ? undefined : 'violet'}
          >
            {plan.price === 0 ? 'Get Started Free' : 'Upgrade Now'}
          </Button>
        </Stack>
      </Paper>
    </motion.div>
  )
}
