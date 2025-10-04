import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung | EN13813 Compliance Management',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-slate-900">Datenschutzerklärung</h1>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800">1. Datenschutz auf einen Blick</h2>

            <h3 className="text-xl font-medium mb-2 text-slate-800">Allgemeine Hinweise</h3>
            <p className="text-slate-700 mb-4">
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
            </p>

            <h3 className="text-xl font-medium mb-2 text-slate-800">Datenerfassung auf dieser Website</h3>
            <p className="text-slate-700 mb-4">
              <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
            </p>

            <p className="text-slate-700 mb-4">
              <strong>Wie erfassen wir Ihre Daten?</strong><br />
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um Daten handeln, die Sie in Kontaktformularen oder bei der Registrierung eingeben.
            </p>

            <p className="text-slate-700 mb-4">
              <strong>Wofür nutzen wir Ihre Daten?</strong><br />
              Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800">2. Hosting und Content Delivery Networks (CDN)</h2>

            <h3 className="text-xl font-medium mb-2 text-slate-800">Vercel</h3>
            <p className="text-slate-700 mb-4">
              Diese Website wird auf Servern von Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA gehostet. Vercel erfasst automatisch Daten über jeden Zugriff auf die Website (sogenannte Serverlogfiles). Zu den Serverlogfiles können die Adresse und Name der abgerufenen Webseite, Datum und Uhrzeit des Abrufs, übertragene Datenmenge, Meldung über erfolgreichen Abruf, Browsertyp nebst Version, das Betriebssystem des Nutzers, Referrer URL und der anfragende Provider gehören.
            </p>
            <p className="text-slate-700 mb-4">
              Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der ordnungsgemäßen technischen Bereitstellung und Optimierung der Website).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800">3. Allgemeine Hinweise und Pflichtinformationen</h2>

            <h3 className="text-xl font-medium mb-2 text-slate-800">Datenschutz</h3>
            <p className="text-slate-700 mb-4">
              Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
            </p>

            <h3 className="text-xl font-medium mb-2 text-slate-800">Hinweis zur verantwortlichen Stelle</h3>
            <p className="text-slate-700 mb-4">
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:<br /><br />
              Jonas Krüger<br />
              Meisenweg 13<br />
              78465 Konstanz<br />
              E-Mail: info@jfkconsulting.de
            </p>
            <p className="text-slate-700 mb-4">
              Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z.B. Namen, E-Mail-Adressen o. Ä.) entscheidet.
            </p>

            <h3 className="text-xl font-medium mb-2 text-slate-800">Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
            <p className="text-slate-700 mb-4">
              Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Dazu reicht eine formlose Mitteilung per E-Mail an uns. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.
            </p>

            <h3 className="text-xl font-medium mb-2 text-slate-800">SSL- bzw. TLS-Verschlüsselung</h3>
            <p className="text-slate-700 mb-4">
              Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL-bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von "http://" auf "https://" wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800">4. Datenerfassung auf dieser Website</h2>

            <h3 className="text-xl font-medium mb-2 text-slate-800">Server-Log-Dateien</h3>
            <p className="text-slate-700 mb-4">
              Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4">
              <li>Browsertyp und Browserversion</li>
              <li>verwendetes Betriebssystem</li>
              <li>Referrer URL</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
              <li>IP-Adresse</li>
            </ul>
            <p className="text-slate-700 mb-4">
              Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Der Websitebetreiber hat ein berechtigtes Interesse an der technisch fehlerfreien Darstellung und der Optimierung seiner Website – hierzu müssen die Server-Log-Files erfasst werden.
            </p>

            <h3 className="text-xl font-medium mb-2 text-slate-800">Kontaktformular und E-Mail-Kontakt</h3>
            <p className="text-slate-700 mb-4">
              Wenn Sie uns per Kontaktformular oder E-Mail Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
            </p>
            <p className="text-slate-700 mb-4">
              Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO) oder auf Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) sofern diese abgefragt wurde.
            </p>

            <h3 className="text-xl font-medium mb-2 text-slate-800">Registrierung und Nutzerkonto</h3>
            <p className="text-slate-700 mb-4">
              Sie können sich auf dieser Website registrieren, um zusätzliche Funktionen zu nutzen. Die dazu eingegebenen Daten verwenden wir nur zum Zwecke der Nutzung des jeweiligen Angebotes oder Dienstes, für den Sie sich registriert haben. Die bei der Registrierung abgefragten Pflichtangaben müssen vollständig angegeben werden. Anderenfalls werden wir die Registrierung ablehnen.
            </p>
            <p className="text-slate-700 mb-4">
              Bei der Registrierung werden folgende Daten erhoben:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4">
              <li>E-Mail-Adresse</li>
              <li>Name</li>
              <li>Firmeninformationen (bei geschäftlicher Nutzung)</li>
              <li>Passwort (verschlüsselt gespeichert)</li>
            </ul>
            <p className="text-slate-700 mb-4">
              Die Verarbeitung der bei der Registrierung eingegebenen Daten erfolgt zum Zwecke der Durchführung des durch die Registrierung begründeten Nutzungsverhältnisses und ggf. zur Anbahnung weiterer Verträge (Art. 6 Abs. 1 lit. b DSGVO).
            </p>

            <h3 className="text-xl font-medium mb-2 text-slate-800">Verarbeitung von Daten im Rahmen der Anwendung</h3>
            <p className="text-slate-700 mb-4">
              Nach der Registrierung können Sie Daten im Rahmen der EN13813 Compliance Management Anwendung eingeben und verarbeiten. Diese Daten umfassen:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4">
              <li>Rezeptdaten (Materialien, Mischverhältnisse)</li>
              <li>Produktionsdaten (Chargen, Prüfergebnisse)</li>
              <li>Qualitätsmanagement-Daten (Abweichungen, CAPA)</li>
              <li>Audit- und Kalibrierungsdaten</li>
              <li>Dokumentationsdaten (DoP, Lieferscheine)</li>
            </ul>
            <p className="text-slate-700 mb-4">
              Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO zur Erfüllung des Vertrags über die Nutzung der Anwendung.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800">5. Authentifizierung und Datenspeicherung</h2>

            <h3 className="text-xl font-medium mb-2 text-slate-800">Supabase</h3>
            <p className="text-slate-700 mb-4">
              Für die Authentifizierung und Datenspeicherung nutzen wir Supabase (Supabase Inc., USA). Dabei werden folgende Daten verarbeitet:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4">
              <li>Authentifizierungsdaten (E-Mail, verschlüsseltes Passwort)</li>
              <li>Anwendungsdaten (wie oben beschrieben)</li>
              <li>Session-Informationen</li>
            </ul>
            <p className="text-slate-700 mb-4">
              Die Daten werden in ISO 27001 zertifizierten Rechenzentren gespeichert. Supabase ist SOC 2 Type II zertifiziert und DSGVO-konform. Die Datenübermittlung in die USA erfolgt auf Grundlage von Standardvertragsklauseln gemäß Art. 46 DSGVO.
            </p>
            <p className="text-slate-700 mb-4">
              Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an sicherer Datenspeicherung).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800">6. Multi-Tenant-Architektur und Datenisolation</h2>
            <p className="text-slate-700 mb-4">
              Diese Anwendung verwendet eine Multi-Tenant-Architektur. Das bedeutet, dass mehrere Mandanten (Organisationen) die gleiche Infrastruktur nutzen, ihre Daten jedoch strikt voneinander getrennt sind. Die Datenisolation erfolgt durch:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4">
              <li>Row Level Security (RLS) Richtlinien auf Datenbankebene</li>
              <li>Mandanten-spezifische Zugriffskontrolle</li>
              <li>Verschlüsselte Datenübertragung und -speicherung</li>
            </ul>
            <p className="text-slate-700 mb-4">
              Es ist technisch ausgeschlossen, dass ein Mandant auf Daten eines anderen Mandanten zugreifen kann.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800">7. Ihre Rechte</h2>
            <p className="text-slate-700 mb-4">
              Sie haben jederzeit das Recht auf:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4">
              <li>Auskunft über Ihre bei uns gespeicherten Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
              <li>Einschränkung der Datenverarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
              <li>Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
            </ul>
            <p className="text-slate-700 mb-4">
              Zur Ausübung Ihrer Rechte wenden Sie sich bitte an: info@jfkconsulting.de
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800">8. Speicherdauer</h2>
            <p className="text-slate-700 mb-4">
              Ihre Daten werden gespeichert, solange Sie die Anwendung nutzen. Nach Beendigung der Nutzung werden Ihre Daten gelöscht, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Bestimmte Daten können aufgrund handels- oder steuerrechtlicher Vorgaben bis zu 10 Jahre aufbewahrt werden müssen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800">9. Änderungen der Datenschutzerklärung</h2>
            <p className="text-slate-700 mb-4">
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.
            </p>
          </section>

          <p className="text-sm text-slate-600 mt-8">
            Stand: {new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>
    </div>
  );
}
