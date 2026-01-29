'use client'

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
  IconCreditCard,
  IconCalendar,
  IconSettings,
  IconChevronRight,
  IconLogout,
  IconHelp,
  IconSun,
  IconMoon,
} from '@tabler/icons-react'
import { useAppStore } from '@/lib/store'
import { useMantineColorScheme } from '@mantine/core'

const platformConnections = [
  { name: 'Instagram', icon: IconBrandInstagram, connected: true, color: 'pink' },
  { name: 'Facebook', icon: IconBrandFacebook, connected: true, color: 'blue' },
  { name: 'WhatsApp Business', icon: IconBrandWhatsapp, connected: false, color: 'green' },
  { name: 'Google Business', icon: IconBuildingStore, connected: false, color: 'orange' },
]

const quickLinks = [
  { href: '/calendar', label: 'Calendar', icon: IconCalendar, description: 'View your content schedule' },
  { href: '/pricing', label: 'Subscription & Plans', icon: IconCreditCard, description: 'Manage your subscription' },
  { href: '/settings', label: 'Settings', icon: IconSettings, description: 'App preferences & security' },
]

export default function ProfilePage() {
  const { businessName, setBusinessName, darkMode, setDarkMode } = useAppStore()
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  
  const isDark = colorScheme === 'dark'
  
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
              <Avatar size={72} radius="lg" color="violet">
                {businessName.charAt(0)}
              </Avatar>
              <Stack gap={4} className="flex-1">
                <Text fw={600} size="lg" className="text-foreground">
                  {businessName}
                </Text>
                <Text size="sm" c="dimmed">
                  cafe@example.com
                </Text>
                <Badge size="sm" variant="light" color="violet">
                  Starter Plan
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
            <Group gap="xs" mb="lg">
              <IconBuilding size={20} className="text-primary" />
              <Text fw={600} size="lg" className="text-foreground">
                Business Profile
              </Text>
            </Group>
            
            <Stack gap="md">
              <TextInput
                label="Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
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
                ]}
                defaultValue="cafe"
              />
              <Textarea
                label="Business Description"
                placeholder="Tell us about your business..."
                minRows={3}
                defaultValue="A cozy cafe serving the finest coffee and delicious snacks in the neighborhood."
              />
            </Stack>

            <Group justify="flex-end" mt="lg">
              <Button variant="filled" color="violet">
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
              {platformConnections.map((platform) => {
                const Icon = platform.icon
                return (
                  <Box 
                    key={platform.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <Group gap="sm">
                      <Box 
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `var(--mantine-color-${platform.color}-1)` }}
                      >
                        <Icon size={20} style={{ color: `var(--mantine-color-${platform.color}-6)` }} />
                      </Box>
                      <Stack gap={0}>
                        <Text size="sm" fw={500} className="text-foreground">
                          {platform.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {platform.connected ? 'Connected' : 'Not connected'}
                        </Text>
                      </Stack>
                    </Group>
                    
                    <Button 
                      variant={platform.connected ? 'subtle' : 'light'}
                      color={platform.connected ? 'red' : 'violet'}
                      size="xs"
                    >
                      {platform.connected ? 'Disconnect' : 'Connect'}
                    </Button>
                  </Box>
                )
              })}
            </Stack>
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
                  defaultValue="english"
                />
                <Select
                  label="Default Tone"
                  data={[
                    { value: 'friendly', label: 'Friendly' },
                    { value: 'professional', label: 'Professional' },
                    { value: 'fun', label: 'Fun' },
                    { value: 'minimal', label: 'Minimal' },
                  ]}
                  defaultValue="friendly"
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
                <Switch color="violet" defaultChecked />
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
                    Post reminders
                  </Text>
                  <Text size="xs" c="dimmed">
                    Get reminded before scheduled posts
                  </Text>
                </Stack>
                <Switch color="violet" defaultChecked />
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
                <Switch color="violet" defaultChecked />
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
                <Button variant="subtle" size="xs" color="violet">
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
                <Button variant="subtle" size="xs" color="red">
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
    </div>
  )
}
