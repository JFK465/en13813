import { PDFDocument, StandardFonts, rgb, PDFPage } from 'pdf-lib'
import QRCode from 'qrcode'

export interface DoPPDFData {
  dop_number: string
  version: number
  product_name: string
  recipe_code: string
  intended_use: string
  manufacturer_info: {
    company_name: string
    address: string
    postal_code: string
    city: string
    country: string
    phone?: string
    email?: string
    website?: string
    authorized_person: string
    authorized_person_role: string
  }
  declared_performance: {
    essential_characteristics: Array<{
      characteristic: string
      performance: string
      standard: string
    }>
    system: string
    notified_body?: string
  }
  issued_at?: string
  qr_code?: string
}

export class PDFGeneratorService {
  async generateDoPPDF(data: DoPPDFData): Promise<Uint8Array> {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()
    
    // Add a page
    const page = pdfDoc.addPage([595, 842]) // A4 size
    
    // Load fonts
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
    
    // Draw header
    await this.drawHeader(page, data, helveticaBold, helvetica)
    
    // Draw content sections
    let yPosition = 700
    yPosition = await this.drawSection1(page, data, yPosition, helveticaBold, helvetica)
    yPosition = await this.drawSection2(page, data, yPosition, helveticaBold, helvetica)
    yPosition = await this.drawSection3(page, data, yPosition, helveticaBold, helvetica)
    yPosition = await this.drawSection4(page, data, yPosition, helveticaBold, helvetica)
    yPosition = await this.drawSection5(page, data, yPosition, helveticaBold, helvetica)
    yPosition = await this.drawSection6(page, data, yPosition, helveticaBold, helvetica)
    yPosition = await this.drawSection7(page, data, yPosition, helveticaBold, helvetica)
    
    // Draw signature section
    await this.drawSignature(page, data, helveticaBold, helvetica)
    
    // Add QR code if available
    if (data.qr_code) {
      await this.addQRCode(page, data.qr_code, pdfDoc)
    }
    
    // Add footer
    await this.drawFooter(page, data, helvetica)
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save()
    return pdfBytes
  }

