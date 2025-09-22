import { PDFDocument, StandardFonts, rgb, PDFPage } from 'pdf-lib'
import { DoP, Recipe, ManufacturerData, Batch, TestReport } from '../types'
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

    // Title
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

    // According to EU Regulation
    drawText(
      language === 'de' 
        ? 'gemäß Verordnung (EU) Nr. 305/2011'
        : 'according to Regulation (EU) No. 305/2011',
      50,
      yPosition,
      10
    )
    yPosition -= 30

    // 1. Product Code
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

    // 2. Product Name
    drawText('2.', 50, yPosition, 10, true)
    drawText(
      language === 'de'
        ? 'Handelsname:'
        : 'Trade name:',
      70,
      yPosition,
      10
    )
    yPosition -= 15
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

    // 3. Intended Use
    drawText('3.', 50, yPosition, 10, true)
    drawText(
      language === 'de'
        ? 'Verwendungszweck:'
        : 'Intended use:',
      70,
      yPosition,
      10
    )
    yPosition -= 15
    drawText(
      language === 'de'
        ? 'Estrichmörtel zur Verwendung in Gebäuden gemäß EN 13813'
        : 'Screed material for use in buildings according to EN 13813',
      70,
      yPosition,
      10
    )
    yPosition -= 25

    // 4. Manufacturer
    drawText('4.', 50, yPosition, 10, true)
    drawText(
      language === 'de'
        ? 'Hersteller:'
        : 'Manufacturer:',
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

    // 5. System of AVCP
    drawText('5.', 50, yPosition, 10, true)
    drawText(
      language === 'de'
        ? 'System zur Bewertung und Überprüfung der Leistungsbeständigkeit:'
        : 'System of assessment and verification of constancy of performance:',
      70,
      yPosition,
      10
    )
    yPosition -= 15
    drawText('System 4', 70, yPosition, 10)
    yPosition -= 25

    // 6. Harmonized Standard
    drawText('6.', 50, yPosition, 10, true)
    drawText(
      language === 'de'
        ? 'Harmonisierte Norm:'
        : 'Harmonized standard:',
      70,
      yPosition,
      10
    )
    yPosition -= 15
    drawText('EN 13813:2002', 70, yPosition, 10)
    yPosition -= 25

    // 7. Declared Performance
    drawText('7.', 50, yPosition, 10, true)
    drawText(
      language === 'de'
        ? 'Erklärte Leistung:'
        : 'Declared performance:',
      70,
      yPosition,
      10
    )
    yPosition -= 20

    // Performance table
    const tableStartY = yPosition
    const col1X = 70
    const col2X = 300
    
    // Table headers
    drawText(
      language === 'de' ? 'Wesentliche Merkmale' : 'Essential characteristics',
      col1X,
      yPosition,
      10,
      true
    )
    drawText(
      language === 'de' ? 'Leistung' : 'Performance',
      col2X,
      yPosition,
      10,
      true
    )
    yPosition -= 20

    // Draw line
    page.drawLine({
      start: { x: col1X, y: yPosition + 5 },
      end: { x: 500, y: yPosition + 5 },
      thickness: 0.5,
      color: rgb(0, 0, 0)
    })
    yPosition -= 10

    // Table content
    const characteristics = [
      {
        name: language === 'de' ? 'Estrichtyp' : 'Screed type',
        value: recipe.binder_type
      },
      {
        name: language === 'de' ? 'Druckfestigkeit' : 'Compressive strength',
        value: recipe.compressive_strength_class
      },
      {
        name: language === 'de' ? 'Biegezugfestigkeit' : 'Flexural strength',
        value: recipe.flexural_strength_class
      }
    ]

    if (recipe.wear_resistance_class) {
      characteristics.push({
        name: language === 'de' ? 'Verschleißwiderstand' : 'Wear resistance',
        value: recipe.wear_resistance_class
      })
    }

    if (recipe.fire_class) {
      characteristics.push({
        name: language === 'de' ? 'Brandverhalten' : 'Reaction to fire',
        value: recipe.fire_class
      })
    }

    for (const char of characteristics) {
      drawText(char.name, col1X, yPosition, 10)
      drawText(char.value, col2X, yPosition, 10)
      yPosition -= 15
    }

    // Draw bottom line
    page.drawLine({
      start: { x: col1X, y: yPosition + 5 },
      end: { x: 500, y: yPosition + 5 },
      thickness: 0.5,
      color: rgb(0, 0, 0)
    })
    yPosition -= 30

    // 8. Declaration
    drawText('8.', 50, yPosition, 10, true)
    const declarationText = language === 'de'
      ? 'Die Leistung des oben genannten Produkts entspricht der erklärten Leistung.'
      : 'The performance of the product identified above is in conformity with the declared performance.'
    
    // Split long text into multiple lines
    const words = declarationText.split(' ')
    let line = ''
    const maxWidth = 450
    
    for (const word of words) {
      const testLine = line + word + ' '
      const width = font.widthOfTextAtSize(testLine, 10)
      if (width > maxWidth) {
        drawText(line.trim(), 70, yPosition, 10)
        yPosition -= 15
        line = word + ' '
      } else {
        line = testLine
      }
    }
    if (line.trim()) {
      drawText(line.trim(), 70, yPosition, 10)
      yPosition -= 15
    }
    yPosition -= 20

    // Signature section
    drawText(
      language === 'de'
        ? 'Unterzeichnet für den Hersteller und im Namen des Herstellers von:'
        : 'Signed for and on behalf of the manufacturer by:',
      50,
      yPosition,
      10
    )
    yPosition -= 30

    // Signature line
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: 250, y: yPosition },
      thickness: 0.5,
      color: rgb(0, 0, 0)
    })
    yPosition -= 15
    drawText(
      language === 'de' ? 'Name und Funktion' : 'Name and function',
      50,
      yPosition,
      8
    )

    // Date and place
    page.drawLine({
      start: { x: 350, y: yPosition + 15 },
      end: { x: 500, y: yPosition + 15 },
      thickness: 0.5,
      color: rgb(0, 0, 0)
    })
    drawText(
      language === 'de' ? 'Ort und Datum' : 'Place and date',
      350,
      yPosition,
      8
    )
    
    // Add current date
    const currentDate = new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')
    drawText(currentDate, 350, yPosition + 20, 10)

    // Add QR code if available
    if (dop.qr_code_data) {
      try {
        // Convert base64 QR code to image
        const qrImageData = dop.qr_code_data.replace(/^data:image\/png;base64,/, '')
        const qrImageBytes = Uint8Array.from(atob(qrImageData), c => c.charCodeAt(0))
        const qrImage = await pdfDoc.embedPng(qrImageBytes)
        
        // Draw QR code in bottom right corner
        page.drawImage(qrImage, {
          x: 450,
          y: 50,
          width: 100,
          height: 100
        })
        
        // Add text below QR code
        drawText(
          language === 'de' ? 'Digitale Version' : 'Digital version',
          460,
          40,
          8
        )
      } catch (error) {
        console.error('Error embedding QR code:', error)
        // Continue without QR code
      }
    }

    // Add footer
    drawText(
      `DoP ${dop.dop_number} - Version ${dop.version} - Page 1/1`,
      50,
      30,
      8
    )

    // Serialize the PDF
    const pdfBytes = await pdfDoc.save()
    return pdfBytes
  }

  async generateCELabel(params: PDFGenerationParams): Promise<Uint8Array> {
    const { recipe, manufacturer, language = 'de' } = params

    // Create a new PDF document for CE label
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

    // Standard
    page.drawText('EN 13813', {
      x: 75,
      y: 190,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0)
    })

    // Classification code
    const classificationCode = `${recipe.binder_type}-${recipe.compressive_strength_class}-${recipe.flexural_strength_class}`
    page.drawText(classificationCode, {
      x: 70,
      y: 160,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0)
    })

    // Product name
    page.drawText(recipe.name, {
      x: 30,
      y: 130,
      size: 10,
      font,
      color: rgb(0, 0, 0)
    })

    // Manufacturer
    page.drawText(manufacturer.name, {
      x: 30,
      y: 110,
      size: 10,
      font,
      color: rgb(0, 0, 0)
    })

    const pdfBytes = await pdfDoc.save()
    return pdfBytes
  }
}