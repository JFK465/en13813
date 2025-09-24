"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Menu, X, Building2, ChevronDown, BookOpen, FileText, Shield, FlaskConical, ClipboardCheck, Package } from "lucide-react"
import { useState } from "react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export function MainNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "Funktionen", href: "/funktionen" },
    { name: "Preise", href: "/preise" },
    {
      name: "Wissen",
      href: "/wissen",
      dropdown: true,
      items: [
        {
          title: "EN 13813 Guide",
          href: "/wissen/en-13813",
          description: "Alles zur Estrichnorm",
          icon: BookOpen,
        },
        {
          title: "CE-Kennzeichnung",
          href: "/wissen/ce-kennzeichnung",
          description: "CE-Zeichen richtig anbringen",
          icon: Shield,
        },
        {
          title: "DoP Erstellung",
          href: "/wissen/dop-erstellung",
          description: "Leistungserklärung erstellen",
          icon: FileText,
        },
        {
          title: "FPC-Dokumentation",
          href: "/wissen/fpc-dokumentation",
          description: "Werkseigene Produktionskontrolle",
          icon: ClipboardCheck,
        },
        {
          title: "ITT-Management",
          href: "/wissen/itt-management",
          description: "Erstprüfung durchführen",
          icon: FlaskConical,
        },
        {
          title: "Estrich-Arten",
          href: "/wissen/estrich-arten",
          description: "Alle Estrichtypen im Überblick",
          icon: Package,
        },
        {
          title: "Glossar A-Z",
          href: "/wissen/glossar",
          description: "150+ Fachbegriffe erklärt",
          icon: BookOpen,
        },
      ],
    },
    { name: "Kontakt", href: "/kontakt" },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">EstrichManager</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                {navigation.map((item) => (
                  item.dropdown ? (
                    <NavigationMenuItem key={item.name}>
                      <NavigationMenuTrigger className="h-9 px-4 py-2">
                        {item.name}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {item.items?.map((subItem) => (
                            <li key={subItem.title}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={subItem.href}
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  <div className="flex items-center gap-2">
                                    {subItem.icon && <subItem.icon className="h-4 w-4 text-blue-600" />}
                                    <div className="text-sm font-medium leading-none">{subItem.title}</div>
                                  </div>
                                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    {subItem.description}
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:text-blue-600 focus:outline-none",
                          pathname === item.href
                            ? "text-blue-600"
                            : "text-gray-700"
                        )}
                      >
                        {item.name}
                      </Link>
                    </NavigationMenuItem>
                  )
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex md:items-center md:gap-x-4">
            <Button asChild variant="ghost">
              <Link href="/login">Anmelden</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Kostenlos testen</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Menü öffnen</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                item.dropdown ? (
                  <div key={item.name}>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {item.name}
                    </div>
                    {item.items?.map((subItem) => (
                      <Link
                        key={subItem.title}
                        href={subItem.href}
                        className={cn(
                          "block px-6 py-2 text-sm font-medium",
                          pathname === subItem.href
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          {subItem.icon && <subItem.icon className="h-4 w-4" />}
                          <span>{subItem.title}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      pathname === item.href
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              ))
              <div className="border-t pt-4 space-y-2">
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Anmelden
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Kostenlos testen
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export function MainFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Company */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-6 w-6 text-blue-400" />
              <h3 className="text-lg font-semibold">EstrichManager</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Die führende Qualitätsmanagement-Software für EN13813 konforme Estrichproduktion.
            </p>
            <div className="mt-4 flex gap-4">
              <Button asChild size="sm" variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Link href="/demo">Demo anfordern</Link>
              </Button>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Produkt</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/funktionen" className="text-gray-400 hover:text-white transition-colors">
                  Funktionen
                </Link>
              </li>
              <li>
                <Link href="/preise" className="text-gray-400 hover:text-white transition-colors">
                  Preise
                </Link>
              </li>
              <li>
                <Link href="/en13813" className="text-gray-400 hover:text-white transition-colors">
                  EN13813 Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-400 hover:text-white transition-colors">
                  Registrierung
                </Link>
              </li>
            </ul>
          </div>

          {/* Wissen */}
          <div>
            <h4 className="font-semibold mb-4">Wissen</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/wissen" className="text-gray-400 hover:text-white transition-colors">
                  Wissens-Hub
                </Link>
              </li>
              <li>
                <Link href="/wissen/en-13813" className="text-gray-400 hover:text-white transition-colors">
                  EN 13813 Guide
                </Link>
              </li>
              <li>
                <Link href="/wissen/ce-kennzeichnung" className="text-gray-400 hover:text-white transition-colors">
                  CE-Kennzeichnung
                </Link>
              </li>
              <li>
                <Link href="/wissen/estrich-arten" className="text-gray-400 hover:text-white transition-colors">
                  Estrich-Arten
                </Link>
              </li>
              <li>
                <Link href="/wissen/glossar" className="text-gray-400 hover:text-white transition-colors">
                  Glossar A-Z
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/kontakt" className="text-gray-400 hover:text-white transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/wissen/fpc-dokumentation" className="text-gray-400 hover:text-white transition-colors">
                  FPC-Dokumentation
                </Link>
              </li>
              <li>
                <Link href="/wissen/itt-management" className="text-gray-400 hover:text-white transition-colors">
                  ITT-Management
                </Link>
              </li>
              <li>
                <Link href="/wissen/dop-erstellung" className="text-gray-400 hover:text-white transition-colors">
                  DoP-Erstellung
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Rechtliches</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/impressum" className="text-gray-400 hover:text-white transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-gray-400 hover:text-white transition-colors">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/agb" className="text-gray-400 hover:text-white transition-colors">
                  AGB
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                  Cookie-Richtlinie
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © 2025 EstrichManager GmbH. Alle Rechte vorbehalten.
          </p>
          <p className="text-sm text-gray-400 mt-4 sm:mt-0">
            Made with ❤️ in Berlin
          </p>
        </div>
      </div>
    </footer>
  )
}