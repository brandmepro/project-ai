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
import { useUsersControllerGetProfile, useAuthControllerLogout } from '@businesspro/api-client'
import { clearAuthTokens } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { notifications } from '@mantine/notifications'
import Link from 'next/link'

export function Header() {
  const { businessName } = useAppStore()
  const { data: userProfile } = useUsersControllerGetProfile()
  const router = useRouter()
  const logoutMutation = useAuthControllerLogout()
  
  const userName = (userProfile as any)?.name || (userProfile as any)?.businessName || (userProfile as any)?.email?.split('@')[0] || businessName || 'User'
  const userEmail = (userProfile as any)?.email || ''
  
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
                src={(userProfile as any)?.avatarUrl}
              >
                {userName.charAt(0).toUpperCase()}
              </Avatar>
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>
              <Text size="sm" fw={600} className="text-foreground" mb={2}>
                {userName}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {userEmail}
              </Text>
            </Menu.Label>
            <Menu.Divider />
            <Menu.Item 
              leftSection={<IconUser size={16} />}
              component={Link}
              href="/profile"
            >
              Profile
            </Menu.Item>
            <Menu.Item 
              leftSection={<IconSettings size={16} />}
              component={Link}
              href="/settings"
            >
              Settings
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item 
              color="red" 
              leftSection={<IconLogout size={16} />}
              onClick={handleLogout}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </header>
  )
}
