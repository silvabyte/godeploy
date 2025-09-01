import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { DomainValidator } from '../utils/domain-validator'
import { commonResponseSchemas } from '../components/http/response.types'

// Request schemas
const validateDomainSchema = z.object({
  domain: z.string().describe('Domain to validate CNAME configuration'),
})

const checkDomainAvailabilitySchema = z.object({
  domain: z.string().describe('Domain to check availability'),
  projectId: z.string().optional().describe('Project ID to exclude from availability check (for updates)'),
})

// Response schemas
const domainValidationResponseSchema = z.object({
  isValid: z.boolean(),
  cnameRecord: z.string().optional(),
  error: z.string().optional(),
})

const domainAvailabilityResponseSchema = z.object({
  available: z.boolean(),
  reason: z.string().optional(),
})

const cnameTargetResponseSchema = z.object({
  target: z.string(),
})

// Generate JSON schemas
const validateDomainJsonSchema = zodToJsonSchema(validateDomainSchema)
const checkDomainAvailabilityJsonSchema = zodToJsonSchema(checkDomainAvailabilitySchema)
const domainValidationResponseJsonSchema = zodToJsonSchema(domainValidationResponseSchema)
const domainAvailabilityResponseJsonSchema = zodToJsonSchema(domainAvailabilityResponseSchema)
const cnameTargetResponseJsonSchema = zodToJsonSchema(cnameTargetResponseSchema)

// Type exports
type ValidateDomainBody = z.infer<typeof validateDomainSchema>
type CheckDomainAvailabilityBody = z.infer<typeof checkDomainAvailabilitySchema>

export default async function (fastify: FastifyInstance) {
  // Public endpoint - Get the CNAME target for domain configuration
  fastify.get('/api/domains/cname-target', {
    schema: {
      response: {
        200: cnameTargetResponseJsonSchema,
      },
    },
    handler: async (_request: FastifyRequest, reply: FastifyReply) => {
      return reply.code(200).send({
        target: DomainValidator.EXPECTED_CNAME,
      })
    },
  })

  // Public endpoint - Validate domain CNAME configuration
  fastify.post('/api/domains/validate', {
    schema: {
      body: validateDomainJsonSchema,
      response: {
        200: domainValidationResponseJsonSchema,
        400: commonResponseSchemas.error,
        500: commonResponseSchemas.error,
      },
    },
    handler: async (
      request: FastifyRequest<{
        Body: ValidateDomainBody
      }>,
      reply: FastifyReply,
    ) => {
      const { domain } = request.body

      request.measure.start('validate_domain_cname', {
        reqId: request.id,
        domain,
      })

      // Validate domain format
      if (!DomainValidator.isValidDomainFormat(domain)) {
        request.measure.failure('Invalid domain format')
        return reply.code(400).send({
          error: 'Invalid domain format',
          message: 'The provided domain is not in a valid format',
        })
      }

      // Validate CNAME configuration
      request.measure.add('check_cname')
      const validationResult = await DomainValidator.validateCnameConfiguration(domain)

      if (validationResult.error) {
        request.measure.failure(validationResult.error)
        return reply.code(500).send({
          error: 'Failed to validate domain',
          message: validationResult.error,
        })
      }

      request.measure.success()
      return reply.code(200).send(validationResult.data)
    },
  })

  // Authenticated endpoint - Check domain availability
  fastify.post('/api/domains/check-availability', {
    schema: {
      security: [{ bearerAuth: [] }],
      body: checkDomainAvailabilityJsonSchema,
      response: {
        200: domainAvailabilityResponseJsonSchema,
        400: commonResponseSchemas.error,
        500: commonResponseSchemas.error,
      },
    },
    handler: async (
      request: FastifyRequest<{
        Body: CheckDomainAvailabilityBody
      }>,
      reply: FastifyReply,
    ) => {
      const { domain, projectId } = request.body
      const { tenant_id } = request.user

      request.measure.start('check_domain_availability', {
        reqId: request.id,
        userId: request.user.user_id,
        tenantId: tenant_id,
        domain,
        projectId,
      })

      // Validate domain format
      if (!DomainValidator.isValidDomainFormat(domain)) {
        request.measure.failure('Invalid domain format')
        return reply.code(400).send({
          error: 'Invalid domain format',
          message: 'The provided domain is not in a valid format',
        })
      }

      // Check if domain is already in use by another project
      request.measure.add('check_existing_usage')
      const availabilityResult = await request.db.projects.isDomainAvailable(domain, projectId)

      if (availabilityResult.error) {
        request.measure.failure(availabilityResult.error)
        return reply.code(500).send({
          error: 'Failed to check domain availability',
          message: availabilityResult.error,
        })
      }

      if (!availabilityResult.data) {
        request.measure.success()
        return reply.code(200).send({
          available: false,
          reason: 'Domain is already in use by another project',
        })
      }

      // Check CNAME configuration
      request.measure.add('validate_cname')
      const validationResult = await DomainValidator.validateCnameConfiguration(domain)

      if (validationResult.error) {
        request.measure.failure(validationResult.error)
        return reply.code(500).send({
          error: 'Failed to validate domain',
          message: validationResult.error,
        })
      }

      // Domain is available if it's not in use and has valid CNAME
      const isAvailable = availabilityResult.data && validationResult.data?.isValid === true

      request.measure.success()
      return reply.code(200).send({
        available: isAvailable,
        reason: isAvailable ? undefined : validationResult.data?.error || 'Domain CNAME is not properly configured',
      })
    },
  })
}
