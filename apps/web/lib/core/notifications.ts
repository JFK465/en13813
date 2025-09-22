import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { Resend } from 'resend'
import { BaseService } from './base.service'
import type { SupabaseClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY!)

// Types
export type NotificationType = 
  | 'deadline_reminder'
  | 'document_approval_required'
  | 'document_approved'
  | 'document_rejected'
  | 'workflow_assigned'
  | 'workflow_completed'
  | 'workflow_overdue'
  | 'report_generated'
  | 'audit_scheduled'
  | 'compliance_alert'
  | 'system_maintenance'

export type NotificationChannel = 'email' | 'in_app' | 'push' | 'sms'
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface NotificationData {
  title: string
  message: string
  type: NotificationType
  priority?: NotificationPriority
  channels?: NotificationChannel[]
  recipientId: string
  resourceType?: string
  resourceId?: string
  data?: Record<string, any>
  scheduledFor?: string
  expiresAt?: string
}

export interface EmailTemplateData {
  name: string
  subject: string
  htmlContent: string
  textContent?: string
  notificationType: NotificationType
  templateVariables: Record<string, string>
}

export interface NotificationPreferences {
  userId: string
  tenantId: string
  notificationType: NotificationType
  emailEnabled: boolean
  inAppEnabled: boolean
  pushEnabled: boolean
  smsEnabled: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
  timezone: string
}

