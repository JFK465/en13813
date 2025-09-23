// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { withSecurity, createSecureAPIResponse, createAPIErrorResponse } from '@/lib/security/api-security'

// Validation schemas
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
 * /api/v1/webhooks/{id}:
 *   get:
 *     summary: Get webhook details
 *     description: Retrieve details of a specific webhook
 *     tags: [Webhooks]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Webhook ID
 *     responses:
 *       200:
 *         description: Webhook details
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
 *                     description:
 *                       type: string
 *                     is_active:
 *                       type: boolean
 *                     failure_count:
 *                       type: integer
 *                     last_triggered_at:
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
async function getWebhook(request: NextRequest, context: { params?: { id: string } }) {
  const params = context.params!;
  const supabase = await createClient()
  
  try {
    const { data: webhook, error } = await supabase
      .from('webhooks')
      .select('id, url, events, description, is_active, failure_count, last_triggered_at, created_at')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createAPIErrorResponse('Webhook not found', 404)
      }
      return createAPIErrorResponse('Database error', 500)
    }

    return createSecureAPIResponse({ data: webhook })

  } catch (error: any) {
    console.error('Get webhook error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

/**
 * @swagger
 * /api/v1/webhooks/{id}:
 *   put:
 *     summary: Update webhook
 *     description: Update an existing webhook configuration
 *     tags: [Webhooks]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Webhook ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *                 description: Whether webhook is active
 *     responses:
 *       200:
 *         description: Webhook updated successfully
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
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
async function updateWebhook(request: NextRequest, context: { params?: { id: string } }) {
  const params = context.params!;
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = webhookUpdateSchema.safeParse(body)
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

    // Update webhook
    const { data: webhook, error } = await supabase
      .from('webhooks')
      .update(updateData)
      .eq('id', params.id)
      .select('id, url, events, description, is_active, created_at')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createAPIErrorResponse('Webhook not found', 404)
      }
      return createAPIErrorResponse('Database error', 500)
    }

    return createSecureAPIResponse({ data: webhook })

  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return createAPIErrorResponse('Invalid JSON body', 400)
    }
    console.error('Update webhook error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

/**
 * @swagger
 * /api/v1/webhooks/{id}:
 *   delete:
 *     summary: Delete webhook
 *     description: Delete a webhook configuration
 *     tags: [Webhooks]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Webhook ID
 *     responses:
 *       204:
 *         description: Webhook deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
async function deleteWebhook(request: NextRequest, context: { params?: { id: string } }) {
  const params = context.params!;
  const supabase = await createClient()
  
  try {
    // Hard delete webhook
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', params.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return createAPIErrorResponse('Webhook not found', 404)
      }
      return createAPIErrorResponse('Database error', 500)
    }

    return new NextResponse(null, { status: 204 })

  } catch (error: any) {
    console.error('Delete webhook error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

/**
 * @swagger
 * /api/v1/webhooks/{id}/test:
 *   post:
 *     summary: Test webhook
 *     description: Send a test event to the webhook endpoint
 *     tags: [Webhooks]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Webhook ID
 *     responses:
 *       200:
 *         description: Test webhook sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status_code:
 *                   type: integer
 *                 response_time:
 *                   type: number
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
async function testWebhook(request: NextRequest, context: { params?: { id: string } }) {
  const params = context.params!;
  const supabase = await createClient()
  
  try {
    // Get webhook details
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', params.id)
      .single()

    if (webhookError || !webhook) {
      return createAPIErrorResponse('Webhook not found', 404)
    }

    // Create test payload
    const testPayload = {
      id: crypto.randomUUID(),
      event: 'webhook.test',
      data: {
        message: 'This is a test webhook event',
        webhook_id: webhook.id,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      tenant_id: webhook.tenant_id
    }

    // Send test webhook
    const startTime = Date.now()
    
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ComplianceSaaS-Webhook/1.0',
          ...(webhook.secret && {
            'X-Webhook-Signature': await generateWebhookSignature(JSON.stringify(testPayload), webhook.secret)
          })
        },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      const responseTime = Date.now() - startTime

      return createSecureAPIResponse({
        success: response.ok,
        status_code: response.status,
        response_time: responseTime,
        message: response.ok ? 'Test webhook sent successfully' : 'Webhook endpoint returned error'
      })

    } catch (fetchError: any) {
      const responseTime = Date.now() - startTime
      
      return createSecureAPIResponse({
        success: false,
        status_code: 0,
        response_time: responseTime,
        error: fetchError.message || 'Failed to send webhook'
      })
    }

  } catch (error: any) {
    console.error('Test webhook error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

async function generateWebhookSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(payload)
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
  const hashArray = Array.from(new Uint8Array(signature))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return `sha256=${hashHex}`
}

// Apply security and rate limiting
export const GET = withSecurity(getWebhook, {
  requireAPIKey: true,
  rateLimit: 'api',
  permissions: ['webhooks:read']
})

export const PUT = withSecurity(updateWebhook, {
  requireAPIKey: true,
  rateLimit: 'api',
  validateBody: webhookUpdateSchema,
  permissions: ['webhooks:write']
})

export const DELETE = withSecurity(deleteWebhook, {
  requireAPIKey: true,
  rateLimit: 'api',
  permissions: ['webhooks:delete']
})

export const POST = withSecurity(testWebhook, {
  requireAPIKey: true,
  rateLimit: 'api',
  permissions: ['webhooks:test']
})