# UI Client Generation Guide

## Overview

BusinessPro uses **Orval** to automatically generate type-safe React Query hooks from your NestJS API's OpenAPI/Swagger specification. This eliminates manual API client code and ensures your frontend stays in sync with your backend.

## 📦 Architecture

```
BusinessPro/
├── api/                          # NestJS Backend API
│   └── src/
│       └── main.ts              # Exposes /api/v1/docs-json endpoint
│
├── packages/
│   └── api-client/              # 🎯 Reusable API Client Package
│       ├── src/
│       │   ├── axios-instance.ts    # Axios config with idempotency
│       │   ├── index.ts             # Package exports
│       │   ├── schemas/             # Generated TypeScript types
│       │   ├── auth/                # Generated auth endpoints
│       │   ├── users/               # Generated user endpoints
│       │   └── ai/                  # Generated AI endpoints
│       └── package.json
│
├── our-app/                     # Next.js Frontend
│   └── package.json             # Imports @businesspro/api-client
│
└── orval.config.ts              # Orval configuration
```

## 🚀 Quick Start

### 1. Start Your Backend API

```powershell
# Terminal 1: Start the API
cd api
bun run start:dev

# API will be available at: http://localhost:3000/api/v1
# Swagger docs at: http://localhost:3000/api/v1/docs
# JSON spec at: http://localhost:3000/api/v1/docs-json
```

### 2. Generate UI Clients

```powershell
# From the project root
bun run generate:ui-client
```

This will:
- ✅ Fetch OpenAPI spec from `http://localhost:3000/api/v1/docs-json`
- ✅ Generate TypeScript types (DTOs) in `packages/api-client/src/schemas/`
- ✅ Generate React Query hooks in `packages/api-client/src/`
- ✅ Format code with Prettier
- ✅ Create index files for easy imports

### 3. Install Dependencies

```powershell
# Install all workspace dependencies
bun install
```

### 4. Use in Your Frontend

```tsx
import { useGetUsers, useCreateUser } from '@businesspro/api-client';

function UsersPage() {
  // Query hook - fetches data with caching
  const { data: users, isLoading, error } = useGetUsers();
  
  // Mutation hook - creates a user
  const createUser = useCreateUser({
    mutation: {
      onSuccess: (newUser) => {
        console.log('User created:', newUser);
      },
      onError: (error) => {
        console.error('Failed to create user:', error.messages);
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
      
      <button onClick={() => createUser.mutate({ 
        data: { name: 'John', email: 'john@example.com', password: 'secret' } 
      })}>
        Add User
      </button>
    </div>
  );
}
```

## 🔄 Idempotency & Smart Retry

The `@businesspro/api-client` package implements sophisticated idempotency rules inspired by script-assist:

### Request Deduplication

Prevents duplicate API calls for identical requests:

```tsx
// Component A
const { data } = useGetUsers();

// Component B (renders at same time)
const { data } = useGetUsers();

// ✅ Only ONE network request is made
// ✅ Both components receive the same data
```

### Smart Retry Logic

Different retry strategies based on HTTP method:

| Method | Retry Count | Reason |
|--------|------------|--------|
| **GET** | 2 times | Safe to retry (idempotent) |
| **POST** | 1 time | Create operations (cautious) |
| **PUT/PATCH** | 1 time | Update operations (cautious) |
| **DELETE** | 0 times | Never retry destructive operations |

### Exponential Backoff

Retries use exponential backoff to avoid overwhelming the server:
- 1st retry: 1 second delay
- 2nd retry: 2 seconds delay
- 3rd retry: 4 seconds delay
- Max delay: 30 seconds

### In-Flight Request Tracking

```tsx
import { 
  isRequestPending, 
  getPendingRequestsCount,
  clearPendingRequests 
} from '@businesspro/api-client';

// Check if a specific request is in flight
const isPending = isRequestPending({ 
  method: 'GET', 
  url: '/users' 
});

// Get count of all pending requests
const count = getPendingRequestsCount();

// Manually clear pending requests (e.g., on logout)
clearPendingRequests();
```

