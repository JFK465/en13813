export default function CookiesPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Cookie-Richtlinie</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 mb-6">Stand: Januar 2025</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Was sind Cookies?</h2>
        <p>
          Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, wenn Sie unsere Website besuchen.
          Sie helfen uns dabei, Ihre Präferenzen zu speichern und die Funktionalität unserer Plattform zu verbessern.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Welche Cookies verwenden wir?</h2>

        <h3 className="text-xl font-semibold mt-6 mb-3">Notwendige Cookies</h3>
        <p>
          Diese Cookies sind für den Betrieb unserer Website unerlässlich und können nicht deaktiviert werden.
          Sie werden normalerweise nur als Reaktion auf von Ihnen getätigte Aktionen gesetzt, wie z.B.:
        </p>
        <ul className="list-disc pl-6 mt-2">
          <li>Anmeldung in Ihrem Benutzerkonto</li>
          <li>Speicherung Ihrer Sitzungsdaten</li>
          <li>Sicherheitstoken zur Authentifizierung</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">Funktionale Cookies</h3>
        <p>
          Diese Cookies ermöglichen es der Website, erweiterte Funktionalität und Personalisierung zu bieten:
        </p>
        <ul className="list-disc pl-6 mt-2">
          <li>Speicherung Ihrer Spracheinstellungen</li>
          <li>Speicherung Ihrer Anzeigeeinstellungen</li>
          <li>Merken Ihrer letzten Aktivitäten</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies von Drittanbietern</h2>
        <p>
          Wir verwenden folgende Dienste, die möglicherweise Cookies setzen:
        </p>
        <ul className="list-disc pl-6 mt-2">
          <li><strong>Supabase:</strong> Für Authentifizierung und Datenbankzugriff</li>
          <li><strong>Vercel:</strong> Für das Hosting unserer Website</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Wie lange werden Cookies gespeichert?</h2>
        <p>
          Die Speicherdauer der Cookies variiert je nach Typ:
        </p>
        <ul className="list-disc pl-6 mt-2">
          <li><strong>Sitzungs-Cookies:</strong> Werden gelöscht, sobald Sie Ihren Browser schließen</li>
          <li><strong>Persistente Cookies:</strong> Werden für einen bestimmten Zeitraum gespeichert (normalerweise 30 Tage)</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Wie können Sie Cookies verwalten?</h2>
        <p>
          Sie können Cookies in Ihrem Browser verwalten und löschen. Beachten Sie jedoch, dass das Blockieren
          bestimmter Cookies die Funktionalität unserer Website beeinträchtigen kann.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Browser-Einstellungen</h3>
        <p>Die meisten Browser erlauben es Ihnen:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>Alle Cookies zu sehen und einzeln zu löschen</li>
          <li>Alle Cookies zu blockieren</li>
          <li>Alle Cookies beim Schließen des Browsers zu löschen</li>
          <li>Cookies von bestimmten Websites zu blockieren</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Zustimmung</h2>
        <p>
          Durch die Nutzung unserer Website stimmen Sie der Verwendung von Cookies gemäß dieser Richtlinie zu.
          Wenn Sie mit unserer Cookie-Richtlinie nicht einverstanden sind, sollten Sie entweder Ihre
          Browser-Einstellungen entsprechend anpassen oder unsere Website nicht nutzen.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Kontakt</h2>
        <p>
          Bei Fragen zu unserer Cookie-Richtlinie kontaktieren Sie uns bitte unter:<br />
          E-Mail: datenschutz@estrichmanager.de
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Änderungen dieser Richtlinie</h2>
        <p>
          Wir behalten uns vor, diese Cookie-Richtlinie zu aktualisieren. Änderungen werden auf dieser
          Seite veröffentlicht und treten mit der Veröffentlichung in Kraft.
        </p>
      </div>
    </div>
  )
}