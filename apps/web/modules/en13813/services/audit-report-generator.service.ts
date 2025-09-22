import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { AuditService } from './audit.service';
import type { Audit, AuditChecklistItem, AuditFinding } from '../types/audit.types';
import logger from '@/lib/logger';

export class AuditReportGeneratorService {
  private auditService = new AuditService();

  async generateAuditReport(auditId: string): Promise<Blob> {
    try {
      // Fetch all necessary data
      const reportData = await this.auditService.getAuditReportData(auditId);
      const { audit, checklist, checklistByCategory, findings, statistics } = reportData;

      // Create PDF
      const doc = new jsPDF();
      let yPosition = 20;

      // Title Page
      this.addHeader(doc, audit);
      yPosition = 60;

      // Executive Summary
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', 14, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const summaryText = [
        `Audit-Nummer: ${audit.audit_number}`,
        `Audit-Typ: ${this.getAuditTypeLabel(audit.audit_type)}`,
        `Datum: ${format(new Date(audit.audit_date), 'dd.MM.yyyy', { locale: de })}`,
        `Auditor: ${audit.auditor_name}`,
        `Status: ${this.getStatusLabel(audit.status)}`,
        '',
        `Compliance Score: ${statistics.complianceScore}%`,
        `Geprüfte Punkte: ${statistics.totalChecklistItems}`,
        `Konforme Punkte: ${statistics.conformItems}`,
        `Abweichungen: ${statistics.nonconformItems}`,
        `Beobachtungen: ${statistics.observationItems}`,
      ];

      summaryText.forEach((line) => {
        doc.text(line, 14, yPosition);
        yPosition += 6;
      });

      // Add new page for detailed results
      doc.addPage();
      yPosition = 20;

      // Section 1: Audit Scope
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Audit-Umfang', 14, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const scopeLines = doc.splitTextToSize(audit.audit_scope, 180);
      scopeLines.forEach((line: string) => {
        doc.text(line, 14, yPosition);
        yPosition += 6;
      });

      // Section 2: EN 13813 Compliance Checklist
      yPosition += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('2. EN 13813 Konformitätsprüfung', 14, yPosition);
      yPosition += 10;

      // Generate checklist tables by category
      Object.entries(checklistByCategory).forEach(([category, items]) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(this.getCategoryLabel(category), 14, yPosition);
        yPosition += 8;

        const tableData = items.map(item => [
          item.section,
          this.truncateText(item.requirement, 50),
          this.getStatusLabel(item.status),
          this.truncateText(item.finding || item.evidence || '-', 40)
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Abschnitt', 'Anforderung', 'Status', 'Nachweis/Finding']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [41, 128, 185] },
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 70 },
            2: { cellWidth: 30 },
            3: { cellWidth: 60 }
          },
          margin: { left: 14 },
          didDrawPage: (data) => {
            yPosition = data.cursor?.y || 20;
          }
        });

