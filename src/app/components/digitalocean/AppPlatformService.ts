interface AppPlatformDomainResponse {
  domain?: {
    id?: string
    name?: string
    type?: string
    wildcard?: boolean
    state?: string
  }
  links?: unknown
  meta?: unknown
}

interface ServiceResult {
  ok: boolean
  error?: string
}

interface RequestOptions {
  body?: string
}

/**
 * Minimal DigitalOcean App Platform client for managing custom domains.
 */
export class DigitalOceanAppPlatformService {
  private static readonly API_BASE = 'https://api.digitalocean.com/v2'

  static fromEnv(): DigitalOceanAppPlatformService | null {
    const token = process.env.DIGITAL_OCEAN_TOKEN
    const appId = process.env.DIGITAL_OCEAN_NGINX_APP_ID ?? process.env.DIGITAL_OCEAN_APP_ID

    if (!token || !appId) return null

    return new DigitalOceanAppPlatformService(token, appId)
  }

  private constructor(
    private readonly token: string,
    private readonly appId: string,
  ) {}

  async addDomain(domain: string): Promise<ServiceResult> {
    return this.request('POST', `/apps/${this.appId}/domains`, {
      body: JSON.stringify({ domain }),
    })
  }

  async removeDomain(domain: string): Promise<ServiceResult> {
    return this.request('DELETE', `/apps/${this.appId}/domains/${domain}`)
  }

  private async request(method: string, path: string, init: RequestOptions = {}): Promise<ServiceResult> {
    const url = `${DigitalOceanAppPlatformService.API_BASE}${path}`

    let response: any

    try {
      response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: init.body,
      })
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'DigitalOcean API request failed',
      }
    }

    if (response.ok) {
      return { ok: true }
    }

    const status = response.status as number
    let body: AppPlatformDomainResponse | { message?: string } | null = null

    try {
      body = (await response.json()) as AppPlatformDomainResponse | { message?: string }
    } catch {}

    // 409/422 typically means the domain already exists – treat as success.
    if (status === 409 || status === 422) {
      return { ok: true }
    }

    // 404 during deletion means the domain was already removed.
    if (status === 404 && method === 'DELETE') {
      return { ok: true }
    }

    const errorMessage =
      (body && 'message' in body && body.message) ||
      (body && 'domain' in body && body.domain?.state) ||
      `DigitalOcean API responded with status ${status}`

    return {
      ok: false,
      error: errorMessage,
    }
  }
}
