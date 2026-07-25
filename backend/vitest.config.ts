import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    env: {
      MONGODB_URI: 'mongodb://localhost:27017/test',
      JWT_SECRET: 'test-jwt-secret-min-32-chars-long-for-testing',
      JWT_REFRESH_SECRET: 'test-refresh-secret-min-32-chars-long-for-test',
      ENCRYPTION_KEY: 'test-encryption-key-32chars!!',
      GOOGLE_CLIENT_ID: 'test-client-id',
      GOOGLE_CLIENT_SECRET: 'test-client-secret',
      NODE_ENV: 'test',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
