import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Estrich Glossar - 150+ Fachbegriffe von A-Z erklärt | EstrichManager",
  description: "Das größte deutsche Estrich-Glossar mit über 150 Fachbegriffen ✓ EN 13813 Normen ✓ DIN Standards ✓ Technische Begriffe ✓ Praxisbeispiele. Ihr digitales Nachschlagewerk für Estrichwerke.",
  keywords: ["Estrich Glossar", "Estrich Lexikon", "Fachbegriffe Estrich", "EN 13813 Begriffe", "Estrich Wörterbuch", "DoP Definition", "FPC Bedeutung", "ITT Definition", "CE-Kennzeichnung", "Zementestrich Begriffe", "Anhydritestrich Fachbegriffe", "Estrich Normen", "DIN 18560", "Estricharten Definitionen"],
  openGraph: {
    title: "Estrich-Glossar: 150+ Fachbegriffe von A-Z erklärt",
    description: "Das umfassendste deutsche Nachschlagewerk für Estrich-Fachbegriffe. Über 150 Begriffe aus EN 13813, Qualitätsmanagement und Produktion verständlich erklärt.",
    type: "article",
  },
  alternates: {
    canonical: "https://estrichmanager.de/wissen/glossar",
  },
}

export default function GlossarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}