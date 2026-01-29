'use client'

import { ActionIcon, Avatar, Menu, Text, Indicator, Group } from '@mantine/core'
import { 
  IconBell, 
  IconUser, 
  IconLogout, 
  IconSettings,
  IconSparkles,
} from '@tabler/icons-react'
import { useAppStore } from '@/lib/store'
import Link from 'next/link'

export function Header() {
  const { businessName } = useAppStore()

  return (
    <header className="h-16 border-b border-border bg-card px-4 lg:px-6 flex items-center justify-between">
      {/* Mobile Logo */}
      <div className="lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <IconSparkles size={16} className="text-primary-foreground" />
          </div>
          <Text fw={600} size="md" className="text-foreground">Business Pro</Text>
        </Link>
      </div>

      {/* Desktop Spacer */}
      <div className="hidden lg:block" />

      {/* Right Section */}
      <Group gap="sm">
        {/* Notifications */}
        <Indicator 
          color="violet" 
          size={8} 
          offset={4}
          processing
        >
          <ActionIcon 
            variant="subtle" 
            size="lg"
            aria-label="Notifications"
          >
            <IconBell size={20} />
          </ActionIcon>
        </Indicator>

        {/* User Menu */}
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <ActionIcon 
              variant="subtle" 
              size="lg" 
              radius="xl"
              className="p-0"
            >
              <Avatar 
                size="sm" 
                radius="xl"
                color="violet"
                className="cursor-pointer"
              >
                {businessName.charAt(0)}
              </Avatar>
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>
              <Text size="xs" c="dimmed">Signed in as</Text>
              <Text size="sm" fw={500} truncate>{businessName}</Text>
            </Menu.Label>
            <Menu.Divider />
            <Menu.Item leftSection={<IconUser size={16} />}>
              Profile
            </Menu.Item>
            <Menu.Item leftSection={<IconSettings size={16} />}>
              Settings
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item 
              color="red" 
              leftSection={<IconLogout size={16} />}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </header>
  )
}
