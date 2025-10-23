import { Metadata } from "next"

export const metadata: Metadata = {
  title: "ITT (Erstprüfung) für Estrich nach EN 13813 - Komplettanleitung 2025 | EstrichManager",
  description: "ITT Erstprüfung für Estrich: Detaillierte Anleitung ✓ Alle Prüfparameter ✓ Akkreditierte Labore ✓ Kosten-Kalkulator ✓ Checklisten ✓ Praxistipps. Der umfassendste ITT-Guide für Estrichwerke.",
  keywords: ["ITT", "Erstprüfung", "Initial Type Testing", "ITT Estrich", "ITT EN 13813", "Erstprüfung Estrich", "ITT Kosten", "ITT Labor", "ITT Prüfbericht", "ITT Durchführung", "ITT Checkliste", "Estrich Prüflabor", "Akkreditierung", "ITT Anleitung"],
  openGraph: {
    title: "ITT Erstprüfung für Estrich - Der komplette Leitfaden 2025",
    description: "Alles was Sie über die ITT-Erstprüfung nach EN 13813 wissen müssen. Mit Prüflaboren, Kostenrechner und Praxistipps.",
    type: "article",
  },
  alternates: {
    canonical: "https://estrichmanager.de/wissen/itt-management",
  },
}

export default function ITTManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