## 🔐 Authentication

The API client automatically handles authentication:

### Automatic Token Injection

```tsx
// Login
const loginMutation = useLogin();
await loginMutation.mutateAsync({ 
  data: { email, password } 
});

// Token is automatically stored in localStorage
// All subsequent API calls include: Authorization: Bearer <token>
```

### Token Refresh

```tsx
// When access token expires (401 error)
// The client automatically:
// 1. Detects 401 error
// 2. Uses refresh token to get new access token
// 3. Retries the original request
// 4. User never notices the refresh
```

### Logout

```tsx
const logoutMutation = useLogout();
await logoutMutation.mutateAsync();

// Automatically:
// 1. Clears auth tokens from localStorage
// 2. Clears pending requests
// 3. Redirects to /login
```

## 📅 Date Handling

All ISO 8601 date strings are automatically converted to JavaScript `Date` objects:

```tsx
const { data: user } = useGetUserById({ id: '123' });

// ✅ user.createdAt is a Date object, not a string
console.log(user.createdAt.toLocaleDateString());
console.log(user.createdAt.getFullYear());
```

## 🎯 Generated Files Structure

After running `bun run generate:ui-client`, you'll see:

```
packages/api-client/src/
├── index.ts                 # Main exports
├── axios-instance.ts        # Axios configuration
├── schemas/                 # TypeScript DTOs
│   ├── index.ts
│   ├── userDTO.ts
│   ├── createUserDtoDTO.ts
│   └── ...
├── auth/                    # Auth endpoints
│   └── auth.ts             # useLogin, useRegister, useLogout
├── users/                   # User endpoints  
│   └── users.ts            # useGetUsers, useCreateUser, useUpdateUser
└── ai/                      # AI endpoints
    └── ai.ts               # useGenerateContent, useSelectModel
```

## 🛠️ Workflow

### 1. Add New Endpoint to Backend

```typescript
// api/src/posts/posts.controller.ts
@Controller('posts')
@ApiTags('Posts')
export class PostsController {
  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  findAll() {
    return this.postsService.findAll();
  }
  
  @Post()
  @ApiOperation({ summary: 'Create post' })
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }
}
```

### 2. Regenerate UI Clients

```powershell
bun run generate:ui-client
```

### 3. Use New Hooks in Frontend

```tsx
import { useGetPosts, useCreatePost } from '@businesspro/api-client';

function PostsPage() {
  const { data: posts } = useGetPosts();
  const createPost = useCreatePost();
  
  return (
    <div>
      {posts?.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

## ⚙️ Configuration

### Orval Configuration

The `orval.config.ts` file controls how clients are generated:

```typescript
export default defineConfig({
  businessProApi: {
    input: {
      target: 'http://localhost:3000/api/v1/docs-json',
    },
    output: {
      target: './packages/api-client/src',
      client: 'react-query',
      mode: 'tags-split', // Split by controller tags
      prettier: true,
      override: {
        mutator: {
          path: './packages/api-client/src/axios-instance.ts',
          name: 'customAxiosInstance',
        },
      },
    },
  },
});
```

### React Query Configuration

Configure default query behavior in `our-app/components/providers/MantineProviders.tsx`:

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,        // Data fresh for 5 seconds
      retry: 2,               // Retry failed queries twice
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,               // Retry mutations once
    },
  },
});
```

## 🔧 Advanced Usage

### Custom Query Options

```tsx
const { data } = useGetUsers({
  query: {
    enabled: isAuthenticated, // Only fetch when authenticated
    staleTime: 10000,         // Override default stale time
    refetchInterval: 30000,   // Refetch every 30 seconds
    onSuccess: (data) => {
      console.log('Users loaded:', data);
    },
  },
});
```

