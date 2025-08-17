import { SupabaseClient } from '@supabase/supabase-js'
import { BaseService, AppError } from './base.service'
import type { Database } from '@/types/database.types'

type Workflow = Database['public']['Tables']['workflows']['Row']
type WorkflowInsert = Database['public']['Tables']['workflows']['Insert']
type WorkflowInstance = Database['public']['Tables']['workflow_instances']['Row']
type WorkflowInstanceInsert = Database['public']['Tables']['workflow_instances']['Insert']
type WorkflowStep = Database['public']['Tables']['workflow_steps']['Row']
type WorkflowStepInsert = Database['public']['Tables']['workflow_steps']['Insert']
type WorkflowComment = Database['public']['Tables']['workflow_comments']['Row']

export interface WorkflowDefinition {
  name: string
  description?: string
  type: string
  category?: string
  steps: WorkflowStepDefinition[]
  config?: {
    autoStart?: boolean
    allowParallelSteps?: boolean
    requireAllApprovals?: boolean
    escalationRules?: EscalationRule[]
  }
}

export interface WorkflowStepDefinition {
  name: string
  type: 'approval' | 'review' | 'notification' | 'condition' | 'parallel'
  assignedTo?: string
  assignedRole?: string
  assignedGroup?: string
  config?: {
    autoApprove?: boolean
    timeout?: number // in hours
    required?: boolean
    conditions?: any[]
  }
  requirements?: {
    approvalCount?: number
    requiredRoles?: string[]
    documents?: string[]
  }
}

export interface EscalationRule {
  afterHours: number
  action: 'notify' | 'reassign' | 'auto_approve'
  target?: string
}

export interface StartWorkflowParams {
  workflowId: string
  resourceType: string
  resourceId: string
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  data?: Record<string, any>
  context?: Record<string, any>
}

export interface StepActionParams {
  stepId: string
  action: 'approve' | 'reject' | 'request_changes' | 'delegate' | 'comment'
  decision?: string
  comments?: string
  attachments?: any[]
  delegateTo?: string
}

