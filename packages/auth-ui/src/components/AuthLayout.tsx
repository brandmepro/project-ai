'use client';

import { Paper, Stack, Title, Text, Box } from '@mantine/core';
import { motion } from 'framer-motion';
import { IconSparkles } from '@tabler/icons-react';
import type { AuthLayoutProps } from '../types';

export function AuthLayout({
  children,
  title,
  subtitle,
  showLogo = true,
}: AuthLayoutProps) {
  return (
    <Box
      style={{
        minHeight: '100dvh',
        height: '100dvh', // Fixed height on desktop to prevent scrolling
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflow: 'auto', // Allow scrolling if content is too tall
        background: 'linear-gradient(135deg, oklch(0.55 0.25 280 / 0.05) 0%, oklch(0.65 0.2 280 / 0.1) 100%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '450px' }}
      >
        <Paper
          shadow="lg"
          radius="xl"
          p={{ base: 'lg', sm: 'xl' }}
          style={{
            border: '1px solid oklch(0.92 0.01 280)',
            backdropFilter: 'blur(10px)',
            background: 'oklch(1 0 0 / 0.9)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <Stack gap="lg">
            {showLogo && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              >
                <Box style={{ textAlign: 'center' }}>
                  <Box
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, oklch(0.55 0.25 280) 0%, oklch(0.65 0.2 280) 100%)',
                      marginBottom: '1rem',
                    }}
                  >
                    <IconSparkles size={32} stroke={2} color="white" />
                  </Box>
                  <Title
                    order={2}
                    style={{
                      fontSize: '1.75rem',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, oklch(0.55 0.25 280) 0%, oklch(0.65 0.2 280) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Business Pro
                  </Title>
                </Box>
              </motion.div>
            )}

            <Box>
              <Title
                order={3}
                mb="xs"
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                {title}
              </Title>
              {subtitle && (
                <Text c="dimmed" size="sm" ta="center">
                  {subtitle}
                </Text>
              )}
            </Box>

            {children}
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
}
