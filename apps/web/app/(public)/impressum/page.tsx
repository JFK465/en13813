import { Metadata } from 'next'
import Link from 'next/link'
import { Building2, Mail, MapPin, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Impressum - EstrichManager',
  description: 'Impressum und Anbieterkennzeichnung gemäß § 5 DDG',
  robots: {
    index: true,
    follow: true,
  },
}

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Startseite
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-4">Impressum</h1>
        <p className="text-lg text-gray-600 mb-8">
          Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)
        </p>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-orange-500" />
              Anbieter
            </h2>
            <div className="space-y-2 text-gray-700">
              <p className="font-medium text-lg">Jonas Krüger</p>
              <p className="text-gray-600">Einzelunternehmen</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-orange-500" />
              Anschrift
            </h2>
            <address className="not-italic text-gray-700 space-y-1">
              <p>Meisenweg 13</p>
              <p>78465 Konstanz</p>
              <p>Deutschland</p>
            </address>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="h-6 w-6 text-blue-600" />
              Kontakt
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">E-Mail:</span>
                <a
                  href="mailto:info@jfkconsulting.de"
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  info@jfkconsulting.de
                </a>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Umsatzsteuer-Identifikationsnummer
            </h2>
            <p className="text-gray-700">
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
            </p>
            <p className="text-gray-600 mt-2 text-sm">
              Wird nachgereicht bzw. kann auf Anfrage mitgeteilt werden.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h2>
            <p className="text-gray-700">
              Jonas Krüger<br />
              Meisenweg 13<br />
              78465 Konstanz
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">EU-Streitschlichtung</h2>
            <p className="text-gray-700 mb-3">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
            </p>
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline break-all"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
            <p className="text-gray-700 mt-3">
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Verbraucherstreitbeilegung / Universalschlichtungsstelle
            </h2>
            <p className="text-gray-700">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Haftung für Inhalte</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
                nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
                Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
                Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
                Tätigkeit hinweisen.
              </p>
              <p>
                Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
                allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch
                erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei
                Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend
                entfernen.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Haftung für Links</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
                Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr
                übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder
                Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der
                Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum
                Zeitpunkt der Verlinkung nicht erkennbar.
              </p>
              <p>
                Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete
                Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
                Rechtsverletzungen werden wir derartige Links umgehend entfernen.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Urheberrecht</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
                unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung
                und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
                schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien
                dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
              </p>
              <p>
                Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die
                Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche
                gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden,
                bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen
                werden wir derartige Inhalte umgehend entfernen.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/datenschutz" className="text-blue-600 hover:text-blue-700 hover:underline">
            Datenschutzerklärung
          </Link>
          <span className="text-gray-400">•</span>
          <Link href="/agb" className="text-blue-600 hover:text-blue-700 hover:underline">
            AGB
          </Link>
          <span className="text-gray-400">•</span>
          <Link href="/kontakt" className="text-blue-600 hover:text-blue-700 hover:underline">
            Kontakt
          </Link>
        </div>
      </div>
    </main>
  )
}