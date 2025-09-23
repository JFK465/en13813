// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { withSecurity, createSecureAPIResponse, createAPIErrorResponse } from '@/lib/security/api-security'
import { validationSchemas } from '@/lib/security/validation'

// Validation schemas
const workflowQuerySchema = z.object({
  page: validationSchemas.page.optional(),
  limit: validationSchemas.limit.optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  resourceType: z.string().optional(),
  assignedToMe: z.boolean().optional()
})

const startWorkflowSchema = z.object({
  workflowId: validationSchemas.uuid,
  resourceType: z.string().min(1),
  resourceId: validationSchemas.uuid,
  title: validationSchemas.workflowTitle,
  description: validationSchemas.workflowDescription.optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dueDate: validationSchemas.isoDate.optional(),
  data: z.object({}).optional(),
  context: z.object({}).optional()
})

/**
 * @swagger
 * /api/v1/workflows:
 *   get:
 *     summary: List workflow instances
 *     description: Retrieve a paginated list of workflow instances with optional filtering
 *     tags: [Workflows]
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
 *           enum: [pending, in_progress, completed, failed, cancelled]
 *         description: Filter by workflow status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by priority
 *       - in: query
 *         name: resourceType
 *         schema:
 *           type: string
 *         description: Filter by resource type
 *       - in: query
 *         name: assignedToMe
 *         schema:
 *           type: boolean
 *         description: Filter workflows assigned to the current user
 *     responses:
 *       200:
 *         description: List of workflow instances
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WorkflowInstance'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
async function getWorkflows(request: NextRequest) {
  const supabase = await createClient()
  
  // Parse and validate query parameters
  const url = new URL(request.url)
  const queryParams = Object.fromEntries(url.searchParams.entries())

  // Convert string boolean to actual boolean
  const processedParams = {
    ...queryParams,
    assignedToMe: queryParams.assignedToMe === 'true'
  }

  const validation = workflowQuerySchema.safeParse(processedParams)
  if (!validation.success) {
    return createAPIErrorResponse(
      'Invalid query parameters',
      400,
      { errors: validation.error.errors }
    )
  }

  const { page = 1, limit = 20, status, priority, resourceType, assignedToMe } = validation.data

  try {
    // Build query
    let query = supabase
      .from('workflow_instances')
      .select(`
        *,
        workflows(name, type),
        workflow_steps(*)
      `, { count: 'exact' })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (priority) {
      query = query.eq('priority', priority)
    }
    if (resourceType) {
      query = query.eq('resource_type', resourceType)
    }

    // Handle assignedToMe filter
    if (assignedToMe) {
      const userId = request.headers.get('x-user-id')
      if (userId) {
        // Join with workflow_steps to find instances where user is assigned
        const { data: assignedSteps } = await supabase
          .from('workflow_steps')
          .select('instance_id')
          .eq('assigned_to', userId)
          .in('status', ['pending', 'in_progress'])

        if (assignedSteps && assignedSteps.length > 0) {
          const instanceIds = assignedSteps.map(step => step.instance_id)
          query = query.in('id', instanceIds)
        } else {
          // No assigned workflows, return empty result
          return createSecureAPIResponse({
            data: [],
            meta: { page, limit, total: 0, totalPages: 0 }
          })
        }
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
      console.error('Workflows query error:', error)
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
    console.error('Workflows API error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

/**
 * @swagger
 * /api/v1/workflows:
 *   post:
 *     summary: Start a new workflow
 *     description: Start a new workflow instance
 *     tags: [Workflows]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workflowId, resourceType, resourceId, title]
 *             properties:
 *               workflowId:
 *                 type: string
 *                 format: uuid
 *                 description: Workflow template ID
 *               resourceType:
 *                 type: string
 *                 description: Type of resource being processed
 *               resourceId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of resource being processed
 *               title:
 *                 type: string
 *                 description: Workflow title
 *               description:
 *                 type: string
 *                 description: Workflow description
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Due date
 *               data:
 *                 type: object
 *                 description: Workflow data
 *               context:
 *                 type: object
 *                 description: Additional context
 *     responses:
 *       201:
 *         description: Workflow started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/WorkflowInstance'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
async function startWorkflow(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = startWorkflowSchema.safeParse(body)
    if (!validation.success) {
      return createAPIErrorResponse(
        'Validation error',
        400,
        { errors: validation.error.errors }
      )
    }

    const {
      workflowId,
      resourceType,
      resourceId,
      title,
      description,
      priority = 'medium',
      dueDate,
      data = {},
      context = {}
    } = validation.data

    // Get authentication context
    const userId = request.headers.get('x-user-id')
    const tenantId = request.headers.get('x-tenant-id')
    
    if (!userId || !tenantId) {
      return createAPIErrorResponse('Authentication context missing', 401)
    }

    // Verify workflow template exists and is active
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('is_template', true)
      .eq('status', 'active')
      .single()

    if (workflowError || !workflow) {
      return createAPIErrorResponse('Workflow template not found or inactive', 404)
    }

    // Create workflow instance
    const { data: instance, error: instanceError } = await supabase
      .from('workflow_instances')
      .insert({
        workflow_id: workflowId,
        tenant_id: tenantId,
        resource_type: resourceType,
        resource_id: resourceId,
        title,
        description,
        priority,
        due_date: dueDate,
        data,
        context,
        status: 'pending',
        started_by: userId,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (instanceError) {
      console.error('Workflow instance creation error:', instanceError)
      return createAPIErrorResponse('Failed to start workflow', 500)
    }

    // Create workflow steps from template
    const stepDefinitions = (workflow.config as any)?.steps || []
    if (stepDefinitions.length > 0) {
      const stepsData = stepDefinitions.map((stepDef: any, index: number) => ({
        instance_id: instance.id,
        tenant_id: tenantId,
        step_name: stepDef.name,
        step_type: stepDef.type,
        step_order: index + 1,
        assigned_to: stepDef.assignedTo,
        assigned_role: stepDef.assignedRole,
        assigned_group: stepDef.assignedGroup,
        config: stepDef.config || {},
        requirements: stepDef.requirements || {},
        status: 'pending'
      }))

      const { error: stepsError } = await supabase
        .from('workflow_steps')
        .insert(stepsData)

      if (stepsError) {
        console.error('Workflow steps creation error:', stepsError)
        // Clean up the instance if steps creation fails
        await supabase
          .from('workflow_instances')
          .delete()
          .eq('id', instance.id)
        
        return createAPIErrorResponse('Failed to create workflow steps', 500)
      }

      // Start first step if auto-start is enabled
      const config = workflow.config as any
      if (config?.autoStart && stepsData.length > 0) {
        await supabase
          .from('workflow_steps')
          .update({
            status: 'in_progress',
            started_at: new Date().toISOString()
          })
          .eq('instance_id', instance.id)
          .eq('step_order', 1)

        // Update instance status and current step
        await supabase
          .from('workflow_instances')
          .update({
            status: 'in_progress',
            current_step_id: stepsData[0].id
          })
          .eq('id', instance.id)
      }
    }

    return createSecureAPIResponse(
      { data: instance },
      201
    )

  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return createAPIErrorResponse('Invalid JSON body', 400)
    }
    console.error('Start workflow error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

// Apply security and rate limiting
export const GET = withSecurity(getWorkflows, {
  requireAPIKey: true,
  rateLimit: 'api',
  validateQuery: workflowQuerySchema
})

export const POST = withSecurity(startWorkflow, {
  requireAPIKey: true,
  rateLimit: 'api',
  validateBody: startWorkflowSchema,
  permissions: ['workflows:write']
})