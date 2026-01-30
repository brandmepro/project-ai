import { defineConfig, type OutputOptions } from 'orval';

// Define base URL for API documentation
const API_DOCS_URL =
  process.env.VITE_API_DOCS_URL || 'http://localhost:8000/api/v1/docs-json';

// Base configuration for UI client generation
const baseConfig = {
  output: {
    mode: 'tags-split',
    schemas: './packages/api-client/ui-clients/schemas',
    client: 'react-query',
    mock: false,
    prettier: true,
    tsconfig: './packages/api-client/tsconfig.json',
    indexFiles: true,
    target: './packages/api-client/ui-clients',
    override: {
      query: {
        useQuery: true,
      },
      operations: {
        // Consistent retry logic with idempotency
        get: {
          query: {
            useQuery: true,
            options: {
              retry: 2, // Retry GET requests twice (safe to retry)
              staleTime: 5000, // Consider data fresh for 5 seconds
            },
          },
        },
        create: {
          query: {
            useMutation: true,
            options: {
              retry: 1, // Retry POST once (be cautious with mutations)
            },
          },
        },
        update: {
          query: {
            useMutation: true,
            options: {
              retry: 1, // Retry PUT/PATCH once
            },
          },
        },
        delete: {
          query: {
            useMutation: true,
            options: {
              retry: 0, // Never retry DELETE operations
            },
          },
        },
      },
      header: true,
      components: {
        schemas: {
          suffix: 'DTO',
        },
        responses: {
          suffix: 'Response',
        },
      },
    },
  },
  hooks: {
    // Run auto-export script and prettier after all files are written
    afterAllFilesWrite: 'node ./scripts/generate-api-exports.js && prettier --write ./packages/api-client/ui-clients',
  },
};

export default defineConfig({
  businessProApi: {
    input: {
      target: API_DOCS_URL,
    },
    output: {
      ...baseConfig.output,
      override: {
        ...baseConfig.output.override,
        mutator: {
          path: './packages/api-client/ui-clients/axios-instance.ts',
          name: 'customAxiosInstance',
        },
        header: true,
        components: {
          schemas: {
            suffix: 'DTO',
          },
          responses: {
            suffix: 'Response',
          },
        },
      },
    } as OutputOptions,
    hooks: {
      afterAllFilesWrite: baseConfig.hooks.afterAllFilesWrite,
    },
  },
});
