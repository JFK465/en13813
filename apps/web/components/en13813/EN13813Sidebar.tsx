'use client'

import {
  FileText,
  FlaskConical,
  Package,
  ClipboardCheck,
  Shield,
  Home,
  Plus,
  BarChart3,
  Settings,
  Building2,
  TestTube,
  FileCheck,
  Gauge,
  Calendar,
  Truck,
  AlertTriangle,
  MessageSquare
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const en13813Navigation = [
  {
    title: 'Hauptbereich',
    items: [
      {
        title: 'Dashboard',
        url: '/en13813',
        icon: Home,
        description: 'Übersicht und Statistiken'
      },
      {
        title: 'Rezepturen',
        url: '/en13813/recipes',
        icon: FlaskConical,
        description: 'Estrich-Rezepturen verwalten'
      },
      {
        title: 'Leistungserklärungen',
        url: '/en13813/dops',
        icon: FileText,
        description: 'DOPs erstellen und verwalten'
      },
    ]
  },
  {
    title: 'Qualitätskontrolle',
    items: [
      {
        title: 'Chargen',
        url: '/en13813/batches',
        icon: Package,
        description: 'Produktionschargen verfolgen'
      },
      {
        title: 'Prüfberichte',
        url: '/en13813/test-reports',
        icon: ClipboardCheck,
        description: 'ITT und FPC Prüfungen'
      },
      {
        title: 'Laborwerte',
        url: '/en13813/lab-values',
        icon: TestTube,
        description: 'Messwerte und Analysen'
      },
      {
        title: 'Kalibrierung',
        url: '/en13813/calibration',
        icon: Gauge,
        description: 'Gerätekalibrierung'
      },
      {
        title: 'Prüfpläne',
        url: '/en13813/test-plans',
        icon: Calendar,
        description: 'ITT und FPC Planung'
      },
    ]
  },
  {
    title: 'Produktion & Versand',
    items: [
      {
        title: 'Marking & Lieferschein',
        url: '/en13813/marking',
        icon: Truck,
        description: 'Kennzeichnung nach Klausel 8'
      },
    ]
  },
  {
    title: 'Qualitätsmanagement',
    items: [
      {
        title: 'Abweichungen/CAPA',
        url: '/en13813/deviations',
        icon: AlertTriangle,
        description: 'Korrekturmaßnahmen & Wirksamkeit'
      },
    ]
  },
  {
    title: 'Compliance & Berichte',
    items: [
      {
        title: 'CE-Konformität',
        url: '/en13813/compliance',
        icon: Shield,
        description: 'Konformitätsbewertung'
      },
      {
        title: 'Berichte',
        url: '/en13813/reports',
        icon: BarChart3,
        description: 'Auswertungen und Statistiken'
      },
      {
        title: 'Audit-Log',
        url: '/en13813/audit',
        icon: FileCheck,
        description: 'Änderungsprotokoll'
      },
    ]
  }
]

const quickActions = [
  {
    title: 'Neue Rezeptur',
    url: '/en13813/recipes/new',
    icon: Plus,
    variant: 'default' as const
  },
  {
    title: 'Neuer DOP',
    url: '/en13813/dops/new',
    icon: Plus,
    variant: 'default' as const
  },
  {
    title: 'Prüfbericht erfassen',
    url: '/en13813/test-reports/new',
    icon: Plus,
    variant: 'default' as const
  },
]

export function EN13813Sidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="relative h-10 w-10 flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="EstrichManager"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">EstrichManager</span>
            <span className="text-xs text-muted-foreground">
              EN 13813 Qualitätsmanagement
            </span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>Schnellzugriff</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2 px-1">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant={action.variant}
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={action.url}>
                    <action.icon className="mr-2 h-4 w-4" />
                    {action.title}
                  </Link>
                </Button>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Main Navigation */}
        {en13813Navigation.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.description}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarSeparator />

        {/* System */}
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/en13813/feedback'}
                >
                  <Link href="/en13813/feedback">
                    <MessageSquare className="h-4 w-4" />
                    <span>Feedback</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/en13813/settings'}
                >
                  <Link href="/en13813/settings">
                    <Settings className="h-4 w-4" />
                    <span>Einstellungen</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="px-3 py-2">
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center justify-between mb-1">
              <span>Standard:</span>
              <span className="font-medium">EN 13813:2002</span>
            </div>
            <div className="flex items-center justify-between">
              <span>AVCP System:</span>
              <span className="font-medium">4</span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}