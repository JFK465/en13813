import { PDFDocument, StandardFonts, rgb, PDFPage } from 'pdf-lib'
import { DoP, Recipe, ManufacturerData, NotifiedBody } from '../types'

export interface CELabelParams {
  dop: DoP
  recipe: Recipe
  manufacturer: ManufacturerData
  language?: 'de' | 'en'
  productName?: string
  intendedUse?: string
}

export class CELabelGeneratorService {
  async generateCELabel(params: CELabelParams): Promise<Uint8Array> {
    const { dop, recipe, manufacturer, language = 'de', productName, intendedUse } = params

    // Create a new PDF document for CE label (smaller format)
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([210, 297]) // A5 size for label
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    let yPosition = 260

    // Helper function to draw text
    const drawText = (text: string, x: number, y: number, size = 8, isBold = false) => {
      page.drawText(text, {
        x,
        y,
        size,
        font: isBold ? boldFont : font,
        color: rgb(0, 0, 0)
      })
    }

    // Helper function to draw centered text
    const drawCenteredText = (text: string, y: number, size = 8, isBold = false) => {
      const textFont = isBold ? boldFont : font
      const textWidth = textFont.widthOfTextAtSize(text, size)
      const x = (210 - textWidth) / 2
      drawText(text, x, y, size, isBold)
    }

    // Draw CE marking symbol (simplified representation)
    const drawCESymbol = (x: number, y: number, size: number) => {
      // C
      page.drawText('C', {
        x: x,
        y: y,
        size: size,
        font: boldFont,
        color: rgb(0, 0, 0)
      })
      // E
      page.drawText('E', {
        x: x + size * 0.8,
        y: y,
        size: size,
        font: boldFont,
        color: rgb(0, 0, 0)
      })
    }

    // CE Symbol
    drawCESymbol(85, yPosition, 30)
    
    // Notified Body number if System 1+
    if (dop.avcp_system === 1 && dop.notified_body?.number) {
      drawCenteredText(dop.notified_body.number, yPosition - 35, 12, true)
      yPosition -= 50
    } else {
      yPosition -= 35
    }

    // Year of first CE marking
    const year = new Date().getFullYear().toString().slice(-2)
    drawCenteredText(year, yPosition, 10)
    yPosition -= 20

    // Manufacturer information
    drawCenteredText(manufacturer.name, yPosition, 9, true)
    yPosition -= 12
    drawCenteredText(manufacturer.address, yPosition, 8)
    yPosition -= 10
    drawCenteredText(`${manufacturer.postalCode} ${manufacturer.city}`, yPosition, 8)
    yPosition -= 10
    drawCenteredText(manufacturer.country, yPosition, 8)
    yPosition -= 20

    // DoP Number
    drawCenteredText(dop.dop_number, yPosition, 9, true)
    yPosition -= 20

    // Harmonized Standard
    drawCenteredText('EN 13813:2002', yPosition, 9)
    yPosition -= 20

    // Product description
    const productDesc = productName || `${language === 'de' ? 'Estrichmörtel' : 'Screed material'} ${recipe.recipe_code}`
    drawCenteredText(productDesc, yPosition, 9, true)
    yPosition -= 15

    // EN 13813 Designation
    const designation = this.buildDesignation(recipe)
    drawCenteredText(designation, yPosition, 10, true)
    yPosition -= 20

    // Intended use
    const use = intendedUse || (language === 'de' 
      ? 'Zur Verwendung in Gebäuden'
      : 'For use in buildings')
    drawCenteredText(use, yPosition, 8)
    yPosition -= 15

    // Essential characteristics (compact format)
    yPosition -= 5
    drawText(language === 'de' ? 'Wesentliche Merkmale:' : 'Essential characteristics:', 20, yPosition, 8, true)
    yPosition -= 12

    // Reaction to fire
    if (recipe.fire_class && recipe.fire_class !== 'NPD') {
      drawText(language === 'de' ? 'Brandverhalten:' : 'Reaction to fire:', 25, yPosition, 7)
      drawText(recipe.fire_class, 120, yPosition, 7)
      yPosition -= 10
    }

    // Corrosive substances
    drawText(language === 'de' ? 'Korrosive Stoffe:' : 'Corrosive substances:', 25, yPosition, 7)
    drawText(recipe.binder_type, 120, yPosition, 7)
    yPosition -= 10

    // Compressive strength
    drawText(language === 'de' ? 'Druckfestigkeit:' : 'Compressive strength:', 25, yPosition, 7)
    drawText(recipe.compressive_strength_class, 120, yPosition, 7)
    yPosition -= 10

    // Flexural strength
    drawText(language === 'de' ? 'Biegezugfestigkeit:' : 'Flexural strength:', 25, yPosition, 7)
    drawText(recipe.flexural_strength_class, 120, yPosition, 7)
    yPosition -= 10

    // Wear resistance (if declared)
    if (recipe.wear_resistance_class) {
      drawText(language === 'de' ? 'Verschleißwiderstand:' : 'Wear resistance:', 25, yPosition, 7)
      drawText(recipe.wear_resistance_class, 120, yPosition, 7)
      yPosition -= 10
    }

    // Dangerous substances
    drawText(language === 'de' ? 'Gefährliche Stoffe:' : 'Dangerous substances:', 25, yPosition, 7)
    drawText(language === 'de' ? 'Siehe SDB' : 'See SDS', 120, yPosition, 7)
    yPosition -= 20

    // Reference to DoP
    drawCenteredText(
      language === 'de' 
        ? 'Die Leistung entspricht der erklärten Leistung'
        : 'The performance corresponds to the declared performance',
      yPosition,
      7
    )
    yPosition -= 10
    drawCenteredText(
      language === 'de'
        ? `Vollständige DoP verfügbar unter: ${dop.digital_availability_url || 'www.dop.estrichwerke.de'}`
        : `Full DoP available at: ${dop.digital_availability_url || 'www.dop.estrichwerke.de'}`,
      yPosition,
      6
    )

    // Save the PDF
    const pdfBytes = await pdfDoc.save()
    return pdfBytes
  }

