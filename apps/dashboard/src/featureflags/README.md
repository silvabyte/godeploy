# Feature Flags

A lightweight feature flag system using bitwise operations for efficient storage and checking.

## Usage

```typescript
import { FeatureFlags, FLAGS } from './ff';

// Get the singleton instance
const flags = FeatureFlags.getInstance();

// Enable features using bitwise OR
flags.enable(FLAGS.ENABLE_OFFER | FLAGS.ENABLE_SUBSCRIPTIONS);

// Check if a feature is enabled
if (flags.isEnabled(FLAGS.ENABLE_OFFER)) {
  // Show offer UI
}

// Disable a feature
flags.disable(FLAGS.ENABLE_OFFER);

// Check if exactly these features are enabled
if (flags.isExactly(FLAGS.ENABLE_OFFER | FLAGS.ENABLE_SUBSCRIPTIONS)) {
  // Show both features
}
```

## URL Query Parameters

Feature flags can be controlled via URL query parameters during app initialization. URL flags take precedence over stored flags:

Example URLs:

- `?ff=1` - Enable ENABLE_OFFER
- `?ff=-1` - Disable ENABLE_OFFER
- `?ff=1,2` - Enable ENABLE_OFFER and ENABLE_SUBSCRIPTIONS
- `?ff=1,-2` - Enable ENABLE_OFFER but disable ENABLE_SUBSCRIPTIONS
- `?ff=-1,-2` - Disable both flags
- `?ff=4` - Enable ENABLE_BETA (if defined)

The order of flags in the URL doesn't matter. For example, `?ff=-1,2` is the same as `?ff=2,-1`.

Flag merging behavior:

- If a flag is enabled in storage but disabled in URL (`-1`), it will be disabled
- If a flag is disabled in storage but enabled in URL (`1`), it will be enabled
- If a flag is not mentioned in URL, its storage state is preserved

## Available Flags

Each flag is a power of 2 (single bit):

- `FLAGS.ENABLE_OFFER`: 1 (00000001)
- `FLAGS.ENABLE_SUBSCRIPTIONS`: 2 (00000010)

## Adding New Flags

To add a new feature flag:

1. Add a new constant to `FLAGS` in `src/featureflags/ff.ts`:

```typescript
export const FLAGS = {
  ENABLE_OFFER: 1, // 00000001
  ENABLE_SUBSCRIPTIONS: 2, // 00000010
  ENABLE_BETA: 4, // 00000100
  ENABLE_DARK_MODE: 8, // 00001000
} as const;
```

2. Use the new flag in your code:

```typescript
// Enable beta features
flags.enable(FLAGS.ENABLE_BETA);

// Check if beta is enabled
if (flags.isEnabled(FLAGS.ENABLE_BETA)) {
  // Show beta features
}

// Enable multiple flags at once
flags.enable(FLAGS.ENABLE_BETA | FLAGS.ENABLE_DARK_MODE);
```

Remember:

- Each flag must be a power of 2 (1, 2, 4, 8, 16, etc.)
- The binary representation should have only one 1
- Don't reuse numbers that are already powers of 2

## Storage Format

Flags are stored as a decimal number in localStorage:

- `0` = no flags enabled
- `1` = `ENABLE_OFFER` enabled
- `2` = `ENABLE_SUBSCRIPTIONS` enabled
- `3` = both flags enabled (1 | 2)

## Testing

```typescript
import { FeatureFlags, FLAGS } from './ff';

// Use custom storage for testing
const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  // ... other Storage interface methods
};

// Test with custom storage
const flags = FeatureFlags.getInstance(mockStorage);

// Test enabling flags
flags.enable(FLAGS.ENABLE_OFFER);
expect(flags.isEnabled(FLAGS.ENABLE_OFFER)).toBe(true);

// Test disabling flags
flags.disable(FLAGS.ENABLE_OFFER);
expect(flags.isEnabled(FLAGS.ENABLE_OFFER)).toBe(false);

// Test with initial flags
const flagsWithInitial = FeatureFlags.getInstance(mockStorage, FLAGS.ENABLE_OFFER);
expect(flagsWithInitial.isEnabled(FLAGS.ENABLE_OFFER)).toBe(true);
```
