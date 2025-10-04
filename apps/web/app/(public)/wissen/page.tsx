import { Metadata } from "next"
import Link from "next/link"
import {
  BookOpen,
  FileText,
  Shield,
  ClipboardCheck,
  FlaskConical,
  Package,
  Search,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Users,
  Award
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ModernWissenHero } from "@/components/wissen/ModernWissenHero"
import { HoverEffect } from "@/components/ui/card-hover-effect"

export const metadata: Metadata = {
  title: "Wissen & Guides zu EN 13813, DoP und Estrich-Qualitätsmanagement | EstrichManager",
  description: "Umfassendes Expertenwissen zu EN 13813, Leistungserklärungen (DoP), CE-Kennzeichnung und Qualitätsmanagement für Estrichwerke. Praxisnahe Anleitungen und Normen-Guides.",
  keywords: ["EN 13813", "Estrich Wissen", "DoP Anleitung", "CE-Kennzeichnung Estrich", "FPC Dokumentation", "ITT Prüfung", "Estrich Qualitätsmanagement", "Estrich Normen"],
  openGraph: {
    title: "EstrichManager Wissens-Hub - Alles zu EN 13813 & Qualitätsmanagement",
    description: "Ihr Wegweiser durch EN 13813, DoP-Erstellung und Estrich-Qualitätsmanagement. Praxiserprobtes Wissen für Estrichwerke.",
    type: "website",
  },
}

