import * as React from 'react'

interface DoPNotificationEmailProps {
  recipientName: string
  dopNumber: string
  productName: string
  recipeCode: string
  manufacturerName: string
  issueDate: string
  downloadUrl: string
  publicUrl: string
  language?: 'de' | 'en' | 'fr'
}

export const DoPNotificationEmail: React.FC<DoPNotificationEmailProps> = ({
  recipientName,
  dopNumber,
  productName,
  recipeCode,
  manufacturerName,
  issueDate,
  downloadUrl,
  publicUrl,
  language = 'de'
}) => {
  const translations = {
    de: {
      subject: `Leistungserklärung ${dopNumber} - ${productName}`,
      greeting: `Sehr geehrte/r ${recipientName}`,
      intro: 'hiermit erhalten Sie die Leistungserklärung gemäß Verordnung (EU) Nr. 305/2011 für folgendes Produkt:',
      product: 'Produkt',
      recipeCode: 'Rezeptur-Code',
      manufacturer: 'Hersteller',
      dopNumber: 'DoP-Nummer',
      issueDate: 'Ausstellungsdatum',
      downloadText: 'Sie können die Leistungserklärung hier herunterladen:',
      downloadButton: 'DoP herunterladen',
      publicAccessText: 'Die DoP ist auch öffentlich verfügbar unter:',
      compliance: 'Diese Leistungserklärung bestätigt die Konformität mit EN 13813:2002.',
      retention: 'Bitte bewahren Sie diese Unterlagen mindestens 10 Jahre auf.',
      questions: 'Bei Fragen wenden Sie sich bitte an:',
      footer: 'Mit freundlichen Grüßen',
      legalNotice: 'Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.'
    },
    en: {
      subject: `Declaration of Performance ${dopNumber} - ${productName}`,
      greeting: `Dear ${recipientName}`,
      intro: 'Please find attached the Declaration of Performance according to Regulation (EU) No. 305/2011 for the following product:',
      product: 'Product',
      recipeCode: 'Recipe Code',
      manufacturer: 'Manufacturer',
      dopNumber: 'DoP Number',
      issueDate: 'Issue Date',
      downloadText: 'You can download the Declaration of Performance here:',
      downloadButton: 'Download DoP',
      publicAccessText: 'The DoP is also publicly available at:',
      compliance: 'This Declaration of Performance confirms compliance with EN 13813:2002.',
      retention: 'Please retain these documents for at least 10 years.',
      questions: 'If you have any questions, please contact:',
      footer: 'Kind regards',
      legalNotice: 'This email was generated automatically. Please do not reply to this email.'
    },
    fr: {
      subject: `Déclaration de Performance ${dopNumber} - ${productName}`,
      greeting: `Cher/Chère ${recipientName}`,
      intro: 'Veuillez trouver ci-joint la Déclaration de Performance selon le Règlement (UE) n° 305/2011 pour le produit suivant:',
      product: 'Produit',
      recipeCode: 'Code de Recette',
      manufacturer: 'Fabricant',
      dopNumber: 'Numéro DoP',
      issueDate: 'Date d\'émission',
      downloadText: 'Vous pouvez télécharger la Déclaration de Performance ici:',
      downloadButton: 'Télécharger DoP',
      publicAccessText: 'La DoP est également disponible publiquement à:',
      compliance: 'Cette Déclaration de Performance confirme la conformité avec EN 13813:2002.',
      retention: 'Veuillez conserver ces documents pendant au moins 10 ans.',
      questions: 'Pour toute question, veuillez contacter:',
      footer: 'Cordialement',
      legalNotice: 'Cet email a été généré automatiquement. Veuillez ne pas répondre à cet email.'
    }
  }

  const t = translations[language]

  return (
    <html>
      <head>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .info-box {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f1f3f5;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: 600;
            color: #495057;
          }
          .value {
            color: #212529;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            margin: 20px 0;
          }
          .button:hover {
            background: #5a67d8;
          }
          .public-link {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .public-link a {
            color: #1976d2;
            word-break: break-all;
          }
          .compliance-notice {
            background: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            color: #6c757d;
            font-size: 14px;
          }
          .legal-notice {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 10px;
            border-radius: 4px;
            font-size: 12px;
            color: #856404;
            margin-top: 20px;
          }
        `}</style>
      </head>
      <body>
        <div className="header">
          <h1>{t.subject}</h1>
        </div>

        <div className="content">
          <p>{t.greeting},</p>

          <p>{t.intro}</p>

          <div className="info-box">
            <div className="info-row">
              <span className="label">{t.product}:</span>
              <span className="value">{productName}</span>
            </div>
            <div className="info-row">
              <span className="label">{t.recipeCode}:</span>
              <span className="value">{recipeCode}</span>
            </div>
            <div className="info-row">
              <span className="label">{t.manufacturer}:</span>
              <span className="value">{manufacturerName}</span>
            </div>
            <div className="info-row">
              <span className="label">{t.dopNumber}:</span>
              <span className="value">{dopNumber}</span>
            </div>
            <div className="info-row">
              <span className="label">{t.issueDate}:</span>
              <span className="value">{new Date(issueDate).toLocaleDateString(language)}</span>
            </div>
          </div>

          <p>{t.downloadText}</p>

          <div style={{ textAlign: 'center' }}>
            <a href={downloadUrl} className="button">{t.downloadButton}</a>
          </div>

          <div className="public-link">
            <p>{t.publicAccessText}</p>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">{publicUrl}</a>
          </div>

          <div className="compliance-notice">
            <p><strong>{t.compliance}</strong></p>
            <p>{t.retention}</p>
          </div>

          <div className="footer">
            <p>{t.questions}</p>
            <p>{manufacturerName}</p>
            <br />
            <p>{t.footer},<br />{manufacturerName}</p>

            <div className="legal-notice">
              {t.legalNotice}
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

export const renderDoPNotificationEmail = (props: DoPNotificationEmailProps) => {
  return React.createElement(DoPNotificationEmail, props)
}