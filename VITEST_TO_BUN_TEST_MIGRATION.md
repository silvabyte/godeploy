# Vitest to Bun Test Migration Plan

## Overview

Migrate from Vitest to Bun's built-in test runner to eliminate dependencies and improve test performance.

## Current State Analysis

### Test Files Found

- `src/app/tests/health.test.ts` - API health check test
- `src/app/components/projects/project-utils.spec.ts` - Unit tests for project utilities
- `src/app/utils/url.spec.ts` - URL utility tests
- `src/vitest/setup.ts` - Vitest setup with mocking

### Current Dependencies

- `vitest`: ^3.1.1
- `vitest-mock-extended`: ^3.1.0
- `vitest.config.ts` - Configuration file

## Migration Tasks

### Phase 1: Syntax Migration

#### 1.1 Import Statement Changes

**Vitest imports:**

```typescript
import { expect, describe, it, beforeAll, vi } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';
```

**Bun test imports:**

```typescript
import { expect, describe, it, beforeAll, mock, spyOn } from 'bun:test';
```

#### 1.2 Mocking Changes

**Vitest mocking:**

```typescript
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue(mockDeep<SupabaseClient>()),
}));
```

**Bun mocking:**

```typescript
import { mock } from 'bun:test';

mock.module('@supabase/supabase-js', () => ({
  createClient: mock(() => ({
    // Mock implementation
    auth: {
      getUser: mock(() => Promise.resolve({ data: null, error: null })),
    },
    from: mock(() => ({
      select: mock(() => ({ data: [], error: null })),
      insert: mock(() => ({ data: null, error: null })),
      update: mock(() => ({ data: null, error: null })),
      delete: mock(() => ({ data: null, error: null })),
    })),
  })),
}));
```

### Phase 2: File Updates

#### 2.1 Test Files to Update

| File                                                | Changes Required                           |
| --------------------------------------------------- | ------------------------------------------ |
| `src/app/tests/health.test.ts`                      | Update imports from 'vitest' to 'bun:test' |
| `src/app/components/projects/project-utils.spec.ts` | Update imports, no mocking needed          |
| `src/app/utils/url.spec.ts`                         | Update imports                             |
| `src/vitest/setup.ts`                               | Convert to `src/test/setup.ts` for Bun     |

#### 2.2 Example Migration

**Before (Vitest):**

```typescript
// src/app/tests/health.test.ts
import { expect, describe, it, beforeAll } from 'vitest';
import { buildApp } from '../build/build';

describe('Health check', async () => {
  let server: Awaited<ReturnType<typeof buildApp>>;
  beforeAll(async () => {
    server = await buildApp();
  });
  it('should return 200', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/health',
    });
    expect(response.statusCode).toBe(200);
  });
});
```

**After (Bun):**

```typescript
// src/app/tests/health.test.ts
import { expect, describe, it, beforeAll } from 'bun:test';
import { buildApp } from '../build/build.js';

describe('Health check', () => {
  let server: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    server = await buildApp();
  });

  it('should return 200', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/health',
    });
    expect(response.statusCode).toBe(200);
  });
});
```

### Phase 3: Configuration Changes

#### 3.1 Bun Test Configuration

Create `bunfig.toml` in project root:

```toml
[test]
# Test runner configuration
preload = ["./src/test/setup.ts"]
coverage = true
coverageReporter = ["text", "json", "html"]
```

Or add to `package.json`:

```json
{
  "test": {
    "preload": ["./src/test/setup.ts"],
    "coverage": true,
    "coverageReporter": ["text", "json", "html"]
  }
}
```

#### 3.2 Files to Delete

- `vitest.config.ts`
- `src/vitest/setup.ts` (after converting to Bun setup)

### Phase 4: Package.json Updates

#### 4.1 Remove Dependencies

```json
// Remove from devDependencies:
- "vitest": "^3.1.1"
- "vitest-mock-extended": "^3.1.0"
```

#### 4.2 Update Scripts

```json
{
  "scripts": {
    "test": "bun test",
    "test:watch": "bun test --watch",
    "test:coverage": "bun test --coverage"
  }
}
```

