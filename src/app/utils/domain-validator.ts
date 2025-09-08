import dns from 'node:dns'
import { promisify } from 'node:util'
import { z } from 'zod'
import type { Result } from '../types/result.types'

const resolveCname = promisify(dns.resolveCname)

// Zod schemas for validation
const domainSchema = z
  .string()
  .min(1, 'Domain cannot be empty')
  .max(253, 'Domain too long')
  .regex(/^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/, 'Invalid domain format')
  .refine(
    (val) => {
      // Additional checks for valid domain
      // No consecutive dots
      if (val.includes('..')) return false
      // No leading/trailing dots
      if (val.startsWith('.') || val.endsWith('.')) return false
      // Each label should be 63 characters or less
      const labels = val.split('.')
      return labels.every((label) => label.length <= 63 && label.length > 0)
    },
    { message: 'Invalid domain format' },
  )
  .transform((val) => val.toLowerCase())

export const domainValidationResultSchema = z.object({
  isValid: z.boolean(),
  cnameRecord: z.string().optional(),
  error: z.string().optional(),
})

export type DomainValidationResult = z.infer<typeof domainValidationResultSchema>

/* biome-ignore lint/complexity/noStaticOnlyClass: centralize domain validation utilities */
export class DomainValidator {
  static readonly EXPECTED_CNAME = process.env.GODEPLOY_CNAME_TARGET || 'godeploy-nginx-o3dvb.ondigitalocean.app'

  static isValidDomainFormat(domain: string): boolean {
    const result = domainSchema.safeParse(domain)
    return result.success
  }

  static normalizeHostname(hostname: string): string {
    return hostname.toLowerCase().replace(/\.$/, '')
  }

  static async validateCnameConfiguration(domain: string): Promise<Result<DomainValidationResult>> {
    // Validate domain format using Zod
    const domainValidation = domainSchema.safeParse(domain)

    if (!domainValidation.success) {
      return {
        data: null,
        error: domainValidation.error.errors[0]?.message || 'Invalid domain format',
      }
    }

    const normalizedDomain = domainValidation.data

    try {
      const cnameRecords = await resolveCname(normalizedDomain)

      if (cnameRecords && cnameRecords.length > 0) {
        const cnameRecord = DomainValidator.normalizeHostname(cnameRecords[0]!)
        const expectedCname = DomainValidator.normalizeHostname(DomainValidator.EXPECTED_CNAME)

        const isValid = cnameRecord === expectedCname

        return {
          data: {
            isValid,
            cnameRecord,
            error: isValid ? undefined : `CNAME points to ${cnameRecord}, expected ${expectedCname}`,
          },
          error: null,
        }
      }

      // No CNAME records found
      return {
        data: {
          isValid: false,
          error: 'No CNAME record found for domain',
        },
        error: null,
      }
    } catch (_error) {
      // DNS resolution error
      return {
        data: {
          isValid: false,
          error: 'No CNAME record found for domain',
        },
        error: null,
      }
    }
  }

  static async checkDomainAvailability(domain: string): Promise<Result<boolean>> {
    try {
      const validationResult = await DomainValidator.validateCnameConfiguration(domain)

      if (validationResult.error) {
        return { data: null, error: validationResult.error }
      }

      return {
        data: !validationResult.data?.isValid,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: `Failed to check domain availability: ${error}`,
      }
    }
  }
}
