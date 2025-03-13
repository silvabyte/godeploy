import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withTimeout } from './async-utils';

describe('withTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should resolve with the promise result when promise resolves before timeout', async () => {
    // Arrange
    const expectedResult = { data: 'test data' };
    const promise = Promise.resolve(expectedResult);

    // Act
    const resultPromise = withTimeout({ promise, timeoutDuration: 5000 });

    // Fast-forward time
    vi.runAllTimers();

    // Assert
    await expect(resultPromise).resolves.toEqual(expectedResult);
  });

  it('should reject with timeout error when promise takes too long', async () => {
    // Arrange
    const slowPromise = new Promise((resolve) => {
      setTimeout(() => resolve('too late'), 10000); // This will never resolve in our test
    });

    const timeoutDuration = 5000;
    const timeoutReason = 'Custom timeout message';

    // Act
    const resultPromise = withTimeout({
      promise: slowPromise,
      timeoutDuration,
      timeoutReason,
    });

    // Fast-forward time past the timeout
    vi.advanceTimersByTime(timeoutDuration + 100);

    // Assert
    await expect(resultPromise).rejects.toThrow(timeoutReason);
  });

  it('should use default timeout duration if not provided', async () => {
    // Arrange
    const slowPromise = new Promise((resolve) => {
      setTimeout(() => resolve('too late'), 10000); // This will never resolve in our test
    });

    // Act
    const resultPromise = withTimeout({
      promise: slowPromise,
    });

    // Fast-forward time past the default timeout (5000ms)
    vi.advanceTimersByTime(5000 + 100);

    // Assert
    await expect(resultPromise).rejects.toThrow('Request timed out');
  });

  it('should use default timeout reason if not provided', async () => {
    // Arrange
    const slowPromise = new Promise((resolve) => {
      setTimeout(() => resolve('too late'), 10000); // This will never resolve in our test
    });

    // Act
    const resultPromise = withTimeout({
      promise: slowPromise,
      timeoutDuration: 1000,
    });

    // Fast-forward time past the timeout
    vi.advanceTimersByTime(1000 + 100);

    // Assert
    await expect(resultPromise).rejects.toThrow('Request timed out');
  });
});