### Phase 5: Mock Patterns

#### 5.1 Function Mocking

**Vitest:**

```typescript
const mockFn = vi.fn();
mockFn.mockReturnValue('value');
mockFn.mockResolvedValue('async value');
```

**Bun:**

```typescript
import { mock } from 'bun:test';
const mockFn = mock(() => 'value');
mockFn.mockReturnValue('value');
mockFn.mockResolvedValue('async value');
```

#### 5.2 Module Mocking

**Vitest:**

```typescript
vi.mock('./module', () => ({
  someFunction: vi.fn(),
}));
```

**Bun:**

```typescript
import { mock } from 'bun:test';
mock.module('./module', () => ({
  someFunction: mock(),
}));
```

#### 5.3 Spying

**Vitest:**

```typescript
const spy = vi.spyOn(object, 'method');
```

**Bun:**

```typescript
import { spyOn } from 'bun:test';
const spy = spyOn(object, 'method');
```

### Phase 6: Assertion Differences

Most assertions are the same, but note these differences:

| Vitest                    | Bun Test                                            |
| ------------------------- | --------------------------------------------------- |
| `expect.assertions(n)`    | Not available - use explicit expects                |
| `expect.hasAssertions()`  | Not available                                       |
| `toMatchInlineSnapshot()` | Use `toMatchSnapshot()`                             |
| `vi.useFakeTimers()`      | Use `jest.useFakeTimers()` (Bun is Jest-compatible) |

### Phase 7: Test Running Commands

#### Development

```bash
# Run all tests
bun test

# Run specific file
bun test src/app/tests/health.test.ts

# Watch mode
bun test --watch

# Coverage
bun test --coverage
```

#### CI/CD

```yaml
# Already updated in .github/workflows/ci.yml
- name: Test
  run: bun test --coverage
```

## Implementation Order

1. **Setup Phase**

   - [ ] Create `src/test/setup.ts` with Bun mocking
   - [ ] Add test configuration to `bunfig.toml` or `package.json`

2. **Migration Phase**

   - [ ] Update `src/app/components/projects/project-utils.spec.ts` (simplest, no mocks)
   - [ ] Update `src/app/utils/url.spec.ts`
   - [ ] Update `src/app/tests/health.test.ts`
   - [ ] Update any smoke tests if they use Vitest

3. **Cleanup Phase**

   - [ ] Remove `vitest.config.ts`
   - [ ] Remove `src/vitest/` directory
   - [ ] Remove Vitest dependencies from `package.json`
   - [ ] Run `bun install` to update lockfile

4. **Validation Phase**
   - [ ] Run all tests: `bun test`
   - [ ] Check coverage: `bun test --coverage`
   - [ ] Verify CI/CD pipeline passes

## Benefits

1. **Performance**

   - Bun's test runner is ~10x faster than Vitest
   - No transpilation overhead
   - Native TypeScript support

2. **Simplicity**

   - One less dependency to manage
   - Built into the runtime
   - Simpler configuration

3. **Compatibility**
   - Jest-compatible API
   - Most assertions work the same
   - Familiar syntax

## Potential Issues & Solutions

### Issue 1: Complex Mocking

**Problem:** `vitest-mock-extended` provides deep mocking utilities
**Solution:** Create manual mock factories for complex objects

### Issue 2: Snapshot Testing

**Problem:** Different snapshot format
**Solution:** Regenerate snapshots after migration

### Issue 3: Coverage Reports

**Problem:** Different coverage format
**Solution:** Update CI/CD to use Bun's coverage format

## Rollback Plan

If issues arise:

1. Keep `vitest.config.ts` and test files in a backup branch
2. Can run both test suites temporarily during migration
3. Revert changes if blocking issues found

## Success Criteria

- [ ] All tests pass with `bun test`
- [ ] Coverage reports generate correctly
- [ ] CI/CD pipeline passes
- [ ] No Vitest dependencies remain
- [ ] Test execution time improves

## Next Steps

1. Start with the simplest test file (project-utils.spec.ts)
2. Validate each migration before moving to the next
3. Run full test suite after each file migration
4. Update documentation after completion
