export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="text-4xl font-bold mb-8">Datenschutzerklärung</h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Datenschutz auf einen Blick</h2>

            <h3 className="text-xl font-semibold mb-2">Allgemeine Hinweise</h3>
            <p>
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
              personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene
              Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">Datenerfassung auf dieser Website</h3>
            <p>
              <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen
              Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
            </p>

            <p>
              <strong>Wie erfassen wir Ihre Daten?</strong><br />
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann
              es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben. Andere Daten
              werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere
              IT-Systeme erfasst.
            </p>

            <p>
              <strong>Wofür nutzen wir Ihre Daten?</strong><br />
              Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu
              gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Hosting und Datenverarbeitung</h2>

            <h3 className="text-xl font-semibold mb-2">Externes Hosting</h3>
            <p>
              Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website
              erfasst werden, werden auf den Servern unserer Hosting- und Datenbankdienstleister gespeichert.
              Hierbei kann es sich v.a. um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten,
              Vertragsdaten, Kontaktdaten, Namen, Websitezugriffe und sonstige Daten handeln.
            </p>

            <p>
              Der Einsatz der Dienstleister erfolgt zum Zwecke der Vertragserfüllung gegenüber unseren
              potenziellen und bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse einer
              sicheren, schnellen und effizienten Bereitstellung unseres Online-Angebots durch
              professionelle Anbieter (Art. 6 Abs. 1 lit. f DSGVO).
            </p>

            <p>
              Unsere Dienstleister werden Ihre Daten nur insoweit verarbeiten, wie dies zur Erfüllung ihrer
              Leistungspflichten erforderlich ist und unsere Weisungen in Bezug auf diese Daten befolgen.
              Mit allen Dienstleistern wurden Auftragsverarbeitungsverträge gemäß Art. 28 DSGVO geschlossen.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">Eingesetzte Dienstleister</h3>

            <p className="mt-3">
              <strong>Hosting (Frontend):</strong><br />
              Vercel Inc.<br />
              340 S Lemon Ave #4133<br />
              Walnut, CA 91789<br />
              USA
            </p>

            <p className="mt-3">
              <strong>Datenbank und Backend-Services:</strong><br />
              Supabase Inc.<br />
              970 Toa Payoh North #07-04<br />
              Singapore 318992<br />
              Singapur
            </p>

            <p className="mt-3">
              <strong>Datentransfer in Drittländer:</strong><br />
              Beide Dienstleister verarbeiten Daten teilweise in den USA und Singapur. Die Übermittlung
              erfolgt auf Grundlage von Standardvertragsklauseln der EU-Kommission (Art. 46 Abs. 2 lit. c DSGVO)
              sowie zusätzlichen technischen und organisatorischen Maßnahmen zur Gewährleistung eines
              angemessenen Datenschutzniveaus.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Allgemeine Hinweise und Pflichtinformationen</h2>

            <h3 className="text-xl font-semibold mb-2">Datenschutz</h3>
            <p>
              Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir
              behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen
              Datenschutzvorschriften sowie dieser Datenschutzerklärung.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">Hinweis zur verantwortlichen Stelle</h3>
            <p>
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
            </p>
            <p>
              EstrichManager GmbH<br />
              Max Mustermann<br />
              Musterstraße 123<br />
              12345 Berlin<br />
              <br />
              Telefon: +49 (0) 123 456789<br />
              E-Mail: datenschutz@estrichmanager.de
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">Speicherdauer</h3>
            <p>
              Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde,
              verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung
              entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur
              Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern keine gesetzlichen
              Aufbewahrungspflichten entgegenstehen.
            </p>

            <p className="mt-3"><strong>Konkrete Speicherfristen:</strong></p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Kontaktanfragen: 6 Monate nach Abschluss der Kommunikation</li>
              <li>Nutzerkonto-Daten: Bis zur Löschung des Kontos durch den Nutzer</li>
              <li>Compliance-Dokumente: 10 Jahre (gesetzliche Aufbewahrungspflicht)</li>
              <li>Server-Log-Dateien: 7 Tage</li>
              <li>Cookies: Siehe jeweilige Cookie-Beschreibung</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">Datenschutzbeauftragter</h3>
            <p>
              Für Unternehmen unserer Größe ist derzeit kein Datenschutzbeauftragter gesetzlich vorgeschrieben.
              Fragen zum Datenschutz können Sie an datenschutz@estrichmanager.de richten.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">Zuständige Aufsichtsbehörde</h3>
            <p>
              Die zuständige Aufsichtsbehörde in datenschutzrechtlichen Fragen ist:
            </p>
            <p className="mt-2">
              Berliner Beauftragte für Datenschutz und Informationsfreiheit<br />
              Friedrichstr. 219<br />
              10969 Berlin<br />
              Telefon: 030 13889-0<br />
              E-Mail: mailbox@datenschutz-berlin.de
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Datenerfassung auf dieser Website</h2>

            <h3 className="text-xl font-semibold mb-2">Cookies</h3>
            <p>
              Unsere Internetseiten verwenden teilweise so genannte Cookies. Cookies richten auf Ihrem
              Rechner keinen Schaden an und enthalten keine Viren. Cookies dienen dazu, unser Angebot
              nutzerfreundlicher, effektiver und sicherer zu machen. Cookies sind kleine Textdateien,
              die auf Ihrem Rechner abgelegt werden und die Ihr Browser speichert.
            </p>

            <p>
              Die meisten der von uns verwendeten Cookies sind so genannte „Session-Cookies". Sie werden
              nach Ende Ihres Besuchs automatisch gelöscht. Andere Cookies bleiben auf Ihrem Endgerät
              gespeichert bis Sie diese löschen. Diese Cookies ermöglichen es uns, Ihren Browser beim
              nächsten Besuch wiederzuerkennen.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">Server-Log-Dateien</h3>
            <p>
              Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten
              Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Browsertyp und Browserversion</li>
              <li>Verwendetes Betriebssystem</li>
              <li>Referrer URL</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
              <li>IP-Adresse</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">Kontaktformular</h3>
            <p>
              Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem
              Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung
              der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben
              wir nicht ohne Ihre Einwilligung weiter.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">Registrierung auf dieser Website</h3>
            <p>
              Sie können sich auf dieser Website registrieren, um zusätzliche Funktionen auf der Seite
              zu nutzen. Die dazu eingegebenen Daten verwenden wir nur zum Zwecke der Nutzung des
              jeweiligen Angebotes oder Dienstes, für den Sie sich registriert haben.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Analyse-Tools und Werbung</h2>

            <p>
              Wir verwenden derzeit keine Analyse-Tools oder Werbedienste auf unserer Website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Newsletter</h2>

            <h3 className="text-xl font-semibold mb-2">Newsletterdaten</h3>
            <p>
              Wenn Sie den auf der Website angebotenen Newsletter beziehen möchten, benötigen wir von
              Ihnen eine E-Mail-Adresse sowie Informationen, welche uns die Überprüfung gestatten, dass
              Sie der Inhaber der angegebenen E-Mail-Adresse sind und mit dem Empfang des Newsletters
              einverstanden sind.
            </p>

            <p>
              Die Datenverarbeitung zum Zwecke der Kontaktaufnahme erfolgt nach Art. 6 Abs. 1 S. 1 lit. a
              DSGVO auf Grundlage Ihrer freiwillig erteilten Einwilligung. Sie können diese Einwilligung
              jederzeit widerrufen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Plugins und Tools</h2>

            <h3 className="text-xl font-semibold mb-2">Google Fonts</h3>
            <p>
              Diese Seite nutzt zur einheitlichen Darstellung von Schriftarten so genannte Google Fonts,
              die von Google bereitgestellt werden. Beim Aufruf einer Seite lädt Ihr Browser die
              benötigten Fonts in ihren Browsercache, um Texte und Schriftarten korrekt anzuzeigen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Eigene Dienste</h2>

            <h3 className="text-xl font-semibold mb-2">Umgang mit Bewerberdaten</h3>
            <p>
              Wir bieten Ihnen die Möglichkeit, sich bei uns zu bewerben (z.B. per E-Mail, postalisch
              oder via Online-Bewerberformular). Im Folgenden informieren wir Sie über Umfang, Zweck und
              Verwendung Ihrer im Rahmen des Bewerbungsprozesses erhobenen personenbezogenen Daten.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Ihre Rechte</h2>

            <p>Sie haben jederzeit das Recht:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Auskunft über Ihre bei uns gespeicherten personenbezogenen Daten zu erhalten</li>
              <li>Berichtigung unrichtiger Daten zu verlangen</li>
              <li>Löschung Ihrer bei uns gespeicherten Daten zu verlangen</li>
              <li>Einschränkung der Datenverarbeitung zu verlangen</li>
              <li>Widerspruch gegen die Verarbeitung Ihrer Daten einzulegen</li>
              <li>Datenübertragbarkeit zu verlangen</li>
            </ul>

            <p className="mt-4">
              Sie haben zudem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die
              Verarbeitung Ihrer personenbezogenen Daten durch uns zu beschweren.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t text-sm text-gray-600">
            <p>Stand: Januar 2025</p>
          </div>
        </div>
      </div>
    </main>
  )
}