### Optimistic Updates

```tsx
const updateUser = useUpdateUser({
  mutation: {
    onMutate: async (newUser) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['users']);
      
      // Snapshot previous value
      const previous = queryClient.getQueryData(['users']);
      
      // Optimistically update cache
      queryClient.setQueryData(['users'], (old) => 
        old?.map(u => u.id === newUser.id ? newUser : u)
      );
      
      return { previous };
    },
    onError: (err, newUser, context) => {
      // Rollback on error
      queryClient.setQueryData(['users'], context?.previous);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries(['users']);
    },
  },
});
```

### Error Handling

```tsx
import { ApiError } from '@businesspro/api-client';

const createUser = useCreateUser({
  mutation: {
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          toast.error('Email already exists');
        } else if (error.status === 400) {
          toast.error(error.messages.join(', '));
        } else {
          toast.error('Something went wrong');
        }
      }
    },
  },
});
```

## 🔄 Keeping Clients Up-to-Date

### When to Regenerate

Regenerate UI clients whenever you:
- ✅ Add new API endpoints
- ✅ Modify endpoint parameters
- ✅ Change response types
- ✅ Update DTOs or validation rules
- ✅ Change API routes or tags

### Best Practices

1. **Run generation before committing backend changes**
   ```powershell
   bun run generate:ui-client
   git add packages/api-client
   git commit -m "feat: add posts API endpoints"
   ```

2. **Add to CI/CD pipeline**
   ```yaml
   - name: Generate UI Clients
     run: bun run generate:ui-client
   
   - name: Check for changes
     run: git diff --exit-code packages/api-client
   ```

3. **Review generated code**
   - Check that types are correct
   - Verify hook names are intuitive
   - Ensure documentation is clear

## 🎯 Multiple Frontend Apps

The `@businesspro/api-client` package is designed to be reusable across multiple frontend applications:

### Structure for Multiple Apps

```
BusinessPro/
├── packages/
│   └── api-client/          # ✅ Shared across all apps
│
├── our-app/                 # Main dashboard app
├── mobile-app/              # Future mobile app
├── admin-panel/             # Future admin app
└── marketing-site/          # Future marketing site
```

### Using in New Apps

```json
{
  "name": "mobile-app",
  "dependencies": {
    "@businesspro/api-client": "workspace:*"
  }
}
```

```tsx
// mobile-app/src/screens/Users.tsx
import { useGetUsers } from '@businesspro/api-client';

export function UsersScreen() {
  const { data: users } = useGetUsers();
  // ... use the same hooks!
}
```

## 🐛 Troubleshooting

### API not accessible

```
Error: connect ECONNREFUSED 127.0.0.1:3000
```

**Solution:** Start your API first:
```powershell
cd api
bun run start:dev
```

### Generation fails

```
Error: Unable to fetch OpenAPI spec
```

**Solution:** Ensure API is running and accessible at `http://localhost:3000/api/v1/docs-json`

### TypeScript errors after generation

**Solution:** Restart your TypeScript server:
- VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
- Or restart your IDE

### Import errors

```
Module '@businesspro/api-client' not found
```

**Solution:** Install workspace dependencies:
```powershell
bun install
```

## 📚 Additional Resources

- [Orval Documentation](https://orval.dev/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [Axios Documentation](https://axios-http.com/)

## 🎉 Summary

You now have a fully automated, type-safe, idempotent API client generation system that:

✅ Eliminates manual API client code  
✅ Ensures frontend-backend type safety  
✅ Prevents duplicate API calls  
✅ Handles authentication automatically  
✅ Implements smart retry logic  
✅ Transforms dates automatically  
✅ Works across multiple frontend apps  

**Next Steps:**
1. Start your API: `cd api && bun run start:dev`
2. Generate clients: `bun run generate:ui-client`
3. Start using hooks in your components!

Happy coding! 🚀
