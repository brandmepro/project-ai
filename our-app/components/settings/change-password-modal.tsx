'use client'

import { useState } from 'react'
import { 
  Modal, 
  Text, 
  Stack, 
  PinInput,
  PasswordInput,
  Button,
  Group,
  Box,
  Progress,
  ThemeIcon,
  Alert,
} from '@mantine/core'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  IconCheck, 
  IconX,
  IconShieldCheck,
  IconLock,
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'

interface ChangePasswordModalProps {
  opened: boolean
  onClose: () => void
}

type Step = 'otp' | 'password'

const DUMMY_OTP = '123456'

export function ChangePasswordModal({ opened, onClose }: ChangePasswordModalProps) {
  const [step, setStep] = useState<Step>('otp')
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Password strength calculation
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.length >= 12) strength += 15
    if (/[a-z]/.test(password)) strength += 15
    if (/[A-Z]/.test(password)) strength += 15
    if (/[0-9]/.test(password)) strength += 15
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15
    return Math.min(strength, 100)
  }

  const passwordStrength = calculatePasswordStrength(newPassword)
  
  const getStrengthColor = (strength: number): string => {
    if (strength < 40) return 'red'
    if (strength < 70) return 'orange'
    return 'green'
  }

  const getStrengthLabel = (strength: number): string => {
    if (strength < 40) return 'Weak'
    if (strength < 70) return 'Medium'
    return 'Strong'
  }

  const passwordRequirements = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(newPassword) },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: 'Contains number', met: /[0-9]/.test(newPassword) },
    { label: 'Contains special character', met: /[^a-zA-Z0-9]/.test(newPassword) },
  ]

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError('Please enter a 6-digit code')
      return
    }

    if (otp !== DUMMY_OTP) {
      setOtpError('Invalid verification code')
      notifications.show({
        title: 'Invalid Code',
        message: 'The verification code you entered is incorrect',
        color: 'red',
      })
      return
    }

    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    setLoading(false)
    setOtpError('')
    setStep('password')
    
    notifications.show({
      title: 'Verified! ✓',
      message: 'Now create your new password',
      color: 'green',
    })
  }

  const handleChangePassword = async () => {
    // Validate passwords
    if (newPassword.length < 8) {
      notifications.show({
        title: 'Password Too Short',
        message: 'Password must be at least 8 characters',
        color: 'red',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      notifications.show({
        title: 'Passwords Don\'t Match',
        message: 'Please make sure both passwords are the same',
        color: 'red',
      })
      return
    }

    if (passwordStrength < 40) {
      notifications.show({
        title: 'Password Too Weak',
        message: 'Please choose a stronger password',
        color: 'orange',
      })
      return
    }

    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // TODO: Call actual API to change password
    // await updatePasswordMutation.mutateAsync({ data: { newPassword } })
    
    setLoading(false)
    
    notifications.show({
      title: 'Password Changed Successfully! 🎉',
      message: 'Your password has been updated',
      color: 'green',
      autoClose: 5000,
    })
    
    handleClose()
  }

  const handleClose = () => {
    setStep('otp')
    setOtp('')
    setOtpError('')
    setNewPassword('')
    setConfirmPassword('')
    onClose()
  }

  const handleResendOtp = () => {
    notifications.show({
      title: 'Code Sent! 📧',
      message: `Verification code sent to your email. Use ${DUMMY_OTP} for testing.`,
      color: 'blue',
      autoClose: 5000,
    })
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <ThemeIcon size="lg" variant="light" color="violet">
            <IconShieldCheck size={20} />
          </ThemeIcon>
          <Text fw={600}>Change Password</Text>
        </Group>
      }
      size="md"
      centered
    >
      <AnimatePresence mode="wait">
        {step === 'otp' ? (
          <motion.div
            key="otp-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Stack gap="lg">
              <Alert variant="light" color="blue" icon={<IconShieldCheck size={16} />}>
                <Text size="sm">
                  We've sent a 6-digit verification code to your email.
                  <Text component="span" fw={600}> (Use: 123456 for testing)</Text>
                </Text>
              </Alert>

              <Stack gap="xs" align="center">
                <Text size="sm" fw={500} ta="center">
                  Enter Verification Code
                </Text>
                <PinInput
                  length={6}
                  size="lg"
                  type="number"
                  value={otp}
                  onChange={(value) => {
                    setOtp(value)
                    setOtpError('')
                  }}
                  error={!!otpError}
                  autoFocus
                />
                {otpError && (
                  <Text size="xs" c="red">
                    {otpError}
                  </Text>
                )}
              </Stack>

              <Group justify="center">
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={handleResendOtp}
                >
                  Didn't receive code? Resend
                </Button>
              </Group>

              <Group grow>
                <Button
                  variant="light"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleVerifyOtp}
                  loading={loading}
                  gradient={{ from: 'violet', to: 'indigo', deg: 135 }}
                  variant="gradient"
                >
                  Verify Code
                </Button>
              </Group>
            </Stack>
          </motion.div>
        ) : (
          <motion.div
            key="password-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Stack gap="lg">
              <Alert variant="light" color="green" icon={<IconCheck size={16} />}>
                <Text size="sm">
                  Code verified! Now create your new password.
                </Text>
              </Alert>

              <PasswordInput
                label="New Password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftSection={<IconLock size={16} />}
                size="md"
                autoFocus
              />

              {/* Password Strength Indicator */}
              {newPassword && (
                <Box>
                  <Group justify="space-between" mb={4}>
                    <Text size="xs" fw={500}>
                      Password Strength
                    </Text>
                    <Text size="xs" fw={600} c={getStrengthColor(passwordStrength)}>
                      {getStrengthLabel(passwordStrength)}
                    </Text>
                  </Group>
                  <Progress
                    value={passwordStrength}
                    color={getStrengthColor(passwordStrength)}
                    size="sm"
                    radius="xl"
                    animated
                  />
                  
                  <Stack gap={4} mt="sm">
                    {passwordRequirements.map((req, index) => (
                      <Group key={index} gap={6}>
                        <ThemeIcon
                          size={16}
                          radius="xl"
                          color={req.met ? 'green' : 'gray'}
                          variant={req.met ? 'filled' : 'light'}
                        >
                          {req.met ? (
                            <IconCheck size={10} stroke={3} />
                          ) : (
                            <IconX size={10} stroke={3} />
                          )}
                        </ThemeIcon>
                        <Text 
                          size="xs" 
                          c={req.met ? 'green' : 'dimmed'}
                          fw={req.met ? 500 : 400}
                        >
                          {req.label}
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </Box>
              )}

              <PasswordInput
                label="Confirm Password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftSection={<IconLock size={16} />}
                size="md"
                error={
                  confirmPassword && newPassword !== confirmPassword
                    ? 'Passwords do not match'
                    : undefined
                }
              />

              <Group grow mt="md">
                <Button
                  variant="light"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleChangePassword}
                  loading={loading}
                  disabled={
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !== confirmPassword ||
                    passwordStrength < 40
                  }
                  gradient={{ from: 'violet', to: 'indigo', deg: 135 }}
                  variant="gradient"
                >
                  Change Password
                </Button>
              </Group>
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}