export class NotificationService extends BaseService<any> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'notifications')
  }

  /**
   * Send notification through multiple channels
   */
  async sendNotification(notificationData: NotificationData, tenantId: string): Promise<string> {
    const supabase = createServiceClient()

    try {
      // Create notification record
      const { data: notification, error: createError } = await supabase
        .from('notifications')
        .insert({
          tenant_id: tenantId,
          recipient_id: notificationData.recipientId,
          title: notificationData.title,
          message: notificationData.message,
          notification_type: notificationData.type,
          priority: notificationData.priority || 'medium',
          channels: notificationData.channels || ['in_app'],
          resource_type: notificationData.resourceType,
          resource_id: notificationData.resourceId,
          data: notificationData.data || {},
          scheduled_for: notificationData.scheduledFor || new Date().toISOString(),
          expires_at: notificationData.expiresAt
        })
        .select()
        .single()

      if (createError) {
        throw new Error(`Failed to create notification: ${createError.message}`)
      }

      // Get user preferences
      const preferences = await this.getNotificationPreferences(
        notificationData.recipientId,
        notificationData.type
      )

      // Send through enabled channels
      const channels = notificationData.channels || ['in_app']
      const deliveryPromises: Promise<void>[] = []

      for (const channel of channels) {
        switch (channel) {
          case 'email':
            if (preferences?.emailEnabled !== false) {
              deliveryPromises.push(
                this.sendEmailNotification(notification.id, notificationData)
              )
            }
            break
          case 'in_app':
            if (preferences?.inAppEnabled !== false) {
              deliveryPromises.push(
                this.sendInAppNotification(notification.id)
              )
            }
            break
          // TODO: Implement push and SMS
        }
      }

      // Execute all deliveries in parallel
      await Promise.allSettled(deliveryPromises)

      return notification.id
    } catch (error: any) {
      console.error('Error sending notification:', error)
      throw error
    }
  }

  /**
   * Send email notification using Resend
   */
  private async sendEmailNotification(
    notificationId: string,
    notificationData: NotificationData
  ): Promise<void> {
    const supabase = createServiceClient()

    try {
      // Get user email and details
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name, tenant_id')
        .eq('id', notificationData.recipientId)
        .single()

      if (!profile?.email) {
        throw new Error('User email not found')
      }

      // Get email template
      const template = await this.getEmailTemplate(
        profile.tenant_id,
        notificationData.type
      )

      if (!template) {
        throw new Error(`Email template not found for type: ${notificationData.type}`)
      }

      // Prepare template variables
      const templateVars = {
        user_name: profile.full_name || profile.email,
        notification_title: notificationData.title,
        notification_message: notificationData.message,
        app_url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        ...notificationData.data
      }

      // Render template
      const renderedSubject = this.renderTemplate(template.subject, templateVars)
      const renderedHtml = this.renderTemplate(template.html_content, templateVars)
      const renderedText = template.text_content 
        ? this.renderTemplate(template.text_content, templateVars)
        : undefined

      // Log delivery attempt
      await this.logDeliveryAttempt(notificationId, 'email', 'pending')

      // Send email via Resend
      const emailResult = await resend.emails.send({
        from: 'Compliance SaaS <notifications@compliance-saas.com>',
        to: [profile.email],
        subject: renderedSubject,
        html: renderedHtml,
        text: renderedText,
        headers: {
          'X-Notification-ID': notificationId,
          'X-Priority': notificationData.priority || 'medium'
        }
      })

      if (emailResult.error) {
        throw new Error(`Resend error: ${emailResult.error.message}`)
      }

      // Update notification with email tracking
      await supabase
        .from('notifications')
        .update({
          email_sent_at: new Date().toISOString()
        })
        .eq('id', notificationId)

      // Log successful delivery
      await this.logDeliveryAttempt(
        notificationId,
        'email',
        'sent',
        emailResult.data?.id
      )

    } catch (error: any) {
      console.error('Email notification error:', error)
      
      // Log failed delivery
      await this.logDeliveryAttempt(
        notificationId,
        'email',
        'failed',
        undefined,
        error.message
      )
    }
  }

  /**
   * Send in-app notification (mark as ready for real-time delivery)
   */
  private async sendInAppNotification(notificationId: string): Promise<void> {
    const supabase = createServiceClient()

    try {
      // Log delivery attempt
      await this.logDeliveryAttempt(notificationId, 'in_app', 'sent')

      // Trigger real-time notification via Supabase Realtime
      // This will be picked up by the client-side notification listener
      await supabase
        .from('notifications')
        .update({
          // Mark as available for real-time pickup
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId)

    } catch (error: any) {
      console.error('In-app notification error:', error)
      await this.logDeliveryAttempt(
        notificationId,
        'in_app',
        'failed',
        undefined,
        error.message
      )
    }
  }

  /**
   * Get notification preferences for user and type
   */
  private async getNotificationPreferences(
    userId: string,
    notificationType: NotificationType
  ): Promise<NotificationPreferences | null> {
    const supabase = createServiceClient()

    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('notification_type', notificationType)
      .single()

    return data
  }

  /**
   * Get email template for notification type
   */
  private async getEmailTemplate(
    tenantId: string,
    notificationType: NotificationType
  ): Promise<any> {
    const supabase = createServiceClient()

    const { data } = await supabase
      .from('email_templates')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('notification_type', notificationType)
      .eq('is_active', true)
      .single()

    return data
  }

  /**
   * Simple template rendering (replace {{variable}} with values)
   */
  private renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      rendered = rendered.replace(regex, String(value || ''))
    })

    return rendered
  }

  /**
   * Log delivery attempt for tracking
   */
  private async logDeliveryAttempt(
    notificationId: string,
    channel: NotificationChannel,
    status: string,
    externalId?: string,
    errorMessage?: string
  ): Promise<void> {
    const supabase = createServiceClient()

    await supabase
      .from('notification_delivery_log')
      .insert({
        notification_id: notificationId,
        channel,
        status,
        external_id: externalId,
        error_message: errorMessage,
        metadata: {},
        attempted_at: new Date().toISOString()
      })
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('recipient_id', userId)
      .is('read_at', null)

    return !error
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: string, tenantId: string): Promise<number> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .rpc('mark_all_notifications_as_read', {
        user_tenant_id: tenantId
      })

    if (error) {
      throw new Error(`Failed to mark notifications as read: ${error.message}`)
    }

    return data || 0
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string, tenantId: string): Promise<number> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .rpc('get_unread_notification_count', {
        user_tenant_id: tenantId
      })

    if (error) {
      throw new Error(`Failed to get unread count: ${error.message}`)
    }

    return data || 0
  }

  /**
   * Get notifications for user (paginated)
   */
  async getUserNotifications(
    userId: string,
    tenantId: string,
    options: {
      page?: number
      limit?: number
      unreadOnly?: boolean
      type?: NotificationType
    } = {}
  ): Promise<{ data: any[]; total: number; unreadCount: number }> {
    const supabase = await createClient()
    const { page = 1, limit = 20, unreadOnly = false, type } = options

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('recipient_id', userId)
      .eq('tenant_id', tenantId)

    if (unreadOnly) {
      query = query.is('read_at', null)
    }

    if (type) {
      query = query.eq('notification_type', type)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`)
    }

    // Get unread count separately
    const unreadCount = await this.getUnreadCount(userId, tenantId)

    return {
      data: data || [],
      total: count || 0,
      unreadCount
    }
  }

  /**
   * Create email template
   */
  async createEmailTemplate(
    tenantId: string,
    templateData: EmailTemplateData,
    userId: string
  ): Promise<string> {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        tenant_id: tenantId,
        name: templateData.name,
        subject: templateData.subject,
        html_content: templateData.htmlContent,
        text_content: templateData.textContent,
        notification_type: templateData.notificationType,
        template_variables: templateData.templateVariables,
        created_by: userId
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create email template: ${error.message}`)
    }

    return data.id
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    tenantId: string,
    preferences: Partial<NotificationPreferences>[]
  ): Promise<void> {
    const supabase = await createClient()

    for (const pref of preferences) {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          tenant_id: tenantId,
          notification_type: pref.notificationType!,
          email_enabled: pref.emailEnabled ?? true,
          in_app_enabled: pref.inAppEnabled ?? true,
          push_enabled: pref.pushEnabled ?? false,
          sms_enabled: pref.smsEnabled ?? false,
          quiet_hours_start: pref.quietHoursStart,
          quiet_hours_end: pref.quietHoursEnd,
          timezone: pref.timezone ?? 'UTC'
        })
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .eq('notification_type', pref.notificationType!)

      if (error) {
        throw new Error(`Failed to update preferences: ${error.message}`)
      }
    }
  }

  /**
   * Send compliance deadline reminder
   */
  async sendDeadlineReminder(params: {
    recipientId: string
    taskName: string
    dueDate: string
    priority: string
    taskUrl: string
    resourceId?: string
    tenantId: string
  }): Promise<string> {
    return this.sendNotification({
      title: `Deadline Reminder: ${params.taskName}`,
      message: `The compliance task "${params.taskName}" is due on ${params.dueDate}.`,
      type: 'deadline_reminder',
      priority: params.priority as NotificationPriority,
      channels: ['email', 'in_app'],
      recipientId: params.recipientId,
      resourceType: 'task',
      resourceId: params.resourceId,
      data: {
        task_name: params.taskName,
        due_date: params.dueDate,
        priority: params.priority,
        task_url: params.taskUrl
      }
    }, params.tenantId)
  }

  /**
   * Send document approval notification
   */
  async sendDocumentApprovalRequest(params: {
    recipientId: string
    documentTitle: string
    documentType: string
    submittedBy: string
    documentUrl: string
    documentId: string
    tenantId: string
  }): Promise<string> {
    return this.sendNotification({
      title: `Document Approval Required: ${params.documentTitle}`,
      message: `The document "${params.documentTitle}" requires your approval.`,
      type: 'document_approval_required',
      priority: 'medium',
      channels: ['email', 'in_app'],
      recipientId: params.recipientId,
      resourceType: 'document',
      resourceId: params.documentId,
      data: {
        document_title: params.documentTitle,
        document_type: params.documentType,
        submitted_by: params.submittedBy,
        document_url: params.documentUrl
      }
    }, params.tenantId)
  }

  /**
   * Send workflow assignment notification
   */
  async sendWorkflowAssignment(params: {
    recipientId: string
    workflowTitle: string
    stepName: string
    dueDate?: string
    workflowUrl: string
    workflowId: string
    tenantId: string
  }): Promise<string> {
    return this.sendNotification({
      title: `New Workflow Assignment: ${params.workflowTitle}`,
      message: `You have been assigned to the workflow "${params.workflowTitle}".`,
      type: 'workflow_assigned',
      priority: 'medium',
      channels: ['email', 'in_app'],
      recipientId: params.recipientId,
      resourceType: 'workflow',
      resourceId: params.workflowId,
      data: {
        workflow_title: params.workflowTitle,
        step_name: params.stepName,
        due_date: params.dueDate || 'No deadline',
        workflow_url: params.workflowUrl
      }
    }, params.tenantId)
  }
}