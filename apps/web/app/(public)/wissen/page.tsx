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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section mit starken Keywords */}
      <section className="relative px-6 py-24 sm:py-32 lg:px-8 bg-white border-b">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-800">
              Expertenwissen für Estrichwerke
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Ihr Wissens-Hub für EN 13813 & Estrich-Qualitätsmanagement
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
              Praxiserprobte Anleitungen, Normen-Guides und Expertenwissen zu Leistungserklärungen (DoP),
              CE-Kennzeichnung, FPC und ITT. Bleiben Sie compliant und sparen Sie Zeit.
            </p>

            {/* Search Bar für bessere UX */}
            <div className="mt-10 max-w-2xl mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    className="pl-10 h-12 text-base"
                    placeholder="Suchen Sie nach EN 13813, DoP, CE-Kennzeichnung..."
                    type="search"
                  />
                </div>
                <Button size="lg">
                  Suchen
                </Button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">150+</div>
                <div className="text-sm text-gray-600 mt-1">Fachartikel</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">2025</div>
                <div className="text-sm text-gray-600 mt-1">Aktualisiert</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">100%</div>
                <div className="text-sm text-gray-600 mt-1">Normkonform</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">Kostenlos</div>
                <div className="text-sm text-gray-600 mt-1">Zugang</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hauptkategorien Grid */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Wissenskategorien</h2>
              <p className="text-lg text-gray-600 mt-2">
                Strukturiertes Fachwissen zu allen relevanten Themen der EN 13813
              </p>
            </div>
            <Link href="/wissen/glossar">
              <Button variant="outline">
                <BookOpen className="mr-2 h-4 w-4" />
                Glossar A-Z
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mainCategories.map((category) => (
              <Link key={category.slug} href={`/wissen/${category.slug}`}>
                <Card className={`h-full hover:shadow-lg transition-shadow cursor-pointer border-2 ${category.color}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <category.icon className="h-8 w-8 text-blue-600" />
                      {category.highlight && (
                        <Badge variant="secondary">{category.highlight}</Badge>
                      )}
                    </div>
                    <CardTitle className="mt-4 text-xl">{category.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{category.articles}</span>
                      <span>{category.readTime}</span>
                    </div>
                    <div className="mt-4 flex items-center text-blue-600 font-medium">
                      Zum Guide
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
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

          <div className="grid gap-4 md:grid-cols-2">
            {popularArticles.map((article) => (
              <Link key={article.slug} href={`/wissen/${article.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2">{article.category}</Badge>
                        <CardTitle className="text-lg">{article.title}</CardTitle>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {article.readTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
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
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/demo">
                Live-Demo ansehen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 border-white text-white hover:bg-white/20"
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