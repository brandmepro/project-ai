# @businesspro/api-client

Business Pro API client package with auto-generated React Query hooks and idempotent request handling.

## Features

- 🔄 **Auto-generated API clients** from OpenAPI/Swagger specs using Orval
- 🎣 **React Query hooks** for all API endpoints
- 🔒 **Authentication handling** with JWT tokens and automatic token refresh
- ♻️ **Idempotency** - Smart retry logic to prevent duplicate API calls
- 📅 **Automatic date transformation** from ISO strings to Date objects
- 🛡️ **Type-safe** - Full TypeScript support with generated DTOs
- 🚨 **Centralized error handling** with custom ApiError class

## Installation

This package is part of the BusinessPro monorepo and is installed as a workspace dependency:

```json
{
  "dependencies": {
    "@businesspro/api-client": "workspace:*"
  }
}
```

## Usage

### Basic Usage

```tsx
import { useGetUsers, useCreateUser } from '@businesspro/api-client';

function UsersList() {
  // Query hook with automatic caching and refetching
  const { data: users, isLoading, error } = useGetUsers();
  
  // Mutation hook with retry logic
  const createUserMutation = useCreateUser({
    mutation: {
      onSuccess: () => {
        console.log('User created successfully!');
      },
      onError: (error) => {
        console.error('Failed to create user:', error);
      }
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {users?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
      <button onClick={() => createUserMutation.mutate({ 
        data: { name: 'John', email: 'john@example.com' } 
      })}>
        Add User
      </button>
    </div>
  );
}
```

### Setting Up React Query Provider

In your app's root layout or entry point:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 2,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
```

## Idempotency & Retry Logic

The API client follows strict idempotency rules to prevent duplicate operations:

- **GET requests**: Retry up to 2 times (safe to retry)
- **POST/PUT/PATCH requests**: Retry once (mutations are retried cautiously)
- **DELETE requests**: Never retry automatically (destructive operations)

All retries use exponential backoff and respect standard HTTP retry headers.

## Authentication

The axios instance automatically:
- Injects JWT tokens from localStorage into request headers
- Handles token refresh when access token expires
- Redirects to login on 401 errors
- Clears auth state on logout

## Generating API Clients

To regenerate the API clients after backend API changes:

```bash
# From the monorepo root
bun run generate:ui-client
```

This will:
1. Fetch the OpenAPI spec from your running API server
2. Generate TypeScript types and React Query hooks
3. Format the generated code with Prettier

## Error Handling

All API errors are wrapped in a custom `ApiError` class:

```tsx
import { ApiError } from '@businesspro/api-client';

try {
  await createUser({ name: 'John' });
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.status); // HTTP status code
    console.log(error.data); // Response data
    console.log(error.messages); // Array of error messages
  }
}
```

## License

Private - Business Pro
