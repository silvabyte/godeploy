export interface WithTimeoutOptions<T> {
  promise: Promise<T>;
  timeoutDuration?: number;
  timeoutReason?: string;
}

export function withTimeout<T>({
  promise,
  timeoutDuration = 5000,
  timeoutReason = 'Request timed out',
}: WithTimeoutOptions<T>) {
  // Timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(timeoutReason)); // Use the custom timeout reason
    }, timeoutDuration);
  });

  // Race the given promise against the timeout
  return Promise.race([promise, timeoutPromise]) as Promise<T>;
}
