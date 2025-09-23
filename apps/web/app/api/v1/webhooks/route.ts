// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { withSecurity, createSecureAPIResponse, createAPIErrorResponse } from '@/lib/security/api-security'
import { validationSchemas } from '@/lib/security/validation'

// Validation schemas
const webhookQuerySchema = z.object({
  page: validationSchemas.page.optional(),
  limit: validationSchemas.limit.optional(),
  event: z.string().optional(),
  status: z.enum(['active', 'inactive', 'error']).optional()
})

const webhookCreateSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum([
    'document.created',
    'document.updated',
    'document.deleted',
    'workflow.started',
    'workflow.completed',
    'workflow.failed',
    'workflow.step.completed',
    'report.generated',
    'report.failed'
  ])),
  description: z.string().optional(),
  secret: z.string().min(16).optional(),
  is_active: z.boolean().default(true)
})

const webhookUpdateSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.enum([
    'document.created',
    'document.updated', 
    'document.deleted',
    'workflow.started',
    'workflow.completed',
    'workflow.failed',
    'workflow.step.completed',
    'report.generated',
    'report.failed'
  ])).optional(),
  description: z.string().optional(),
  secret: z.string().min(16).optional(),
  is_active: z.boolean().optional()
})

/**
 * @swagger
 * /api/v1/webhooks:
 *   get:
 *     summary: List webhooks
 *     description: Retrieve a paginated list of configured webhooks
 *     tags: [Webhooks]
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
 *         name: event
 *         schema:
 *           type: string
 *         description: Filter by event type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, error]
 *         description: Filter by webhook status
 *     responses:
 *       200:
 *         description: List of webhooks
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
 *                       url:
 *                         type: string
 *                         format: uri
 *                       events:
 *                         type: array
 *                         items:
 *                           type: string
 *                       description:
 *                         type: string
 *                       is_active:
 *                         type: boolean
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
async function getWebhooks(request: NextRequest) {
  const supabase = await createClient()
  
  // Parse and validate query parameters
  const url = new URL(request.url)
  const queryParams = Object.fromEntries(url.searchParams.entries())
  
  const validation = webhookQuerySchema.safeParse(queryParams)
  if (!validation.success) {
    return createAPIErrorResponse(
      'Invalid query parameters',
      400,
      { errors: validation.error.errors }
    )
  }

  const { page = 1, limit = 20, event, status } = validation.data

  try {
    // Build query
    let query = supabase
      .from('webhooks')
      .select('id, url, events, description, is_active, created_at, last_triggered_at, failure_count', { count: 'exact' })

    // Apply filters
    if (event) {
      query = query.contains('events', [event])
    }
    if (status) {
      if (status === 'active') {
        query = query.eq('is_active', true)
      } else if (status === 'inactive') {
        query = query.eq('is_active', false)
      } else if (status === 'error') {
        query = query.gt('failure_count', 0)
      }
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      console.error('Webhooks query error:', error)
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
    console.error('Webhooks API error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

/**
 * @swagger
 * /api/v1/webhooks:
 *   post:
 *     summary: Create webhook
 *     description: Register a new webhook endpoint
 *     tags: [Webhooks]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url, events]
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: Webhook endpoint URL
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [document.created, document.updated, document.deleted, workflow.started, workflow.completed, workflow.failed, workflow.step.completed, report.generated, report.failed]
 *                 description: Events to subscribe to
 *               description:
 *                 type: string
 *                 description: Webhook description
 *               secret:
 *                 type: string
 *                 minLength: 16
 *                 description: Secret for webhook signature verification
 *               is_active:
 *                 type: boolean
 *                 default: true
 *                 description: Whether webhook is active
 *     responses:
 *       201:
 *         description: Webhook created successfully
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
 *                     url:
 *                       type: string
 *                       format: uri
 *                     events:
 *                       type: array
 *                       items:
 *                         type: string
 *                     is_active:
 *                       type: boolean
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
async function createWebhook(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = webhookCreateSchema.safeParse(body)
    if (!validation.success) {
      return createAPIErrorResponse(
        'Validation error',
        400,
        { errors: validation.error.errors }
      )
    }

    const { url, events, description, secret, is_active } = validation.data

    // Get authentication context
    const userId = request.headers.get('x-user-id')
    const tenantId = request.headers.get('x-tenant-id')
    
    if (!userId || !tenantId) {
      return createAPIErrorResponse('Authentication context missing', 401)
    }

    // Generate secret if not provided
    const webhookSecret = secret || generateWebhookSecret()

    // Create webhook
    const { data: webhook, error } = await supabase
      .from('webhooks')
      .insert({
        tenant_id: tenantId,
        url,
        events,
        description,
        secret: webhookSecret,
        is_active,
        created_by: userId
      })
      .select('id, url, events, description, is_active, created_at')
      .single()

    if (error) {
      console.error('Webhook creation error:', error)
      return createAPIErrorResponse('Failed to create webhook', 500)
    }

    return createSecureAPIResponse(
      { data: webhook },
      201
    )

  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return createAPIErrorResponse('Invalid JSON body', 400)
    }
    console.error('Create webhook error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

function generateWebhookSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Apply security and rate limiting
export const GET = withSecurity(getWebhooks, {
  requireAPIKey: true,
  rateLimit: 'api',
  validateQuery: webhookQuerySchema
})

export const POST = withSecurity(createWebhook, {
  requireAPIKey: true,
  rateLimit: 'api',
  validateBody: webhookCreateSchema,
  permissions: ['webhooks:write']
})