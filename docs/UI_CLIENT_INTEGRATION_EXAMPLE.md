# UI Client Integration Example

## Complete Example: User Management Component

This example demonstrates how to use the generated API client hooks in a real component with full idempotency and error handling.

## Step 1: Generate the Clients

```powershell
# Start API first
cd api
bun run start:dev

# In another terminal, from project root
bun install
bun run generate:ui-client
```

## Step 2: Create a User Management Component

```tsx
// our-app/app/(dashboard)/users/page.tsx
'use client';

import { useState } from 'react';
import { 
  useGetUsers, 
  useCreateUser, 
  useUpdateUser, 
  useDeleteUser 
} from '@businesspro/api-client';
import { Button, TextInput, Card, Group, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export default function UsersPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Query: Fetch all users with automatic caching
  const { 
    data: users, 
    isLoading, 
    error, 
    refetch 
  } = useGetUsers({
    query: {
      // Refetch every 30 seconds
      refetchInterval: 30000,
      // Show cached data while fetching
      staleTime: 5000,
    }
  });

  // Mutation: Create user
  const createUserMutation = useCreateUser({
    mutation: {
      onSuccess: (newUser) => {
        notifications.show({
          title: 'Success',
          message: `User ${newUser.name} created successfully!`,
          color: 'green',
        });
        
        // Clear form
        setName('');
        setEmail('');
        setPassword('');
        
        // Refetch users list
        refetch();
      },
      onError: (error) => {
        notifications.show({
          title: 'Error',
          message: error.messages.join(', '),
          color: 'red',
        });
      },
    },
  });

  // Mutation: Update user
  const updateUserMutation = useUpdateUser({
    mutation: {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: 'User updated successfully!',
          color: 'green',
        });
        refetch();
      },
    },
  });

  // Mutation: Delete user
  const deleteUserMutation = useDeleteUser({
    mutation: {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: 'User deleted successfully!',
          color: 'green',
        });
        refetch();
      },
    },
  });

  const handleCreateUser = () => {
    if (!name || !email || !password) {
      notifications.show({
        title: 'Validation Error',
        message: 'All fields are required',
        color: 'orange',
      });
      return;
    }

    createUserMutation.mutate({
      data: {
        name,
        email,
        password,
        businessType: 'retail',
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Text>Loading users...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <Text color="red">Error loading users: {error.message}</Text>
          <Button onClick={() => refetch()} mt="md">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">User Management</h1>

      {/* Create User Form */}
      <Card className="mb-8" padding="lg">
        <h2 className="text-xl font-semibold mb-4">Create New User</h2>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextInput
            label="Email"
            placeholder="john@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextInput
            label="Password"
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            onClick={handleCreateUser}
            loading={createUserMutation.isPending}
          >
            Create User
          </Button>
        </Stack>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Users ({users?.length || 0})</h2>
        {users?.map((user) => (
          <Card key={user.id} padding="lg">
            <Group justify="space-between" align="center">
              <div>
                <Text fw={600}>{user.name}</Text>
                <Text size="sm" c="dimmed">{user.email}</Text>
                <Text size="xs" c="dimmed">
                  Created: {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </div>
              <Group gap="xs">
                <Button
                  variant="light"
                  color="blue"
                  onClick={() => {
                    // Example: Toggle some field
                    updateUserMutation.mutate({
                      id: user.id,
                      data: { name: user.name + ' (Updated)' },
                    });
                  }}
                  loading={updateUserMutation.isPending}
                >
                  Edit
                </Button>
                <Button
                  variant="light"
                  color="red"
                  onClick={() => {
                    if (confirm(`Delete user ${user.name}?`)) {
                      deleteUserMutation.mutate({ id: user.id });
                    }
                  }}
                  loading={deleteUserMutation.isPending}
                >
                  Delete
                </Button>
              </Group>
            </Group>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

## Step 3: Test Idempotency

Open the browser console and watch the network tab:

### Test 1: Duplicate Requests Prevention

```tsx
// Both components fetch users simultaneously
function ComponentA() {
  const { data } = useGetUsers();
  return <div>Component A: {data?.length} users</div>;
}

function ComponentB() {
  const { data } = useGetUsers();
  return <div>Component B: {data?.length} users</div>;
}

// Result: Only ONE network request is made ✅
```

### Test 2: Smart Retry on Failure

```tsx
// Simulate network failure
// The client will automatically retry GET requests 2 times
const { data, error, failureCount } = useGetUsers({
  query: {
    retry: 2,
    onError: (error, attempt) => {
      console.log(`Attempt ${attempt} failed:`, error);
    },
  },
});

console.log('Failure count:', failureCount);
// If network fails, you'll see:
// Attempt 1 failed: Network Error
// Attempt 2 failed: Network Error
// Attempt 3 failed: Network Error (final)
```

### Test 3: No Duplicate Mutations

```tsx
// Click "Create User" button rapidly
const createUser = useCreateUser();

