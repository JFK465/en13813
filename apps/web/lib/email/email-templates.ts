export const emailStyles = {
  container: `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
  `,
  header: `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 32px;
    text-align: center;
  `,
  logo: `
    font-size: 28px;
    font-weight: bold;
    margin: 0;
    letter-spacing: -0.5px;
  `,
  content: `
    padding: 32px;
    color: #333333;
    line-height: 1.6;
  `,
  heading: `
    color: #1a202c;
    margin-top: 0;
    margin-bottom: 24px;
    font-size: 24px;
  `,
  button: `
    display: inline-block;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    margin: 16px 0;
  `,
  footer: `
    background-color: #f7fafc;
    padding: 24px 32px;
    text-align: center;
    color: #718096;
    font-size: 14px;
    border-top: 1px solid #e2e8f0;
  `,
  table: `
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
  `,
  tableCell: `
    padding: 12px;
    border: 1px solid #e2e8f0;
    text-align: left;
  `,
  alert: {
    low: '#48bb78',
    medium: '#ed8936',
    high: '#f56565',
    critical: '#e53e3e'
  }
}

export const baseEmailTemplate = (content: string, showLogo: boolean = true) => `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EstrichManager</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f7fafc;">
  <div style="${emailStyles.container}">
    ${showLogo ? `
    <div style="${emailStyles.header}">
      <h1 style="${emailStyles.logo}">EstrichManager</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">
        Ihr digitaler Assistent für EN13813-Konformität
      </p>
    </div>
    ` : ''}
    <div style="${emailStyles.content}">
      ${content}
    </div>
    <div style="${emailStyles.footer}">
      <p style="margin: 0 0 8px 0;">
        © ${new Date().getFullYear()} EstrichManager - Qualität digital verwaltet
      </p>
      <p style="margin: 0; font-size: 12px; color: #a0aec0;">
        Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese Nachricht.
      </p>
    </div>
  </div>
</body>
</html>
`

