'use client'

import { useEffect, useState } from 'react'
import { Settings, Mail, Smartphone, Bell, MessageSquare } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useNotifications } from '@/hooks/useNotifications'
import { useToast } from '@/hooks/use-toast'
import type { NotificationType } from '@/lib/core/notifications'

interface NotificationPreferencesProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface PreferenceItem {
  type: NotificationType
  label: string
  description: string
  emailEnabled: boolean
  inAppEnabled: boolean
  pushEnabled: boolean
  smsEnabled: boolean
}

export function NotificationPreferences({
  open,
  onOpenChange
}: NotificationPreferencesProps) {
  const { getPreferences, updatePreferences } = useNotifications()
  const { toast } = useToast()
  const [preferences, setPreferences] = useState<PreferenceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Default preference items
  const defaultPreferences: Omit<PreferenceItem, 'emailEnabled' | 'inAppEnabled' | 'pushEnabled' | 'smsEnabled'>[] = [
    {
      type: 'deadline_reminder',
      label: 'Deadline Reminders',
      description: 'Get notified when compliance deadlines are approaching'
    },
    {
      type: 'document_approval_required',
      label: 'Document Approvals',
      description: 'When documents require your approval'
    },
    {
      type: 'document_approved',
      label: 'Document Approved',
      description: 'When your documents are approved'
    },
    {
      type: 'document_rejected',
      label: 'Document Rejected',
      description: 'When your documents are rejected'
    },
    {
      type: 'workflow_assigned',
      label: 'Workflow Assignments',
      description: 'When you are assigned to a workflow step'
    },
    {
      type: 'workflow_completed',
      label: 'Workflow Completed',
      description: 'When workflows you are involved in are completed'
    },
    {
      type: 'workflow_overdue',
      label: 'Workflow Overdue',
      description: 'When workflow steps become overdue'
    },
    {
      type: 'report_generated',
      label: 'Report Generated',
      description: 'When reports you requested are ready'
    },
    {
      type: 'audit_scheduled',
      label: 'Audit Scheduled',
      description: 'When audits are scheduled or updated'
    },
    {
      type: 'compliance_alert',
      label: 'Compliance Alerts',
      description: 'Important compliance-related alerts'
    },
    {
      type: 'system_maintenance',
      label: 'System Maintenance',
      description: 'System maintenance and downtime notifications'
    }
  ]

  // Load preferences when dialog opens
  useEffect(() => {
    if (open) {
      loadPreferences()
    }
  }, [open])

  const loadPreferences = async () => {
    try {
      setLoading(true)
      const savedPreferences = await getPreferences()
      
      // Create preference items with saved values or defaults
      const preferenceItems = defaultPreferences.map(defaultPref => {
        const saved = savedPreferences.find(p => p.notification_type === defaultPref.type)
        
        return {
          ...defaultPref,
          emailEnabled: saved?.email_enabled ?? true,
          inAppEnabled: saved?.in_app_enabled ?? true,
          pushEnabled: saved?.push_enabled ?? false,
          smsEnabled: saved?.sms_enabled ?? false
        }
      })

      setPreferences(preferenceItems)
    } catch (error) {
      console.error('Error loading preferences:', error)
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePreferenceChange = (
    type: NotificationType,
    channel: 'email' | 'inApp' | 'push' | 'sms',
    enabled: boolean
  ) => {
    setPreferences(prev => 
      prev.map(pref => {
        if (pref.type === type) {
          return {
            ...pref,
            [`${channel}Enabled`]: enabled
          }
        }
        return pref
      })
    )
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const preferencesToUpdate = preferences.map(pref => ({
        notification_type: pref.type,
        email_enabled: pref.emailEnabled,
        in_app_enabled: pref.inAppEnabled,
        push_enabled: pref.pushEnabled,
        sms_enabled: pref.smsEnabled
      }))

      const success = await updatePreferences(preferencesToUpdate)

      if (success) {
        toast({
          title: 'Preferences Saved',
          description: 'Your notification preferences have been updated'
        })
        onOpenChange(false)
      } else {
        throw new Error('Failed to save preferences')
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEnableAll = (channel: 'email' | 'inApp' | 'push' | 'sms') => {
    setPreferences(prev =>
      prev.map(pref => ({
        ...pref,
        [`${channel}Enabled`]: true
      }))
    )
  }

  const handleDisableAll = (channel: 'email' | 'inApp' | 'push' | 'sms') => {
    setPreferences(prev =>
      prev.map(pref => ({
        ...pref,
        [`${channel}Enabled`]: false
      }))
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Preferences
          </DialogTitle>
          <DialogDescription>
            Choose how you want to receive notifications for different types of events.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-48" />
                </div>
                <div className="flex gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Channel Headers */}
            <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-muted-foreground">
              <div className="col-span-6">Notification Type</div>
              <div className="col-span-6 grid grid-cols-4 gap-2 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Bell className="h-4 w-4" />
                  <span>In-App</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Smartphone className="h-4 w-4" />
                  <span>Push</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>SMS</span>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-6">
                <span className="text-sm font-medium">Quick Actions</span>
              </div>
              <div className="col-span-6 grid grid-cols-4 gap-2">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEnableAll('email')}
                    className="text-xs"
                  >
                    All On
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisableAll('email')}
                    className="text-xs"
                  >
                    All Off
                  </Button>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEnableAll('inApp')}
                    className="text-xs"
                  >
                    All On
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisableAll('inApp')}
                    className="text-xs"
                  >
                    All Off
                  </Button>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEnableAll('push')}
                    className="text-xs"
                  >
                    All On
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisableAll('push')}
                    className="text-xs"
                  >
                    All Off
                  </Button>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEnableAll('sms')}
                    className="text-xs"
                  >
                    All On
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisableAll('sms')}
                    className="text-xs"
                  >
                    All Off
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Preference Items */}
            <div className="space-y-4">
              {preferences.map((pref) => (
                <div key={pref.type} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-6 space-y-1">
                    <Label className="text-sm font-medium">{pref.label}</Label>
                    <p className="text-xs text-muted-foreground">{pref.description}</p>
                  </div>
                  <div className="col-span-6 grid grid-cols-4 gap-2">
                    <div className="flex justify-center">
                      <Switch
                        checked={pref.emailEnabled}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange(pref.type, 'email', checked)
                        }
                      />
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        checked={pref.inAppEnabled}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange(pref.type, 'inApp', checked)
                        }
                      />
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        checked={pref.pushEnabled}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange(pref.type, 'push', checked)
                        }
                        disabled // Coming soon
                      />
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        checked={pref.smsEnabled}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange(pref.type, 'sms', checked)
                        }
                        disabled // Coming soon
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Save Button */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}