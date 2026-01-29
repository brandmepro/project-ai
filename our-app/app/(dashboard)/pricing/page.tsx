'use client'

import { motion } from 'framer-motion'
import { 
  Text, 
  Stack, 
  SimpleGrid,
  Paper,
  Table,
  Box,
  Badge,
  SegmentedControl,
} from '@mantine/core'
import { useState } from 'react'
import { IconCheck, IconX } from '@tabler/icons-react'
import { PricingCard, type PricingPlan } from '@/components/pricing/pricing-card'

const monthlyPlans: PricingPlan[] = [
  {
    name: 'Free',
    price: 0,
    period: 'month',
    description: 'Perfect for trying out Business Pro',
    postsPerMonth: 5,
    platforms: 1,
    features: [
      { text: 'Basic AI content generation', included: true },
      { text: 'Single platform support', included: true },
      { text: 'Manual scheduling', included: true },
      { text: 'Basic templates', included: true },
      { text: 'Analytics dashboard', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    name: 'Starter',
    price: 499,
    period: 'month',
    description: 'Great for small businesses getting started',
    postsPerMonth: 30,
    platforms: 2,
    features: [
      { text: 'Advanced AI content generation', included: true },
      { text: '2 platform support', included: true },
      { text: 'Auto-scheduling', included: true },
      { text: 'Premium templates', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Email support', included: false },
    ],
  },
  {
    name: 'Pro',
    price: 999,
    period: 'month',
    description: 'Best for growing businesses',
    postsPerMonth: 100,
    platforms: 4,
    highlighted: true,
    badge: 'Most Popular',
    features: [
      { text: 'Unlimited AI generation', included: true },
      { text: 'All 4 platforms', included: true },
      { text: 'Smart auto-scheduling', included: true },
      { text: 'All premium templates', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority support', included: true },
    ],
  },
]

const yearlyPlans: PricingPlan[] = monthlyPlans.map(plan => ({
  ...plan,
  price: plan.price === 0 ? 0 : Math.round(plan.price * 10), // 2 months free
  period: 'year',
  badge: plan.highlighted ? 'Most Popular' : plan.price > 0 ? 'Save 17%' : undefined,
}))

const comparisonFeatures = [
  { feature: 'Posts per month', free: '5', starter: '30', pro: '100' },
  { feature: 'Platforms supported', free: '1', starter: '2', pro: 'All 4' },
  { feature: 'AI content generation', free: 'Basic', starter: 'Advanced', pro: 'Unlimited' },
  { feature: 'Templates', free: 'Basic', starter: 'Premium', pro: 'All Premium' },
  { feature: 'Auto-scheduling', free: false, starter: true, pro: true },
  { feature: 'Analytics dashboard', free: false, starter: 'Basic', pro: 'Advanced' },
  { feature: 'Content calendar', free: false, starter: true, pro: true },
  { feature: 'Team collaboration', free: false, starter: false, pro: true },
  { feature: 'API access', free: false, starter: false, pro: true },
  { feature: 'Priority support', free: false, starter: false, pro: true },
]

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const plans = billingPeriod === 'monthly' ? monthlyPlans : yearlyPlans

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <Stack gap="md" align="center">
          <Badge variant="light" color="violet" size="lg">
            Pricing
          </Badge>
          <Text size="xl" fw={700} className="text-foreground">
            Choose the perfect plan for your business
          </Text>
          <Text size="sm" c="dimmed" maw={500}>
            Start free and scale as you grow. All plans include our core AI features.
          </Text>

          <SegmentedControl
            value={billingPeriod}
            onChange={(value) => setBillingPeriod(value as 'monthly' | 'yearly')}
            data={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly (Save 17%)' },
            ]}
            mt="md"
          />
        </Stack>
      </motion.div>

      {/* Pricing Cards */}
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" mb="xl">
        {plans.map((plan, index) => (
          <PricingCard key={plan.name} plan={plan} index={index} />
        ))}
      </SimpleGrid>

      {/* Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Paper className="p-5 bg-card border border-border overflow-x-auto" withBorder={false}>
          <Text fw={600} size="lg" mb="lg" className="text-foreground">
            Feature Comparison
          </Text>
          
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Feature</Table.Th>
                <Table.Th className="text-center">Free</Table.Th>
                <Table.Th className="text-center">Starter</Table.Th>
                <Table.Th className="text-center">
                  <Badge color="violet" variant="light">Pro</Badge>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {comparisonFeatures.map((row, index) => (
                <Table.Tr key={row.feature}>
                  <Table.Td>
                    <Text size="sm" className="text-foreground">
                      {row.feature}
                    </Text>
                  </Table.Td>
                  <Table.Td className="text-center">
                    {renderValue(row.free)}
                  </Table.Td>
                  <Table.Td className="text-center">
                    {renderValue(row.starter)}
                  </Table.Td>
                  <Table.Td className="text-center">
                    {renderValue(row.pro)}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </motion.div>

      {/* FAQ or additional info could go here */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="mt-8 text-center"
      >
        <Paper className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border border-border" withBorder={false}>
          <Text fw={600} size="lg" mb="xs" className="text-foreground">
            Need a custom plan?
          </Text>
          <Text size="sm" c="dimmed" mb="md">
            Contact us for enterprise pricing with custom features and dedicated support.
          </Text>
          <Badge variant="outline" color="violet" size="lg" className="cursor-pointer">
            Contact Sales
          </Badge>
        </Paper>
      </motion.div>
    </div>
  )
}

function renderValue(value: boolean | string) {
  if (typeof value === 'boolean') {
    return value ? (
      <IconCheck size={18} className="inline text-green-500" />
    ) : (
      <IconX size={18} className="inline text-gray-300" />
    )
  }
  return <Text size="sm" c="dimmed">{value}</Text>
}
