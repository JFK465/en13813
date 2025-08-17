'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { WorkflowService } from '@/lib/core/workflows'
import { createClient } from '@/lib/supabase/client'
import type { 
  WorkflowDefinition, 
  StartWorkflowParams, 
  StepActionParams 
} from '@/lib/core/workflows'

const workflowService = new WorkflowService(createClient())

// Workflow Templates
export function useWorkflowTemplates(type?: string) {
  return useQuery({
    queryKey: ['workflow-templates', type],
    queryFn: () => workflowService.getWorkflowTemplates(type),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateWorkflowTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (definition: WorkflowDefinition) => workflowService.createWorkflowTemplate(definition),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-templates'] })
      toast.success('Workflow template created successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create workflow template')
    },
  })
}

export function useActivateWorkflowTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workflowId: string) => workflowService.activateWorkflowTemplate(workflowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-templates'] })
      toast.success('Workflow template activated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to activate workflow template')
    },
  })
}

// Workflow Instances
export function useWorkflowInstances(filters?: {
  status?: string
  resourceType?: string
  assignedToMe?: boolean
  startedBy?: string
  priority?: string
}) {
  return useQuery({
    queryKey: ['workflow-instances', filters],
    queryFn: () => workflowService.getWorkflowInstances(filters || {}),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  })
}

export function useWorkflowInstance(instanceId: string) {
  return useQuery({
    queryKey: ['workflow-instance', instanceId],
    queryFn: () => workflowService.getWorkflowInstance(instanceId),
    enabled: !!instanceId,
    refetchInterval: 10000, // More frequent updates for individual instances
  })
}

export function useStartWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: StartWorkflowParams) => workflowService.startWorkflow(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-instances'] })
      toast.success('Workflow started successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start workflow')
    },
  })
}

// Workflow Steps
export function useMyTasks() {
  return useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => workflowService.getMyTasks(),
    refetchInterval: 30000,
  })
}

export function useExecuteStepAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: StepActionParams) => workflowService.executeStepAction(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-instances'] })
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
      
      // Also invalidate the specific workflow instance if we know the step
      const action = variables.action
      const actionMessages = {
        approve: 'Step approved successfully',
        reject: 'Step rejected',
        request_changes: 'Changes requested',
        delegate: 'Step delegated',
        comment: 'Comment added'
      }
      
      toast.success(actionMessages[action] || 'Action completed')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to execute action')
    },
  })
}

// Workflow Comments
export function useWorkflowComments(instanceId: string) {
  return useQuery({
    queryKey: ['workflow-comments', instanceId],
    queryFn: () => workflowService.getWorkflowComments(instanceId),
    enabled: !!instanceId,
    refetchInterval: 15000,
  })
}

export function useAddWorkflowComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      instanceId: string
      stepId?: string
      content: string
      type?: string
      isInternal?: boolean
      mentions?: string[]
    }) => workflowService.addWorkflowComment(
      params.instanceId,
      params.stepId || null,
      params.content,
      params.type,
      params.isInternal,
      params.mentions
    ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-comments', variables.instanceId] })
      toast.success('Comment added')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add comment')
    },
  })
}

// Document Approval Integration
export function useStartDocumentApproval() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { documentId: string; workflowType?: string }) => 
      workflowService.startDocumentApprovalWorkflow(params.documentId, params.workflowType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-instances'] })
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Document approval workflow started')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start approval workflow')
    },
  })
}