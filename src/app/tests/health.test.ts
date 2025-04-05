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
