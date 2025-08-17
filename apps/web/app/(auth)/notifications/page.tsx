'use client'

import { useState } from 'react'
import { Bell, Settings, Filter, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotificationList } from '@/components/notifications/NotificationList'
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences'
import { useNotifications } from '@/hooks/useNotifications'
import type { NotificationType } from '@/lib/core/notifications'

export default function NotificationsPage() {
  const { unreadCount, markAllAsRead } = useNotifications()
  const [showPreferences, setShowPreferences] = useState(false)
  const [selectedType, setSelectedType] = useState<NotificationType | undefined>()

  const notificationTypes: { value: NotificationType; label: string }[] = [
    { value: 'deadline_reminder', label: 'Deadlines' },
    { value: 'document_approval_required', label: 'Approvals' },
    { value: 'workflow_assigned', label: 'Assignments' },
    { value: 'workflow_completed', label: 'Completed' },
    { value: 'report_generated', label: 'Reports' },
    { value: 'compliance_alert', label: 'Alerts' },
  ]

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Manage your compliance notifications and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read ({unreadCount})
            </Button>
          )}
          <Button 
            onClick={() => setShowPreferences(true)}
            variant="outline" 
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              New notifications
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Notifications received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Bell className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Urgent notifications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notification Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>
            View and manage your compliance notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger 
                value="all" 
                onClick={() => setSelectedType(undefined)}
              >
                All
              </TabsTrigger>
              {notificationTypes.map((type) => (
                <TabsTrigger 
                  key={type.value} 
                  value={type.value}
                  onClick={() => setSelectedType(type.value)}
                >
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <NotificationList 
                limit={50} 
                type={selectedType}
              />
            </TabsContent>

            {notificationTypes.map((type) => (
              <TabsContent key={type.value} value={type.value} className="space-y-4">
                <NotificationList 
                  limit={50} 
                  type={type.value}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Preferences Modal */}
      <NotificationPreferences
        open={showPreferences}
        onOpenChange={setShowPreferences}
      />
    </div>
  )
}