export class WorkflowService extends BaseService<Workflow> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'workflows')
  }

  // Workflow Template Management
  async createWorkflowTemplate(definition: WorkflowDefinition): Promise<Workflow> {
    const tenantId = await this.getCurrentTenantId()

    const workflowData: WorkflowInsert = {
      tenant_id: tenantId,
      name: definition.name,
      description: definition.description,
      type: definition.type,
      category: definition.category,
      config: {
        steps: definition.steps,
        ...definition.config
      },
      status: 'draft',
      is_template: true
    }

    return await this.create(workflowData)
  }

  async getWorkflowTemplates(type?: string): Promise<Workflow[]> {
    const filters: Record<string, any> = { is_template: true, status: 'active' }
    if (type) filters.type = type

    return await this.findMany(filters)
  }

  async activateWorkflowTemplate(workflowId: string): Promise<Workflow> {
    return await this.update(workflowId, { status: 'active' })
  }

  // Workflow Instance Management
  async startWorkflow(params: StartWorkflowParams): Promise<WorkflowInstance> {
    const tenantId = await this.getCurrentTenantId()

    // Get workflow template
    const workflow = await this.findById(params.workflowId)
    if (!workflow) {
      throw new AppError('Workflow template not found', 'WORKFLOW_NOT_FOUND', 404)
    }

    if (workflow.status !== 'active') {
      throw new AppError('Workflow template is not active', 'WORKFLOW_INACTIVE', 400)
    }

    // Create workflow instance
    const instanceData: WorkflowInstanceInsert = {
      workflow_id: params.workflowId,
      tenant_id: tenantId,
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      title: params.title,
      description: params.description,
      priority: params.priority || 'medium',
      due_date: params.dueDate,
      data: params.data || {},
      context: params.context || {},
      status: 'pending'
    }

    const { data: instance, error } = await this.supabase
      .from('workflow_instances')
      .insert(instanceData)
      .select()
      .single()

    if (error) throw new AppError(error.message, error.code)

    // Create workflow steps from template
    const stepDefinitions = (workflow.config as any)?.steps || []
    const steps = await this.createWorkflowSteps(instance.id, stepDefinitions)

    // Start first step if auto-start is enabled
    const config = workflow.config as any
    if (config?.autoStart && steps.length > 0) {
      await this.startNextStep(instance.id)
    }

    await this.createAuditLog('workflow_started', instance.id, {
      workflow_name: workflow.name,
      resource_type: params.resourceType,
      resource_id: params.resourceId
    })

    return instance
  }

  private async createWorkflowSteps(
    instanceId: string, 
    stepDefinitions: WorkflowStepDefinition[]
  ): Promise<WorkflowStep[]> {
    const tenantId = await this.getCurrentTenantId()

    const stepsData: WorkflowStepInsert[] = stepDefinitions.map((stepDef, index) => ({
      instance_id: instanceId,
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

    const { data: steps, error } = await this.supabase
      .from('workflow_steps')
      .insert(stepsData)
      .select()

    if (error) throw new AppError(error.message, error.code)

    return steps || []
  }

  private async startNextStep(instanceId: string): Promise<void> {
    // Find the first pending step
    const { data: nextStep, error } = await this.supabase
      .from('workflow_steps')
      .select('*')
      .eq('instance_id', instanceId)
      .eq('status', 'pending')
      .order('step_order')
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new AppError(error.message, error.code)
    }

    if (nextStep) {
      // Update step to in_progress
      await this.supabase
        .from('workflow_steps')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', nextStep.id)

      // Update instance current step
      await this.supabase
        .from('workflow_instances')
        .update({
          status: 'in_progress',
          current_step_id: nextStep.id
        })
        .eq('id', instanceId)
    }
  }

  // Step Actions
  async executeStepAction(params: StepActionParams): Promise<WorkflowStep> {
    const step = await this.getWorkflowStep(params.stepId)
    if (!step) {
      throw new AppError('Workflow step not found', 'STEP_NOT_FOUND', 404)
    }

    // Check permissions
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) {
      throw new AppError('User not authenticated', 'UNAUTHENTICATED', 401)
    }

    if (step.assigned_to && step.assigned_to !== user.id) {
      // Check if user has admin role
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || !['owner', 'admin'].includes(profile.role)) {
        throw new AppError('Not authorized to perform this action', 'UNAUTHORIZED', 403)
      }
    }

    // Handle different actions
    let newStatus: WorkflowStep['status'] = step.status
    let decision = params.decision

    switch (params.action) {
      case 'approve':
        newStatus = 'completed'
        decision = 'approved'
        break
      case 'reject':
        newStatus = 'completed'
        decision = 'rejected'
        break
      case 'request_changes':
        newStatus = 'completed'
        decision = 'changes_requested'
        break
      case 'delegate':
        if (!params.delegateTo) {
          throw new AppError('Delegation target is required', 'DELEGATE_TARGET_REQUIRED', 400)
        }
        // Update assigned_to instead of completing the step
        const { data: delegatedStep, error: delegateError } = await this.supabase
          .from('workflow_steps')
          .update({
            assigned_to: params.delegateTo,
            comments: params.comments,
            updated_at: new Date().toISOString()
          })
          .eq('id', params.stepId)
          .select()
          .single()

        if (delegateError) throw new AppError(delegateError.message, delegateError.code)

        await this.createAuditLog('step_delegated', params.stepId, {
          delegated_to: params.delegateTo,
          comments: params.comments
        })

        return delegatedStep
      case 'comment':
        // Just add a comment without changing status
        await this.addWorkflowComment(step.instance_id, params.stepId, params.comments || '', 'general')
        return step
    }

    // Update step
    const { data: updatedStep, error } = await this.supabase
      .from('workflow_steps')
      .update({
        status: newStatus,
        action_taken: params.action,
        decision,
        comments: params.comments,
        attachments: params.attachments || [],
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        completed_by: newStatus === 'completed' ? user.id : null
      })
      .eq('id', params.stepId)
      .select()
      .single()

    if (error) throw new AppError(error.message, error.code)

    await this.createAuditLog('step_action', params.stepId, {
      action: params.action,
      decision,
      comments: params.comments
    })

    return updatedStep
  }

  async getWorkflowStep(stepId: string): Promise<WorkflowStep | null> {
    const { data, error } = await this.supabase
      .from('workflow_steps')
      .select('*')
      .eq('id', stepId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new AppError(error.message, error.code)
    }

    return data || null
  }

  // Workflow Instance Queries
  async getWorkflowInstance(instanceId: string): Promise<WorkflowInstance | null> {
    const { data, error } = await this.supabase
      .from('workflow_instances')
      .select(`
        *,
        workflows(*),
        workflow_steps(*)
      `)
      .eq('id', instanceId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new AppError(error.message, error.code)
    }

    return data || null
  }

  async getWorkflowInstances(filters: {
    status?: string
    resourceType?: string
    assignedToMe?: boolean
    startedBy?: string
    priority?: string
  } = {}): Promise<WorkflowInstance[]> {
    let query = this.supabase
      .from('workflow_instances')
      .select(`
        *,
        workflows(name, type),
        workflow_steps(*)
      `)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.resourceType) {
      query = query.eq('resource_type', filters.resourceType)
    }

    if (filters.startedBy) {
      query = query.eq('started_by', filters.startedBy)
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }

    if (filters.assignedToMe) {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (user) {
        // Join with workflow_steps to find instances where user is assigned to a step
        query = query.in('id', 
          this.supabase
            .from('workflow_steps')
            .select('instance_id')
            .eq('assigned_to', user.id)
            .in('status', ['pending', 'in_progress'])
        )
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw new AppError(error.message, error.code)

    return data || []
  }

  async getMyTasks(): Promise<WorkflowStep[]> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new AppError('User not authenticated', 'UNAUTHENTICATED', 401)

    const { data, error } = await this.supabase
      .from('workflow_steps')
      .select(`
        *,
        workflow_instances(title, description, priority, resource_type, resource_id)
      `)
      .eq('assigned_to', user.id)
      .in('status', ['pending', 'in_progress'])
      .order('due_date', { ascending: true, nullsLast: true })

    if (error) throw new AppError(error.message, error.code)

    return data || []
  }

  // Comments
  async addWorkflowComment(
    instanceId: string,
    stepId: string | null,
    content: string,
    type: string = 'general',
    isInternal = false,
    mentions: string[] = []
  ): Promise<WorkflowComment> {
    const tenantId = await this.getCurrentTenantId()
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new AppError('User not authenticated', 'UNAUTHENTICATED', 401)

    const { data: comment, error } = await this.supabase
      .from('workflow_comments')
      .insert({
        instance_id: instanceId,
        step_id: stepId,
        tenant_id: tenantId,
        content,
        comment_type: type,
        is_internal: isInternal,
        mentions,
        author_id: user.id
      })
      .select()
      .single()

    if (error) throw new AppError(error.message, error.code)

    return comment
  }

  async getWorkflowComments(instanceId: string): Promise<WorkflowComment[]> {
    const { data, error } = await this.supabase
      .from('workflow_comments')
      .select(`
        *,
        profiles(full_name, email)
      `)
      .eq('instance_id', instanceId)
      .order('created_at', { ascending: true })

    if (error) throw new AppError(error.message, error.code)

    return data || []
  }

  // Integration with Document Management
  async startDocumentApprovalWorkflow(
    documentId: string,
    workflowType: string = 'document_approval'
  ): Promise<WorkflowInstance> {
    // Get document details
    const { data: document, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (error) throw new AppError(error.message, error.code)

    // Find appropriate workflow template
    const workflows = await this.getWorkflowTemplates(workflowType)
    if (workflows.length === 0) {
      throw new AppError('No workflow template found for document approval', 'NO_WORKFLOW_TEMPLATE', 404)
    }

    const workflow = workflows[0] // Use first available template

    // Start workflow
    const instance = await this.startWorkflow({
      workflowId: workflow.id,
      resourceType: 'document',
      resourceId: documentId,
      title: `Approval: ${document.title}`,
      description: `Document approval workflow for ${document.title}`,
      priority: 'medium',
      data: {
        document_id: documentId,
        document_title: document.title,
        document_type: document.type
      }
    })

    // Update document status
    await this.supabase
      .from('documents')
      .update({ status: 'pending_approval' })
      .eq('id', documentId)

    return instance
  }
}