'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Text, 
  Stack, 
  Paper,
  Group,
  Button,
  Divider,
  Badge,
  TextInput,
  Select,
  Checkbox,
  Box,
  List,
  ThemeIcon,
  Radio,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useState } from 'react'
import { 
  IconCheck, 
  IconCreditCard, 
  IconLock,
  IconBuildingBank,
  IconPhone,
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'

const planDetails: Record<string, { name: string; price: number; period: string; features: string[] }> = {
  free: {
    name: 'Free',
    price: 0,
    period: 'month',
    features: [
      '5 posts per month',
      '1 platform',
      'Basic AI content generation',
      'Manual scheduling',
    ],
  },
  'starter-monthly': {
    name: 'Starter',
    price: 499,
    period: 'month',
    features: [
      '30 posts per month',
      '2 platforms',
      'Advanced AI content generation',
      'Auto-scheduling',
      'Premium templates',
    ],
  },
  'starter-yearly': {
    name: 'Starter',
    price: 4990,
    period: 'year',
    features: [
      '30 posts per month',
      '2 platforms',
      'Advanced AI content generation',
      'Auto-scheduling',
      'Premium templates',
    ],
  },
  'pro-monthly': {
    name: 'Pro',
    price: 999,
    period: 'month',
    features: [
      '100 posts per month',
      'All 4 platforms',
      'Unlimited AI generation',
      'Smart auto-scheduling',
      'All premium templates',
      'Advanced analytics',
      'Priority support',
    ],
  },
  'pro-yearly': {
    name: 'Pro',
    price: 9990,
    period: 'year',
    features: [
      '100 posts per month',
      'All 4 platforms',
      'Unlimited AI generation',
      'Smart auto-scheduling',
      'All premium templates',
      'Advanced analytics',
      'Priority support',
    ],
  },
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planKey = searchParams.get('plan') || 'starter-monthly'
  const plan = planDetails[planKey] || planDetails['starter-monthly']
  
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card')
  const [processing, setProcessing] = useState(false)

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      upiId: '',
      bankName: '',
      agreeToTerms: false,
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      email: (value) => (!value || !/^\S+@\S+$/.test(value) ? 'Invalid email' : null),
      phone: (value) => (!value || !/^\d{10}$/.test(value) ? 'Invalid phone number' : null),
      cardNumber: (value) => paymentMethod === 'card' && (!value || value.length !== 16) ? 'Invalid card number' : null,
      expiryDate: (value) => paymentMethod === 'card' && (!value || !/^\d{2}\/\d{2}$/.test(value)) ? 'Format: MM/YY' : null,
      cvv: (value) => paymentMethod === 'card' && (!value || value.length !== 3) ? 'Invalid CVV' : null,
      upiId: (value) => paymentMethod === 'upi' && (!value || !value.includes('@')) ? 'Invalid UPI ID' : null,
      bankName: (value) => paymentMethod === 'netbanking' && !value ? 'Please select a bank' : null,
      agreeToTerms: (value) => !value ? 'You must agree to the terms' : null,
    },
  })

  const handleSubmit = async (values: typeof form.values) => {
    setProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // TODO: Integrate with actual payment gateway (Razorpay, Stripe, etc.)
    console.log('Payment details:', { ...values, plan: planKey, amount: plan.price })
    
    notifications.show({
      title: 'Payment Successful! 🎉',
      message: `Welcome to ${plan.name} plan! Your account has been upgraded.`,
      color: 'green',
      autoClose: 5000,
    })
    
    setProcessing(false)
    
    // Redirect to dashboard after successful payment
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  const gst = Math.round(plan.price * 0.18)
  const totalAmount = plan.price + gst

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Stack gap="md" mb="xl">
          <Group justify="space-between" align="center">
            <div>
              <Text size="xl" fw={700} className="text-foreground">
                Complete Your Purchase
              </Text>
              <Text size="sm" c="dimmed">
                Secure checkout powered by Business Pro
              </Text>
            </div>
            <Badge size="lg" variant="dot" color="green">
              <Group gap={4}>
                <IconLock size={14} />
                Secure Payment
              </Group>
            </Badge>
          </Group>
        </Stack>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="lg">
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Paper className="p-5 bg-card border border-border">
                  <Text fw={600} mb="md">Contact Information</Text>
                  <Stack gap="md">
                    <TextInput
                      label="Full Name"
                      placeholder="John Doe"
                      {...form.getInputProps('name')}
                      radius="md"
                      required
                    />
                    <Group grow>
                      <TextInput
                        label="Email"
                        placeholder="your@email.com"
                        {...form.getInputProps('email')}
                        radius="md"
                        required
                      />
                      <TextInput
                        label="Phone"
                        placeholder="9876543210"
                        leftSection={<IconPhone size={16} />}
                        {...form.getInputProps('phone')}
                        radius="md"
                        required
                      />
                    </Group>
                  </Stack>
                </Paper>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Paper className="p-5 bg-card border border-border">
                  <Text fw={600} mb="md">Payment Method</Text>
                  
                  <Radio.Group value={paymentMethod} onChange={(val) => setPaymentMethod(val as any)}>
                    <Stack gap="sm">
                      <Paper
                        className={`p-3 cursor-pointer transition-all ${
                          paymentMethod === 'card' 
                            ? 'border-2 border-primary bg-primary/5' 
                            : 'border border-border hover:border-primary/50'
                        }`}
                        onClick={() => setPaymentMethod('card')}
                      >
                        <Radio
                          value="card"
                          label={
                            <Group gap="xs">
                              <IconCreditCard size={20} />
                              <Text fw={500}>Credit / Debit Card</Text>
                            </Group>
                          }
                        />
                      </Paper>

                      <Paper
                        className={`p-3 cursor-pointer transition-all ${
                          paymentMethod === 'upi' 
                            ? 'border-2 border-primary bg-primary/5' 
                            : 'border border-border hover:border-primary/50'
                        }`}
                        onClick={() => setPaymentMethod('upi')}
                      >
                        <Radio
                          value="upi"
                          label={
                            <Group gap="xs">
                              <Text fw={500}>UPI (Google Pay, PhonePe, Paytm)</Text>
                            </Group>
                          }
                        />
                      </Paper>

                      <Paper
                        className={`p-3 cursor-pointer transition-all ${
                          paymentMethod === 'netbanking' 
                            ? 'border-2 border-primary bg-primary/5' 
                            : 'border border-border hover:border-primary/50'
                        }`}
                        onClick={() => setPaymentMethod('netbanking')}
                      >
                        <Radio
                          value="netbanking"
                          label={
                            <Group gap="xs">
                              <IconBuildingBank size={20} />
                              <Text fw={500}>Net Banking</Text>
                            </Group>
                          }
                        />
                      </Paper>
                    </Stack>
                  </Radio.Group>

                  {/* Payment Method Details */}
                  <Box mt="md">
                    {paymentMethod === 'card' && (
                      <Stack gap="md">
                        <TextInput
                          label="Card Number"
                          placeholder="1234 5678 9012 3456"
                          leftSection={<IconCreditCard size={16} />}
                          {...form.getInputProps('cardNumber')}
                          radius="md"
                          maxLength={16}
                          required
                        />
                        <Group grow>
                          <TextInput
                            label="Expiry Date"
                            placeholder="MM/YY"
                            {...form.getInputProps('expiryDate')}
                            radius="md"
                            maxLength={5}
                            required
                          />
                          <TextInput
                            label="CVV"
                            placeholder="123"
                            {...form.getInputProps('cvv')}
                            radius="md"
                            maxLength={3}
                            type="password"
                            required
                          />
                        </Group>
                      </Stack>
                    )}

                    {paymentMethod === 'upi' && (
                      <TextInput
                        label="UPI ID"
                        placeholder="yourname@paytm"
                        {...form.getInputProps('upiId')}
                        radius="md"
                        required
                      />
                    )}

                    {paymentMethod === 'netbanking' && (
                      <Select
                        label="Select Your Bank"
                        placeholder="Choose your bank"
                        data={[
                          { value: 'sbi', label: 'State Bank of India' },
                          { value: 'hdfc', label: 'HDFC Bank' },
                          { value: 'icici', label: 'ICICI Bank' },
                          { value: 'axis', label: 'Axis Bank' },
                          { value: 'kotak', label: 'Kotak Mahindra Bank' },
                        ]}
                        {...form.getInputProps('bankName')}
                        radius="md"
                        searchable
                        required
                      />
                    )}
                  </Box>
                </Paper>
              </motion.div>

              {/* Terms */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Checkbox
                  label={
                    <Text size="sm">
                      I agree to the{' '}
                      <Text component="span" c="violet" className="cursor-pointer hover:underline">
                        Terms & Conditions
                      </Text>{' '}
                      and{' '}
                      <Text component="span" c="violet" className="cursor-pointer hover:underline">
                        Privacy Policy
                      </Text>
                    </Text>
                  }
                  {...form.getInputProps('agreeToTerms', { type: 'checkbox' })}
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Group grow>
                  <Button
                    variant="light"
                    size="lg"
                    onClick={() => router.back()}
                    disabled={processing}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    loading={processing}
                    gradient={{ from: 'violet', to: 'indigo', deg: 135 }}
                    variant="gradient"
                    leftSection={<IconLock size={18} />}
                  >
                    Pay ₹{totalAmount.toLocaleString()}
                  </Button>
                </Group>
              </motion.div>
            </Stack>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="sticky top-6"
          >
            <Paper className="p-5 bg-card border border-border">
              <Text fw={600} size="lg" mb="md">Order Summary</Text>
              
              <Stack gap="md">
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>{plan.name} Plan</Text>
                    <Text size="xs" c="dimmed">Billed {plan.period}ly</Text>
                  </div>
                  <Badge color="violet" variant="light">
                    {plan.period === 'year' ? 'Save 17%' : 'Popular'}
                  </Badge>
                </Group>

                <Divider />

                <List
                  spacing="xs"
                  size="sm"
                  icon={
                    <ThemeIcon size={18} radius="xl" color="violet">
                      <IconCheck size={12} stroke={3} />
                    </ThemeIcon>
                  }
                >
                  {plan.features.map((feature, i) => (
                    <List.Item key={i}>
                      <Text size="sm">{feature}</Text>
                    </List.Item>
                  ))}
                </List>

                <Divider />

                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm">Subtotal</Text>
                    <Text size="sm" fw={500}>₹{plan.price.toLocaleString()}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">GST (18%)</Text>
                    <Text size="sm" c="dimmed">₹{gst.toLocaleString()}</Text>
                  </Group>
                </Stack>

                <Divider />

                <Group justify="space-between">
                  <Text fw={600}>Total Amount</Text>
                  <Text fw={700} size="xl" c="violet">
                    ₹{totalAmount.toLocaleString()}
                  </Text>
                </Group>

                <Text size="xs" c="dimmed" ta="center" mt="md">
                  Your payment information is encrypted and secure
                </Text>
              </Stack>
            </Paper>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