export const emailTemplates = {
  welcome: (userName: string) => baseEmailTemplate(`
    <h2 style="${emailStyles.heading}">Herzlich willkommen, ${userName}!</h2>

    <p>Vielen Dank für Ihre Registrierung bei EstrichManager.</p>

    <p>Mit EstrichManager haben Sie nun Zugriff auf:</p>
    <ul style="color: #4a5568; padding-left: 20px;">
      <li>✓ Digitale Rezepturverwaltung nach EN13813</li>
      <li>✓ Automatische Konformitätsprüfungen</li>
      <li>✓ Leistungserklärungen auf Knopfdruck</li>
      <li>✓ Lückenloses Qualitätsmanagement</li>
      <li>✓ Audit- und Abweichungsmanagement</li>
    </ul>

    <p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/en13813" style="${emailStyles.button}">
        Jetzt loslegen →
      </a>
    </p>

    <p style="color: #718096; font-size: 14px; margin-top: 32px;">
      Bei Fragen erreichen Sie unser Support-Team jederzeit unter support@estrichmanager.de
    </p>

    <p>Mit freundlichen Grüßen,<br>
    <strong>Ihr EstrichManager Team</strong></p>
  `),

  passwordReset: (resetLink: string) => baseEmailTemplate(`
    <h2 style="${emailStyles.heading}">Passwort zurücksetzen</h2>

    <p>Sie haben angefordert, Ihr Passwort zurückzusetzen.</p>

    <p>Klicken Sie auf den folgenden Button, um ein neues Passwort zu vergeben:</p>

    <p style="text-align: center;">
      <a href="${resetLink}" style="${emailStyles.button}">
        Neues Passwort festlegen
      </a>
    </p>

    <div style="background-color: #fef5e7; border-left: 4px solid #f39c12; padding: 16px; margin: 24px 0;">
      <p style="margin: 0; color: #7d6608;">
        <strong>Sicherheitshinweis:</strong><br>
        Dieser Link ist aus Sicherheitsgründen nur 1 Stunde gültig.
        Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie bitte diese E-Mail.
      </p>
    </div>

    <p>Mit freundlichen Grüßen,<br>
    <strong>Ihr EstrichManager Team</strong></p>
  `),

  auditReport: (auditNumber: string) => baseEmailTemplate(`
    <h2 style="${emailStyles.heading}">Auditbericht ${auditNumber}</h2>

    <p>Sehr geehrte Damen und Herren,</p>

    <p>anbei erhalten Sie den Auditbericht für die Auditnummer <strong>${auditNumber}</strong>.</p>

    <div style="background-color: #f0f4f8; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h3 style="margin-top: 0; color: #2d3748;">Berichtsinhalt:</h3>
      <ul style="color: #4a5568; padding-left: 20px;">
        <li>Zusammenfassung der Prüfergebnisse</li>
        <li>Detaillierte Prüfpunkte nach EN13813</li>
        <li>Identifizierte Abweichungen und Risiken</li>
        <li>Empfohlene Korrektur- und Vorbeugemaßnahmen</li>
        <li>Zeitplan für Nachverfolgung</li>
      </ul>
    </div>

    <p style="color: #718096;">
      📎 Der vollständige Bericht ist als PDF-Datei angehängt.
    </p>

    <p>Für Rückfragen stehen wir Ihnen gerne zur Verfügung.</p>

    <p>Mit freundlichen Grüßen,<br>
    <strong>Ihr EstrichManager Qualitätsmanagement-Team</strong></p>
  `),

  deviationNotification: (
    deviationTitle: string,
    deviationDescription: string,
    priority: 'low' | 'medium' | 'high' | 'critical'
  ) => {
    const priorityLabels = {
      low: 'Niedrig',
      medium: 'Mittel',
      high: 'Hoch',
      critical: 'Kritisch'
    }

    const priorityColor = emailStyles.alert[priority]

    return baseEmailTemplate(`
      <h2 style="${emailStyles.heading}">Neue Abweichung erfasst</h2>

      <div style="border-left: 4px solid ${priorityColor}; padding-left: 16px; margin: 24px 0;">
        <h3 style="color: ${priorityColor}; margin: 0;">${deviationTitle}</h3>
        <p style="margin: 8px 0 0 0;">
          <span style="background-color: ${priorityColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
            PRIORITÄT: ${priorityLabels[priority].toUpperCase()}
          </span>
        </p>
      </div>

      <div style="background-color: #f8f9fa; border-radius: 6px; padding: 16px; margin: 16px 0;">
        <h4 style="margin-top: 0; color: #2d3748;">Beschreibung:</h4>
        <p style="color: #4a5568;">${deviationDescription}</p>
      </div>

      <p>Bitte prüfen Sie die Abweichung und leiten Sie erforderliche Maßnahmen ein:</p>

      <p style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/en13813/deviations" style="${emailStyles.button}">
          Abweichung bearbeiten →
        </a>
      </p>

      <p style="color: #718096; font-size: 14px;">
        Gemäß EN 13813 § 6.3 ist eine zeitnahe Bearbeitung von Abweichungen erforderlich.
      </p>

      <p>Mit freundlichen Grüßen,<br>
      <strong>Ihr EstrichManager Qualitätsmanagement-System</strong></p>
    `)
  },

  testReminder: (
    testType: string,
    dueDate: Date,
    recipeName: string
  ) => baseEmailTemplate(`
    <h2 style="${emailStyles.heading}">⏰ Prüfung fällig</h2>

    <p>Diese Nachricht erinnert Sie an eine anstehende Prüfung:</p>

    <table style="${emailStyles.table}">
      <tr>
        <td style="${emailStyles.tableCell}; background-color: #f7fafc; font-weight: bold; width: 40%;">
          Prüfart:
        </td>
        <td style="${emailStyles.tableCell}">
          ${testType}
        </td>
      </tr>
      <tr>
        <td style="${emailStyles.tableCell}; background-color: #f7fafc; font-weight: bold;">
          Rezeptur:
        </td>
        <td style="${emailStyles.tableCell}">
          ${recipeName}
        </td>
      </tr>
      <tr>
        <td style="${emailStyles.tableCell}; background-color: #f7fafc; font-weight: bold;">
          Fälligkeitsdatum:
        </td>
        <td style="${emailStyles.tableCell}">
          <strong style="color: #e53e3e;">${dueDate.toLocaleDateString('de-DE')}</strong>
        </td>
      </tr>
    </table>

    <div style="background-color: #fff5f5; border-left: 4px solid #fc8181; padding: 16px; margin: 24px 0;">
      <p style="margin: 0; color: #742a2a;">
        <strong>Wichtig:</strong> Bitte führen Sie die Prüfung rechtzeitig durch,
        um die Konformität nach EN13813 sicherzustellen.
      </p>
    </div>

    <p style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/en13813/tests" style="${emailStyles.button}">
        Prüfung durchführen →
      </a>
    </p>

    <p>Mit freundlichen Grüßen,<br>
    <strong>Ihr EstrichManager Qualitätsmanagement-System</strong></p>
  `),

  dopGenerated: (
    dopNumber: string,
    recipeName: string,
    dopPdfBuffer?: Buffer
  ) => baseEmailTemplate(`
    <h2 style="${emailStyles.heading}">✅ Leistungserklärung erstellt</h2>

    <p>Die Leistungserklärung wurde erfolgreich generiert:</p>

    <div style="background-color: #f0fff4; border: 2px solid #9ae6b4; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <table style="width: 100%; border: none;">
        <tr>
          <td style="padding: 8px 0; color: #22543d;"><strong>DoP-Nummer:</strong></td>
          <td style="padding: 8px 0; color: #22543d; text-align: right;">${dopNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #22543d;"><strong>Rezeptur:</strong></td>
          <td style="padding: 8px 0; color: #22543d; text-align: right;">${recipeName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #22543d;"><strong>Erstellt am:</strong></td>
          <td style="padding: 8px 0; color: #22543d; text-align: right;">${new Date().toLocaleDateString('de-DE')}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #22543d;"><strong>Norm:</strong></td>
          <td style="padding: 8px 0; color: #22543d; text-align: right;">EN 13813:2002</td>
        </tr>
      </table>
    </div>

    ${dopPdfBuffer ? `
      <p style="color: #718096;">
        📎 Die vollständige Leistungserklärung ist als PDF-Datei angehängt.
      </p>
    ` : ''}

    <p style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/en13813/dops" style="${emailStyles.button}">
        Alle Leistungserklärungen anzeigen →
      </a>
    </p>

    <p style="color: #718096; font-size: 14px; margin-top: 24px;">
      Diese Leistungserklärung wurde automatisch gemäß den Anforderungen der
      Bauprodukteverordnung (EU) Nr. 305/2011 erstellt.
    </p>

    <p>Mit freundlichen Grüßen,<br>
    <strong>Ihr EstrichManager Team</strong></p>
  `)
}