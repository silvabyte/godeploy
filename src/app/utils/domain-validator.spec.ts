import { describe, expect, it } from 'bun:test'
import { DomainValidator } from './domain-validator'

describe('DomainValidator', () => {
  describe('isValidDomainFormat', () => {
    it('should validate correct domain formats', () => {
      expect(DomainValidator.isValidDomainFormat('example.com')).toBe(true)
      expect(DomainValidator.isValidDomainFormat('sub.example.com')).toBe(true)
      expect(DomainValidator.isValidDomainFormat('sub-domain.example.com')).toBe(true)
      expect(DomainValidator.isValidDomainFormat('123.example.com')).toBe(true)
      expect(DomainValidator.isValidDomainFormat('EXAMPLE.COM')).toBe(true) // Should work with uppercase
      expect(DomainValidator.isValidDomainFormat('a.b.c.example.com')).toBe(true) // Multiple subdomains
      expect(DomainValidator.isValidDomainFormat('my-app.example.co.uk')).toBe(true) // Country TLDs
      expect(DomainValidator.isValidDomainFormat('app123.example.io')).toBe(true) // Numbers in subdomain
      expect(DomainValidator.isValidDomainFormat('xn--example.com')).toBe(true) // Punycode domains
    })

    it('should reject invalid domain formats', () => {
      expect(DomainValidator.isValidDomainFormat('')).toBe(false) // Empty
      expect(DomainValidator.isValidDomainFormat('example')).toBe(false) // No TLD
      expect(DomainValidator.isValidDomainFormat('example.')).toBe(false) // Trailing dot
      expect(DomainValidator.isValidDomainFormat('.example.com')).toBe(false) // Leading dot
      expect(DomainValidator.isValidDomainFormat('example..com')).toBe(false) // Consecutive dots
      expect(DomainValidator.isValidDomainFormat('-example.com')).toBe(false) // Leading dash
      expect(DomainValidator.isValidDomainFormat('example-.com')).toBe(false) // Trailing dash
      expect(DomainValidator.isValidDomainFormat('exam ple.com')).toBe(false) // Space
      expect(DomainValidator.isValidDomainFormat('example.com/')).toBe(false) // Path
      expect(DomainValidator.isValidDomainFormat('http://example.com')).toBe(false) // Protocol
      expect(DomainValidator.isValidDomainFormat('example.c')).toBe(false) // TLD too short
      expect(DomainValidator.isValidDomainFormat(`${'a'.repeat(64)}.com`)).toBe(false) // Label too long
    })
  })

  describe('normalizeHostname', () => {
    it('should normalize hostnames correctly', () => {
      expect(DomainValidator.normalizeHostname('EXAMPLE.COM')).toBe('example.com')
      expect(DomainValidator.normalizeHostname('example.com.')).toBe('example.com')
      expect(DomainValidator.normalizeHostname('EXAMPLE.COM.')).toBe('example.com')
    })
  })

  describe('validateCnameConfiguration', () => {
    it('should reject invalid domain format', async () => {
      const result = await DomainValidator.validateCnameConfiguration('invalid..domain')

      expect(result.error).toBe('Invalid domain format')
      expect(result.data).toBeNull()
    })

    it('should transform domain to lowercase', async () => {
      // Test with a domain that likely doesn't exist
      const result = await DomainValidator.validateCnameConfiguration('THISISANONEXISTENTDOMAINFORSURE123456.COM')

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data?.isValid).toBe(false)
      expect(result.data?.error).toBe('No CNAME record found for domain')
    })

    it('should handle real domain with correct CNAME', async () => {
      // Test with audetic.ai which we know has the correct CNAME
      const result = await DomainValidator.validateCnameConfiguration('audetic.ai')

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data?.isValid).toBe(true)
      expect(result.data?.cnameRecord).toBe('godeploy-nginx-o3dvb.ondigitalocean.app')
    })

    it('should handle domain without CNAME', async () => {
      // Test with a domain that likely doesn't have our CNAME
      const result = await DomainValidator.validateCnameConfiguration('google.com')

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data?.isValid).toBe(false)
    })
  })

  describe('checkDomainAvailability', () => {
    it('should return false for domain with correct CNAME', async () => {
      // Test with audetic.ai which has correct CNAME
      const result = await DomainValidator.checkDomainAvailability('audetic.ai')

      expect(result.error).toBeNull()
      expect(result.data).toBe(false) // Not available because it has the correct CNAME
    })

    it('should return true for non-existent domains', async () => {
      const result = await DomainValidator.checkDomainAvailability('thisisanonexistentdomainforsure123456.com')

      expect(result.error).toBeNull()
      expect(result.data).toBe(true) // Available because no CNAME
    })
  })

  describe('EXPECTED_CNAME configuration', () => {
    it('should have the expected default value or env value', () => {
      // Just check that EXPECTED_CNAME is set to something
      expect(DomainValidator.EXPECTED_CNAME).toBeTruthy()
      expect(typeof DomainValidator.EXPECTED_CNAME).toBe('string')
      // Should be either the env var or the default
      const expectedValue = process.env.GODEPLOY_CNAME_TARGET || 'godeploy-nginx-o3dvb.ondigitalocean.app'
      expect(DomainValidator.EXPECTED_CNAME).toBe(expectedValue)
    })
  })
})
