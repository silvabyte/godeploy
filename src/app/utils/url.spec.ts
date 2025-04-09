import { describe, it, expect, vi } from 'vitest';
import * as urlUtils from './url';
import { nanoid } from 'nanoid';
import randomWord from 'random-word';

vi.mock('nanoid', () => ({
  nanoid: vi.fn().mockReturnValue('-abc123---'),
}));

vi.mock('random-word', () => ({
  default: vi.fn().mockReturnValue('--sunshine--'),
}));

describe('generateUniqueSubdomain', () => {
  it('should generate a subdomain with nanoid and random word', () => {
    const result = urlUtils.generateUniqueSubdomain();
    expect(result).toBe('abc123-sunshine');
  });
});

describe('constructCdnUrl', () => {
  it('should construct a CDN URL from subdomain', () => {
    const subdomain = 'abc123-sunshine';
    const result = urlUtils.constructCdnUrl(subdomain);
    expect(result).toBe('https://abc123-sunshine.spa.godeploy.app');
  });
});

describe('constructStorageKey', () => {
  it('should construct a storage key from subdomain', () => {
    const subdomain = 'abc123-sunshine';
    const result = urlUtils.constructStorageKey(subdomain);
    expect(result).toBe('spa-projects/abc123-sunshine.spa.godeploy.app');
  });
});
