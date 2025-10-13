export default function AGBPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Allgemeine Geschäftsbedingungen</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 mb-6">Stand: Januar 2025</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">§ 1 Geltungsbereich</h2>
        <p>Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen der EstrichManager GmbH und den Nutzern der EstrichManager-Plattform.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">§ 2 Vertragsgegenstand</h2>
        <p>EstrichManager ist eine Software-as-a-Service (SaaS) Lösung für das Qualitätsmanagement in der Estrichindustrie gemäß EN 13813.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">§ 3 Beta-Phase und Nutzungsbedingungen</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2">§ 3.1 Beta-Status</h3>
        <p>Die Software befindet sich derzeit in der Beta-Phase (Entwicklungsversion). Die Nutzung während der Beta-Phase ist kostenlos. Das Ende der Beta-Phase wird rechtzeitig bekannt gegeben (siehe § 3.3).</p>

        <h3 className="text-xl font-semibold mt-4 mb-2">§ 3.2 Eigenschaften der Beta-Software</h3>
        <p>Als Beta-Software können folgende Eigenschaften auftreten:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Die Software kann Fehler, Bugs und Instabilitäten aufweisen</li>
          <li>Funktionen können sich ändern, ergänzt oder entfernt werden</li>
          <li>Die Verfügbarkeit ist nicht garantiert (kein Service Level Agreement)</li>
          <li>Datenverlust kann auftreten – wir empfehlen regelmäßige eigene Backups</li>
          <li>Updates und Änderungen können jederzeit ohne Vorankündigung erfolgen</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">§ 3.3 Übergang zu kostenpflichtigen Tarifen</h3>
        <p>Nach Ende der Beta-Phase behalten wir uns vor, kostenpflichtige Tarife einzuführen. Beta-Tester werden mindestens 60 Tage vor Einführung kostenpflichtiger Tarife per E-Mail informiert und erhalten ein Sonderkündigungsrecht sowie bevorzugte Konditionen (voraussichtlich 50% Rabatt auf den regulären Tarif für mindestens 12 Monate).</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">§ 4 Datenschutz</h2>
        <p>Der Schutz Ihrer Daten hat für uns höchste Priorität. Details finden Sie in unserer Datenschutzerklärung.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">§ 5 Haftung und Gewährleistung</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2">§ 5.1 Allgemeine Haftungsregelung</h3>
        <p>Die Haftung von EstrichManager richtet sich nach den folgenden Grundsätzen:</p>

        <p className="mt-3"><strong>Unbeschränkte Haftung:</strong></p>
        <p>Wir haften unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit sowie für Schäden aus Vorsatz oder grober Fahrlässigkeit.</p>

        <p className="mt-3"><strong>Haftung bei wesentlichen Vertragspflichten:</strong></p>
        <p>Bei der fahrlässigen Verletzung wesentlicher Vertragspflichten (Kardinalpflichten) ist unsere Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt. Kardinalpflichten sind solche, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht.</p>

        <p className="mt-3"><strong>Ausgeschlossene Haftung:</strong></p>
        <p>Im Übrigen ist unsere Haftung ausgeschlossen, soweit gesetzlich zulässig.</p>

        <h3 className="text-xl font-semibold mt-4 mb-2">§ 5.2 Besonderheiten während der Beta-Phase</h3>
        <p><strong>Keine Gewährleistung für Vollständigkeit:</strong></p>
        <p>Während der Beta-Phase wird keine Gewährleistung für die Vollständigkeit, Richtigkeit oder ständige Verfügbarkeit der Software übernommen, soweit gesetzlich zulässig.</p>

        <p className="mt-3"><strong>Haftungsausschluss für Beta-typische Risiken:</strong></p>
        <p>Soweit gesetzlich zulässig, haften wir während der Beta-Phase nicht für:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Datenverlust oder -beschädigung (regelmäßige eigene Backups erforderlich)</li>
          <li>Unterbrechungen der Verfügbarkeit</li>
          <li>Fehler in algorithmischen Berechnungen (fachliche Prüfung erforderlich)</li>
          <li>Wirtschaftliche Schäden durch fehlerhafte Compliance-Dokumente, sofern diese auf Fehleingaben oder fehlende Validierung durch den Nutzer zurückzuführen sind</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">§ 5.3 Haftungshöchstgrenzen (Beta-Phase)</h3>
        <p>Während der kostenlosen Beta-Phase ist unsere Haftung auf EUR 10.000 pro Schadensfall und EUR 50.000 pro Kalenderjahr begrenzt, sofern nicht unbeschränkte Haftung nach § 5.1 besteht.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">§ 6 Compliance-Verantwortung und Werkzeugcharakter</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2">§ 6.1 Verantwortung des Nutzers</h3>
        <p>Sie bleiben zu jeder Zeit allein verantwortlich für:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Die Einhaltung der EN 13813 und aller anwendbaren Normen und Vorschriften</li>
          <li>Die Richtigkeit der in die Software eingegebenen Daten</li>
          <li>Die fachliche Validierung aller durch die Software generierten Dokumente (Leistungserklärungen, Prüfberichte, etc.)</li>
          <li>Die finale Freigabe von Dokumenten und Produkten</li>
          <li>Die Schulung und Qualifikation Ihres Personals</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">§ 6.2 Verantwortung von EstrichManager</h3>
        <p>Wir sind verantwortlich für:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Die technische Bereitstellung der Software gemäß Leistungsbeschreibung</li>
          <li>Die Behebung gemeldeter Fehler im Rahmen des Beta-Supports</li>
          <li>Die Einhaltung der Datenschutzbestimmungen</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">§ 6.3 Werkzeugcharakter</h3>
        <p>EstrichManager ist ein Werkzeug zur Unterstützung Ihrer Compliance-Prozesse. Die Software trifft keine eigenständigen Compliance-Entscheidungen und ersetzt nicht die fachliche Beurteilung durch qualifiziertes Personal. Alle durch die Software generierten Dokumente und Berechnungen müssen vor Verwendung durch fachkundiges Personal geprüft und freigegeben werden.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">§ 7 Pflichten als Beta-Tester</h2>
        <p>Als Beta-Tester verpflichten Sie sich:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Fehler und Unstimmigkeiten unverzüglich über die Feedback-Funktion zu melden</li>
          <li>Kritische Compliance-Dokumente vor Verwendung manuell zu prüfen</li>
          <li>Die Software nicht für produktionskritische Prozesse ohne zusätzliche Validierung einzusetzen</li>
          <li>Regelmäßige Backups Ihrer Daten anzufertigen</li>
        </ul>
      </div>
    </div>
  )
}