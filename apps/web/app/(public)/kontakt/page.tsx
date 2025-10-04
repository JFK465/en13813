import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Headphones,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { ContactForm } from "@/components/contact/ContactForm"

// Kontaktdaten ändern sich selten, wöchentliche Revalidierung reicht
export const revalidate = 604800 // 7 Tage

export const metadata: Metadata = {
  title: 'Kontakt - EstrichManager | Wir sind für Sie da',
  description: 'Kontaktieren Sie EstrichManager für eine Demo, Support oder Beratung. Direkter Draht zu Estrich-Experten. Telefon, E-Mail oder Kontaktformular.',
  keywords: 'EstrichManager Kontakt, Support, Demo vereinbaren, Beratung Estrich Software',
  openGraph: {
    title: 'Kontakt - EstrichManager',
    description: 'Nehmen Sie Kontakt mit uns auf. Wir beraten Sie gerne zu EstrichManager.',
    type: 'website',
    locale: 'de_DE',
    url: 'https://estrichmanager.de/kontakt',
  },
  alternates: {
    canonical: 'https://estrichmanager.de/kontakt'
  }
}

const contactMethods = [
  {
    icon: Phone,
    title: "Telefon",
    description: "Mo-Fr 8:00-17:00 Uhr",
    value: "+49 (0) 123 456789",
    link: "tel:+49123456789",
  },
  {
    icon: Mail,
    title: "E-Mail",
    description: "24/7 Support",
    value: "info@estrichmanager.de",
    link: "mailto:info@estrichmanager.de",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Mo-Fr 9:00-16:00 Uhr",
    value: "Chat starten",
    link: "#chat",
  },
]

const supportOptions = [
  {
    icon: Headphones,
    title: "Support Center",
    description: "Hilfe-Artikel, Tutorials und FAQs",
    link: "/support",
  },
  {
    icon: Calendar,
    title: "Demo vereinbaren",
    description: "Persönliche Online-Präsentation",
    link: "/demo",
  },
  {
    icon: MessageSquare,
    title: "Community Forum",
    description: "Austausch mit anderen Nutzern",
    link: "/community",
  },
]

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Wir sind für Sie da
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
            Haben Sie Fragen zu EstrichManager? Möchten Sie eine Demo vereinbaren?
            Oder benötigen Sie Support? Wir freuen uns auf Ihre Nachricht.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="px-6 pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Mobile-optimized Contact Methods Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
            {contactMethods.map((method) => {
              const Icon = method.icon
              return (
                <Card key={method.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="p-6">
                    <Icon className="h-10 w-10 sm:h-8 sm:w-8 text-blue-600 mb-3" />
                    <CardTitle className="text-lg sm:text-xl">{method.title}</CardTitle>
                    <CardDescription className="text-sm">{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    {method.link.startsWith("#") ? (
                      <Button variant="outline" className="w-full min-h-[44px]">
                        {method.value}
                      </Button>
                    ) : (
                      <a
                        href={method.link}
                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline text-base block py-2"
                      >
                        {method.value}
                      </a>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="px-6 pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form - Client Component */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Nachricht senden</CardTitle>
                <CardDescription>
                  Füllen Sie das Formular aus und wir melden uns innerhalb von 24 Stunden bei Ihnen.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>

            {/* Company Info */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Unternehmenssitz</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">EstrichManager GmbH</p>
                      <p className="text-gray-600">
                        Musterstraße 123<br />
                        12345 Berlin<br />
                        Deutschland
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Geschäftszeiten</p>
                      <p className="text-gray-600">
                        Montag - Freitag: 8:00 - 17:00 Uhr<br />
                        Samstag & Sonntag: Geschlossen
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Support & Hilfe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {supportOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <Link
                          key={option.title}
                          href={option.link}
                          className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Icon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {option.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              {option.description}
                            </p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="px-6 py-20 lg:px-8 bg-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Häufig gestellte Fragen
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Finden Sie schnell Antworten auf die wichtigsten Fragen
          </p>
          {/* Mobile-optimized FAQ Grid */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 text-left">
            <div className="p-6 sm:p-8 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 text-base sm:text-lg">
                Kann ich EstrichManager kostenlos testen?
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Ja, Sie können EstrichManager 14 Tage lang kostenlos und unverbindlich testen.
              </p>
            </div>
            <div className="p-6 sm:p-8 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 text-base sm:text-lg">
                Wie schnell ist EstrichManager einsatzbereit?
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Nach der Registrierung können Sie sofort loslegen. Die Einrichtung dauert nur wenige Minuten.
              </p>
            </div>
            <div className="p-6 sm:p-8 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 text-base sm:text-lg">
                Bieten Sie Schulungen an?
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Ja, wir bieten Online-Schulungen und persönliche Einweisungen für alle Pakete an.
              </p>
            </div>
            <div className="p-6 sm:p-8 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 text-base sm:text-lg">
                Sind meine Daten sicher?
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Absolut. Wir speichern alle Daten DSGVO-konform in deutschen Rechenzentren.
              </p>
            </div>
          </div>
          <Button asChild size="lg" variant="outline" className="mt-8 h-14 px-8 text-base">
            <Link href="/faq">
              Alle FAQs ansehen
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold tracking-tight">
            Bereit für den nächsten Schritt?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Testen Sie EstrichManager 14 Tage kostenlos und unverbindlich
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-base w-full sm:w-auto">
              <Link href="/register">
                Kostenlos testen
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base w-full sm:w-auto bg-white/10 border-white text-white hover:bg-white/20">
              <Link href="/demo">
                Demo vereinbaren
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}