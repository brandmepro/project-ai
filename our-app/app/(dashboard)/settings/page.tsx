'use client'

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
import { useAppStore } from '@/lib/store'

const platformConnections = [
  { name: 'Instagram', icon: IconBrandInstagram, connected: true, color: 'pink' },
  { name: 'Facebook', icon: IconBrandFacebook, connected: true, color: 'blue' },
  { name: 'WhatsApp Business', icon: IconBrandWhatsapp, connected: false, color: 'green' },
  { name: 'Google Business', icon: IconBuildingStore, connected: false, color: 'orange' },
]

export default function SettingsPage() {
  const { businessName, setBusinessName } = useAppStore()

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
                <Avatar size={80} radius="lg" color="violet">
                  {businessName.charAt(0)}
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
              </Stack>
            </Group>

            <Textarea
              label="Business Description"
              placeholder="Tell us about your business..."
              minRows={3}
              defaultValue="A cozy cafe serving the finest coffee and delicious snacks in the neighborhood."
            />

            <Group justify="flex-end" mt="lg">
              <Button variant="light" color="gray">
                Cancel
              </Button>
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

              <Group justify="space-between">
                <Stack gap={0}>
                  <Text size="sm" fw={500} className="text-foreground">
                    Dark Mode
                  </Text>
                  <Text size="xs" c="dimmed">
                    Switch between light and dark themes
                  </Text>
                </Stack>
                <Switch color="violet" />
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
                <Switch color="violet" defaultChecked />
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

              <Group justify="space-between">
                <Stack gap={0}>
                  <Text size="sm" fw={500} className="text-foreground">
                    Marketing updates
                  </Text>
                  <Text size="xs" c="dimmed">
                    News about new features and tips
                  </Text>
                </Stack>
                <Switch color="violet" />
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
