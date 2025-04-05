import type { SupabaseClient } from '@supabase/supabase-js';
import { vi } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue(mockDeep<SupabaseClient>()),
}));
