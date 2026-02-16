'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { setAuthTokens } from '@/lib/auth';
import { Center, Loader, Stack, Text } from '@mantine/core';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent SSR/SSG issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const processOAuthCallback = async () => {
      try {
        // Extract tokens from query params
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const onboardingCompleted = searchParams.get('onboardingCompleted');

        // Validate tokens exist
        if (!accessToken || !refreshToken) {
          throw new Error('Missing authentication tokens');
        }

        // Store tokens
        setAuthTokens(accessToken, refreshToken);

        // Show success notification
        notifications.show({
          title: 'Welcome! 👋',
          message: 'Successfully signed in with Google',
          color: 'green',
        });

        // Redirect based on onboarding status
        if (onboardingCompleted === 'false') {
          // OAuth user needs to complete onboarding - redirect to dashboard
          // Dashboard will show the onboarding modal
          router.push('/dashboard?showOnboarding=true');
        } else {
          // Regular user - go to dashboard
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        
        notifications.show({
          title: 'Authentication Failed',
          message: error instanceof Error ? error.message : 'Failed to complete sign in',
          color: 'red',
        });

        // Redirect to login on error
        router.push('/login');
      } finally {
        setIsProcessing(false);
      }
    };

    processOAuthCallback();
  }, [searchParams, router, isMounted]);

  if (!isMounted) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" type="dots" color="violet" />
          <Text size="lg" fw={500}>
            Loading...
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Center style={{ minHeight: '100vh' }}>
      <Stack align="center" gap="md">
        <Loader size="lg" type="dots" color="violet" />
        <Text size="lg" fw={500}>
          {isProcessing ? 'Completing sign in...' : 'Redirecting...'}
        </Text>
        <Text size="sm" c="dimmed">
          Please wait while we set up your account
        </Text>
      </Stack>
    </Center>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <Center style={{ minHeight: '100vh' }}>
          <Stack align="center" gap="md">
            <Loader size="lg" type="dots" color="violet" />
            <Text size="lg" fw={500}>
              Loading...
            </Text>
          </Stack>
        </Center>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