  private async drawHeader(page: PDFPage, data: DoPPDFData, boldFont: any, regularFont: any) {
    const { width } = page.getSize()
    
    // Title
    page.drawText('LEISTUNGSERKLÄRUNG', {
      x: width / 2 - 120,
      y: 780,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    
    // DoP Number
    page.drawText(`Nr. ${data.dop_number}`, {
      x: width / 2 - 50,
      y: 750,
      size: 14,
      font: regularFont,
      color: rgb(0, 0, 0)
    })
    
    // Draw a line
    page.drawLine({
      start: { x: 50, y: 730 },
      end: { x: width - 50, y: 730 },
      thickness: 1,
      color: rgb(0, 0, 0)
    })
  }

  private async drawSection1(page: PDFPage, data: DoPPDFData, yPosition: number, boldFont: any, regularFont: any): Promise<number> {
    page.drawText('1. Eindeutiger Kenncode des Produkttyps:', {
      x: 50,
      y: yPosition,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    
    yPosition -= 20
    page.drawText(data.recipe_code, {
      x: 70,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0)
    })
    
    return yPosition - 30
  }

  private async drawSection2(page: PDFPage, data: DoPPDFData, yPosition: number, boldFont: any, regularFont: any): Promise<number> {
    page.drawText('2. Verwendungszweck:', {
      x: 50,
      y: yPosition,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    
    yPosition -= 20
    const lines = this.wrapText(data.intended_use, 80)
    for (const line of lines) {
      page.drawText(line, {
        x: 70,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0)
      })
      yPosition -= 15
    }
    
    return yPosition - 15
  }

  private async drawSection3(page: PDFPage, data: DoPPDFData, yPosition: number, boldFont: any, regularFont: any): Promise<number> {
    page.drawText('3. Hersteller:', {
      x: 50,
      y: yPosition,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    
    yPosition -= 20
    const info = data.manufacturer_info
    
    // Company name
    page.drawText(info.company_name, {
      x: 70,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0)
    })
    yPosition -= 15
    
    // Address
    page.drawText(info.address, {
      x: 70,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0)
    })
    yPosition -= 15
    
    // Postal code and city
    page.drawText(`${info.postal_code} ${info.city}`, {
      x: 70,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0)
    })
    yPosition -= 15
    
    // Country
    page.drawText(info.country, {
      x: 70,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0)
    })
    
    return yPosition - 30
  }

  private async drawSection4(page: PDFPage, data: DoPPDFData, yPosition: number, boldFont: any, regularFont: any): Promise<number> {
    page.drawText('4. Bevollmächtigter:', {
      x: 50,
      y: yPosition,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    
    yPosition -= 20
    page.drawText('Nicht zutreffend', {
      x: 70,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0)
    })
    
    return yPosition - 30
  }

  private async drawSection5(page: PDFPage, data: DoPPDFData, yPosition: number, boldFont: any, regularFont: any): Promise<number> {
    page.drawText('5. System zur Bewertung und Überprüfung der Leistungsbeständigkeit:', {
      x: 50,
      y: yPosition,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    
    yPosition -= 20
    page.drawText(data.declared_performance.system, {
      x: 70,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0)
    })
    
    return yPosition - 30
  }

  private async drawSection6(page: PDFPage, data: DoPPDFData, yPosition: number, boldFont: any, regularFont: any): Promise<number> {
    page.drawText('6. Harmonisierte Norm:', {
      x: 50,
      y: yPosition,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    
    yPosition -= 20
    page.drawText('EN 13813:2002', {
      x: 70,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0)
    })
    
    if (data.declared_performance.notified_body) {
      yPosition -= 15
      page.drawText(`Benannte Stelle: ${data.declared_performance.notified_body}`, {
        x: 70,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0)
      })
    }
    
    return yPosition - 30
  }

  private async drawSection7(page: PDFPage, data: DoPPDFData, yPosition: number, boldFont: any, regularFont: any): Promise<number> {
    page.drawText('7. Erklärte Leistungen:', {
      x: 50,
      y: yPosition,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    
    yPosition -= 25
    
    // Draw table header
    page.drawText('Wesentliche Merkmale', {
      x: 70,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    
    page.drawText('Leistung', {
      x: 300,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    
    page.drawText('Harmonisierte technische Spezifikation', {
      x: 400,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    
    yPosition -= 5
    // Draw line under header
    page.drawLine({
      start: { x: 70, y: yPosition },
      end: { x: 545, y: yPosition },
      thickness: 0.5,
      color: rgb(0, 0, 0)
    })
    
    yPosition -= 15
    
    // Draw characteristics
    for (const char of data.declared_performance.essential_characteristics) {
      page.drawText(char.characteristic, {
        x: 70,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: rgb(0, 0, 0)
      })
      
      page.drawText(char.performance, {
        x: 300,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: rgb(0, 0, 0)
      })
      
      page.drawText(char.standard, {
        x: 400,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: rgb(0, 0, 0)
      })
      
      yPosition -= 15
    }
    
    return yPosition - 20
  }

  private async drawSignature(page: PDFPage, data: DoPPDFData, boldFont: any, regularFont: any) {
    const { width } = page.getSize()
    let yPosition = 150
    
    page.drawText('Die Leistung des vorstehenden Produkts entspricht der erklärten Leistung.', {
      x: 50,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0)
    })
    
    yPosition -= 30
    page.drawText('Unterzeichnet für den Hersteller und im Namen des Herstellers von:', {
      x: 50,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0)
    })
    
    yPosition -= 40
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: 250, y: yPosition },
      thickness: 0.5,
      color: rgb(0, 0, 0)
    })
    
    yPosition -= 15
    page.drawText(data.manufacturer_info.authorized_person, {
      x: 50,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0)
    })
    
    yPosition -= 15
    page.drawText(data.manufacturer_info.authorized_person_role, {
      x: 50,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0)
    })
    
    // Date and location
    const date = data.issued_at ? new Date(data.issued_at).toLocaleDateString('de-DE') : new Date().toLocaleDateString('de-DE')
    page.drawText(`${data.manufacturer_info.city}, ${date}`, {
      x: width - 200,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0)
    })
  }

  private async addQRCode(page: PDFPage, qrData: string, pdfDoc: PDFDocument) {
    try {
      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 100,
        margin: 1
      })
      
      // Convert data URL to buffer
      const qrCodeImage = await pdfDoc.embedPng(qrCodeDataUrl)
      
      // Draw QR code in bottom right corner
      const { width } = page.getSize()
      page.drawImage(qrCodeImage, {
        x: width - 120,
        y: 20,
        width: 80,
        height: 80
      })
    } catch (error) {
      console.error('Error adding QR code:', error)
    }
  }

  private async drawFooter(page: PDFPage, data: DoPPDFData, regularFont: any) {
    const { width } = page.getSize()
    
    page.drawText(`Seite 1 von 1 | Version ${data.version}`, {
      x: 50,
      y: 20,
      size: 8,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5)
    })
  }

  private wrapText(text: string, maxChars: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    
    for (const word of words) {
      if ((currentLine + word).length <= maxChars) {
        currentLine += (currentLine ? ' ' : '') + word
      } else {
        if (currentLine) lines.push(currentLine)
        currentLine = word
      }
    }
    
    if (currentLine) lines.push(currentLine)
    return lines
  }

  async generateCELabel(data: {
    company_name: string
    product_name: string
    recipe_code: string
    year: string
    notified_body?: string
    classification: string
  }): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([200, 100]) // Small label size
    
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
    
    // CE marking
    page.drawText('CE', {
      x: 20,
      y: 70,
      size: 24,
      font: helveticaBold,
      color: rgb(0, 0, 0)
    })
    
    // Notified body number if applicable
    if (data.notified_body) {
      page.drawText(data.notified_body, {
        x: 60,
        y: 70,
        size: 14,
        font: helvetica,
        color: rgb(0, 0, 0)
      })
    }
    
    // Year
    page.drawText(data.year, {
      x: 120,
      y: 70,
      size: 14,
      font: helvetica,
      color: rgb(0, 0, 0)
    })
    
    // Classification
    page.drawText(data.classification, {
      x: 20,
      y: 45,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0)
    })
    
    // Product info
    page.drawText(data.product_name, {
      x: 20,
      y: 25,
      size: 8,
      font: helvetica,
      color: rgb(0, 0, 0)
    })
    
    page.drawText(data.company_name, {
      x: 20,
      y: 10,
      size: 8,
      font: helvetica,
      color: rgb(0, 0, 0)
    })
    
    const pdfBytes = await pdfDoc.save()
    return pdfBytes
  }
}