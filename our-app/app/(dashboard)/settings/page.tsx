'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandWhatsapp,
  IconBuildingStore,
  IconBell,
  IconPalette,
  IconLanguage,
  IconShield,
  IconUpload,
} from '@tabler/icons-react'
import {
  useUsersControllerGetProfile,
  useUsersControllerUpdateBusinessProfile,
  useUsersControllerGetPreferences,
  useUsersControllerUpdatePreferences,
  useUsersControllerGetNotifications,
  useUsersControllerUpdateNotifications,
  usePlatformsControllerGetAllConnections,
  useAuthControllerLogout,
} from '@businesspro/api-client'
import { useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { clearAuthTokens } from '@/lib/auth'
import { useRouter } from 'next/navigation'

const platformIcons = {
  instagram: IconBrandInstagram,
  facebook: IconBrandFacebook,
  whatsapp: IconBrandWhatsapp,
  'google-business': IconBuildingStore,
}

const platformColors = {
  instagram: 'pink',
  facebook: 'blue',
  whatsapp: 'green',
  'google-business': 'orange',
}

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const router = useRouter()
  
  // Fetch data
  const { data: profile, isLoading: profileLoading } = useUsersControllerGetProfile()
  const { data: preferences, isLoading: preferencesLoading } = useUsersControllerGetPreferences()
  const { data: notifications, isLoading: notificationsLoading } = useUsersControllerGetNotifications()
  const { data: platforms, isLoading: platformsLoading } = usePlatformsControllerGetAllConnections()
  
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
    darkMode: false,
    autoSave: true,
  })
  
  const [notificationsData, setNotificationsData] = useState({
    email: true,
    push: true,
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
        darkMode: prefsData.darkMode || false,
        autoSave: prefsData.autoSave !== undefined ? prefsData.autoSave : true,
      })
    }
  }, [preferences])
  
  useEffect(() => {
    if (notifications) {
      const notifData = notifications as any
      setNotificationsData({
        email: notifData.email !== undefined ? notifData.email : true,
        push: notifData.push !== undefined ? notifData.push : true,
        contentReady: notifData.contentReady !== undefined ? notifData.contentReady : true,
        weeklyReport: notifData.weeklyReport !== undefined ? notifData.weeklyReport : true,
        aiSuggestions: notifData.aiSuggestions !== undefined ? notifData.aiSuggestions : true,
      })
    }
  }, [notifications])
  
  const isLoading = profileLoading || preferencesLoading || notificationsLoading || platformsLoading
  
  if (isLoading) {
    return (
      <Center h="50vh">
        <Loader size="lg" />
      </Center>
    )
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
    } catch (error) {
      console.error('Failed to update business profile:', error)
    }
  }
  
  const handleSavePreferences = async () => {
    try {
      await updatePreferencesMutation.mutateAsync({
        data: {
          language: preferencesData.language as any,
          tone: preferencesData.tone as any,
          darkMode: preferencesData.darkMode,
          autoSave: preferencesData.autoSave,
        },
      })
      queryClient.invalidateQueries({ queryKey: ['usersControllerGetPreferences'] })
    } catch (error) {
      console.error('Failed to update preferences:', error)
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
      // Call logout API to invalidate tokens on backend
      await logoutMutation.mutateAsync()
      
      // Clear local tokens
      clearAuthTokens()
      
      // Show success notification
      notifications.show({
        title: 'Logged out successfully',
        message: 'You have been logged out. See you soon! 👋',
        color: 'green',
      })
      
      // Redirect to login
      router.push('/login')
    } catch (error) {
      // Even if API call fails, still clear tokens and redirect
      clearAuthTokens()
      notifications.show({
        title: 'Logged out',
        message: 'You have been logged out.',
        color: 'blue',
      })
      router.push('/login')
    }
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
            Settings
          </Text>
          <Text size="sm" c="dimmed">
            Manage your account and preferences
          </Text>
        </Stack>
      </motion.div>

      <Stack gap="lg">
        {/* Business Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Paper className="p-5 bg-card border border-border" withBorder={false}>
            <Group gap="xs" mb="lg">
              <IconBuilding size={20} className="text-primary" />
              <Text fw={600} size="lg" className="text-foreground">
                Business Profile
              </Text>
            </Group>
            
            <Group gap="lg" align="flex-start" mb="lg">
              <Box className="relative">
                <Avatar size={80} radius="lg" color="violet" src={(profile as any)?.avatarUrl}>
                  {businessData.businessName?.charAt(0) || 'B'}
                </Avatar>
                <Button
                  size="xs"
                  variant="filled"
                  color="violet"
                  className="absolute -bottom-2 -right-2"
                  leftSection={<IconUpload size={12} />}
                >
                  Upload
                </Button>
              </Box>
              
              <Stack gap="sm" className="flex-1">
                <TextInput
                  label="Business Name"
                  value={businessData.businessName}
                  onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
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
                />
              </Stack>
            </Group>

            <Textarea
              label="Business Description"
              placeholder="Tell us about your business..."
              minRows={3}
              value={businessData.businessDescription}
              onChange={(e) => setBusinessData({ ...businessData, businessDescription: e.target.value })}
            />

            <Group justify="flex-end" mt="lg">
              <Button 
                variant="light" 
                color="gray"
                onClick={() => {
                  if (profile) {
                    setBusinessData({
                      businessName: (profile as any).businessName || '',
                      businessType: (profile as any).businessType || 'cafe',
                      businessDescription: (profile as any).businessDescription || '',
                    })
                  }
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
          </Paper>
        </motion.div>

        {/* Connected Platforms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Paper className="p-5 bg-card border border-border" withBorder={false}>
            <Group gap="xs" mb="lg">
              <IconBrandInstagram size={20} className="text-primary" />
              <Text fw={600} size="lg" className="text-foreground">
                Connected Platforms
              </Text>
            </Group>
            
            <Stack gap="sm">
              {platforms ? (platforms as any[]).map((platform: any) => {
                const Icon = platformIcons[platform.platform as keyof typeof platformIcons]
                const color = platformColors[platform.platform as keyof typeof platformColors]
                return (
                  <Box 
                    key={platform.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <Group gap="sm">
                      <Box 
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `var(--mantine-color-${color}-1)` }}
                      >
                        <Icon size={20} style={{ color: `var(--mantine-color-${color}-6)` }} />
                      </Box>
                      <Stack gap={0}>
                        <Text size="sm" fw={500} className="text-foreground" tt="capitalize">
                          {platform.platform.replace('-', ' ')}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {platform.isConnected ? 'Connected' : 'Not connected'}
                        </Text>
                      </Stack>
                    </Group>
                    
                    <Button 
                      variant={platform.isConnected ? 'subtle' : 'light'}
                      color={platform.isConnected ? 'red' : 'violet'}
                      size="xs"
                    >
                      {platform.isConnected ? 'Disconnect' : 'Connect'}
                    </Button>
                  </Box>
                )
              }) : null}
            </Stack>
          </Paper>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
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
                  onChange={(value) => setPreferencesData({ ...preferencesData, language: value || 'english' })}
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
                  onChange={(value) => setPreferencesData({ ...preferencesData, tone: value || 'friendly' })}
                />
              </SimpleGrid>

              <Divider my="sm" />

              <Group justify="space-between">
                <Stack gap={0}>
                  <Text size="sm" fw={500} className="text-foreground">
                    Dark Mode
                  </Text>
                  <Text size="xs" c="dimmed">
                    Switch between light and dark themes
                  </Text>
                </Stack>
                <Switch 
                  color="violet" 
                  checked={preferencesData.darkMode}
                  onChange={(e) => setPreferencesData({ ...preferencesData, darkMode: e.target.checked })}
                />
              </Group>

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
                  onChange={(e) => setPreferencesData({ ...preferencesData, autoSave: e.target.checked })}
                />
              </Group>
              
              <Group justify="flex-end" mt="md">
                <Button 
                  variant="filled" 
                  color="violet"
                  size="sm"
                  loading={updatePreferencesMutation.isPending}
                  onClick={handleSavePreferences}
                >
                  Save Preferences
                </Button>
              </Group>
            </Stack>
          </Paper>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
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

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Paper className="p-5 bg-card border border-border" withBorder={false}>
            <Group gap="xs" mb="lg">
              <IconShield size={20} className="text-primary" />
              <Text fw={600} size="lg" className="text-foreground">
                Security
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
                <Button variant="subtle" size="xs" color="violet">
                  Update
                </Button>
              </Group>

              <Divider my="sm" />

              <Group justify="space-between">
                <Stack gap={0}>
                  <Text size="sm" fw={500} className="text-foreground">
                    Sign out
                  </Text>
                  <Text size="xs" c="dimmed">
                    Sign out of your account
                  </Text>
                </Stack>
                <Button 
                  variant="light" 
                  size="xs" 
                  color="violet"
                  loading={logoutMutation.isPending}
                  onClick={handleLogout}
                >
                  Sign Out
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
    </div>
  )
}
