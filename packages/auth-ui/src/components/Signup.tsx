'use client';

import { useState } from 'react';
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Text,
  Anchor,
  Divider,
  Group,
  Select,
  Box,
  Progress,
  Checkbox,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconMail,
  IconLock,
  IconUser,
  IconBrandGoogle,
  IconBrandFacebook,
  IconBuilding,
  IconTarget,
  IconCheck,
  IconSparkles,
} from '@tabler/icons-react';
import { AuthLayout } from './AuthLayout';
import type { SignupProps, OnboardingData } from '../types';

const DEFAULT_BUSINESS_TYPES = [
  { value: 'cafe', label: '☕ Cafe' },
  { value: 'restaurant', label: '🍽️ Restaurant' },
  { value: 'salon', label: '💇 Salon & Spa' },
  { value: 'gym', label: '💪 Gym & Fitness' },
  { value: 'clinic', label: '🏥 Clinic' },
  { value: 'boutique', label: '👗 Boutique' },
  { value: 'kirana', label: '🛒 Retail Store' },
  { value: 'tea-shop', label: '🍵 Tea Shop' },
];

const CONTENT_GOALS = [
  { value: 'awareness', label: '📢 Brand Awareness', description: 'Build recognition in your community' },
  { value: 'engagement', label: '💬 Customer Engagement', description: 'Connect with your audience' },
  { value: 'promotion', label: '🎁 Promotions & Offers', description: 'Drive sales with special deals' },
  { value: 'festival', label: '🎊 Festival Content', description: 'Celebrate with your customers' },
];

