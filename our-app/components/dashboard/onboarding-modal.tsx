'use client';

import { useState } from 'react';
import {
  Modal,
  Stack,
  TextInput,
  Select,
  Button,
  Text,
  Progress,
  Box,
  Checkbox,
  Group,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconBuilding,
  IconTarget,
  IconSparkles,
  IconCheck,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { 
  useUsersControllerCompleteOnboarding,
  CompleteOnboardingDtoDTO,
  CompleteOnboardingDtoDTOBusinessType,
} from '@businesspro/api-client';

const BUSINESS_TYPES = [
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

interface OnboardingModalProps {
  opened: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ opened, onComplete }: OnboardingModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const totalSteps = 3;

  const completeOnboardingMutation = useUsersControllerCompleteOnboarding({
    mutation: {
      onSuccess: () => {
        notifications.show({
          title: 'Welcome to BusinessPro! 🎉',
          message: 'Your profile is all set up',
          color: 'green',
        });
        setActiveStep(3); // Move to success step
        setTimeout(() => {
          onComplete();
        }, 2000);
      },
      onError: (error: any) => {
        notifications.show({
          title: 'Setup Failed',
          message: error?.messages?.[0] || 'Failed to complete setup',
          color: 'red',
        });
      },
    },
  });

  const form = useForm({
    initialValues: {
      businessName: '',
      businessType: '',
    },
    validate: {
      businessName: (value) => (activeStep === 0 && !value ? 'Business name is required' : null),
      businessType: (value) => (activeStep === 1 && !value ? 'Please select a business type' : null),
    },
  });

  const handleNext = () => {
    const errors = form.validate();
    if (!errors.hasErrors) {
      if (activeStep === 2) {
        // Final step - submit
        if (selectedGoals.length === 0) {
          return; // Don't proceed if no goals selected
        }
        handleSubmit();
      } else {
        setActiveStep((current) => Math.min(current + 1, totalSteps - 1));
      }
    }
  };

  const handleBack = () => {
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = () => {
    const data: CompleteOnboardingDtoDTO = {
      businessName: form.values.businessName,
      businessType: form.values.businessType as CompleteOnboardingDtoDTOBusinessType,
      goals: selectedGoals,
    };

    completeOnboardingMutation.mutate({ data });
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
        return "What's your business name?";
      case 1:
        return 'What type of business do you run?';
      case 2:
        return 'What are your goals?';
      case 3:
        return "You're all set!";
      default:
        return 'Complete Setup';
    }
  };

  const getStepSubtitle = () => {
    switch (activeStep) {
      case 0:
        return 'Help us personalize your experience';
      case 1:
        return "We'll tailor content for your industry";
      case 2:
        return 'Select all that apply (at least one required)';
      case 3:
        return 'Your profile is ready!';
      default:
        return '';
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {}} // Prevent closing - user must complete
      withCloseButton={false}
      size="lg"
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Stack gap="lg" p="md">
        <Box>
          <Title order={2} ta="center" mb="xs">
            {getStepTitle()}
          </Title>
          <Text size="sm" c="dimmed" ta="center">
            {getStepSubtitle()}
          </Text>
        </Box>

        <Progress
          value={progress}
          size="sm"
          radius="xl"
          color="violet"
          animated
        />

        <Box style={{ minHeight: '300px' }}>
          <AnimatePresence mode="wait">
            {/* Step 1: Business Name */}
            {activeStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TextInput
                  label="Business name"
                  placeholder="My Awesome Business"
                  leftSection={<IconBuilding size={18} />}
                  radius="lg"
                  size="lg"
                  {...form.getInputProps('businessName')}
                  autoFocus
                  disabled={completeOnboardingMutation.isPending}
                />
              </motion.div>
            )}

            {/* Step 2: Business Type */}
            {activeStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Select
                  label="Business type"
                  placeholder="Select your business type"
                  data={BUSINESS_TYPES}
                  radius="lg"
                  size="lg"
                  searchable
                  {...form.getInputProps('businessType')}
                  disabled={completeOnboardingMutation.isPending}
                />
              </motion.div>
            )}

            {/* Step 3: Goals */}
            {activeStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Stack gap="sm">
                  {CONTENT_GOALS.map((goal) => (
                    <motion.div
                      key={goal.value}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      <Box
                        onClick={() => !completeOnboardingMutation.isPending && toggleGoal(goal.value)}
                        style={{
                          padding: '1rem',
                          borderRadius: '12px',
                          border: selectedGoals.includes(goal.value)
                            ? '2px solid oklch(0.55 0.25 280)'
                            : '1px solid oklch(0.92 0.01 280)',
                          background: selectedGoals.includes(goal.value)
                            ? 'oklch(0.55 0.25 280 / 0.05)'
                            : 'transparent',
                          cursor: completeOnboardingMutation.isPending ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          opacity: completeOnboardingMutation.isPending ? 0.6 : 1,
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
                            disabled={completeOnboardingMutation.isPending}
                          />
                        </Group>
                      </Box>
                    </motion.div>
                  ))}

                  {selectedGoals.length === 0 && (
                    <Text size="xs" c="red" mt="xs">
                      Please select at least one goal to continue
                    </Text>
                  )}
                </Stack>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {activeStep === 3 && (
              <motion.div
                key="step-3"
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
                    <Title order={3} ta="center">Welcome aboard!</Title>
                    <Text size="sm" c="dimmed" ta="center">
                      Your profile is ready. Let's create something amazing together.
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
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        {activeStep < 3 && (
          <Group grow mt="xl">
            {activeStep > 0 && (
              <Button
                variant="light"
                onClick={handleBack}
                radius="lg"
                size="lg"
                disabled={completeOnboardingMutation.isPending}
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              radius="lg"
              size="lg"
              gradient={{ from: 'violet', to: 'indigo', deg: 135 }}
              variant="gradient"
              style={{ fontWeight: 600 }}
              disabled={
                (activeStep === 2 && selectedGoals.length === 0) ||
                completeOnboardingMutation.isPending
              }
              loading={completeOnboardingMutation.isPending}
              fullWidth={activeStep === 0}
            >
              {activeStep === 2 ? 'Complete Setup' : 'Continue'}
            </Button>
          </Group>
        )}
      </Stack>
    </Modal>
  );
}