// Click 5 times rapidly
for (let i = 0; i < 5; i++) {
  createUser.mutate({ data: { name: 'Test', email: 'test@test.com' } });
}

// Result: Only the LAST mutation executes ✅
// React Query prevents duplicate mutations
```

## Step 4: Authentication Flow

```tsx
// our-app/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin } from '@businesspro/api-client';
import { TextInput, PasswordInput, Button, Card, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (response) => {
        // Token is automatically stored by axios interceptor
        localStorage.setItem('auth-token', response.accessToken);
        localStorage.setItem('auth-storage', JSON.stringify({
          state: {
            refreshToken: response.refreshToken,
          }
        }));
        
        notifications.show({
          title: 'Welcome!',
          message: 'Login successful',
          color: 'green',
        });
        
        router.push('/dashboard');
      },
      onError: (error) => {
        notifications.show({
          title: 'Login Failed',
          message: error.messages[0] || 'Invalid credentials',
          color: 'red',
        });
      },
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      data: { email, password },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md" padding="xl">
        <form onSubmit={handleLogin}>
          <Stack gap="md">
            <h1 className="text-2xl font-bold text-center">Login</h1>
            
            <TextInput
              label="Email"
              placeholder="your@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <PasswordInput
              label="Password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <Button
              type="submit"
              fullWidth
              loading={loginMutation.isPending}
            >
              Login
            </Button>
          </Stack>
        </form>
      </Card>
    </div>
  );
}
```

## Step 5: Error Handling Best Practices

```tsx
import { ApiError } from '@businesspro/api-client';

const createUser = useCreateUser({
  mutation: {
    onError: (error) => {
      if (error instanceof ApiError) {
        switch (error.status) {
          case 400:
            // Validation error
            notifications.show({
              title: 'Validation Error',
              message: error.messages.join('\n'),
              color: 'orange',
            });
            break;
            
          case 401:
            // Unauthorized - redirect to login
            router.push('/login');
            break;
            
          case 403:
            // Forbidden
            notifications.show({
              title: 'Access Denied',
              message: 'You do not have permission',
              color: 'red',
            });
            break;
            
          case 409:
            // Conflict (e.g., email already exists)
            notifications.show({
              title: 'Conflict',
              message: 'Email already exists',
              color: 'orange',
            });
            break;
            
          case 500:
            // Server error
            notifications.show({
              title: 'Server Error',
              message: 'Something went wrong. Please try again.',
              color: 'red',
            });
            break;
            
          default:
            notifications.show({
              title: 'Error',
              message: error.messages[0] || 'An error occurred',
              color: 'red',
            });
        }
      }
    },
  },
});
```

## Step 6: Testing the Integration

### Manual Testing Checklist

1. **Start the API**
   ```powershell
   cd api
   bun run start:dev
   ```

2. **Generate UI Clients**
   ```powershell
   bun run generate:ui-client
   ```

3. **Start Frontend**
   ```powershell
   cd our-app
   bun run dev
   ```

4. **Test User Flow**
   - ✅ Navigate to `/users`
   - ✅ Verify users list loads
   - ✅ Create a new user
   - ✅ Check Network tab - only one request for create
   - ✅ Update a user
   - ✅ Delete a user
   - ✅ Check that list refetches after mutations

5. **Test Idempotency**
   - ✅ Open multiple tabs with `/users` page
   - ✅ Verify only one network request in total
   - ✅ Click create button rapidly
   - ✅ Verify only one user is created

6. **Test Error Handling**
   - ✅ Try creating user with existing email
   - ✅ Verify 409 error is handled gracefully
   - ✅ Stop API server
   - ✅ Verify retry logic attempts 2 times
   - ✅ Verify error message displays

7. **Test Authentication**
   - ✅ Login with valid credentials
   - ✅ Verify token is stored
   - ✅ Verify subsequent requests include token
   - ✅ Logout
   - ✅ Verify token is cleared
   - ✅ Verify redirect to login

## Common Issues and Solutions

### Issue: "Module not found: @businesspro/api-client"

**Solution:**
```powershell
bun install
```

### Issue: "Cannot find module './auth/auth'"

**Solution:** Generate the clients first
```powershell
bun run generate:ui-client
```

### Issue: TypeScript errors after generation

**Solution:** Restart TypeScript server
- VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### Issue: Duplicate requests still happening

**Solution:** Ensure React Query provider is at root level
```tsx
// app/layout.tsx
<QueryClientProvider client={queryClient}>
  <YourApp />
</QueryClientProvider>
```

## Performance Monitoring

Track API performance with React Query DevTools:

```tsx
// our-app/app/layout.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

## Summary

You now have a complete, production-ready API integration with:

✅ Type-safe API hooks  
✅ Automatic request deduplication  
✅ Smart retry logic  
✅ Comprehensive error handling  
✅ Authentication flow  
✅ Date transformation  
✅ Performance optimization  

The system follows the same patterns as script-assist with perfect idempotency and can be reused across multiple frontend applications!