export function Signup({
  onSignup,
  onLoginClick,
  onSocialLogin,
  loading = false,
  businessTypes = DEFAULT_BUSINESS_TYPES,
}: SignupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const totalSteps = 5;

  const form = useForm<OnboardingData>({
    initialValues: {
      email: '',
      password: '',
      name: '',
      businessType: '',
      businessName: '',
      goals: [],
    },
    validate: {
      email: (value, values) => {
        if (activeStep === 0) {
          if (!value) return 'Email is required';
          if (!/^\S+@\S+$/.test(value)) return 'Invalid email address';
        }
        return null;
      },
      password: (value, values) => {
        if (activeStep === 0) {
          if (!value) return 'Password is required';
          if (value.length < 8) return 'At least 8 characters';
          if (!/(?=.*[a-z])/.test(value)) return 'Include lowercase letter';
          if (!/(?=.*[A-Z])/.test(value)) return 'Include uppercase letter';
          if (!/(?=.*\d)/.test(value)) return 'Include a number';
        }
        return null;
      },
      name: (value) => activeStep === 1 && !value ? 'Name is required' : null,
      businessName: (value) => activeStep === 2 && !value ? 'Business name is required' : null,
      businessType: (value) => activeStep === 2 && !value ? 'Please select a business type' : null,
    },
  });

  const handleNext = () => {
    const errors = form.validate();
    if (!errors.hasErrors) {
      // Step 3 (Goals): Require at least 1 goal selection
      if (activeStep === 3 && selectedGoals.length === 0) {
        return; // Don't proceed if no goals selected
      }
      
      // Step 3 (Goals): Call API to create account
      if (activeStep === 3) {
        handleSubmit(form.values);
        return;
      }
      
      setActiveStep((current) => Math.min(current + 1, totalSteps - 1));
    }
  };

  const handleBack = () => {
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = async (values: OnboardingData) => {
    try {
      setIsLoading(true);
      await onSignup({
        ...values,
        goals: selectedGoals,
      });
      // On success, move to final step
      setActiveStep(4);
    } catch (error) {
      console.error('Signup error:', error);
      // Stay on current step if error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'facebook') => {
    if (onSocialLogin) {
      try {
        setIsLoading(true);
        await onSocialLogin(provider);
      } catch (error) {
        console.error('Social signup error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const progress = ((activeStep + 1) / totalSteps) * 100;

  const getStepTitle = () => {
    switch (activeStep) {
      case 0:
        return 'Create your account';
      case 1:
        return "What's your name?";
      case 2:
        return 'Tell us about your business';
      case 3:
        return 'What are your goals?';
      case 4:
        return "You're all set!";
      default:
        return 'Create Account';
    }
  };

  const getStepSubtitle = () => {
    switch (activeStep) {
      case 0:
        return 'Start your AI-powered social media journey';
      case 1:
        return 'Help us personalize your experience';
      case 2:
        return 'We\'ll tailor content for your industry';
      case 3:
        return 'Select all that apply (required)';
      case 4:
        return 'Account created successfully!';
      default:
        return '';
    }
  };

  return (
    <AuthLayout
      title={getStepTitle()}
      subtitle={getStepSubtitle()}
      showLogo={activeStep === 0}
    >
      <Box>
        <Progress
          value={progress}
          size="sm"
          radius="xl"
          mb="xl"
          color="violet"
          animated
        />

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <AnimatePresence mode="wait">
            {/* Step 1: Email & Password */}
            {activeStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Stack gap="md">
                  <TextInput
                    label="Email address"
                    placeholder="your@email.com"
                    leftSection={<IconMail size={18} />}
                    radius="lg"
                    size="md"
                    {...form.getInputProps('email')}
                    disabled={isLoading || loading}
                  />

                  <PasswordInput
                    label="Create password"
                    placeholder="Min. 8 characters"
                    leftSection={<IconLock size={18} />}
                    radius="lg"
                    size="md"
                    {...form.getInputProps('password')}
                    disabled={isLoading || loading}
                  />

                  <Text size="xs" c="dimmed">
                    Must include uppercase, lowercase, and number
                  </Text>

                  {onSocialLogin && (
                    <>
                      <Divider label="or sign up with" labelPosition="center" />

                      <Group grow>
                        <Button
                          variant="light"
                          leftSection={<IconBrandGoogle size={20} />}
                          onClick={() => handleSocialSignup('google')}
                          disabled={isLoading || loading}
                          radius="lg"
                          color="gray"
                        >
                          Google
                        </Button>
                        <Button
                          variant="light"
                          leftSection={<IconBrandFacebook size={20} />}
                          onClick={() => handleSocialSignup('facebook')}
                          disabled={isLoading || loading}
                          radius="lg"
                          color="blue"
                        >
                          Facebook
                        </Button>
                      </Group>
                    </>
                  )}

                  <Button
                    fullWidth
                    size="lg"
                    radius="lg"
                    onClick={handleNext}
                    gradient={{ from: 'violet', to: 'indigo', deg: 135 }}
                    variant="gradient"
                    style={{ fontWeight: 600, height: '48px', marginTop: '0.5rem' }}
                  >
                    Continue
                  </Button>

                  {onLoginClick && (
                    <Text size="sm" ta="center" mt="md">
                      Already have an account?{' '}
                      <Anchor
                        fw={600}
                        onClick={onLoginClick}
                        style={{ color: 'oklch(0.55 0.25 280)' }}
                      >
                        Log in
                      </Anchor>
                    </Text>
                  )}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Text size="xs" ta="center" mt="xl" c="dimmed" style={{ lineHeight: 1.6 }}>
                      Built with ❤️ by <Text component="span" fw={600} c="violet">Riya Tiwari</Text>
                      <br />
                      <Text component="span" size="xs" c="dimmed">Founder & CEO, Business Pro</Text>
                    </Text>
                  </motion.div>
                </Stack>
              </motion.div>
            )}

            {/* Step 2: Name */}
            {activeStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Stack gap="md">
                  <TextInput
                    label="Your name"
                    placeholder="John Doe"
                    leftSection={<IconUser size={18} />}
                    radius="lg"
                    size="lg"
                    {...form.getInputProps('name')}
                    disabled={isLoading || loading}
                    autoFocus
                  />

                  <Group grow mt="xl">
                    <Button
                      variant="light"
                      onClick={handleBack}
                      radius="lg"
                      size="lg"
                      disabled={isLoading || loading}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      radius="lg"
                      size="lg"
                      gradient={{ from: 'violet', to: 'indigo', deg: 135 }}
                      variant="gradient"
                      style={{ fontWeight: 600 }}
                    >
                      Continue
                    </Button>
                  </Group>
                </Stack>
              </motion.div>
            )}

            {/* Step 3: Business Info */}
            {activeStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Stack gap="md">
                  <TextInput
                    label="Business name"
                    placeholder="My Awesome Business"
                    leftSection={<IconBuilding size={18} />}
                    radius="lg"
                    size="md"
                    {...form.getInputProps('businessName')}
                    disabled={isLoading || loading}
                    autoFocus
                  />

                  <Select
                    label="Business type"
                    placeholder="Select your business type"
                    data={businessTypes}
                    radius="lg"
                    size="md"
                    searchable
                    {...form.getInputProps('businessType')}
                    disabled={isLoading || loading}
                  />

                  <Group grow mt="xl">
                    <Button
                      variant="light"
                      onClick={handleBack}
                      radius="lg"
                      size="lg"
                      disabled={isLoading || loading}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      radius="lg"
                      size="lg"
                      gradient={{ from: 'violet', to: 'indigo', deg: 135 }}
                      variant="gradient"
                      style={{ fontWeight: 600 }}
                    >
                      Continue
                    </Button>
                  </Group>
                </Stack>
              </motion.div>
            )}

            {/* Step 4: Goals */}
            {activeStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Stack gap="md">
                  <Stack gap="sm">
                    {CONTENT_GOALS.map((goal) => (
                      <motion.div
                        key={goal.value}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      >
                        <Box
                          onClick={() => toggleGoal(goal.value)}
                          style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            border: selectedGoals.includes(goal.value)
                              ? '2px solid oklch(0.55 0.25 280)'
                              : '1px solid oklch(0.92 0.01 280)',
                            background: selectedGoals.includes(goal.value)
                              ? 'oklch(0.55 0.25 280 / 0.05)'
                              : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Group justify="space-between" wrap="nowrap">
                            <Box style={{ flex: 1 }}>
                              <Text fw={500} size="sm">{goal.label}</Text>
                              <Text size="xs" c="dimmed">{goal.description}</Text>
                            </Box>
                            <Checkbox
                              checked={selectedGoals.includes(goal.value)}
                              onChange={() => {}}
                              readOnly
                              color="violet"
                            />
                          </Group>
                        </Box>
                      </motion.div>
                    ))}
                  </Stack>

                  {selectedGoals.length === 0 && (
                    <Text size="xs" c="red" mt="xs">
                      Please select at least one goal to continue
                    </Text>
                  )}

                  <Group grow mt="xl">
                    <Button
                      variant="light"
                      onClick={handleBack}
                      radius="lg"
                      size="lg"
                      disabled={isLoading || loading}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      radius="lg"
                      size="lg"
                      gradient={{ from: 'violet', to: 'indigo', deg: 135 }}
                      variant="gradient"
                      style={{ fontWeight: 600, paddingLeft: '12px', paddingRight: '12px' }}
                      disabled={selectedGoals.length === 0 || isLoading || loading}
                      loading={isLoading || loading}
                    >
                      Create Account
                    </Button>
                  </Group>
                </Stack>
              </motion.div>
            )}

            {/* Step 5: Welcome / Confirmation */}
            {activeStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Stack gap="xl" align="center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  >
                    <Box
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, oklch(0.55 0.25 280) 0%, oklch(0.65 0.2 280) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconSparkles size={40} stroke={2} color="white" />
                    </Box>
                  </motion.div>

                  <Stack gap="xs" align="center">
                    <Title order={3} ta="center">Welcome aboard, {form.values.name}!</Title>
                    <Text size="sm" c="dimmed" ta="center">
                      Your account is ready. Let's create something amazing together.
                    </Text>
                  </Stack>

                  <Stack gap="xs" style={{ width: '100%' }}>
                    <Group gap="xs">
                      <IconCheck size={20} color="oklch(0.55 0.25 280)" />
                      <Text size="sm">AI-powered content generation</Text>
                    </Group>
                    <Group gap="xs">
                      <IconCheck size={20} color="oklch(0.55 0.25 280)" />
                      <Text size="sm">Smart scheduling & automation</Text>
                    </Group>
                    <Group gap="xs">
                      <IconCheck size={20} color="oklch(0.55 0.25 280)" />
                      <Text size="sm">Analytics & insights</Text>
                    </Group>
                  </Stack>

                  <Button
                    fullWidth
                    size="lg"
                    radius="lg"
                    onClick={() => window.location.href = '/dashboard'}
                    gradient={{ from: 'violet', to: 'indigo', deg: 135 }}
                    variant="gradient"
                    style={{ fontWeight: 600, height: '56px', marginTop: '1rem' }}
                  >
                    Go to Dashboard
                  </Button>
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Box>
    </AuthLayout>
  );
}
