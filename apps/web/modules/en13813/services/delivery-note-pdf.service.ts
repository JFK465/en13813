/**
 * Delivery Note PDF Generator Service
 * EN 13813:2002 Klausel 8 - PDF-Erzeugung für Lieferscheine
 */

import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import type { MarkingLabelData } from './marking-delivery-note.service'

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: {
      finalY: number
    }
  }
}

export interface DeliveryNotePDFData {
  header: {
    documentType: string
    documentNumber: string
    date: string
    page: string
  }
  customerInfo: {
    name: string
    address: string
    projectName?: string
    deliveryAddress?: string
  }
  productInfo: {
    designation: string
    productName: string
    batchNumber: string
    productionDate: string
    quantity: string
    dopNumber?: string
    dopUrl?: string
  }
  markingInfo: MarkingLabelData
  deliveryInfo: {
    vehicleNumber?: string
    driverName?: string
    loadingTime?: string
    unloadingTime?: string
    remarks?: string
  }
  footer: {
    manufacturerName: string
    manufacturerAddress: string
    disclaimer?: string
    signature?: {
      driver: string
      recipient: string
    }
  }
}

export class DeliveryNotePDFService {
  /**
   * Generiert ein PDF für einen Lieferschein nach EN 13813 Klausel 8
   */
  static generateDeliveryNotePDF(data: DeliveryNotePDFData): Uint8Array {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Farben
    const primaryColor = [41, 98, 255] as [number, number, number]
    const secondaryColor = [100, 116, 139] as [number, number, number]
    const dangerColor = [239, 68, 68] as [number, number, number]

    // Fonts
    doc.setFont('helvetica')

    // Header
    this.addHeader(doc, data.header, primaryColor)

    // Kundeninformationen
    this.addCustomerSection(doc, data.customerInfo)

    // Produktinformationen
    this.addProductSection(doc, data.productInfo, data.markingInfo, primaryColor)

    // EN 13813 Marking (Klausel 8)
    this.addMarkingSection(doc, data.markingInfo, dangerColor)

    // CE-Kennzeichnung wenn vorhanden
    if (data.markingInfo.ceMarking) {
      this.addCESection(doc, data.markingInfo.ceMarking)
    }

    // Lieferinformationen
    this.addDeliverySection(doc, data.deliveryInfo)

    // Footer
    this.addFooter(doc, data.footer)

    return doc.output('arraybuffer') as Uint8Array
  }