        yPosition += 10;
      });

      // Section 3: Findings
      if (findings.length > 0) {
        doc.addPage();
        yPosition = 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('3. Findings und Maßnahmen', 14, yPosition);
        yPosition += 10;

        const findingsData = findings.map(finding => [
          finding.finding_number,
          this.getFindingTypeLabel(finding.finding_type),
          finding.severity || '-',
          this.truncateText(finding.description, 50),
          finding.responsible_person || '-',
          finding.target_date ? format(new Date(finding.target_date), 'dd.MM.yyyy') : '-',
          this.getStatusLabel(finding.status)
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Nr.', 'Typ', 'Schweregrad', 'Beschreibung', 'Verantwortlich', 'Zieldatum', 'Status']],
          body: findingsData,
          theme: 'striped',
          headStyles: { fillColor: [231, 76, 60] },
          columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 25 },
            2: { cellWidth: 25 },
            3: { cellWidth: 60 },
            4: { cellWidth: 25 },
            5: { cellWidth: 20 },
            6: { cellWidth: 20 }
          },
          margin: { left: 14 },
          didDrawPage: (data) => {
            yPosition = data.cursor?.y || 20;
          }
        });
      }

      // Section 4: Statistics Summary
      doc.addPage();
      yPosition = 20;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('4. Statistische Auswertung', 14, yPosition);
      yPosition += 10;

      const statsData = [
        ['Gesamtanzahl Prüfpunkte', statistics.totalChecklistItems.toString()],
        ['Konforme Punkte', `${statistics.conformItems} (${Math.round((statistics.conformItems / statistics.totalChecklistItems) * 100)}%)`],
        ['Abweichungen', `${statistics.nonconformItems} (${Math.round((statistics.nonconformItems / statistics.totalChecklistItems) * 100)}%)`],
        ['Beobachtungen', `${statistics.observationItems} (${Math.round((statistics.observationItems / statistics.totalChecklistItems) * 100)}%)`],
        ['Nicht anwendbar', `${statistics.notApplicableItems} (${Math.round((statistics.notApplicableItems / statistics.totalChecklistItems) * 100)}%)`],
        ['', ''],
        ['Kritische Findings', statistics.criticalFindings.toString()],
        ['Schwerwiegende Findings', statistics.majorFindings.toString()],
        ['Geringfügige Findings', statistics.minorFindings.toString()],
        ['', ''],
        ['Offene Findings', statistics.openFindings.toString()],
        ['Geschlossene Findings', statistics.closedFindings.toString()],
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [['Metrik', 'Wert']],
        body: statsData,
        theme: 'grid',
        headStyles: { fillColor: [46, 204, 113] },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 80 }
        },
        margin: { left: 14 }
      });

      // Section 5: Conclusion
      if (audit.findings_summary) {
        doc.addPage();
        yPosition = 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('5. Zusammenfassung und Empfehlungen', 14, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(audit.findings_summary, 180);
        summaryLines.forEach((line: string) => {
          doc.text(line, 14, yPosition);
          yPosition += 6;
        });

        if (audit.corrective_actions_required) {
          yPosition += 10;
          doc.setFont('helvetica', 'bold');
          doc.text('Korrekturmaßnahmen erforderlich:', 14, yPosition);
          yPosition += 6;
          doc.setFont('helvetica', 'normal');
          doc.text('Ja - Bitte beachten Sie die erfassten Findings und deren Maßnahmen.', 14, yPosition);
        }

        if (audit.next_audit_date) {
          yPosition += 10;
          doc.setFont('helvetica', 'bold');
          doc.text('Nächstes Audit:', 14, yPosition);
          yPosition += 6;
          doc.setFont('helvetica', 'normal');
          doc.text(format(new Date(audit.next_audit_date), 'dd.MM.yyyy', { locale: de }), 14, yPosition);
        }
      }

      // Footer on each page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Seite ${i} von ${pageCount} | ${audit.audit_number} | Erstellt am ${format(new Date(), 'dd.MM.yyyy')}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Return as Blob
      return doc.output('blob');
    } catch (error) {
      logger.error('Error generating audit report', {
        auditId,
        error: error as Error,
        errorCode: 'AUDIT_REPORT_GENERATION_FAILED'
      });
      throw error;
    }
  }

  private addHeader(doc: jsPDF, audit: Audit) {
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('AUDIT REPORT', doc.internal.pageSize.width / 2, 30, { align: 'center' });

    // Subtitle
    doc.setFontSize(16);
    doc.text('EN 13813 Konformitätsprüfung', doc.internal.pageSize.width / 2, 40, { align: 'center' });

    // Audit Number
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(audit.audit_number, doc.internal.pageSize.width / 2, 50, { align: 'center' });
  }

  private truncateText(text: string, maxLength: number): string {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  private getAuditTypeLabel(type: Audit['audit_type']): string {
    const labels = {
      internal: 'Internes Audit',
      external: 'Externes Audit',
      certification: 'Zertifizierungsaudit'
    };
    return labels[type];
  }

  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      planned: 'Geplant',
      in_progress: 'In Bearbeitung',
      completed: 'Abgeschlossen',
      closed: 'Geschlossen',
      conform: 'Konform',
      nonconform: 'Abweichung',
      observation: 'Beobachtung',
      not_applicable: 'N/A',
      open: 'Offen',
      overdue: 'Überfällig'
    };
    return labels[status] || status;
  }

  private getFindingTypeLabel(type: AuditFinding['finding_type']): string {
    const labels = {
      nonconformity: 'Abweichung',
      observation: 'Beobachtung',
      opportunity: 'Verbesserung'
    };
    return labels[type];
  }

  private getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      raw_material_control: 'Rohstoffkontrolle',
      process_control: 'Prozesssteuerung',
      final_product_testing: 'Endproduktprüfung',
      nonconforming_products: 'Nichtkonforme Produkte',
      calibration: 'Kalibrierung',
      documentation: 'Dokumentation',
      management_system: 'Managementsystem',
      training_competence: 'Schulung & Kompetenz'
    };
    return labels[category] || category;
  }

  async downloadAuditReport(auditId: string, auditNumber: string): Promise<void> {
    try {
      const blob = await this.generateAuditReport(auditId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Audit_Report_${auditNumber}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('Error downloading audit report', {
        auditId,
        auditNumber,
        error: error as Error,
        errorCode: 'AUDIT_REPORT_DOWNLOAD_FAILED'
      });
      throw error;
    }
  }
}