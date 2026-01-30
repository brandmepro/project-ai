import { useState } from 'react';
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Group,
  Text,
  Anchor,
  Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { motion } from 'framer-motion';
import { IconMail, IconLock, IconBrandGoogle, IconBrandFacebook } from '@tabler/icons-react';
import { AuthLayout } from './AuthLayout';
import type { LoginProps, LoginCredentials } from '../types';

export function Login({
  onLogin,
  onSignupClick,
  onForgotPassword,
  onSocialLogin,
  loading = false,
}: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginCredentials>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+$/.test(value)) return 'Invalid email address';
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return null;
      },
    },
  });

  const handleSubmit = async (values: LoginCredentials) => {
    try {
      setIsLoading(true);
      await onLogin(values);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    if (onSocialLogin) {
      try {
        setIsLoading(true);
        await onSocialLogin(provider);
      } catch (error) {
        console.error('Social login error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Log in to continue managing your social media"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TextInput
              label="Email"
              placeholder="your@email.com"
              leftSection={<IconMail size={18} />}
              radius="lg"
              size="md"
              {...form.getInputProps('email')}
              disabled={isLoading || loading}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              leftSection={<IconLock size={18} />}
              radius="lg"
              size="md"
              {...form.getInputProps('password')}
              disabled={isLoading || loading}
            />
          </motion.div>

          {onForgotPassword && (
            <Group justify="flex-end">
              <Anchor
                size="sm"
                onClick={() => onForgotPassword(form.values.email)}
                style={{ color: 'oklch(0.55 0.25 280)' }}
              >
                Forgot password?
              </Anchor>
            </Group>
          )}

          <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
          >
            <Button
              type="submit"
              fullWidth
              size="lg"
              radius="lg"
              loading={isLoading || loading}
              gradient={{ from: 'violet', to: 'indigo', deg: 135 }}
              variant="gradient"
              style={{
                fontWeight: 600,
                height: '48px',
              }}
            >
              Log In
            </Button>
          </motion.div>

          {onSocialLogin && (
            <>
              <Divider label="or continue with" labelPosition="center" />

              <Group grow>
                <Button
                  variant="light"
                  leftSection={<IconBrandGoogle size={20} />}
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading || loading}
                  radius="lg"
                  color="gray"
                >
                  Google
                </Button>
                <Button
                  variant="light"
                  leftSection={<IconBrandFacebook size={20} />}
                  onClick={() => handleSocialLogin('facebook')}
                  disabled={isLoading || loading}
                  radius="lg"
                  color="blue"
                >
                  Facebook
                </Button>
              </Group>
            </>
          )}

          {onSignupClick && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Text size="sm" ta="center" mt="md">
                Don't have an account?{' '}
                <Anchor
                  fw={600}
                  onClick={onSignupClick}
                  style={{ color: 'oklch(0.55 0.25 280)' }}
                >
                  Sign up
                </Anchor>
              </Text>
            </motion.div>
          )}
        </Stack>
      </form>
    </AuthLayout>
  );
}
