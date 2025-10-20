import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'AGB - EstrichManager',
  description: 'Allgemeine Geschäftsbedingungen für die Nutzung von EstrichManager',
  robots: {
    index: true,
    follow: true,
  },
}

export default function AGBPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl">
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Startseite
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <FileText className="h-10 w-10 text-orange-500" />
            Allgemeine Geschäftsbedingungen
          </h1>
          <p className="text-lg text-gray-600">
            Nutzungsbedingungen für EstrichManager
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          <p className="text-gray-600 text-sm">Stand: Januar 2025</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 1 Geltungsbereich</h2>
            <div className="space-y-3 text-gray-700">
              <p>(1) Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen Jonas Krüger, Meisenweg 13, 78465 Konstanz (nachfolgend "Anbieter") und den Nutzern der EstrichManager-Plattform (nachfolgend "Kunde").</p>
              <p>(2) Abweichende Bedingungen des Kunden werden nur dann Vertragsbestandteil, wenn der Anbieter ausdrücklich schriftlich zustimmt.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 2 Vertragsgegenstand</h2>
            <p className="text-gray-700">EstrichManager ist eine Software-as-a-Service (SaaS) Lösung für das Qualitätsmanagement in der Estrichindustrie gemäß EN 13813.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 3 Beta-Phase und Nutzungsbedingungen</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">3.1 Beta-Status</h3>
            <p className="text-gray-700">Die Software befindet sich derzeit in der Beta-Phase (Entwicklungsversion). Die Nutzung während der Beta-Phase ist kostenlos. Das Ende der Beta-Phase wird rechtzeitig bekannt gegeben.</p>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">3.2 Eigenschaften der Beta-Software</h3>
            <p className="text-gray-700">Als Beta-Software können folgende Eigenschaften auftreten:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
              <li>Die Software kann Fehler, Bugs und Instabilitäten aufweisen</li>
              <li>Funktionen können sich ändern, ergänzt oder entfernt werden</li>
              <li>Die Verfügbarkeit ist nicht garantiert (kein Service Level Agreement)</li>
              <li>Datenverlust kann auftreten – wir empfehlen regelmäßige eigene Backups</li>
              <li>Updates und Änderungen können jederzeit ohne Vorankündigung erfolgen</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">3.3 Übergang zu kostenpflichtigen Tarifen</h3>
            <div className="space-y-2 text-gray-700">
              <p>Nach Ende der Beta-Phase behalten wir uns vor, kostenpflichtige Tarife einzuführen.</p>
              <p>Beta-Tester werden mindestens 60 Tage vor Einführung kostenpflichtiger Tarife per E-Mail informiert und erhalten:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Ein Sonderkündigungsrecht</li>
                <li>50% Rabatt auf den regulären Tarif für 12 Monate nach Vertragsabschluss</li>
                <li>Rabattgewährung nur bei Vertragsabschluss innerhalb von 30 Tagen nach Ende der Beta-Phase</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 4 Datenschutz</h2>
            <p className="text-gray-700">Der Schutz Ihrer Daten hat für uns höchste Priorität. Details finden Sie in unserer{' '}
              <Link href="/datenschutz" className="text-blue-600 hover:underline">Datenschutzerklärung</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 5 Haftung und Gewährleistung</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">5.1 Allgemeine Haftungsregelung</h3>
            <div className="space-y-3 text-gray-700">
              <p className="font-semibold">Unbeschränkte Haftung:</p>
              <p>Wir haften unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit sowie für Schäden aus Vorsatz oder grober Fahrlässigkeit.</p>

              <p className="font-semibold mt-3">Haftung bei wesentlichen Vertragspflichten:</p>
              <p>Bei der fahrlässigen Verletzung wesentlicher Vertragspflichten ist unsere Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt.</p>

              <p className="font-semibold mt-3">Ausgeschlossene Haftung:</p>
              <p>Im Übrigen ist unsere Haftung ausgeschlossen, soweit gesetzlich zulässig.</p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">5.2 Besonderheiten während der Beta-Phase</h3>
            <div className="space-y-3 text-gray-700">
              <p className="font-semibold">Keine Gewährleistung für Vollständigkeit:</p>
              <p>Während der Beta-Phase wird keine Gewährleistung für die Vollständigkeit, Richtigkeit oder ständige Verfügbarkeit der Software übernommen, soweit gesetzlich zulässig.</p>

              <p className="font-semibold mt-3">Haftungsausschluss für Beta-typische Risiken:</p>
              <p>Soweit gesetzlich zulässig, haften wir während der Beta-Phase nicht für:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Datenverlust oder -beschädigung (regelmäßige eigene Backups erforderlich)</li>
                <li>Unterbrechungen der Verfügbarkeit</li>
                <li>Fehler in algorithmischen Berechnungen (fachliche Prüfung erforderlich)</li>
                <li>Wirtschaftliche Schäden durch fehlerhafte Compliance-Dokumente</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">5.3 Haftungshöchstgrenzen (Beta-Phase)</h3>
            <p className="text-gray-700">Während der kostenlosen Beta-Phase ist unsere Haftung auf EUR 10.000 pro Schadensfall und EUR 50.000 pro Kalenderjahr begrenzt, sofern nicht unbeschränkte Haftung nach § 5.1 besteht.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 6 Compliance-Verantwortung und Werkzeugcharakter</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">6.1 Verantwortung des Nutzers</h3>
            <p className="text-gray-700 mb-2">Sie bleiben zu jeder Zeit allein verantwortlich für:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
              <li>Die Einhaltung der EN 13813 und aller anwendbaren Normen und Vorschriften</li>
              <li>Die Richtigkeit der in die Software eingegebenen Daten</li>
              <li>Die fachliche Validierung aller durch die Software generierten Dokumente</li>
              <li>Die finale Freigabe von Dokumenten und Produkten</li>
              <li>Die Schulung und Qualifikation Ihres Personals</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">6.2 Werkzeugcharakter</h3>
            <p className="text-gray-700">EstrichManager ist ein Werkzeug zur Unterstützung Ihrer Compliance-Prozesse. Die Software trifft keine eigenständigen Compliance-Entscheidungen und ersetzt nicht die fachliche Beurteilung durch qualifiziertes Personal.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">§ 7 Pflichten als Beta-Tester</h2>
            <p className="text-gray-700 mb-2">Als Beta-Tester verpflichten Sie sich:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
              <li>Fehler und Unstimmigkeiten unverzüglich zu melden</li>
              <li>Kritische Compliance-Dokumente vor Verwendung manuell zu prüfen</li>
              <li>Die Software nicht für produktionskritische Prozesse ohne zusätzliche Validierung einzusetzen</li>
              <li>Regelmäßige Backups Ihrer Daten anzufertigen</li>
            </ul>
          </section>

          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-gray-600">Stand: Januar 2025</p>
            <p className="text-sm text-gray-700 mt-2">
              Bei Fragen zu diesen AGB können Sie uns jederzeit unter{' '}
              <a href="mailto:info@jfkconsulting.de" className="text-blue-600 hover:underline">
                info@jfkconsulting.de
              </a>{' '}
              kontaktieren.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/impressum" className="text-blue-600 hover:text-blue-700 hover:underline">
            Impressum
          </Link>
          <span className="text-gray-400">•</span>
          <Link href="/datenschutz" className="text-blue-600 hover:text-blue-700 hover:underline">
            Datenschutzerklärung
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