export default function BetaTermsPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Beta-Tester Vereinbarung</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 mb-6">Stand: Januar 2025</p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>Wichtig:</strong> Diese Vereinbarung ergänzt unsere Allgemeinen Geschäftsbedingungen
            und gilt speziell für die Beta-Phase von EstrichManager. Im Konfliktfall haben die Regelungen
            dieser Beta-Vereinbarung Vorrang.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Zweck der Beta-Phase</h2>
        <p>
          Sie nehmen als Beta-Tester am Entwicklungsprozess von EstrichManager teil. Ziel ist es,
          die Software unter realen Bedingungen zu testen, Fehler zu identifizieren und Feedback
          zur Verbesserung der Funktionalität zu geben.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Beta-Zeitraum</h2>
        <p>
          Die Beta-Phase läuft bis auf Weiteres. Das Ende der Beta-Phase wird rechtzeitig bekannt gegeben.
          Beta-Tester werden <strong>mindestens 60 Tage vor Ende der Beta-Phase</strong> per E-Mail informiert,
          bevor kostenpflichtige Tarife eingeführt werden.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Kostenlose Nutzung und Vorteile</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2">3.1 Während der Beta-Phase</h3>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Vollständig kostenloser Zugang zu allen Funktionen</li>
          <li>Prioritäts-Support per E-Mail</li>
          <li>Direkter Einfluss auf die Produktentwicklung</li>
          <li>Zugang zu Beta-Features vor allen anderen</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">3.2 Nach der Beta-Phase</h3>
        <p>Beta-Tester erhalten folgende exklusive Vorteile:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li><strong>50% Rabatt</strong> auf den regulären Tarif für mindestens 12 Monate (vorbehaltlich endgültiger Preisgestaltung)</li>
          <li>Lebenslange Anerkennung als Early Adopter</li>
          <li>Bevorzugte Konditionen bei zukünftigen Premium-Features</li>
          <li>60 Tage Kündigungsfrist vor Einführung kostenpflichtiger Tarife</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Software-Status und bekannte Einschränkungen</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2">4.1 Beta-Software Eigenschaften</h3>
        <p>Sie akzeptieren ausdrücklich, dass die Software:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Fehler, Bugs und Instabilitäten enthalten kann</li>
          <li>Nicht für produktionskritische Anwendungen ohne zusätzliche Validierung geeignet ist</li>
          <li>Sich jederzeit ohne Vorankündigung ändern kann</li>
          <li>Zeitweise nicht verfügbar sein kann</li>
          <li>Zu Datenverlust führen kann</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">4.2 Keine Service Level Agreements (SLA)</h3>
        <p>
          Während der Beta-Phase gelten keine Service Level Agreements (SLA) oder Verfügbarkeitsgarantien.
          Wir bemühen uns um eine hohe Verfügbarkeit, können diese jedoch nicht zusichern.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Ihre Pflichten als Beta-Tester</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2">5.1 Feedback und Fehlerberichte</h3>
        <p>Sie verpflichten sich:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Fehler, Bugs und Unstimmigkeiten zeitnah über die Feedback-Funktion zu melden</li>
          <li>Konstruktives Feedback zur Verbesserung der Software zu geben</li>
          <li>An gelegentlichen Umfragen teilzunehmen (optional, aber erwünscht)</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">5.2 Verantwortungsvolle Nutzung</h3>
        <p>Sie verpflichten sich:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Alle durch die Software generierten Compliance-Dokumente fachlich zu validieren</li>
          <li>Regelmäßige Backups Ihrer Daten anzufertigen</li>
          <li>Die Software nicht für finale produktionskritische Entscheidungen ohne Validierung zu nutzen</li>
          <li>Bei sicherheitskritischen Anwendungen zusätzliche manuelle Prüfungen durchzuführen</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">5.3 Vertraulichkeit (optional)</h3>
        <p>
          Beta-Features und nicht öffentliche Funktionen sollten nicht an Dritte weitergegeben werden.
          Öffentliche Diskussionen über die Software sind jedoch ausdrücklich erwünscht.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Datensicherheit und Backups</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2">6.1 Unsere Maßnahmen</h3>
        <p>Wir führen regelmäßige automatische Backups durch und schützen Ihre Daten nach bestem Wissen.</p>

        <h3 className="text-xl font-semibold mt-4 mb-2">6.2 Ihre Verantwortung</h3>
        <p>
          <strong className="text-red-600">Wichtig:</strong> Aufgrund des Beta-Status empfehlen wir dringend,
          regelmäßige eigene Backups kritischer Daten anzufertigen. Bei Datenverlust können wir keine
          Wiederherstellung garantieren.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Haftung während der Beta-Phase</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2">7.1 Unbeschränkte Haftung</h3>
        <p>
          Wir haften unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder
          der Gesundheit sowie für Schäden aus Vorsatz oder grober Fahrlässigkeit.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">7.2 Eingeschränkte Haftung</h3>
        <p>
          Für andere Schäden haften wir nur bei Verletzung wesentlicher Vertragspflichten.
          In diesen Fällen ist die Haftung auf den vorhersehbaren, vertragstypischen Schaden begrenzt.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">7.3 Haftungsobergrenze</h3>
        <p>
          Während der kostenlosen Beta-Phase ist unsere Haftung (außer in Fällen von 7.1)
          auf folgende Beträge begrenzt:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>EUR 10.000 pro Schadensfall</li>
          <li>EUR 50.000 pro Kalenderjahr</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">7.4 Ausgeschlossene Haftung</h3>
        <p>Soweit gesetzlich zulässig, haften wir nicht für:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Datenverlust, wenn keine regelmäßigen Backups durchgeführt wurden</li>
          <li>Wirtschaftliche Schäden durch fehlerhafte Berechnungen, wenn keine fachliche Validierung erfolgte</li>
          <li>Unterbrechungen der Verfügbarkeit</li>
          <li>Fehler in Compliance-Dokumenten aufgrund falscher Eingabedaten</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Compliance und EN 13813 Verantwortung</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2">8.1 Werkzeugcharakter der Software</h3>
        <p>
          EstrichManager ist ein <strong>Hilfswerkzeug</strong> zur Unterstützung Ihrer
          Compliance-Prozesse nach EN 13813. Die Software:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Trifft keine eigenständigen Compliance-Entscheidungen</li>
          <li>Ersetzt nicht die fachliche Beurteilung durch qualifiziertes Personal</li>
          <li>Erfordert eine Validierung aller generierten Dokumente vor Verwendung</li>
          <li>Dient der Dokumentation und Prozessunterstützung</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">8.2 Ihre Compliance-Verantwortung</h3>
        <p>Sie bleiben allein verantwortlich für:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Die Einhaltung der EN 13813 und aller anwendbaren Vorschriften</li>
          <li>Die Richtigkeit aller eingegebenen Daten</li>
          <li>Die fachliche Prüfung aller Leistungserklärungen (DoP)</li>
          <li>Die Freigabe von Prüfberichten und Produkten</li>
          <li>Die Schulung Ihres Personals</li>
          <li>Die Einhaltung von Werks- und Produktionskontrollen (FPC/ITT)</li>
        </ul>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6">
          <p className="text-sm text-yellow-900">
            <strong>Wichtiger Hinweis:</strong> Alle durch EstrichManager generierten Dokumente
            (Leistungserklärungen, Prüfberichte, CE-Kennzeichnungen, etc.) müssen vor offizieller
            Verwendung von fachkundigem Personal geprüft und freigegeben werden. Die Software
            dient der Unterstützung, nicht dem Ersatz fachlicher Expertise.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Beendigung der Beta-Teilnahme</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2">9.1 Durch Sie</h3>
        <p>
          Sie können Ihre Beta-Teilnahme jederzeit ohne Angabe von Gründen beenden,
          indem Sie Ihr Konto löschen.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">9.2 Durch uns</h3>
        <p>
          Wir können Ihre Beta-Teilnahme bei Verstößen gegen diese Vereinbarung oder
          missbräuchlicher Nutzung beenden.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">9.3 Datenexport</h3>
        <p>
          Bei Beendigung haben Sie 30 Tage Zeit, Ihre Daten zu exportieren.
          Danach werden die Daten gemäß unserer Datenschutzerklärung gelöscht.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Übergang zu regulärem Service</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2">10.1 Information</h3>
        <p>
          Mindestens 60 Tage vor Einführung kostenpflichtiger Tarife werden Sie per E-Mail informiert.
          Die Information enthält:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Geplante Preismodelle</li>
          <li>Ihre Beta-Tester Konditionen (50% Rabatt)</li>
          <li>Datum des Übergangs</li>
          <li>Kündigungsmöglichkeiten</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">10.2 Wahlmöglichkeiten</h3>
        <p>Sie haben dann folgende Optionen:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Wechsel zu einem kostenpflichtigen Tarif mit 50% Beta-Rabatt</li>
          <li>Kündigung ohne weitere Verpflichtungen</li>
          <li>Eventuelle kostenlose Basisversion (falls verfügbar)</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">11. Änderungen dieser Vereinbarung</h2>
        <p>
          Wir behalten uns vor, diese Beta-Vereinbarung zu ändern. Wesentliche Änderungen
          werden Ihnen mindestens 14 Tage vor Inkrafttreten per E-Mail mitgeteilt.
          Wenn Sie den Änderungen nicht zustimmen, können Sie Ihre Teilnahme beenden.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">12. Kontakt und Support</h2>
        <p>
          Bei Fragen zur Beta-Vereinbarung oder technischen Problemen erreichen Sie uns:
        </p>
        <ul className="list-none mt-2 space-y-1">
          <li><strong>E-Mail:</strong> beta@estrichmanager.de</li>
          <li><strong>Support:</strong> support@estrichmanager.de</li>
          <li><strong>Feedback:</strong> Über die In-App Feedback-Funktion</li>
        </ul>

        <div className="mt-12 pt-8 border-t">
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <p className="text-sm text-green-900">
              <strong>Vielen Dank für Ihre Teilnahme!</strong><br />
              Als Beta-Tester helfen Sie uns, EstrichManager zur besten EN13813
              Compliance-Lösung zu entwickeln. Ihr Feedback ist von unschätzbarem Wert.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-sm text-gray-600">
          <p>Stand: Januar 2025</p>
          <p className="mt-2">
            Diese Vereinbarung ergänzt die{' '}
            <a href="/agb" className="text-blue-600 hover:underline">
              Allgemeinen Geschäftsbedingungen
            </a>
            {' '}und die{' '}
            <a href="/datenschutz" className="text-blue-600 hover:underline">
              Datenschutzerklärung
            </a>.
          </p>
        </div>
      </div>
    </div>
  )
}
