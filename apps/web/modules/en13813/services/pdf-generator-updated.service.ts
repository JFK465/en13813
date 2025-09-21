import { PDFDocument, StandardFonts, rgb, PDFPage } from 'pdf-lib'
import { DoP, Recipe, ManufacturerData, Batch, TestReport, DeclaredPerformance } from '../types'
import * as QRCode from 'qrcode'

export interface PDFGenerationParams {
  dop: DoP
  recipe: Recipe
  manufacturer: ManufacturerData
  batch?: Batch
  testReports?: TestReport[]
  language?: 'de' | 'en'
}

export class PDFGeneratorService {
  async generateDoPPDF(params: PDFGenerationParams): Promise<Uint8Array> {
    const { dop, recipe, manufacturer, batch, language = 'de' } = params

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842]) // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    let yPosition = 780

    // Helper function to draw text
    const drawText = (text: string, x: number, y: number, size = 10, isBold = false) => {
      page.drawText(text, {
        x,
        y,
        size,
        font: isBold ? boldFont : font,
        color: rgb(0, 0, 0)
      })
    }

    // Helper for multi-line text
    const drawMultilineText = (text: string, x: number, startY: number, maxWidth: number, size = 10) => {
      const words = text.split(' ')
      let line = ''
      let y = startY
      
      for (const word of words) {
        const testLine = line + word + ' '
        const width = font.widthOfTextAtSize(testLine, size)
        if (width > maxWidth && line) {
          drawText(line.trim(), x, y, size)
          y -= 15
          line = word + ' '
        } else {
          line = testLine
        }
      }
      if (line.trim()) {
        drawText(line.trim(), x, y, size)
        y -= 15
      }
      return y
    }

    // TITLE
    drawText(
      language === 'de' ? 'LEISTUNGSERKLÄRUNG' : 'DECLARATION OF PERFORMANCE',
      50,
      yPosition,
      16,
      true
    )
    yPosition -= 20
    drawText(`Nr. ${dop.dop_number}`, 50, yPosition, 12)
    yPosition -= 30

    // CPR Reference
    drawText(
      language === 'de' 
        ? 'gemäß Verordnung (EU) Nr. 305/2011'
        : 'according to Regulation (EU) No. 305/2011',
      50,
      yPosition,
      10
    )
    yPosition -= 30

    // 1. Eindeutiger Kenncode des Produkttyps
    drawText('1.', 50, yPosition, 10, true)
    drawText(
      language === 'de'
        ? 'Eindeutiger Kenncode des Produkttyps:'
        : 'Unique identification code of the product-type:',
      70,
      yPosition,
      10
    )
    yPosition -= 15
    drawText(recipe.recipe_code, 70, yPosition, 10)
    yPosition -= 25

    // 2. Typen-, Chargen- oder Seriennummer
    drawText('2.', 50, yPosition, 10, true)
    const typeText = language === 'de'
      ? 'Typen-, Chargen- oder Seriennummer oder ein anderes Kennzeichen zur Identifikation des Bauprodukts:'
      : 'Type, batch or serial number or any other element allowing identification of the construction product:'
    yPosition = drawMultilineText(typeText, 70, yPosition, 450, 10)
    yPosition -= 5
    drawText(recipe.name, 70, yPosition, 10)
    if (batch) {
      yPosition -= 15
      drawText(
        language === 'de'
          ? `Chargennummer: ${batch.batch_number}`
          : `Batch number: ${batch.batch_number}`,
        70,
        yPosition,
        10
      )
    }
    yPosition -= 25

    // 3. Vom Hersteller vorgesehener Verwendungszweck
    drawText('3.', 50, yPosition, 10, true)
    const intendedUseText = language === 'de'
      ? 'Vom Hersteller vorgesehener Verwendungszweck oder vorgesehene Verwendungszwecke des Bauprodukts:'
      : 'Intended use or uses of the construction product, in accordance with the applicable harmonised technical specification:'
    yPosition = drawMultilineText(intendedUseText, 70, yPosition, 450, 10)
    yPosition -= 5
    drawText(
      language === 'de'
        ? 'Estrichmörtel zur Verwendung in Gebäuden gemäß EN 13813'
        : 'Screed material for use in buildings according to EN 13813',
      70,
      yPosition,
      10
    )
    yPosition -= 25

    // 4. Name und Kontaktanschrift des Herstellers
    drawText('4.', 50, yPosition, 10, true)
    drawText(
      language === 'de'
        ? 'Name, eingetragener Handelsname oder eingetragene Marke und Kontaktanschrift des Herstellers:'
        : 'Name, registered trade name or registered trade mark and contact address of the manufacturer:',
      70,
      yPosition,
      10
    )
    yPosition -= 15
    drawText(manufacturer.name, 70, yPosition, 10)
    yPosition -= 15
    drawText(
      `${manufacturer.address}, ${manufacturer.postalCode} ${manufacturer.city}`,
      70,
      yPosition,
      10
    )
    yPosition -= 15
    drawText(manufacturer.country, 70, yPosition, 10)
    if (manufacturer.phone) {
      yPosition -= 15
      drawText(`Tel: ${manufacturer.phone}`, 70, yPosition, 10)
    }
    if (manufacturer.email) {
      yPosition -= 15
      drawText(`Email: ${manufacturer.email}`, 70, yPosition, 10)
    }
    yPosition -= 25

    // 5. Gegebenenfalls Bevollmächtigter
    if (dop.authorized_representative) {
      drawText('5.', 50, yPosition, 10, true)
      drawText(
        language === 'de'
          ? 'Gegebenenfalls Name und Kontaktanschrift des Bevollmächtigten:'
          : 'Where applicable, name and contact address of the authorised representative:',
        70,
        yPosition,
        10
      )
      yPosition -= 15
      drawText(dop.authorized_representative.name, 70, yPosition, 10)
      yPosition -= 15
      drawText(
        `${dop.authorized_representative.address}, ${dop.authorized_representative.postalCode} ${dop.authorized_representative.city}`,
        70,
        yPosition,
        10
      )
      yPosition -= 25
    }

    // 6. System zur Bewertung und Überprüfung der Leistungsbeständigkeit
    const systemNumber = dop.authorized_representative ? '6' : '5'
    drawText(`${systemNumber}.`, 50, yPosition, 10, true)
    const avcpText = language === 'de'
      ? 'System oder Systeme zur Bewertung und Überprüfung der Leistungsbeständigkeit des Bauprodukts:'
      : 'System or systems of assessment and verification of constancy of performance of the construction product:'
    yPosition = drawMultilineText(avcpText, 70, yPosition, 450, 10)
    yPosition -= 5
    drawText(`System ${dop.avcp_system}`, 70, yPosition, 10)
    yPosition -= 25

    // 7. Harmonisierte Norm
    const normNumber = dop.authorized_representative ? '7' : '6'
    drawText(`${normNumber}.`, 50, yPosition, 10, true)
    drawText(
      language === 'de'
        ? 'Harmonisierte Norm:'
        : 'Harmonised standard:',
      70,
      yPosition,
      10
    )
    yPosition -= 15
    drawText('EN 13813:2002', 70, yPosition, 10)
    yPosition -= 15
    drawText(
      language === 'de'
        ? 'Estrichmörtel und Estrichmassen - Estrichmörtel - Eigenschaften und Anforderungen'
        : 'Screed material and floor screeds - Screed material - Properties and requirements',
      70,
      yPosition,
      9
    )
    yPosition -= 25

    // 8. Notifizierte Stelle (bei System 1+)
    if (dop.avcp_system === 1 && dop.notified_body) {
      const nbNumber = dop.authorized_representative ? '8' : '7'
      drawText(`${nbNumber}.`, 50, yPosition, 10, true)
      drawText(
        language === 'de'
          ? 'Notifizierte Stelle(n):'
          : 'Notified body(ies):',
        70,
        yPosition,
        10
      )
      yPosition -= 15
      drawText(`${dop.notified_body.name} (Nr. ${dop.notified_body.number})`, 70, yPosition, 10)
      yPosition -= 15
      const nbTaskText = language === 'de'
        ? `hat die Erstprüfung des Produkts für die ${dop.notified_body.task} durchgeführt`
        : `performed the initial type testing for ${dop.notified_body.task}`
      yPosition = drawMultilineText(nbTaskText, 70, yPosition, 450, 10)
      if (dop.notified_body.certificate_number) {
        yPosition -= 5
        drawText(
          language === 'de'
            ? `Prüfbericht Nr.: ${dop.notified_body.certificate_number}`
            : `Test report No.: ${dop.notified_body.certificate_number}`,
          70,
          yPosition,
          10
        )
      }
      yPosition -= 25
    }

    // Neue Seite für Leistungstabelle wenn nötig
    if (yPosition < 250) {
      const page2 = pdfDoc.addPage([595, 842])
      yPosition = 780
    }

    // 9. Erklärte Leistung(en)
    const perfNumber = dop.authorized_representative 
      ? (dop.avcp_system === 1 && dop.notified_body ? '9' : '8')
      : (dop.avcp_system === 1 && dop.notified_body ? '8' : '7')
    
    drawText(`${perfNumber}.`, 50, yPosition, 10, true)
    drawText(
      language === 'de'
        ? 'Erklärte Leistung(en):'
        : 'Declared performance:',
      70,
      yPosition,
      10
    )
    yPosition -= 20

    // Leistungstabelle mit 3 Spalten
    const col1X = 70
    const col2X = 280
    const col3X = 450
    
    // Tabellenkopf
    drawText(
      language === 'de' ? 'Wesentliche Merkmale' : 'Essential characteristics',
      col1X,
      yPosition,
      9,
      true
    )
    drawText(
      language === 'de' ? 'Leistung' : 'Performance',
      col2X,
      yPosition,
      9,
      true
    )
    drawText(
      language === 'de' ? 'Harmonisierte\ntechnische Spezifikation' : 'Harmonised\ntechnical specification',
      col3X,
      yPosition,
      9,
      true
    )
    yPosition -= 20

    // Horizontale Linie
    page.drawLine({
      start: { x: col1X, y: yPosition + 5 },
      end: { x: 540, y: yPosition + 5 },
      thickness: 0.5,
      color: rgb(0, 0, 0)
    })
    yPosition -= 10

    // Tabelleninhalt - WICHTIG: Korrosive Stoffe IMMER zuerst!
    const characteristics: Array<{ name: string; value: string }> = []

    // 1. Freisetzung korrosiver Stoffe (PFLICHT als erste Zeile)
    characteristics.push({
      name: language === 'de' ? 'Freisetzung korrosiver Stoffe' : 'Release of corrosive substances',
      value: dop.declared_performance.release_of_corrosive_substances
    })

    // 2. Mechanische Eigenschaften
    characteristics.push({
      name: language === 'de' ? 'Druckfestigkeit' : 'Compressive strength',
      value: dop.declared_performance.compressive_strength_class
    })

    characteristics.push({
      name: language === 'de' ? 'Biegezugfestigkeit' : 'Flexural strength',
      value: dop.declared_performance.flexural_strength_class
    })

    // 3. Verschleißwiderstand (je nach Methode)
    if (dop.declared_performance.wear_resistance_bohme_class) {
      characteristics.push({
        name: language === 'de' ? 'Verschleißwiderstand nach Böhme' : 'Wear resistance (Böhme)',
        value: dop.declared_performance.wear_resistance_bohme_class
      })
    }
    if (dop.declared_performance.wear_resistance_bca_class) {
      characteristics.push({
        name: language === 'de' ? 'Verschleißwiderstand BCA' : 'Wear resistance (BCA)',
        value: dop.declared_performance.wear_resistance_bca_class
      })
    }
    if (dop.declared_performance.wear_resistance_rwfc_class) {
      characteristics.push({
        name: language === 'de' ? 'Rollbeanspruchung' : 'Rolling wheel',
        value: dop.declared_performance.wear_resistance_rwfc_class
      })
    }

    // 4. Zusätzliche mechanische Eigenschaften
    if (dop.declared_performance.surface_hardness_class) {
      characteristics.push({
        name: language === 'de' ? 'Oberflächenhärte' : 'Surface hardness',
        value: dop.declared_performance.surface_hardness_class
      })
    }

    if (dop.declared_performance.bond_strength_class) {
      characteristics.push({
        name: language === 'de' ? 'Haftzugfestigkeit' : 'Bond strength',
        value: dop.declared_performance.bond_strength_class
      })
    }

    if (dop.declared_performance.impact_resistance_class) {
      characteristics.push({
        name: language === 'de' ? 'Schlagfestigkeit' : 'Impact resistance',
        value: dop.declared_performance.impact_resistance_class
      })
    }

    // 5. Brandverhalten
    if (dop.declared_performance.fire_class) {
      characteristics.push({
        name: language === 'de' ? 'Brandverhalten' : 'Reaction to fire',
        value: dop.declared_performance.fire_class
      })
    }

    // 6. Weitere Eigenschaften
    if (dop.declared_performance.water_permeability) {
      characteristics.push({
        name: language === 'de' ? 'Wasserdurchlässigkeit' : 'Water permeability',
        value: dop.declared_performance.water_permeability
      })
    }

    if (dop.declared_performance.water_vapour_permeability) {
      characteristics.push({
        name: language === 'de' ? 'Wasserdampfdurchlässigkeit' : 'Water vapour permeability',
        value: dop.declared_performance.water_vapour_permeability
      })
    }

    if (dop.declared_performance.sound_insulation) {
      characteristics.push({
        name: language === 'de' ? 'Schalldämmung' : 'Sound insulation',
        value: dop.declared_performance.sound_insulation
      })
    }

    if (dop.declared_performance.sound_absorption) {
      characteristics.push({
        name: language === 'de' ? 'Schallabsorption' : 'Sound absorption',
        value: dop.declared_performance.sound_absorption
      })
    }

    if (dop.declared_performance.thermal_resistance) {
      characteristics.push({
        name: language === 'de' ? 'Wärmewiderstand' : 'Thermal resistance',
        value: dop.declared_performance.thermal_resistance
      })
    }

    if (dop.declared_performance.chemical_resistance) {
      characteristics.push({
        name: language === 'de' ? 'Chemische Beständigkeit' : 'Chemical resistance',
        value: dop.declared_performance.chemical_resistance
      })
    }

    if (dop.declared_performance.electrical_resistance) {
      characteristics.push({
        name: language === 'de' ? 'Elektrischer Widerstand' : 'Electrical resistance',
        value: dop.declared_performance.electrical_resistance
      })
    }

    // 7. Freisetzung gefährlicher Substanzen (immer als letzte Zeile)
    characteristics.push({
      name: language === 'de' ? 'Freisetzung gefährlicher Substanzen' : 'Release of dangerous substances',
      value: dop.declared_performance.release_of_dangerous_substances || 'Siehe SDS'
    })

    // Zeichne alle Zeilen
    let rowCount = 0
    for (const char of characteristics) {
      drawText(char.name, col1X, yPosition, 9)
      drawText(char.value, col2X, yPosition, 9)
      if (rowCount === 0) {
        // Nur erste Zeile bekommt die Spezifikation
        drawText('EN 13813:2002', col3X, yPosition, 9)
      }
      yPosition -= 15
      rowCount++
    }

    // Untere Linie
    page.drawLine({
      start: { x: col1X, y: yPosition + 5 },
      end: { x: 540, y: yPosition + 5 },
      thickness: 0.5,
      color: rgb(0, 0, 0)
    })
    yPosition -= 30

    // 10. Standard-Konformitätserklärung
    const declNumber = dop.authorized_representative 
      ? (dop.avcp_system === 1 && dop.notified_body ? '10' : '9')
      : (dop.avcp_system === 1 && dop.notified_body ? '9' : '8')
    
    drawText(`${declNumber}.`, 50, yPosition, 10, true)
    yPosition -= 15
    
    const conformityText = language === 'de'
      ? `Die Leistung des Produkts gemäß den Nummern 1 und 2 entspricht der erklärten Leistung nach Nummer ${perfNumber}. Verantwortlich für die Erstellung dieser Leistungserklärung ist allein der Hersteller gemäß Nummer 4.`
      : `The performance of the product identified in points 1 and 2 is in conformity with the declared performance in point ${perfNumber}. This declaration of performance is issued under the sole responsibility of the manufacturer identified in point 4.`
    
    yPosition = drawMultilineText(conformityText, 50, yPosition, 500, 10)
    yPosition -= 30

    // Unterschrift
    drawText(
      language === 'de'
        ? 'Unterzeichnet für den Hersteller und im Namen des Herstellers von:'
        : 'Signed for and on behalf of the manufacturer by:',
      50,
      yPosition,
      10
    )
    yPosition -= 40

    // Unterschriftslinie
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: 250, y: yPosition },
      thickness: 0.5,
      color: rgb(0, 0, 0)
    })
    yPosition -= 15

    if (dop.signatory) {
      drawText(dop.signatory.name, 50, yPosition, 10)
      yPosition -= 12
      drawText(dop.signatory.position, 50, yPosition, 9)
    } else {
      drawText(
        language === 'de' ? 'Name und Funktion' : 'Name and function',
        50,
        yPosition,
        8
      )
    }

    // Datum und Ort
    page.drawLine({
      start: { x: 350, y: yPosition + 27 },
      end: { x: 500, y: yPosition + 27 },
      thickness: 0.5,
      color: rgb(0, 0, 0)
    })
    
    const currentDate = new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')
    const place = dop.signatory?.place || manufacturer.city
    drawText(`${place}, ${currentDate}`, 350, yPosition + 30, 10)
    drawText(
      language === 'de' ? 'Ort und Datum' : 'Place and date',
      350,
      yPosition + 12,
      8
    )

    // QR Code wenn vorhanden
    if (dop.qr_code_data) {
      try {
        const qrImageData = dop.qr_code_data.replace(/^data:image\/png;base64,/, '')
        const qrImageBytes = Uint8Array.from(atob(qrImageData), c => c.charCodeAt(0))
        const qrImage = await pdfDoc.embedPng(qrImageBytes)
        
        page.drawImage(qrImage, {
          x: 450,
          y: 50,
          width: 100,
          height: 100
        })
        
        drawText(
          language === 'de' ? 'Digitale Version' : 'Digital version',
          460,
          40,
          8
        )

        if (dop.digital_availability_url) {
          drawText(dop.digital_availability_url, 420, 25, 6)
        }
      } catch (error) {
        console.error('Error embedding QR code:', error)
      }
    }

    // Footer
    drawText(
      `DoP ${dop.dop_number} - Version ${dop.version} - ${language.toUpperCase()}`,
      50,
      30,
      8
    )

    if (dop.retention_period) {
      drawText(
        language === 'de' 
          ? `Aufbewahrungsfrist: ${dop.retention_period}`
          : `Retention period: ${dop.retention_period}`,
        50,
        20,
        8
      )
    }

    // Serialize PDF
    const pdfBytes = await pdfDoc.save()
    return pdfBytes
  }

  async generateCELabel(params: PDFGenerationParams): Promise<Uint8Array> {
    const { recipe, manufacturer, dop, language = 'de' } = params

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([210, 297]) // A5 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // CE marking
    page.drawText('CE', {
      x: 90,
      y: 250,
      size: 48,
      font: boldFont,
      color: rgb(0, 0, 0)
    })

    // Year
    page.drawText(new Date().getFullYear().toString(), {
      x: 95,
      y: 220,
      size: 12,
      font,
      color: rgb(0, 0, 0)
    })

    // Notified body number if System 1+
    if (dop.avcp_system === 1 && dop.notified_body?.number) {
      page.drawText(dop.notified_body.number, {
        x: 85,
        y: 200,
        size: 12,
        font,
        color: rgb(0, 0, 0)
      })
    }

    // Standard
    page.drawText('EN 13813', {
      x: 75,
      y: 180,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0)
    })

    // Classification code mit allen relevanten Klassen
    let classificationCode = `${dop.declared_performance.release_of_corrosive_substances}-${dop.declared_performance.compressive_strength_class}-${dop.declared_performance.flexural_strength_class}`
    
    if (dop.declared_performance.wear_resistance_bohme_class) {
      classificationCode += `-${dop.declared_performance.wear_resistance_bohme_class}`
    } else if (dop.declared_performance.wear_resistance_bca_class) {
      classificationCode += `-${dop.declared_performance.wear_resistance_bca_class}`
    } else if (dop.declared_performance.wear_resistance_rwfc_class) {
      classificationCode += `-${dop.declared_performance.wear_resistance_rwfc_class}`
    }

    if (dop.declared_performance.fire_class && dop.declared_performance.fire_class !== 'NPD') {
      classificationCode += `-${dop.declared_performance.fire_class}`
    }

    page.drawText(classificationCode, {
      x: 30,
      y: 150,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0)
    })

    // Product name
    page.drawText(recipe.name, {
      x: 30,
      y: 120,
      size: 10,
      font,
      color: rgb(0, 0, 0)
    })

    // DoP number
    page.drawText(`DoP: ${dop.dop_number}`, {
      x: 30,
      y: 100,
      size: 10,
      font,
      color: rgb(0, 0, 0)
    })

    // Manufacturer
    page.drawText(manufacturer.name, {
      x: 30,
      y: 80,
      size: 10,
      font,
      color: rgb(0, 0, 0)
    })

    page.drawText(manufacturer.city, {
      x: 30,
      y: 65,
      size: 10,
      font,
      color: rgb(0, 0, 0)
    })

    const pdfBytes = await pdfDoc.save()
    return pdfBytes
  }
}