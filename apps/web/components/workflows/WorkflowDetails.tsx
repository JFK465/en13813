'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  User,
  Calendar,
  MessageSquare,
  Send,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Users,
  ArrowRight,
  ChevronRight
} from 'lucide-react'
import { 
  useWorkflowInstance, 
  useWorkflowComments, 
  useExecuteStepAction,
  useAddWorkflowComment 
} from '@/hooks/useWorkflows'
import { formatDistanceToNow, format } from 'date-fns'
import { de } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const statusIcons = {
  pending: Clock,
  in_progress: AlertCircle,
  completed: CheckCircle2,
  skipped: ArrowRight,
  failed: AlertCircle,
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  skipped: 'bg-gray-100 text-gray-800 border-gray-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
}

interface WorkflowDetailsProps {
  instanceId: string
  activeStepId?: string
}

export function WorkflowDetails({ instanceId, activeStepId }: WorkflowDetailsProps) {
  const [comment, setComment] = useState('')
  const [actionComment, setActionComment] = useState('')
  
  const { data: workflow, isLoading } = useWorkflowInstance(instanceId)
  const { data: comments, isLoading: commentsLoading } = useWorkflowComments(instanceId)
  const executeAction = useExecuteStepAction()
  const addComment = useAddWorkflowComment()

  const handleStepAction = async (stepId: string, action: 'approve' | 'reject' | 'request_changes') => {
    try {
      await executeAction.mutateAsync({
        stepId,
        action,
        comments: actionComment,
      })
      setActionComment('')
    } catch (error) {
      console.error('Failed to execute action:', error)
    }
  }

  const handleAddComment = async () => {
    if (!comment.trim()) return

    try {
      await addComment.mutateAsync({
        instanceId,
        stepId: activeStepId,
        content: comment,
        type: 'general'
      })
      setComment('')
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!workflow) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Workflow nicht gefunden</h3>
          <p className="text-muted-foreground">
            Der angeforderte Workflow existiert nicht oder Sie haben keine Berechtigung.
          </p>
        </CardContent>
      </Card>
    )
  }

  const currentStep = workflow.workflow_steps?.find((step: any) => step.id === workflow.current_step_id)
  const activeStep = activeStepId ? workflow.workflow_steps?.find((step: any) => step.id === activeStepId) : currentStep

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{workflow.title}</CardTitle>
              <CardDescription className="text-base">
                {workflow.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn(statusColors[workflow.status as keyof typeof statusColors])}
              >
                {React.createElement(statusIcons[workflow.status as keyof typeof statusIcons], { 
                  className: "h-3 w-3 mr-1" 
                })}
                {workflow.status === 'pending' ? 'Ausstehend' : 
                 workflow.status === 'in_progress' ? 'In Bearbeitung' : 
                 workflow.status === 'completed' ? 'Abgeschlossen' :
                 workflow.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Typ</Label>
              <p className="font-medium">{workflow.resource_type === 'document' ? 'Dokument' : workflow.resource_type}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Priorität</Label>
              <p className="font-medium">
                {workflow.priority === 'urgent' ? 'Dringend' :
                 workflow.priority === 'high' ? 'Hoch' :
                 workflow.priority === 'medium' ? 'Mittel' : 'Niedrig'}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Erstellt</Label>
              <p className="font-medium">
                {formatDistanceToNow(new Date(workflow.created_at), { 
                  addSuffix: true, 
                  locale: de 
                })}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Fälligkeitsdatum</Label>
              <p className="font-medium">
                {workflow.due_date ? 
                  format(new Date(workflow.due_date), 'dd.MM.yyyy', { locale: de }) : 
                  'Nicht gesetzt'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Workflow Steps */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow-Schritte</CardTitle>
              <CardDescription>
                Fortschritt und Details der einzelnen Schritte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflow.workflow_steps?.map((step: any, index: number) => (
                  <div key={step.id} className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border",
                    step.id === activeStepId && "bg-blue-50 border-blue-200",
                    step.status === 'completed' && "bg-green-50 border-green-200"
                  )}>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border-2">
                      {step.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : step.status === 'in_progress' ? (
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{step.step_name}</h4>
                        <Badge 
                          variant="outline" 
                          className={cn(statusColors[step.status as keyof typeof statusColors])}
                        >
                          {step.status === 'pending' ? 'Ausstehend' : 
                           step.status === 'in_progress' ? 'In Bearbeitung' : 
                           step.status === 'completed' ? 'Abgeschlossen' :
                           step.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {step.assigned_to ? 'Zugewiesen' : 'Nicht zugewiesen'}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {step.step_type === 'approval' ? 'Genehmigung' :
                           step.step_type === 'review' ? 'Prüfung' :
                           step.step_type}
                        </div>
                        {step.completed_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDistanceToNow(new Date(step.completed_at), { 
                              addSuffix: true, 
                              locale: de 
                            })}
                          </div>
                        )}
                      </div>

                      {step.comments && (
                        <p className="text-sm bg-gray-50 p-2 rounded border">
                          {step.comments}
                        </p>
                      )}

                      {step.decision && (
                        <div className="flex items-center gap-2">
                          <Badge variant={step.decision === 'approved' ? 'default' : 'destructive'}>
                            {step.decision === 'approved' ? 'Genehmigt' :
                             step.decision === 'rejected' ? 'Abgelehnt' :
                             step.decision === 'changes_requested' ? 'Änderungen angefordert' :
                             step.decision}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Panel for Active Step */}
          {activeStep && activeStep.status === 'in_progress' && (
            <Card>
              <CardHeader>
                <CardTitle>Aktion erforderlich</CardTitle>
                <CardDescription>
                  Bearbeiten Sie den Schritt: {activeStep.step_name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="action-comment">Kommentar</Label>
                  <Textarea
                    id="action-comment"
                    placeholder="Fügen Sie einen Kommentar zu Ihrer Entscheidung hinzu..."
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStepAction(activeStep.id, 'approve')}
                    disabled={executeAction.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Genehmigen
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleStepAction(activeStep.id, 'reject')}
                    disabled={executeAction.isPending}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Ablehnen
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStepAction(activeStep.id, 'request_changes')}
                    disabled={executeAction.isPending}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Änderungen anfordern
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Comments Sidebar */}
        <div>
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Kommentare
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {commentsLoading ? (
                    <div className="text-sm text-muted-foreground">Lade Kommentare...</div>
                  ) : comments?.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Noch keine Kommentare</div>
                  ) : (
                    comments?.map((comment: any) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {comment.profiles?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {comment.profiles?.full_name || 'Unbekannt'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { 
                                addSuffix: true, 
                                locale: de 
                              })}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              
              <Separator />
              
              <div className="space-y-2">
                <Textarea
                  placeholder="Kommentar hinzufügen..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button 
                  size="sm" 
                  onClick={handleAddComment}
                  disabled={!comment.trim() || addComment.isPending}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Kommentar senden
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}