  /**
   * Header mit Dokumentinformationen
   */
  private static addHeader(
    doc: jsPDF,
    header: DeliveryNotePDFData['header'],
    color: [number, number, number]
  ) {
    let y = 15

    // Logo-Platzhalter
    doc.setFillColor(...color)
    doc.rect(15, y, 40, 15, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.text('EN 13813', 35, y + 9, { align: 'center' })

    // Dokumenttyp
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(header.documentType, 105, y + 8, { align: 'center' })

    // Dokumentnummer und Datum
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Nr.: ${header.documentNumber}`, 160, y + 2)
    doc.text(`Datum: ${header.date}`, 160, y + 8)
    doc.text(`Seite: ${header.page}`, 160, y + 14)

    // Trennlinie
    y += 20
    doc.setDrawColor(200, 200, 200)
    doc.line(15, y, 195, y)
  }

  /**
   * Kundeninformationen
   */
  private static addCustomerSection(
    doc: jsPDF,
    customer: DeliveryNotePDFData['customerInfo']
  ) {
    let y = 45

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('KUNDE / LIEFERADRESSE', 15, y)

    doc.setFont('helvetica', 'normal')
    y += 6
    doc.text(customer.name, 15, y)

    // Adresse mehrzeilig
    const addressLines = customer.deliveryAddress
      ? customer.deliveryAddress.split('\n')
      : customer.address.split('\n')

    addressLines.forEach(line => {
      y += 5
      doc.text(line, 15, y)
    })

    if (customer.projectName) {
      y += 6
      doc.setFont('helvetica', 'bold')
      doc.text('Projekt:', 15, y)
      doc.setFont('helvetica', 'normal')
      doc.text(customer.projectName, 35, y)
    }
  }

  /**
   * Produktinformationen Tabelle
   */
  private static addProductSection(
    doc: jsPDF,
    product: DeliveryNotePDFData['productInfo'],
    marking: MarkingLabelData,
    color: [number, number, number]
  ) {
    const startY = 85

    // Produkttabelle
    doc.autoTable({
      startY,
      head: [['Position', 'Bezeichnung', 'Charge', 'Menge', 'Herstelldatum']],
      body: [[
        '1',
        `${product.productName}\n${product.designation}`,
        product.batchNumber,
        product.quantity,
        product.productionDate
      ]],
      headStyles: {
        fillColor: color,
        fontSize: 10
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 80 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 }
      }
    })

    // DoP-Referenz wenn vorhanden
    if (product.dopNumber) {
      const y = doc.lastAutoTable.finalY + 5
      doc.setFontSize(9)
      doc.text(`Leistungserklärung (DoP): ${product.dopNumber}`, 15, y)
      if (product.dopUrl) {
        doc.setTextColor(...color)
        doc.textWithLink('Download', 100, y, { url: product.dopUrl })
        doc.setTextColor(0, 0, 0)
      }
    }
  }

  /**
   * EN 13813 Marking Section (Klausel 8)
   */
  private static addMarkingSection(
    doc: jsPDF,
    marking: MarkingLabelData,
    dangerColor: [number, number, number]
  ) {
    let y = doc.lastAutoTable.finalY + 15

    // Titel
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('KENNZEICHNUNG GEMÄSS EN 13813 KLAUSEL 8', 15, y)

    y += 8

    // Pflichtangaben in Tabelle (Klausel 8)
    const markingData = [
      ['1. Designation', marking.designation],
      ['2. Produktname', marking.productName],
      ['3. Menge', marking.quantity],
      ['4. Herstelldatum', marking.productionDate + (marking.shelfLife ? ` / Haltbar bis: ${marking.shelfLife}` : '')],
      ['5. Charge', marking.batchNumber],
      ['6. Dmax/Dickenbereich', marking.maxGrainSize || marking.layerThickness || ''],
      ['7. Misch-/Verarbeitung', marking.mixingInstructions]
    ]

    doc.autoTable({
      startY: y,
      body: markingData,
      styles: {
        fontSize: 9,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' },
        1: { cellWidth: 140 }
      },
      theme: 'plain'
    })

    // H&S-Hinweise (kritisch - in Warnbox)
    y = doc.lastAutoTable.finalY + 5
    doc.setFillColor(255, 243, 224) // Light orange background
    doc.rect(15, y, 180, 25, 'F')

    doc.setDrawColor(...dangerColor)
    doc.setLineWidth(0.5)
    doc.rect(15, y, 180, 25, 'S')

    doc.setTextColor(...dangerColor)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('⚠ 8. HEALTH & SAFETY HINWEISE', 20, y + 6)

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')

    // Text umbrechen
    const hsLines = doc.splitTextToSize(marking.healthSafetyInstructions, 170)
    let lineY = y + 11
    hsLines.forEach((line: string) => {
      if (lineY < y + 23) {
        doc.text(line, 20, lineY)
        lineY += 4
      }
    })

    // Verarbeitungshinweise wenn vorhanden
    if (marking.applicationInstructions) {
      y += 28
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Verarbeitungshinweise:', 15, y)
      doc.setFont('helvetica', 'normal')
      const appLines = doc.splitTextToSize(marking.applicationInstructions, 180)
      y += 5
      appLines.forEach((line: string) => {
        doc.text(line, 15, y)
        y += 4
      })
    }
  }

  /**
   * CE-Kennzeichnung gemäß Annex ZA.3
   * WICHTIG: Kein AVCP-Text, nur 2-stellige Jahreszahl
   */
  private static addCESection(
    doc: jsPDF,
    ceMarking: MarkingLabelData['ceMarking']
  ) {
    if (!ceMarking) return

    let y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 180

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('CE-KENNZEICHNUNG (Annex ZA.3)', 15, y)

    y += 8

    // CE-Symbol mit Jahr (NUR 2 Ziffern!)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('CE', 20, y)
    doc.setFontSize(14)
    doc.text(ceMarking.year, 38, y) // NUR 2 Ziffern, z.B. "25"

    y += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(ceMarking.standard, 20, y)

    y += 5
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.text(ceMarking.productDescription || 'Screed material for use in buildings', 20, y)

    // Essential characteristics (Deklarierte Leistung)
    y += 7
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('Essential characteristics:', 20, y)

    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    Object.entries(ceMarking.declaredPerformance).forEach(([key, value]) => {
      doc.text(`${key}:`, 25, y)
      doc.setFont('helvetica', 'bold')
      doc.text(String(value), 90, y)
      doc.setFont('helvetica', 'normal')
      y += 4
    })

    // Hinweis zu System 4 (ohne NB)
    y += 3
    doc.setFontSize(7)
    doc.setFont('helvetica', 'italic')
    doc.text('Declaration of Performance available at manufacturer', 20, y)
  }

  /**
   * Lieferinformationen
   */
  private static addDeliverySection(
    doc: jsPDF,
    delivery: DeliveryNotePDFData['deliveryInfo']
  ) {
    let y = 210

    if (delivery.vehicleNumber || delivery.driverName) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('TRANSPORTINFORMATIONEN', 15, y)

      y += 6
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')

      if (delivery.vehicleNumber) {
        doc.text(`Fahrzeug: ${delivery.vehicleNumber}`, 15, y)
        y += 5
      }

      if (delivery.driverName) {
        doc.text(`Fahrer: ${delivery.driverName}`, 15, y)
        y += 5
      }

      if (delivery.loadingTime) {
        doc.text(`Ladezeit: ${delivery.loadingTime}`, 15, y)
        y += 5
      }

      if (delivery.remarks) {
        y += 2
        doc.text('Bemerkungen:', 15, y)
        y += 4
        const remarkLines = doc.splitTextToSize(delivery.remarks, 180)
        remarkLines.forEach((line: string) => {
          doc.text(line, 15, y)
          y += 4
        })
      }
    }
  }

  /**
   * Footer mit Unterschriften
   */
  private static addFooter(
    doc: jsPDF,
    footer: DeliveryNotePDFData['footer']
  ) {
    let y = 250

    // Hersteller
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('9. HERSTELLER', 15, y)
    doc.setFont('helvetica', 'normal')
    doc.text(footer.manufacturerName, 15, y + 4)
    doc.text(footer.manufacturerAddress, 15, y + 8)

    // Disclaimer
    if (footer.disclaimer) {
      doc.setFontSize(7)
      doc.setFont('helvetica', 'italic')
      doc.text(footer.disclaimer, 105, y + 4, { align: 'center' })
    }

    // Unterschriften
    if (footer.signature) {
      y = 270
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')

      // Fahrer
      doc.text('Fahrer:', 30, y)
      doc.line(30, y + 5, 80, y + 5)

      // Empfänger
      doc.text('Empfänger:', 115, y)
      doc.line(115, y + 5, 165, y + 5)
    }

    // Seitenzahl
    doc.setFontSize(8)
    doc.text(
      `Erstellt am ${format(new Date(), 'dd.MM.yyyy HH:mm')} Uhr`,
      105,
      290,
      { align: 'center' }
    )
  }

  /**
   * Generiert ein Marking-Label als PDF
   */
  static generateMarkingLabelPDF(marking: MarkingLabelData): Uint8Array {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [100, 150] // Label-Format
    })

    const primaryColor = [41, 98, 255] as [number, number, number]
    const dangerColor = [239, 68, 68] as [number, number, number]

    // Header
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 100, 15, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('EN 13813', 50, 10, { align: 'center' })

    // Bezeichnung
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.text(marking.designation, 50, 22, { align: 'center' })

    // Produktname
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(marking.productName, 50, 30, { align: 'center' })

    // Details
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    let y = 38

    const details = [
      `Menge: ${marking.quantity}`,
      `Charge: ${marking.batchNumber}`,
      `Herstellung: ${marking.productionDate}`,
      marking.shelfLife ? `Haltbar bis: ${marking.shelfLife}` : null,
      marking.maxGrainSize ? `Größtkorn: ${marking.maxGrainSize}` : null,
      marking.layerThickness ? `Dicke: ${marking.layerThickness}` : null
    ].filter(Boolean)

    details.forEach(detail => {
      if (detail) {
        doc.text(detail, 5, y)
        y += 6
      }
    })

    // H&S-Warnung
    y += 2
    doc.setFillColor(255, 243, 224)
    doc.rect(2, y, 96, 35, 'F')
    doc.setDrawColor(...dangerColor)
    doc.rect(2, y, 96, 35, 'S')

    doc.setTextColor(...dangerColor)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('⚠ SICHERHEITSHINWEISE', 50, y + 5, { align: 'center' })

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    const hsLines = doc.splitTextToSize(marking.healthSafetyInstructions, 92)
    let lineY = y + 10
    hsLines.slice(0, 6).forEach((line: string) => {
      doc.text(line, 5, lineY)
      lineY += 4
    })

    // QR-Code Platzhalter
    y += 38
    doc.setDrawColor(0, 0, 0)
    doc.rect(35, y, 30, 30, 'S')
    doc.setFontSize(6)
    doc.text('QR-Code', 50, y + 15, { align: 'center' })

    // Hersteller
    y += 35
    doc.setFontSize(6)
    doc.text(marking.manufacturerName, 50, y, { align: 'center' })
    const addressLines = doc.splitTextToSize(marking.manufacturerAddress, 90)
    addressLines.forEach((line: string) => {
      y += 3
      doc.text(line, 50, y, { align: 'center' })
    })

    return doc.output('arraybuffer') as Uint8Array
  }
}

export default DeliveryNotePDFService