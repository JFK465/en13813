'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { 
  Bell, 
  FileText, 
  Workflow, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'
import type { NotificationType } from '@/lib/core/notifications'

interface NotificationListProps {
  compact?: boolean
  limit?: number
  type?: NotificationType
  onNotificationClick?: (notificationId: string) => void
}

export function NotificationList({
  compact = false,
  limit = 20,
  type,
  onNotificationClick
}: NotificationListProps) {
  const { 
    notifications, 
    loading, 
    error, 
    fetchNotifications, 
    markAsRead 
  } = useNotifications()

  useEffect(() => {
    fetchNotifications({ limit, type })
  }, [fetchNotifications, limit, type])

  const handleNotificationClick = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(notificationId)
    }
    onNotificationClick?.(notificationId)
  }

  const getNotificationIcon = (notificationType: NotificationType, priority: string) => {
    const iconProps = {
      className: cn(
        "h-4 w-4",
        priority === 'urgent' && "text-red-500",
        priority === 'high' && "text-orange-500",
        priority === 'medium' && "text-blue-500",
        priority === 'low' && "text-gray-500"
      )
    }

    switch (notificationType) {
      case 'document_approval_required':
      case 'document_approved':
      case 'document_rejected':
        return <FileText {...iconProps} />
      case 'workflow_assigned':
      case 'workflow_completed':
      case 'workflow_overdue':
        return <Workflow {...iconProps} />
      case 'deadline_reminder':
      case 'audit_scheduled':
        return <Calendar {...iconProps} />
      case 'compliance_alert':
        return <AlertTriangle {...iconProps} />
      case 'report_generated':
        return <CheckCircle {...iconProps} />
      case 'system_maintenance':
        return <Info {...iconProps} />
      default:
        return <Bell {...iconProps} />
    }
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      urgent: 'destructive',
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    } as const

    return (
      <Badge 
        variant={variants[priority as keyof typeof variants] || 'default'}
        className="text-xs"
      >
        {priority}
      </Badge>
    )
  }

  const getTypeLabel = (type: NotificationType) => {
    const labels = {
      deadline_reminder: 'Deadline',
      document_approval_required: 'Approval',
      document_approved: 'Approved',
      document_rejected: 'Rejected',
      workflow_assigned: 'Assignment',
      workflow_completed: 'Completed',
      workflow_overdue: 'Overdue',
      report_generated: 'Report',
      audit_scheduled: 'Audit',
      compliance_alert: 'Alert',
      system_maintenance: 'System'
    }

    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3">
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-sm text-red-600">
        <AlertTriangle className="h-4 w-4 mx-auto mb-2" />
        Error loading notifications: {error}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
        No notifications found
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {notifications.map((notification) => {
        const isRead = !!notification.read_at
        const timeAgo = formatDistanceToNow(new Date(notification.created_at), { 
          addSuffix: true 
        })

        return (
          <div
            key={notification.id}
            className={cn(
              "group relative flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors",
              !isRead && "bg-blue-50/50 border-l-2 border-l-blue-500",
              compact && "p-2"
            )}
            onClick={() => handleNotificationClick(notification.id, isRead)}
          >
            {/* Unread indicator */}
            {!isRead && (
              <div className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 bg-blue-500 rounded-full" />
            )}

            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.notification_type, notification.priority)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className={cn(
                  "text-sm font-medium leading-none",
                  !isRead && "font-semibold"
                )}>
                  {notification.title}
                </h4>
                {!compact && (
                  <div className="flex items-center gap-1">
                    {getPriorityBadge(notification.priority)}
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {notification.message}
              </p>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{getTypeLabel(notification.notification_type)}</span>
                  <span>•</span>
                  <span>{timeAgo}</span>
                </div>

                {!isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      markAsRead(notification.id)
                    }}
                  >
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}