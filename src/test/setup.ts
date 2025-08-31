import { mock } from 'bun:test';

// Mock Supabase client for tests
mock.module('@supabase/supabase-js', () => ({
  createClient: mock(() => ({
    auth: {
      getUser: mock(() => Promise.resolve({ data: null, error: null })),
      getSession: mock(() => Promise.resolve({ data: null, error: null })),
      signInWithPassword: mock(() =>
        Promise.resolve({ data: null, error: null })
      ),
      signOut: mock(() => Promise.resolve({ error: null })),
    },
    from: mock(() => ({
      select: mock(() => ({
        eq: mock(() => Promise.resolve({ data: [], error: null })),
        single: mock(() => Promise.resolve({ data: null, error: null })),
        data: [],
        error: null,
      })),
      insert: mock(() => ({
        select: mock(() => Promise.resolve({ data: null, error: null })),
        data: null,
        error: null,
      })),
      update: mock(() => ({
        eq: mock(() => Promise.resolve({ data: null, error: null })),
        data: null,
        error: null,
      })),
      delete: mock(() => ({
        eq: mock(() => Promise.resolve({ data: null, error: null })),
        data: null,
        error: null,
      })),
    })),
  })),
}));

// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_API_KEY = 'test-api-key';
