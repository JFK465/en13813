// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { withSecurity, createSecureAPIResponse, createAPIErrorResponse } from '@/lib/security/api-security'
import { validationSchemas } from '@/lib/security/validation'

// Validation schemas
const stepActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'request_changes', 'delegate', 'comment']),
  decision: z.string().optional(),
  comments: z.string().optional(),
  delegateTo: validationSchemas.uuid.optional()
})

/**
 * @swagger
 * /api/v1/workflows/{id}/steps/{stepId}:
 *   get:
 *     summary: Get workflow step details
 *     description: Retrieve details of a specific workflow step
 *     tags: [Workflows]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Workflow instance ID
 *       - in: path
 *         name: stepId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Workflow step ID
 *     responses:
 *       200:
 *         description: Workflow step details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/WorkflowStep'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
async function getWorkflowStep(
  request: NextRequest,
  { params }: { params: { id: string; stepId: string } }
) {
  const supabase = await createClient()
  
  try {
    const { data: step, error } = await (supabase as any)
      .from('workflow_steps')
      .select(`
        *,
        workflow_instances!inner(id, title, status)
      `)
      .eq('id', params.stepId)
      .eq('instance_id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createAPIErrorResponse('Workflow step not found', 404)
      }
      return createAPIErrorResponse('Database error', 500)
    }

    return createSecureAPIResponse({ data: step })

  } catch (error: any) {
    console.error('Get workflow step error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

/**
 * @swagger
 * /api/v1/workflows/{id}/steps/{stepId}:
 *   post:
 *     summary: Perform action on workflow step
 *     description: Approve, reject, or perform other actions on a workflow step
 *     tags: [Workflows]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Workflow instance ID
 *       - in: path
 *         name: stepId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Workflow step ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkflowStepAction'
 *     responses:
 *       200:
 *         description: Action performed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/WorkflowStep'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
async function performStepAction(
  request: NextRequest,
  { params }: { params: { id: string; stepId: string } }
) {
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = stepActionSchema.safeParse(body)
    if (!validation.success) {
      return createAPIErrorResponse(
        'Validation error',
        400,
        { errors: validation.error.errors }
      )
    }

    const { action, decision, comments, delegateTo } = validation.data

    // Get authentication context
    const userId = request.headers.get('x-user-id')
    const tenantId = request.headers.get('x-tenant-id')
    
    if (!userId || !tenantId) {
      return createAPIErrorResponse('Authentication context missing', 401)
    }

    // Get workflow step and validate permissions
    const { data: step, error: stepError } = await supabase
      .from('workflow_steps')
      .select(`
        *,
        workflow_instances!inner(id, title, status, tenant_id)
      `)
      .eq('id', params.stepId)
      .eq('instance_id', params.id)
      .single()

    if (stepError || !step) {
      return createAPIErrorResponse('Workflow step not found', 404)
    }

    // Check if user is authorized to perform this action
    const isAssigned = step.assigned_to === userId
    const hasRole = step.assigned_role && request.headers.get('x-user-roles')?.includes(step.assigned_role)
    const hasGroup = step.assigned_group && request.headers.get('x-user-groups')?.includes(step.assigned_group)

    if (!isAssigned && !hasRole && !hasGroup) {
      return createAPIErrorResponse('Not authorized to perform this action', 403)
    }

    // Validate step can be acted upon
    if (step.status !== 'pending' && step.status !== 'in_progress') {
      return createAPIErrorResponse('Step cannot be modified in current status', 400)
    }

    // Perform the action
    let updateData: any = {
      updated_at: new Date().toISOString(),
      completed_by: userId,
      completed_at: new Date().toISOString()
    }

    switch (action) {
      case 'approve':
        updateData.status = 'completed'
        updateData.decision = decision || 'approved'
        updateData.comments = comments
        break

      case 'reject':
        updateData.status = 'failed'
        updateData.decision = decision || 'rejected'
        updateData.comments = comments
        break

      case 'request_changes':
        updateData.status = 'pending'
        updateData.decision = 'changes_requested'
        updateData.comments = comments
        // Don't set completed_at for change requests
        delete updateData.completed_at
        delete updateData.completed_by
        break

      case 'delegate':
        if (!delegateTo) {
          return createAPIErrorResponse('delegateTo is required for delegate action', 400)
        }
        updateData.assigned_to = delegateTo
        updateData.decision = 'delegated'
        updateData.comments = comments
        // Don't complete the step, just reassign
        delete updateData.completed_at
        delete updateData.completed_by
        break

      case 'comment':
        updateData.comments = comments
        updateData.decision = 'commented'
        // Don't complete the step for comments
        delete updateData.completed_at
        delete updateData.completed_by
        break

      default:
        return createAPIErrorResponse('Invalid action', 400)
    }

    // Update the step
    const { data: updatedStep, error: updateError } = await supabase
      .from('workflow_steps')
      .update(updateData)
      .eq('id', params.stepId)
      .select()
      .single()

    if (updateError) {
      console.error('Step update error:', updateError)
      return createAPIErrorResponse('Failed to update step', 500)
    }

    // If step was completed, check if we should advance the workflow
    if (action === 'approve' && updatedStep.status === 'completed') {
      await advanceWorkflow(supabase, params.id, tenantId)
    }

    // If step was rejected, mark workflow as failed
    if (action === 'reject') {
      await supabase
        .from('workflow_instances')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString()
        })
        .eq('id', params.id)
    }

    return createSecureAPIResponse({ data: updatedStep })

  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return createAPIErrorResponse('Invalid JSON body', 400)
    }
    console.error('Step action error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

async function advanceWorkflow(supabase: any, instanceId: string, tenantId: string) {
  try {
    // Get all steps for this workflow instance
    const { data: steps } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('instance_id', instanceId)
      .order('step_order')

    if (!steps) return

    // Find next pending step
    const nextStep = steps.find((step: any) => step.status === 'pending')
    
    if (nextStep) {
      // Start next step
      await supabase
        .from('workflow_steps')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', nextStep.id)

      // Update workflow instance current step
      await supabase
        .from('workflow_instances')
        .update({
          current_step_id: nextStep.id,
          status: 'in_progress'
        })
        .eq('id', instanceId)
    } else {
      // No more steps, check if all are completed
      const allCompleted = steps.every((step: any) => step.status === 'completed' || step.status === 'skipped')
      
      if (allCompleted) {
        // Complete the workflow
        await supabase
          .from('workflow_instances')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            current_step_id: null
          })
          .eq('id', instanceId)
      }
    }
  } catch (error) {
    console.error('Error advancing workflow:', error)
  }
}

// Simplified exports without security wrapper for now
export const GET = getWorkflowStep
export const POST = performStepAction