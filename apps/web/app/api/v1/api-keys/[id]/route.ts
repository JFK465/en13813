// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { withSecurity, createSecureAPIResponse, createAPIErrorResponse } from '@/lib/security/api-security'

// Validation schemas
const apiKeyUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  rate_limit: z.number().min(1).max(10000).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  expires_at: z.string().datetime().optional()
})

/**
 * @swagger
 * /api/v1/api-keys/{id}:
 *   get:
 *     summary: Get API key details
 *     description: Retrieve details of a specific API key
 *     tags: [API Keys]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: API key ID
 *     responses:
 *       200:
 *         description: API key details
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
 *                     description:
 *                       type: string
 *                     key_prefix:
 *                       type: string
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     rate_limit:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [active, inactive, revoked]
 *                     usage_count:
 *                       type: integer
 *                     last_used_at:
 *                       type: string
 *                       format: date-time
 *                     expires_at:
 *                       type: string
 *                       format: date-time
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
async function getApiKey(request: NextRequest, context: { params?: { id: string } }) {
  const params = context.params!;
  const supabase = await createClient()
  
  try {
    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .select(`
        id,
        name,
        description,
        key_prefix,
        permissions,
        rate_limit,
        status,
        usage_count,
        last_used_at,
        expires_at,
        created_at
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createAPIErrorResponse('API key not found', 404)
      }
      return createAPIErrorResponse('Database error', 500)
    }

    return createSecureAPIResponse({ data: apiKey })

  } catch (error: any) {
    console.error('Get API key error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

/**
 * @swagger
 * /api/v1/api-keys/{id}:
 *   put:
 *     summary: Update API key
 *     description: Update an existing API key configuration
 *     tags: [API Keys]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: API key ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *                 description: Array of permissions to grant
 *               rate_limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10000
 *                 description: Requests per minute limit
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: API key status
 *               expires_at:
 *                 type: string
 *                 format: date-time
 *                 description: Expiration date
 *     responses:
 *       200:
 *         description: API key updated successfully
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
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     status:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
async function updateApiKey(request: NextRequest, context: { params?: { id: string } }) {
  const params = context.params!;
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = apiKeyUpdateSchema.safeParse(body)
    if (!validation.success) {
      return createAPIErrorResponse(
        'Validation error',
        400,
        { errors: validation.error.errors }
      )
    }

    const updateData = {
      ...validation.data,
      updated_at: new Date().toISOString()
    }

    // Update API key
    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        id,
        name,
        description,
        key_prefix,
        permissions,
        rate_limit,
        status,
        expires_at,
        created_at
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createAPIErrorResponse('API key not found', 404)
      }
      return createAPIErrorResponse('Database error', 500)
    }

    return createSecureAPIResponse({ data: apiKey })

  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return createAPIErrorResponse('Invalid JSON body', 400)
    }
    console.error('Update API key error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

/**
 * @swagger
 * /api/v1/api-keys/{id}:
 *   delete:
 *     summary: Revoke API key
 *     description: Revoke an API key (sets status to revoked)
 *     tags: [API Keys]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: API key ID
 *     responses:
 *       204:
 *         description: API key revoked successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
async function revokeApiKey(request: NextRequest, context: { params?: { id: string } }) {
  const params = context.params!;
  const supabase = await createClient()
  
  try {
    // Revoke API key (set status to revoked)
    const { error } = await supabase
      .from('api_keys')
      .update({ 
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return createAPIErrorResponse('API key not found', 404)
      }
      return createAPIErrorResponse('Database error', 500)
    }

    return new NextResponse(null, { status: 204 })

  } catch (error: any) {
    console.error('Revoke API key error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

/**
 * @swagger
 * /api/v1/api-keys/{id}/rotate:
 *   post:
 *     summary: Rotate API key
 *     description: Generate a new API key value while keeping the same ID and configuration
 *     tags: [API Keys]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: API key ID
 *     responses:
 *       200:
 *         description: API key rotated successfully
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
 *                     api_key:
 *                       type: string
 *                       description: The new API key (only shown once)
 *                     key_prefix:
 *                       type: string
 *                 warning:
 *                   type: string
 *                   description: Security warning about updating integrations
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
async function rotateApiKey(request: NextRequest, context: { params?: { id: string } }) {
  const params = context.params!;
  const supabase = await createClient()
  
  try {
    // Check if API key exists and is not revoked
    const { data: existingKey, error: checkError } = await supabase
      .from('api_keys')
      .select('id, revoked_at')
      .eq('id', params.id)
      .single()

    if (checkError || !existingKey) {
      return createAPIErrorResponse('API key not found', 404)
    }

    if (existingKey.revoked_at) {
      return createAPIErrorResponse('Cannot rotate a revoked API key', 400)
    }

    // Generate new API key
    const crypto = await import('crypto')
    
    function generateApiKey(): string {
      const prefix = 'sk_'
      const randomBytes = crypto.default.randomBytes(32)
      const key = randomBytes.toString('base64url')
      return prefix + key
    }
    
    function hashApiKey(apiKey: string): string {
      return crypto.default.createHash('sha256').update(apiKey).digest('hex')
    }
    
    const newApiKey = generateApiKey()
    const hashedKey = hashApiKey(newApiKey)
    const keyPrefix = newApiKey.substring(0, 8)

    // Update API key with new values
    const { data: rotatedKey, error: updateError } = await supabase
      .from('api_keys')
      .update({
        key: newApiKey
      })
      .eq('id', params.id)
      .select('id, name')
      .single()

    if (updateError) {
      return createAPIErrorResponse('Failed to rotate API key', 500)
    }

    return createSecureAPIResponse({
      data: {
        ...rotatedKey,
        api_key: newApiKey // Only shown once
      },
      warning: 'Update your integrations with the new API key immediately. The old key is no longer valid.'
    })

  } catch (error: any) {
    console.error('Rotate API key error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

// Apply security and rate limiting
export const GET = withSecurity(getApiKey, {
  requireAPIKey: true,
  rateLimit: 'api',
  permissions: ['api_keys:read']
})

export const PUT = withSecurity(updateApiKey, {
  requireAPIKey: true,
  rateLimit: 'api',
  validateBody: apiKeyUpdateSchema,
  permissions: ['api_keys:write']
})

export const DELETE = withSecurity(revokeApiKey, {
  requireAPIKey: true,
  rateLimit: 'api',
  permissions: ['api_keys:delete']
})

export const POST = withSecurity(rotateApiKey, {
  requireAPIKey: true,
  rateLimit: 'api',
  permissions: ['api_keys:write']
})