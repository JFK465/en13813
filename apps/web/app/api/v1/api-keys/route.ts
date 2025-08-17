import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { withSecurity, createSecureAPIResponse, createAPIErrorResponse } from '@/lib/security/api-security'
import { validationSchemas } from '@/lib/security/validation'
import crypto from 'crypto'

// Validation schemas
const apiKeyQuerySchema = z.object({
  page: validationSchemas.page.optional(),
  limit: validationSchemas.limit.optional()
})

const apiKeyCreateSchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string()).default([
    'documents:read',
    'documents:write',
    'workflows:read',
    'workflows:write',
    'reports:read'
  ]),
  expires_at: validationSchemas.isoDate.optional()
})

/**
 * @swagger
 * /api/v1/api-keys:
 *   get:
 *     summary: List API keys
 *     description: Retrieve a paginated list of API keys for the current tenant
 *     tags: [API Keys]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, revoked]
 *         description: Filter by API key status
 *     responses:
 *       200:
 *         description: List of API keys
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       key_prefix:
 *                         type: string
 *                         description: First 8 characters of the API key
 *                       permissions:
 *                         type: array
 *                         items:
 *                           type: string
 *                       rate_limit:
 *                         type: integer
 *                       status:
 *                         type: string
 *                         enum: [active, inactive, revoked]
 *                       last_used_at:
 *                         type: string
 *                         format: date-time
 *                       expires_at:
 *                         type: string
 *                         format: date-time
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
async function getApiKeys(request: NextRequest) {
  const supabase = await createClient()
  
  // Parse and validate query parameters
  const url = new URL(request.url)
  const queryParams = Object.fromEntries(url.searchParams.entries())
  
  const validation = apiKeyQuerySchema.safeParse(queryParams)
  if (!validation.success) {
    return createAPIErrorResponse(
      'Invalid query parameters',
      400,
      { errors: validation.error.errors }
    )
  }

  const { page = 1, limit = 20 } = validation.data

  try {
    // Build query
    let query = supabase
      .from('api_keys')
      .select(`
        id,
        name,
        permissions,
        last_used_at,
        expires_at,
        created_at
      `, { count: 'exact' })


    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      console.error('API keys query error:', error)
      return createAPIErrorResponse('Database error', 500)
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return createSecureAPIResponse({
      data: data || [],
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    })

  } catch (error: any) {
    console.error('API keys API error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

/**
 * @swagger
 * /api/v1/api-keys:
 *   post:
 *     summary: Create API key
 *     description: Generate a new API key for programmatic access
 *     tags: [API Keys]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Human-readable name for the API key
 *               description:
 *                 type: string
 *                 description: Optional description
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 default: [documents:read, documents:write, workflows:read, workflows:write, reports:read]
 *                 description: Array of permissions to grant
 *               rate_limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10000
 *                 default: 100
 *                 description: Requests per minute limit
 *               expires_at:
 *                 type: string
 *                 format: date-time
 *                 description: Optional expiration date
 *     responses:
 *       201:
 *         description: API key created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     api_key:
 *                       type: string
 *                       description: The generated API key (only shown once)
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     rate_limit:
 *                       type: integer
 *                     expires_at:
 *                       type: string
 *                       format: date-time
 *                 warning:
 *                   type: string
 *                   description: Security warning about storing the key
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
async function createApiKey(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = apiKeyCreateSchema.safeParse(body)
    if (!validation.success) {
      return createAPIErrorResponse(
        'Validation error',
        400,
        { errors: validation.error.errors }
      )
    }

    const { name, permissions, expires_at } = validation.data

    // Get authentication context
    const userId = request.headers.get('x-user-id')
    const tenantId = request.headers.get('x-tenant-id')
    
    if (!userId || !tenantId) {
      return createAPIErrorResponse('Authentication context missing', 401)
    }

    // Generate API key
    const apiKey = generateApiKey()
    const hashedKey = hashApiKey(apiKey)
    const keyPrefix = apiKey.substring(0, 8)

    // Create API key record
    const { data: newApiKey, error } = await supabase
      .from('api_keys')
      .insert({
        tenant_id: tenantId,
        name,
        key: apiKey,
        permissions,
        expires_at,
        created_by: userId
      })
      .select(`
        id,
        name,
        permissions,
        expires_at,
        created_at
      `)
      .single()

    if (error) {
      console.error('API key creation error:', error)
      return createAPIErrorResponse('Failed to create API key', 500)
    }

    return createSecureAPIResponse(
      {
        data: {
          ...newApiKey,
          api_key: apiKey // Only shown once
        },
        warning: 'Store this API key securely. It will not be shown again.'
      },
      201
    )

  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return createAPIErrorResponse('Invalid JSON body', 400)
    }
    console.error('Create API key error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

function generateApiKey(): string {
  // Generate a secure API key with prefix
  const prefix = 'sk_'
  const randomBytes = crypto.randomBytes(32)
  const key = randomBytes.toString('base64url') // URL-safe base64
  return prefix + key
}

function hashApiKey(apiKey: string): string {
  // Hash the API key for secure storage
  return crypto.createHash('sha256').update(apiKey).digest('hex')
}

// Apply security and rate limiting
export const GET = withSecurity(getApiKeys, {
  requireAPIKey: true,
  rateLimit: 'api',
  validateQuery: apiKeyQuerySchema,
  permissions: ['api_keys:read']
})

export const POST = withSecurity(createApiKey, {
  requireAPIKey: true,
  rateLimit: 'api',
  validateBody: apiKeyCreateSchema,
  permissions: ['api_keys:write']
})