export default function WissenHubPage() {
  // Hauptkategorien mit SEO-optimierten Inhalten
  const mainCategories = [
    {
      title: "EN 13813 Norm",
      slug: "en-13813",
      icon: BookOpen,
      description: "Der komplette Leitfaden zur europäischen Estrichnorm EN 13813 - von Grundlagen bis zur praktischen Umsetzung",
      articles: "15 Artikel",
      readTime: "45 Min Gesamt",
      highlight: "Meistgelesen",
      color: "bg-blue-50 border-blue-200",
      keywords: ["EN 13813 Norm", "Estrichnorm", "europäische Norm"]
    },
    {
      title: "CE-Kennzeichnung",
      slug: "ce-kennzeichnung",
      icon: Shield,
      description: "Schritt-für-Schritt Anleitung zur rechtssicheren CE-Kennzeichnung von Estrichen nach Bauproduktverordnung",
      articles: "8 Artikel",
      readTime: "30 Min Gesamt",
      highlight: "Pflichtthema",
      color: "bg-green-50 border-green-200",
      keywords: ["CE-Kennzeichnung Estrich", "CE-Zeichen", "Bauproduktverordnung"]
    },
    {
      title: "DoP Erstellung",
      slug: "dop-erstellung",
      icon: FileText,
      description: "Leistungserklärungen (DoP) korrekt erstellen - mit Vorlagen, Beispielen und häufigen Fehlern",
      articles: "12 Artikel",
      readTime: "35 Min Gesamt",
      highlight: "Praxisguide",
      color: "bg-purple-50 border-purple-200",
      keywords: ["DoP erstellen", "Leistungserklärung Estrich", "Declaration of Performance"]
    },
    {
      title: "FPC Dokumentation",
      slug: "fpc-dokumentation",
      icon: ClipboardCheck,
      description: "Werkseigene Produktionskontrolle (FPC) normkonform dokumentieren und organisieren",
      articles: "10 Artikel",
      readTime: "40 Min Gesamt",
      color: "bg-orange-50 border-orange-200",
      keywords: ["FPC", "werkseigene Produktionskontrolle", "Factory Production Control"]
    },
    {
      title: "ITT Management",
      slug: "itt-management",
      icon: FlaskConical,
      description: "Erstprüfungen (ITT) planen, durchführen und dokumentieren nach EN 13813",
      articles: "7 Artikel",
      readTime: "25 Min Gesamt",
      color: "bg-red-50 border-red-200",
      keywords: ["ITT", "Erstprüfung", "Initial Type Testing"]
    },
    {
      title: "Estricharten",
      slug: "estrich-arten",
      icon: Package,
      description: "Übersicht aller Estricharten nach DIN und EN - Eigenschaften, Anwendungen und Bezeichnungen",
      articles: "9 Artikel",
      readTime: "30 Min Gesamt",
      color: "bg-indigo-50 border-indigo-200",
      keywords: ["Estricharten", "Estrich Typen", "Zementestrich", "Calciumsulfatestrich"]
    }
  ]

  // Beliebte Artikel für SEO und User Engagement
  const popularArticles = [
    {
      title: "EN 13813 einfach erklärt - Der Komplett-Guide 2025",
      slug: "en-13813",
      category: "Norm",
      readTime: "15 Min",
      views: "12.3k"
    },
    {
      title: "DoP in 5 Minuten erstellen - Schritt-für-Schritt Anleitung",
      slug: "dop-erstellung",
      category: "DoP",
      readTime: "8 Min",
      views: "8.7k"
    },
    {
      title: "CE-Kennzeichnung für Estrich - Alles was Sie wissen müssen",
      slug: "ce-kennzeichnung",
      category: "CE",
      readTime: "12 Min",
      views: "6.2k"
    },
    {
      title: "FPC nach EN 13813 - Praxisleitfaden für Estrichwerke",
      slug: "fpc-dokumentation",
      category: "FPC",
      readTime: "10 Min",
      views: "5.1k"
    }
  ]

  // FAQ für bessere SEO Rankings
  const faqs = [
    {
      question: "Was ist EN 13813?",
      answer: "EN 13813 ist die europäische Norm für Estrichmörtel und Estrichmassen. Sie regelt Anforderungen, Prüfverfahren und Konformitätsbewertung."
    },
    {
      question: "Wann brauche ich eine Leistungserklärung (DoP)?",
      answer: "Eine DoP ist immer erforderlich, wenn Sie Estrich mit CE-Kennzeichnung in Verkehr bringen. Dies gilt für alle harmonisierten Bauprodukte."
    },
    {
      question: "Was bedeutet FPC?",
      answer: "FPC steht für Factory Production Control (werkseigene Produktionskontrolle) und ist ein verpflichtendes Qualitätssicherungssystem nach EN 13813."
    }
  ]

  return (
    <main className="min-h-screen">
      {/* Modern Hero Section with Spotlight */}
      <ModernWissenHero />

      {/* Hauptkategorien Grid - Modern Hover Effect */}
      <section className="px-6 py-16 lg:px-8 bg-neutral-950">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white">Wissenskategorien</h2>
              <p className="text-lg text-neutral-400 mt-2">
                Strukturiertes Fachwissen zu allen relevanten Themen der EN 13813
              </p>
            </div>
            <Link href="/wissen/glossar">
              <Button variant="outline" className="border-white/[0.2] bg-transparent text-white hover:bg-white/[0.1]">
                <BookOpen className="mr-2 h-4 w-4" />
                Glossar A-Z
              </Button>
            </Link>
          </div>

          <HoverEffect
            items={mainCategories.map((category) => ({
              title: category.title,
              description: category.description,
              link: `/wissen/${category.slug}`,
              icon: <category.icon className="h-8 w-8 text-blue-400" />
            }))}
          />
        </div>
      </section>

      {/* Beliebte Artikel */}
      <section className="px-6 py-16 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Meistgelesene Artikel</h2>
              <p className="text-lg text-gray-600 mt-2">
                Die wichtigsten Guides für Ihren Arbeitsalltag
              </p>
            </div>
            <Link href="/blog">
              <Button variant="outline">
                Alle Artikel
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {popularArticles.map((article) => (
              <Link key={article.slug} href={`/wissen/${article.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98] min-h-[120px]">
                  <CardHeader className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2 text-xs">{article.category}</Badge>
                        <CardTitle className="text-base sm:text-lg leading-snug">{article.title}</CardTitle>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4" />
                        {article.readTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4" />
                        {article.views} Aufrufe
                      </span>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section für SEO */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Häufig gestellte Fragen zu EN 13813 und Estrich-Qualitätsmanagement
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-start gap-2">
                    <span className="text-blue-600 font-bold">Q:</span>
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 pl-6">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/wissen/glossar">
              <Button variant="outline" size="lg">
                Mehr Fragen im Glossar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <Award className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-3xl font-bold">
            Setzen Sie Ihr Wissen in die Praxis um
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Mit EstrichManager erstellen Sie DoPs in 5 Minuten statt 4 Stunden.
            100% EN 13813 konform, garantiert.
          </p>
          {/* Mobile-optimized CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="h-14 text-base min-w-[200px]">
              <Link href="/demo">
                Live-Demo ansehen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 text-base min-w-[200px] bg-white/10 border-white text-white hover:bg-white/20"
            >
              <Link href="/register">
                Kostenlos testen
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Schema.org Structured Data für SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "EstrichManager Wissens-Hub",
            "description": "Umfassendes Expertenwissen zu EN 13813, DoP und Estrich-Qualitätsmanagement",
            "url": "https://estrichmanager.de/wissen",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": mainCategories.map((cat, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": cat.title,
                "description": cat.description,
                "url": `https://estrichmanager.de/wissen/${cat.slug}`
              }))
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://estrichmanager.de"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Wissen",
                  "item": "https://estrichmanager.de/wissen"
                }
              ]
            }
          })
        }}
      />
    </main>
  )
}