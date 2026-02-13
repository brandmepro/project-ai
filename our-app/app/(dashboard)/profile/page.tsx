'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Text, 
  Stack, 
  Paper,
  TextInput,
  Textarea,
  Select,
  Switch,
  Button,
  Group,
  Avatar,
  Box,
  Divider,
  Badge,
  SimpleGrid,
  Loader,
  Center,
} from '@mantine/core'
import { 
  IconBuilding,
  IconBell,
  IconPalette,
  IconLanguage,
  IconShield,
  IconUpload,
  IconCreditCard,
  IconCalendar,
  IconSettings,
  IconChevronRight,
  IconLogout,
  IconHelp,
  IconSun,
  IconMoon,
  IconPencil,
} from '@tabler/icons-react'
import { useAppStore } from '@/lib/store'
import { useMantineColorScheme } from '@mantine/core'
import {
  useUsersControllerGetProfile,
  useUsersControllerUpdateBusinessProfile,
  useUsersControllerGetPreferences,
  useUsersControllerUpdatePreferences,
  useUsersControllerGetNotifications,
  useUsersControllerUpdateNotifications,
  useAuthControllerLogout,
} from '@businesspro/api-client'
import { useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { clearAuthTokens } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { ChangePasswordModal } from '@/components/settings/change-password-modal'

const quickLinks = [
  { href: '/calendar', label: 'Calendar', icon: IconCalendar, description: 'View your content schedule' },
  { href: '/pricing', label: 'Subscription & Plans', icon: IconCreditCard, description: 'Manage your subscription' },
  { href: '/settings', label: 'Settings', icon: IconSettings, description: 'App preferences & security' },
]

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { businessName, setBusinessName, darkMode, setDarkMode } = useAppStore()
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  
  const isDark = colorScheme === 'dark'
  
  // Modal state
  const [passwordModalOpened, setPasswordModalOpened] = useState(false)
  const [isEditingBusiness, setIsEditingBusiness] = useState(false)
  
  // Fetch data
  const { data: profile, isLoading: profileLoading } = useUsersControllerGetProfile()
  const { data: preferences, isLoading: preferencesLoading } = useUsersControllerGetPreferences()
  const { data: notificationsResponse, isLoading: notificationsLoading } = useUsersControllerGetNotifications()
  
  // Mutations
  const updateBusinessMutation = useUsersControllerUpdateBusinessProfile()
  const updatePreferencesMutation = useUsersControllerUpdatePreferences()
  const updateNotificationsMutation = useUsersControllerUpdateNotifications()
  const logoutMutation = useAuthControllerLogout()
  
  // Local state for forms
  const [businessData, setBusinessData] = useState({
    businessName: '',
    businessType: 'cafe',
    businessDescription: '',
  })
  
  const [preferencesData, setPreferencesData] = useState({
    language: 'english',
    tone: 'friendly',
    autoSave: true,
  })
  
  const [notificationsData, setNotificationsData] = useState({
    push: true,
    email: true,
    contentReady: true,
    weeklyReport: true,
    aiSuggestions: true,
  })
  
  // Update local state when data loads
  useEffect(() => {
    if (profile) {
      const profileData = profile as any
      setBusinessData({
        businessName: profileData.businessName || profileData.name || profileData.email?.split('@')[0] || '',
        businessType: profileData.businessType || 'cafe',
        businessDescription: profileData.businessDescription || '',
      })
    }
  }, [profile])
  
  useEffect(() => {
    if (preferences) {
      const prefsData = preferences as any
      setPreferencesData({
        language: prefsData.language || 'english',
        tone: prefsData.tone || 'friendly',
        autoSave: prefsData.autoSave !== undefined ? prefsData.autoSave : true,
      })
    }
  }, [preferences])
  
  useEffect(() => {
    if (notificationsResponse) {
      const notifData = notificationsResponse as any
      setNotificationsData({
        push: notifData.push !== undefined ? notifData.push : true,
        email: notifData.email !== undefined ? notifData.email : true,
        contentReady: notifData.contentReady !== undefined ? notifData.contentReady : true,
        weeklyReport: notifData.weeklyReport !== undefined ? notifData.weeklyReport : true,
        aiSuggestions: notifData.aiSuggestions !== undefined ? notifData.aiSuggestions : true,
      })
    }
  }, [notificationsResponse])
  
  const isLoading = profileLoading || preferencesLoading || notificationsLoading
  
  const handleThemeToggle = () => {
    const newScheme = isDark ? 'light' : 'dark'
    setColorScheme(newScheme)
    setDarkMode(!isDark)
    
    // Also toggle the class on html element for Tailwind
    if (newScheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  const handleSaveBusinessProfile = async () => {
    try {
      await updateBusinessMutation.mutateAsync({
        data: {
          businessName: businessData.businessName,
          businessType: businessData.businessType as any,
          businessDescription: businessData.businessDescription,
        },
      })
      queryClient.invalidateQueries({ queryKey: ['usersControllerGetProfile'] })
      setIsEditingBusiness(false)
    } catch (error) {
      console.error('Failed to update business profile:', error)
    }
  }
  
  const handleUpdatePreference = async (field: string, value: any) => {
    try {
      const updated = { ...preferencesData, [field]: value }
      setPreferencesData(updated)
      await updatePreferencesMutation.mutateAsync({ 
        data: {
          language: updated.language as any,
          tone: updated.tone as any,
          autoSave: updated.autoSave,
        }
      })
      queryClient.invalidateQueries({ queryKey: ['usersControllerGetPreferences'] })
    } catch (error) {
      console.error('Failed to update preference:', error)
    }
  }
  
  const handleUpdateNotifications = async (field: string, value: boolean) => {
    try {
      const updated = { ...notificationsData, [field]: value }
      setNotificationsData(updated)
      await updateNotificationsMutation.mutateAsync({ data: updated })
      queryClient.invalidateQueries({ queryKey: ['usersControllerGetNotifications'] })
    } catch (error) {
      console.error('Failed to update notifications:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      clearAuthTokens()
      notifications.show({
        title: 'Logged out successfully',
        message: 'You have been logged out. See you soon! 👋',
        color: 'green',
      })
      router.push('/login')
    } catch (error) {
      clearAuthTokens()
      notifications.show({
        title: 'Logged out',
        message: 'You have been logged out.',
        color: 'blue',
      })
      router.push('/login')
    }
  }
  
  if (isLoading) {
    return (
      <Center h="50vh">
        <Loader size="lg" />
      </Center>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Stack gap={4} mb="xl">
          <Text size="xl" fw={700} className="text-foreground">
            Profile
          </Text>
          <Text size="sm" c="dimmed">
            Manage your account, preferences and subscription
          </Text>
        </Stack>
      </motion.div>

      <Stack gap="lg">
        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Paper className="p-5 bg-card border border-border" withBorder={false}>
            <Group gap="lg" align="center">
              <Avatar size={72} radius="lg" color="violet" src={(profile as any)?.avatarUrl}>
                {businessData.businessName?.charAt(0) || 'B'}
              </Avatar>
              <Stack gap={4} className="flex-1">
                <Text fw={600} size="lg" className="text-foreground">
                  {businessData.businessName || (profile as any)?.name || 'Business'}
                </Text>
                <Text size="sm" c="dimmed">
                  {(profile as any)?.email || ''}
                </Text>
                <Badge size="sm" variant="light" color="violet">
                  {(profile as any)?.subscriptionPlan === 'free' ? 'Free Plan' : 'Starter Plan'}
                </Badge>
              </Stack>
              <Button
                variant="light"
                color="violet"
                size="sm"
                leftSection={<IconUpload size={14} />}
              >
                Edit
              </Button>
            </Group>
          </Paper>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Paper className="bg-card border border-border overflow-hidden" withBorder={false}>
            {quickLinks.map((link, index) => {
              const Icon = link.icon
              return (
                <Link key={link.href} href={link.href}>
                  <Box 
                    className={`
                      flex items-center justify-between p-4 transition-colors hover:bg-secondary/50
                      ${index !== quickLinks.length - 1 ? 'border-b border-border' : ''}
                    `}
                  >
                    <Group gap="md">
                      <Box className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon size={20} className="text-primary" />
                      </Box>
                      <Stack gap={0}>
                        <Text size="sm" fw={500} className="text-foreground">
                          {link.label}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {link.description}
                        </Text>
                      </Stack>
                    </Group>
                    <IconChevronRight size={18} className="text-muted-foreground" />
                  </Box>
                </Link>
              )
            })}
          </Paper>
        </motion.div>

        {/* Business Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Paper className="p-5 bg-card border border-border" withBorder={false}>
            <Group gap="xs" mb="lg" justify="space-between">
              <Group gap="xs">
                <IconBuilding size={20} className="text-primary" />
                <Text fw={600} size="lg" className="text-foreground">
                  Business Profile
                </Text>
              </Group>
              {!isEditingBusiness && (
                <Button
                  variant="subtle"
                  size="xs"
                  color="violet"
                  leftSection={<IconPencil size={14} />}
                  onClick={() => setIsEditingBusiness(true)}
                >
                  Edit
                </Button>
              )}
            </Group>
            
            <Stack gap="md">
              <TextInput
                label="Business Name"
                value={businessData.businessName}
                onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
                readOnly={!isEditingBusiness}
                disabled={!isEditingBusiness}
                styles={{
                  input: {
                    opacity: isEditingBusiness ? 1 : 1,
                    color: isEditingBusiness ? 'inherit' : 'var(--mantine-color-text)',
                    cursor: isEditingBusiness ? 'text' : 'default',
                  }
                }}
              />
              <Select
                label="Business Type"
                data={[
                  { value: 'cafe', label: 'Cafe / Coffee Shop' },
                  { value: 'kirana', label: 'Kirana / General Store' },
                  { value: 'salon', label: 'Salon / Beauty Parlor' },
                  { value: 'gym', label: 'Gym / Fitness Center' },
                  { value: 'clinic', label: 'Clinic / Healthcare' },
                  { value: 'restaurant', label: 'Restaurant' },
                  { value: 'boutique', label: 'Boutique' },
                  { value: 'tea-shop', label: 'Tea Shop' },
                ]}
                value={businessData.businessType}
                onChange={(value) => setBusinessData({ ...businessData, businessType: value || 'cafe' })}
                readOnly={!isEditingBusiness}
                disabled={!isEditingBusiness}
                styles={{
                  input: {
                    opacity: isEditingBusiness ? 1 : 1,
                    color: isEditingBusiness ? 'inherit' : 'var(--mantine-color-text)',
                    cursor: isEditingBusiness ? 'pointer' : 'default',
                  }
                }}
              />
              <Textarea
                label="Business Description"
                placeholder="Tell us about your business..."
                minRows={3}
                value={businessData.businessDescription}
                onChange={(e) => setBusinessData({ ...businessData, businessDescription: e.target.value })}
                readOnly={!isEditingBusiness}
                disabled={!isEditingBusiness}
                styles={{
                  input: {
                    opacity: isEditingBusiness ? 1 : 1,
                    color: isEditingBusiness ? 'inherit' : 'var(--mantine-color-text)',
                    cursor: isEditingBusiness ? 'text' : 'default',
                  }
                }}
              />
            </Stack>

            {isEditingBusiness && (
              <Group justify="flex-end" mt="lg">
                <Button 
                  variant="light" 
                  color="gray"
                  onClick={() => {
                    if (profile) {
                      const profileData = profile as any
                      setBusinessData({
                        businessName: profileData.businessName || profileData.name || '',
                        businessType: profileData.businessType || 'cafe',
                        businessDescription: profileData.businessDescription || '',
                      })
                    }
                    setIsEditingBusiness(false)
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="filled" 
                  color="violet"
                  loading={updateBusinessMutation.isPending}
                  onClick={handleSaveBusinessProfile}
                >
                  Save Changes
                </Button>
              </Group>
            )}
          </Paper>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <Paper className="p-5 bg-card border border-border" withBorder={false}>
            <Group gap="xs" mb="lg">
              <IconPalette size={20} className="text-primary" />
              <Text fw={600} size="lg" className="text-foreground">
                Preferences
              </Text>
            </Group>
            
            <Stack gap="md">
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Select
                  label="Default Language"
                  leftSection={<IconLanguage size={16} />}
                  data={[
                    { value: 'english', label: 'English' },
                    { value: 'hinglish', label: 'Hinglish' },
                    { value: 'hindi', label: 'Hindi' },
                  ]}
                  value={preferencesData.language}
                  onChange={(value) => handleUpdatePreference('language', value || 'english')}
                />
                <Select
                  label="Default Tone"
                  data={[
                    { value: 'friendly', label: 'Friendly' },
                    { value: 'professional', label: 'Professional' },
                    { value: 'fun', label: 'Fun' },
                    { value: 'minimal', label: 'Minimal' },
                  ]}
                  value={preferencesData.tone}
                  onChange={(value) => handleUpdatePreference('tone', value || 'friendly')}
                />
              </SimpleGrid>

              <Divider my="sm" />

              {/* Beautiful Dark Mode Toggle */}
              <Box className="p-4 rounded-xl bg-secondary/30">
                <Group justify="space-between" align="center">
                  <Group gap="md">
                    <Box 
                      className={`
                        flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300
                        ${isDark 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-amber-100 text-amber-500'
                        }
                      `}
                    >
                      {isDark ? <IconMoon size={24} /> : <IconSun size={24} />}
                    </Box>
                    <Stack gap={2}>
                      <Text size="sm" fw={600} className="text-foreground">
                        {isDark ? 'Dark Mode' : 'Light Mode'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {isDark ? 'Easy on the eyes at night' : 'Bright and clear for daytime'}
                      </Text>
                    </Stack>
                  </Group>
                  
                  {/* Custom Toggle Button */}
                  <button
                    onClick={handleThemeToggle}
                    className={`
                      relative w-16 h-8 rounded-full transition-all duration-300 ease-in-out
                      ${isDark 
                        ? 'bg-primary' 
                        : 'bg-muted'
                      }
                    `}
                  >
                    <motion.div
                      className={`
                        absolute top-1 w-6 h-6 rounded-full shadow-md flex items-center justify-center
                        ${isDark ? 'bg-card' : 'bg-card'}
                      `}
                      animate={{ 
                        x: isDark ? 34 : 4,
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      {isDark 
                        ? <IconMoon size={14} className="text-primary" />
                        : <IconSun size={14} className="text-amber-500" />
                      }
                    </motion.div>
                  </button>
                </Group>
              </Box>

              <Group justify="space-between">
                <Stack gap={0}>
                  <Text size="sm" fw={500} className="text-foreground">
                    Auto-save drafts
                  </Text>
                  <Text size="xs" c="dimmed">
                    Automatically save content as you create
                  </Text>
                </Stack>
                <Switch 
                  color="violet" 
                  checked={preferencesData.autoSave}
                  onChange={(e) => handleUpdatePreference('autoSave', e.target.checked)}
                />
              </Group>
            </Stack>
          </Paper>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Paper className="p-5 bg-card border border-border" withBorder={false}>
            <Group gap="xs" mb="lg">
              <IconBell size={20} className="text-primary" />
              <Text fw={600} size="lg" className="text-foreground">
                Notifications
              </Text>
            </Group>
            
            <Stack gap="md">
              <Group justify="space-between">
                <Stack gap={0}>
                  <Text size="sm" fw={500} className="text-foreground">
                    Push Notifications
                  </Text>
                  <Text size="xs" c="dimmed">
                    Receive push notifications in browser
                  </Text>
                </Stack>
                <Switch 
                  color="violet" 
                  checked={notificationsData.push}
                  onChange={(e) => handleUpdateNotifications('push', e.target.checked)}
                />
              </Group>

              <Group justify="space-between">
                <Stack gap={0}>
                  <Text size="sm" fw={500} className="text-foreground">
                    Email Notifications
                  </Text>
                  <Text size="xs" c="dimmed">
                    Receive important updates via email
                  </Text>
                </Stack>
                <Switch 
                  color="violet" 
                  checked={notificationsData.email}
                  onChange={(e) => handleUpdateNotifications('email', e.target.checked)}
                />
              </Group>

              <Group justify="space-between">
                <Stack gap={0}>
                  <Text size="sm" fw={500} className="text-foreground">
                    Post reminders
                  </Text>
                  <Text size="xs" c="dimmed">
                    Get reminded before scheduled posts
                  </Text>
                </Stack>
                <Switch 
                  color="violet" 
                  checked={notificationsData.contentReady}
                  onChange={(e) => handleUpdateNotifications('contentReady', e.target.checked)}
                />
              </Group>

              <Group justify="space-between">
                <Stack gap={0}>
                  <Text size="sm" fw={500} className="text-foreground">
                    Weekly analytics report
                  </Text>
                  <Text size="xs" c="dimmed">
                    Receive performance summaries via email
                  </Text>
                </Stack>
                <Switch 
                  color="violet" 
                  checked={notificationsData.weeklyReport}
                  onChange={(e) => handleUpdateNotifications('weeklyReport', e.target.checked)}
                />
              </Group>

              <Group justify="space-between">
                <Stack gap={0}>
                  <Text size="sm" fw={500} className="text-foreground">
                    Marketing updates
                  </Text>
                  <Text size="xs" c="dimmed">
                    News about new features and tips
                  </Text>
                </Stack>
                <Switch 
                  color="violet" 
                  checked={notificationsData.aiSuggestions}
                  onChange={(e) => handleUpdateNotifications('aiSuggestions', e.target.checked)}
                />
              </Group>
            </Stack>
          </Paper>
        </motion.div>

        {/* Security & Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
        >
          <Paper className="p-5 bg-card border border-border" withBorder={false}>
            <Group gap="xs" mb="lg">
              <IconShield size={20} className="text-primary" />
              <Text fw={600} size="lg" className="text-foreground">
                Security & Account
              </Text>
            </Group>
            
            <Stack gap="md">
              <Group justify="space-between">
                <Stack gap={0}>
                  <Group gap="xs">
                    <Text size="sm" fw={500} className="text-foreground">
                      Two-factor authentication
                    </Text>
                    <Badge size="xs" variant="light" color="green">
                      Enabled
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed">
                    Add an extra layer of security
                  </Text>
                </Stack>
                <Button variant="subtle" size="xs" color="violet">
                  Manage
                </Button>
              </Group>

              <Group justify="space-between">
                <Stack gap={0}>
                  <Text size="sm" fw={500} className="text-foreground">
                    Change password
                  </Text>
                  <Text size="xs" c="dimmed">
                    Update your account password
                  </Text>
                </Stack>
                <Button 
                  variant="subtle" 
                  size="xs" 
                  color="violet"
                  onClick={() => setPasswordModalOpened(true)}
                >
                  Update
                </Button>
              </Group>

              <Divider my="sm" />

              <Group justify="space-between">
                <Stack gap={0}>
                  <Group gap="xs">
                    <IconHelp size={16} className="text-muted-foreground" />
                    <Text size="sm" fw={500} className="text-foreground">
                      Help & Support
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed">
                    Get help with your account
                  </Text>
                </Stack>
                <Button variant="subtle" size="xs" color="violet">
                  Contact
                </Button>
              </Group>

              <Divider my="sm" />

              <Group justify="space-between">
                <Stack gap={0}>
                  <Group gap="xs">
                    <IconLogout size={16} className="text-red-500" />
                    <Text size="sm" fw={500} c="red">
                      Sign out
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed">
                    Sign out of your account
                  </Text>
                </Stack>
                <Button 
                  variant="subtle" 
                  size="xs" 
                  color="red"
                  loading={logoutMutation.isPending}
                  onClick={handleLogout}
                >
                  Sign out
                </Button>
              </Group>

              <Divider my="sm" />

              <Group justify="space-between">
                <Stack gap={0}>
                  <Text size="sm" fw={500} c="red">
                    Delete account
                  </Text>
                  <Text size="xs" c="dimmed">
                    Permanently delete your account and data
                  </Text>
                </Stack>
                <Button variant="subtle" size="xs" color="red">
                  Delete
                </Button>
              </Group>
            </Stack>
          </Paper>
        </motion.div>
      </Stack>

      {/* Change Password Modal */}
      <ChangePasswordModal
        opened={passwordModalOpened}
        onClose={() => setPasswordModalOpened(false)}
      />
    </div>
  )
}
