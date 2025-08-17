'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './core/useAuth'
import type { NotificationType } from '@/lib/core/notifications'

interface Notification {
  id: string
  title: string
  message: string
  notification_type: NotificationType
  priority: 'low' | 'medium' | 'high' | 'urgent'
  resource_type?: string
  resource_id?: string
  read_at?: string
  created_at: string
  data?: Record<string, any>
}

interface NotificationPreferences {
  notification_type: NotificationType
  email_enabled: boolean
  in_app_enabled: boolean
  push_enabled: boolean
  sms_enabled: boolean
}

export function useNotifications() {
  const { user, profile } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch notifications
  const fetchNotifications = useCallback(async (options: {
    page?: number
    limit?: number
    unreadOnly?: boolean
    type?: NotificationType
  } = {}) => {
    if (!user || !profile?.tenant_id) return

    try {
      setLoading(true)
      setError(null)

      const { page = 1, limit = 20, unreadOnly = false, type } = options

      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('recipient_id', user.id)
        .eq('tenant_id', profile.tenant_id)

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

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setNotifications(data || [])

      // Also fetch unread count
      const { data: unreadData, error: unreadError } = await supabase
        .rpc('get_unread_notification_count', {
          user_tenant_id: profile.tenant_id
        })

      if (!unreadError) {
        setUnreadCount(unreadData || 0)
      }

    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [user, profile?.tenant_id, supabase])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user || !profile?.tenant_id) return false

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('recipient_id', user.id)
        .is('read_at', null)

      if (error) {
        throw new Error(error.message)
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      )

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1))

      return true
    } catch (err: any) {
      console.error('Error marking notification as read:', err)
      return false
    }
  }, [user, profile?.tenant_id, supabase])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user || !profile?.tenant_id) return 0

    try {
      const { data, error } = await supabase
        .rpc('mark_all_notifications_as_read', {
          user_tenant_id: profile.tenant_id
        })

      if (error) {
        throw new Error(error.message)
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      )
      setUnreadCount(0)

      return data || 0
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err)
      return 0
    }
  }, [user, profile?.tenant_id, supabase])

  // Get notification preferences
  const getPreferences = useCallback(async (): Promise<NotificationPreferences[]> => {
    if (!user || !profile?.tenant_id) return []

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .eq('tenant_id', profile.tenant_id)

      if (error) {
        throw new Error(error.message)
      }

      return data || []
    } catch (err: any) {
      console.error('Error fetching notification preferences:', err)
      return []
    }
  }, [user, profile?.tenant_id, supabase])

  // Update notification preferences
  const updatePreferences = useCallback(async (
    preferences: Partial<NotificationPreferences>[]
  ) => {
    if (!user || !profile?.tenant_id) return false

    try {
      for (const pref of preferences) {
        const { error } = await supabase
          .from('notification_preferences')
          .upsert({
            user_id: user.id,
            tenant_id: profile.tenant_id,
            notification_type: pref.notification_type!,
            email_enabled: pref.email_enabled ?? true,
            in_app_enabled: pref.in_app_enabled ?? true,
            push_enabled: pref.push_enabled ?? false,
            sms_enabled: pref.sms_enabled ?? false,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('tenant_id', profile.tenant_id)
          .eq('notification_type', pref.notification_type!)

        if (error) {
          throw new Error(error.message)
        }
      }

      return true
    } catch (err: any) {
      console.error('Error updating notification preferences:', err)
      return false
    }
  }, [user, profile?.tenant_id, supabase])

  // Set up real-time subscription for new notifications
  useEffect(() => {
    if (!user || !profile?.tenant_id) return

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification
          
          // Add to notifications list
          setNotifications(prev => [newNotification, ...prev])
          
          // Increment unread count
          setUnreadCount(prev => prev + 1)
          
          // Show browser notification if supported and enabled
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico',
              tag: newNotification.id
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          const updatedNotification = payload.new as Notification
          
          // Update notification in list
          setNotifications(prev => 
            prev.map(n => 
              n.id === updatedNotification.id ? updatedNotification : n
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, profile?.tenant_id, supabase])

  // Initial load
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }, [])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    getPreferences,
    updatePreferences,
    requestNotificationPermission
  }
}