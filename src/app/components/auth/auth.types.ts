import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { commonResponseSchemas } from '../http/response.types'

// Request schemas
export const authInitSchema = z.object({
  email: z.string().email('Invalid email format'),
  redirect_uri: z.string(),
})

export const magicLinkSchema = z.object({
  redirect_to: z.string(),
  token: z.string().optional(),
})

// Password auth schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

export const resetPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  redirect_uri: z.string().optional(),
})

export const resetPasswordConfirmSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

// Response schemas
export const authInitSuccessSchema = z.object({
  success: z.literal(true),
  message: z.string(),
})

export const authInitErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
})

export const authVerifySuccessSchema = z.object({
  valid: z.literal(true),
  user: z.object({
    id: z.string(),
    email: z.string(),
    tenant_id: z.string(),
  }),
})

export const authVerifyErrorSchema = z.object({
  valid: z.literal(false),
  error: z.string(),
})

// Password auth response schemas
export const authTokenResponseSchema = z.object({
  success: z.literal(true),
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    tenant_id: z.string(),
  }),
})

export const authErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
})

// Generate JSON schemas
export const authInitJsonSchema = zodToJsonSchema(authInitSchema)
export const magicLinkJsonSchema = zodToJsonSchema(magicLinkSchema)
export const authInitSuccessJsonSchema = zodToJsonSchema(authInitSuccessSchema)
export const authInitErrorJsonSchema = zodToJsonSchema(authInitErrorSchema)
export const authVerifySuccessJsonSchema = zodToJsonSchema(authVerifySuccessSchema)
export const authVerifyErrorJsonSchema = zodToJsonSchema(authVerifyErrorSchema)

// Password auth JSON schemas
export const signUpJsonSchema = zodToJsonSchema(signUpSchema)
export const signInJsonSchema = zodToJsonSchema(signInSchema)
export const changePasswordJsonSchema = zodToJsonSchema(changePasswordSchema)
export const resetPasswordRequestJsonSchema = zodToJsonSchema(resetPasswordRequestSchema)
export const resetPasswordConfirmJsonSchema = zodToJsonSchema(resetPasswordConfirmSchema)
export const authTokenResponseJsonSchema = zodToJsonSchema(authTokenResponseSchema)
export const authErrorResponseJsonSchema = zodToJsonSchema(authErrorResponseSchema)

// Route schemas
export const routeSchemas = {
  authInit: {
    schema: {
      body: authInitJsonSchema,
      response: {
        200: authInitSuccessJsonSchema,
        400: authInitErrorJsonSchema,
        500: commonResponseSchemas.error,
      },
    },
  },
  magicLink: {
    schema: {
      querystring: magicLinkJsonSchema,
      response: {
        302: z.void(), // Redirect response
        500: commonResponseSchemas.error,
      },
    },
  },
  authVerify: {
    schema: {
      security: [{ bearerAuth: [] }],
      response: {
        200: authVerifySuccessJsonSchema,
        401: authVerifyErrorJsonSchema,
        500: commonResponseSchemas.error,
      },
    },
  },
  signUp: {
    schema: {
      body: signUpJsonSchema,
      response: {
        201: authTokenResponseJsonSchema,
        400: authErrorResponseJsonSchema,
        500: commonResponseSchemas.error,
      },
    },
  },
  signIn: {
    schema: {
      body: signInJsonSchema,
      response: {
        200: authTokenResponseJsonSchema,
        401: authErrorResponseJsonSchema,
        500: commonResponseSchemas.error,
      },
    },
  },
  changePassword: {
    schema: {
      security: [{ bearerAuth: [] }],
      body: changePasswordJsonSchema,
      response: {
        200: authInitSuccessJsonSchema,
        401: authErrorResponseJsonSchema,
        500: commonResponseSchemas.error,
      },
    },
  },
  resetPasswordRequest: {
    schema: {
      body: resetPasswordRequestJsonSchema,
      response: {
        200: authInitSuccessJsonSchema,
        400: authErrorResponseJsonSchema,
        500: commonResponseSchemas.error,
      },
    },
  },
  resetPasswordConfirm: {
    schema: {
      body: resetPasswordConfirmJsonSchema,
      response: {
        200: authInitSuccessJsonSchema,
        400: authErrorResponseJsonSchema,
        500: commonResponseSchemas.error,
      },
    },
  },
}

// Type exports
export type AuthInitBody = z.infer<typeof authInitSchema>
export type MagicLinkQuerystring = z.infer<typeof magicLinkSchema>

// Password auth type exports
export type SignUpBody = z.infer<typeof signUpSchema>
export type SignInBody = z.infer<typeof signInSchema>
export type ChangePasswordBody = z.infer<typeof changePasswordSchema>
export type ResetPasswordRequestBody = z.infer<typeof resetPasswordRequestSchema>
export type ResetPasswordConfirmBody = z.infer<typeof resetPasswordConfirmSchema>