  private buildDesignation(recipe: Recipe): string {
    let designation = recipe.binder_type

    // Add compressive strength
    designation += `-C${recipe.compressive_strength_class.replace('C', '')}`

    // Add flexural strength
    designation += `-F${recipe.flexural_strength_class.replace('F', '')}`

    // Add wear resistance if declared
    if (recipe.wear_resistance_class) {
      if (recipe.wear_resistance_method === 'bohme') {
        designation += `-A${recipe.wear_resistance_class.replace('A', '')}`
      } else if (recipe.wear_resistance_method === 'bca') {
        designation += `-AR${recipe.wear_resistance_class.replace('AR', '')}`
      } else if (recipe.wear_resistance_method === 'rolling_wheel') {
        designation += `-RWA${recipe.wear_resistance_class.replace('RWA', '')}`
      }
    }

    // Add surface hardness for MA
    if (recipe.binder_type === 'MA' && recipe.surface_hardness_class) {
      designation += `-SH${recipe.surface_hardness_class.replace('SH', '')}`
    }

    // Add bond strength for SR
    if (recipe.binder_type === 'SR' && recipe.bond_strength_class) {
      designation += `-B${recipe.bond_strength_class.replace('B', '')}`
    }

    // Add fire class if not A1fl
    if (recipe.fire_class && recipe.fire_class !== 'A1fl' && recipe.fire_class !== 'NPD') {
      designation += `-${recipe.fire_class}`
    }

    return designation
  }

  async generateBatchLabel(params: {
    dop: DoP
    recipe: Recipe
    batchNumber: string
    productionDate: string
    quantity?: string
    language?: 'de' | 'en'
  }): Promise<Uint8Array> {
    const { dop, recipe, batchNumber, productionDate, quantity, language = 'de' } = params

    // Create a new PDF document for batch label
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([148, 105]) // A6 size for small label
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Helper function to draw text
    const drawText = (text: string, x: number, y: number, size = 7, isBold = false) => {
      page.drawText(text, {
        x,
        y,
        size,
        font: isBold ? boldFont : font,
        color: rgb(0, 0, 0)
      })
    }

    // CE Symbol
    drawText('CE', 10, 85, 12, true)
    if (dop.notified_body?.number) {
      drawText(dop.notified_body.number, 35, 85, 8)
    }

    // Product designation
    drawText(this.buildDesignation(recipe), 10, 70, 8, true)

    // Batch information
    drawText(language === 'de' ? 'Charge:' : 'Batch:', 10, 55, 7)
    drawText(batchNumber, 45, 55, 7, true)

    drawText(language === 'de' ? 'Datum:' : 'Date:', 10, 45, 7)
    drawText(productionDate, 45, 45, 7)

    if (quantity) {
      drawText(language === 'de' ? 'Menge:' : 'Quantity:', 10, 35, 7)
      drawText(quantity, 45, 35, 7)
    }

    // DoP reference
    drawText('DoP:', 10, 25, 7)
    drawText(dop.dop_number, 30, 25, 6)

    // QR code placeholder text
    drawText(language === 'de' ? 'QR-Code siehe DoP' : 'QR code see DoP', 10, 15, 6)

    const pdfBytes = await pdfDoc.save()
    return pdfBytes
  }
}