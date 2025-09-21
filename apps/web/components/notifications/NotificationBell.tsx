'use client'

import { useState } from 'react'
import { Bell, Check, CheckCheck, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationList } from './NotificationList'
import { NotificationPreferences } from './NotificationPreferences'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const { unreadCount, markAllAsRead, loading } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const handleBellClick = () => {
    setIsOpen(!isOpen)
    setShowPreferences(false)
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={handleBellClick}
            disabled={loading}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className={cn(
                  "absolute -top-1 -right-1 h-5 w-5 rounded-full p-0",
                  "flex items-center justify-center text-xs font-medium",
                  unreadCount > 99 ? "text-[10px]" : "text-xs"
                )}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-80 max-h-96 overflow-hidden"
          sideOffset={5}
        >
          <DropdownMenuHeader className="flex items-center justify-between px-4 py-3">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreferences(true)}
                className="h-auto p-1"
              >
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </DropdownMenuHeader>

          <DropdownMenuSeparator />

          <div className="max-h-64 overflow-y-auto">
            <NotificationList compact />
          </div>

          {unreadCount === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No new notifications
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Notification Preferences Modal */}
      <NotificationPreferences
        open={showPreferences}
        onOpenChange={setShowPreferences}
      />
    </>
  )
}

// Add to dropdown menu components if not already present
function DropdownMenuHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}