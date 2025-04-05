import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { commonResponseSchemas } from '../http/response.types';

// Request schemas
export const authInitSchema = z.object({
  email: z.string().email('Invalid email format'),
  redirect_uri: z.string(),
});

export const magicLinkSchema = z.object({
  redirect_to: z.string(),
  token: z.string().optional(),
});

// Response schemas
export const authInitSuccessSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export const authInitErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

export const authVerifySuccessSchema = z.object({
  valid: z.literal(true),
  user: z.object({
    id: z.string(),
    email: z.string(),
    tenant_id: z.string(),
  }),
});

export const authVerifyErrorSchema = z.object({
  valid: z.literal(false),
  error: z.string(),
});

// Generate JSON schemas
export const authInitJsonSchema = zodToJsonSchema(authInitSchema);
export const magicLinkJsonSchema = zodToJsonSchema(magicLinkSchema);
export const authInitSuccessJsonSchema = zodToJsonSchema(authInitSuccessSchema);
export const authInitErrorJsonSchema = zodToJsonSchema(authInitErrorSchema);
export const authVerifySuccessJsonSchema = zodToJsonSchema(
  authVerifySuccessSchema
);
export const authVerifyErrorJsonSchema = zodToJsonSchema(authVerifyErrorSchema);

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
};

// Type exports
export type AuthInitBody = z.infer<typeof authInitSchema>;
export type MagicLinkQuerystring = z.infer<typeof magicLinkSchema>;
export type AuthInitSuccessResponse = z.infer<typeof authInitSuccessSchema>;
export type AuthInitErrorResponse = z.infer<typeof authInitErrorSchema>;
export type AuthVerifySuccessResponse = z.infer<typeof authVerifySuccessSchema>;
export type AuthVerifyErrorResponse = z.infer<typeof authVerifyErrorSchema>;
