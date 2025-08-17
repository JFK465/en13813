'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  User,
  Calendar,
  ArrowRight,
  Filter
} from 'lucide-react'
import { useWorkflowInstances, useMyTasks } from '@/hooks/useWorkflows'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const statusIcons = {
  pending: Clock,
  in_progress: AlertCircle,
  completed: CheckCircle2,
  failed: AlertCircle,
  cancelled: AlertCircle,
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

interface WorkflowListProps {
  showFilters?: boolean
}

export function WorkflowList({ showFilters = true }: WorkflowListProps) {
  const { data: allWorkflows, isLoading: allLoading } = useWorkflowInstances()
  const { data: assignedWorkflows, isLoading: assignedLoading } = useWorkflowInstances({ assignedToMe: true })
  const { data: myTasks, isLoading: tasksLoading } = useMyTasks()

  if (allLoading || assignedLoading || tasksLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workflows</h2>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Compliance-Workflows und Aufgaben
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showFilters && (
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          )}
          <Link href="/workflows/templates">
            <Button size="sm">
              Workflow erstellen
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="my-tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-tasks">
            Meine Aufgaben ({myTasks?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="assigned">
            Zugewiesene Workflows ({assignedWorkflows?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="all">
            Alle Workflows ({allWorkflows?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-tasks" className="space-y-4">
          {myTasks?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine offenen Aufgaben</h3>
                <p className="text-muted-foreground text-center">
                  Sie haben aktuell keine ausstehenden Workflow-Aufgaben.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myTasks?.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {task.step_name}
                        </CardTitle>
                        <CardDescription>
                          {(task as any).workflow_instances?.title}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn(statusColors[task.status as keyof typeof statusColors])}
                        >
                          {React.createElement(statusIcons[task.status as keyof typeof statusIcons], { 
                            className: "h-3 w-3 mr-1" 
                          })}
                          {task.status === 'pending' ? 'Ausstehend' : 
                           task.status === 'in_progress' ? 'In Bearbeitung' : 
                           task.status}
                        </Badge>
                        <Badge 
                          variant="secondary"
                          className={priorityColors[(task as any).workflow_instances?.priority as keyof typeof priorityColors]}
                        >
                          {(task as any).workflow_instances?.priority === 'urgent' ? 'Dringend' :
                           (task as any).workflow_instances?.priority === 'high' ? 'Hoch' :
                           (task as any).workflow_instances?.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {task.step_type === 'approval' ? 'Genehmigung' :
                           task.step_type === 'review' ? 'Prüfung' :
                           task.step_type}
                        </div>
                        {task.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Fällig {formatDistanceToNow(new Date(task.due_date), { 
                              addSuffix: true, 
                              locale: de 
                            })}
                          </div>
                        )}
                        {task.created_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDistanceToNow(new Date(task.created_at), { 
                              addSuffix: true, 
                              locale: de 
                            })}
                          </div>
                        )}
                      </div>
                      <Link href={`/workflows/${task.instance_id}?step=${task.id}`}>
                        <Button size="sm" variant="outline">
                          Bearbeiten
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4">
          <WorkflowInstanceList workflows={assignedWorkflows || []} />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <WorkflowInstanceList workflows={allWorkflows || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function WorkflowInstanceList({ workflows }: { workflows: any[] }) {
  if (workflows.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Workflows vorhanden</h3>
          <p className="text-muted-foreground text-center">
            Es wurden noch keine Workflows erstellt.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {workflows.map((workflow) => (
        <Card key={workflow.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  {workflow.title}
                </CardTitle>
                <CardDescription>
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
                <Badge 
                  variant="secondary"
                  className={priorityColors[workflow.priority as keyof typeof priorityColors]}
                >
                  {workflow.priority === 'urgent' ? 'Dringend' :
                   workflow.priority === 'high' ? 'Hoch' :
                   workflow.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {workflow.resource_type === 'document' ? 'Dokument' : workflow.resource_type}
                </div>
                {workflow.due_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Fällig {formatDistanceToNow(new Date(workflow.due_date), { 
                      addSuffix: true, 
                      locale: de 
                    })}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(new Date(workflow.created_at), { 
                    addSuffix: true, 
                    locale: de 
                  })}
                </div>
                {workflow.workflow_steps && (
                  <div className="text-xs">
                    {workflow.workflow_steps.filter((s: any) => s.status === 'completed').length}/
                    {workflow.workflow_steps.length} Schritte
                  </div>
                )}
              </div>
              <Link href={`/workflows/${workflow.id}`}>
                <Button size="sm" variant="outline">
                  Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}