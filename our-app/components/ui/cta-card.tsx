'use client'

import { motion } from 'framer-motion'
import { Paper, Text, Button, Group, Stack, Box } from '@mantine/core'
import Link from 'next/link'
import type { TablerIcon } from '@tabler/icons-react'

interface CTACardProps {
  title: string
  description: string
  buttonText: string
  buttonHref: string
  icon: TablerIcon
  variant?: 'primary' | 'secondary'
}

export function CTACard({ 
  title, 
  description, 
  buttonText, 
  buttonHref, 
  icon: Icon,
  variant = 'primary' 
}: CTACardProps) {
  const isPrimary = variant === 'primary'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      whileHover={{ scale: 1.01 }}
      className="h-full"
    >
      <Paper
        className={`
          p-6 lg:p-8 h-full relative overflow-hidden
          ${isPrimary 
            ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground' 
            : 'bg-card border border-border'
          }
        `}
        withBorder={false}
      >
        {/* Background decoration */}
        {isPrimary && (
          <Box className="absolute top-0 right-0 w-32 h-32 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="80" cy="20" r="60" fill="currentColor" />
            </svg>
          </Box>
        )}

        <Stack gap="md" className="relative z-10">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Box 
              className={`
                flex h-12 w-12 items-center justify-center rounded-xl
                ${isPrimary 
                  ? 'bg-white/20' 
                  : 'bg-primary/10'
                }
              `}
            >
              <Icon 
                size={26} 
                stroke={1.5} 
                className={isPrimary ? 'text-white' : 'text-primary'} 
              />
            </Box>
          </motion.div>

          <Stack gap={4}>
            <Text 
              size="xl" 
              fw={700}
              className={isPrimary ? 'text-white' : 'text-foreground'}
            >
              {title}
            </Text>
            <Text 
              size="sm"
              className={isPrimary ? 'text-white/80' : 'text-muted-foreground'}
            >
              {description}
            </Text>
          </Stack>

          <Group mt="sm">
            <Button
              component={Link}
              href={buttonHref}
              size="md"
              variant={isPrimary ? 'white' : 'filled'}
              color={isPrimary ? undefined : 'violet'}
              rightSection={
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.15 }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path 
                      d="M3 8H13M13 8L9 4M13 8L9 12" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.span>
              }
            >
              {buttonText}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </motion.div>
  )
}
