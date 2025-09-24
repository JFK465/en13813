import { Metadata } from "next"
import Link from "next/link"
import {
  Package,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronRight,
  ArrowRight,
  Layers,
  Droplets,
  Thermometer,
  Home,
  Factory,
  Shield,
  Clock,
  Euro,
  Calculator,
  Download,
  BookOpen,
  Zap,
  Construction,
  FlaskConical,
  Gauge,
  Building,
  FileText,
  ClipboardCheck
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "Estricharten Übersicht 2025 - Alle Typen nach DIN & EN 13813 | Eigenschaften, Kosten, Anwendung",
  description: "Umfassender Vergleich aller Estricharten ✓ Zementestrich CT ✓ Calciumsulfatestrich CA ✓ Anhydritestrich ✓ Magnesiaestrich MA ✓ Gussasphalt AS ✓ Kunstharzestrich SR. Mit Eigenschaften, Kosten, Vor- und Nachteilen.",
  keywords: [
    "Estricharten",
    "Estrich Typen",
    "Zementestrich",
    "Calciumsulfatestrich",
    "Anhydritestrich",
    "Magnesiaestrich",
    "Gussasphaltestrich",
    "Kunstharzestrich",
    "CT Estrich",
    "CA Estrich",
    "MA Estrich",
    "AS Estrich",
    "SR Estrich",
    "Estrich Vergleich",
    "Estrich Kosten",
    "Fließestrich",
    "Schnellestrich",
    "Heizestrich",
    "Verbundestrich",
    "Schwimmender Estrich"
  ],
  openGraph: {
    title: "Alle Estricharten 2025 im detaillierten Vergleich - Eigenschaften, Kosten & Anwendung",
    description: "Der ultimative Guide zu allen Estrichtypen nach DIN und EN 13813. Welcher Estrich für welchen Zweck? Mit Kostenvergleich und Entscheidungshilfe.",
    type: "article",
  },
  alternates: {
    canonical: "https://estrichmanager.de/wissen/estrich-arten",
  },
}

export default function EstrichArtenPage() {
  // Detaillierte Estrichdaten
  const estricharten = [
    {
      code: "CT",
      name: "Zementestrich",
      fullName: "Cement screed",
      bindemittel: "Portlandzement (CEM I/II)",
      zusammensetzung: "Zement, Sand (0-8mm), Wasser, ggf. Zusatzmittel",
      festigkeitsklassen: ["C5", "C7", "C12", "C16", "C20", "C25", "C30", "C35", "C40", "C50", "C60", "C70", "C80"],
      biegezugklassen: ["F1", "F2", "F3", "F4", "F5", "F7", "F10", "F15", "F20", "F30", "F40", "F50"],
      trockenzeit: {
        begehbar: "1-3 Tage",
        belegreif: "28 Tage (bei 20°C, 65% rF)",
        heizestrich: "21 Tage + Aufheizprotokoll"
      },
      restfeuchte: {
        unbeheizt: "≤ 2,0 CM-%",
        beheizt: "≤ 1,8 CM-%"
      },
      schichtdicken: {
        verbund: "≥ 10 mm",
        trennschicht: "≥ 35 mm",
        schwimmend: "≥ 40 mm (bei C16)",
        heizestrich: "≥ 45 mm über Rohr"
      },
      kosten: {
        material: "8-12 €/m²",
        einbau: "15-25 €/m²",
        gesamt: "23-37 €/m²"
      },
      vorteile: [
        "Hohe Festigkeit möglich (bis C80)",
        "Feuchtebeständig - für Nassräume geeignet",
        "Frostbeständig - auch für Außenbereich",
        "Universell einsetzbar",
        "Günstig in der Herstellung",
        "Lokale Verfügbarkeit der Rohstoffe",
        "Recyclingfähig"
      ],
      nachteile: [
        "Lange Trockenzeit (28 Tage)",
        "Schwindverhalten beim Trocknen",
        "Rissneigung bei falscher Nachbehandlung",
        "Hohe Rohdichte (2000-2200 kg/m³)",
        "Alkalisch (pH 12-13)",
        "Empfindlich gegen zu schnelle Trocknung"
      ],
      anwendung: [
        "Wohnbau (alle Bereiche)",
        "Industriebau (hohe Lasten)",
        "Nassräume (Bäder, Küchen)",
        "Außenbereiche (Balkone, Terrassen)",
        "Parkhäuser und Garagen",
        "Krankenhäuser",
        "Schulen und öffentliche Gebäude"
      ],
      normen: ["DIN EN 13813", "DIN 18560", "DIN EN 13892"],
      besonderheiten: "Kann mit Fasern verstärkt werden (Stahlfasern, Kunststofffasern) für höhere Rissbeständigkeit"
    },
    {
      code: "CA",
      name: "Calciumsulfatestrich",
      fullName: "Calcium sulphate screed",
      bindemittel: "Calciumsulfat (Anhydrit oder Alpha-Halbhydrat)",
      zusammensetzung: "Calciumsulfat-Binder, Sand (0-8mm), Wasser, Fließmittel",
      festigkeitsklassen: ["C20", "C25", "C30", "C35", "C40", "C50", "C60", "C70", "C80"],
      biegezugklassen: ["F4", "F5", "F7", "F10", "F15", "F20", "F30", "F40", "F50"],
      trockenzeit: {
        begehbar: "24-48 Stunden",
        belegreif: "7-14 Tage (bei ≤35mm)",
        heizestrich: "7 Tage + Aufheizprotokoll"
      },
      restfeuchte: {
        unbeheizt: "≤ 0,5 CM-%",
        beheizt: "≤ 0,3 CM-%"
      },
      schichtdicken: {
        verbund: "≥ 10 mm",
        trennschicht: "≥ 30 mm",
        schwimmend: "≥ 35 mm (bei C30)",
        heizestrich: "≥ 35 mm über Rohr"
      },
      kosten: {
        material: "10-15 €/m²",
        einbau: "18-28 €/m²",
        gesamt: "28-43 €/m²"
      },
      vorteile: [
        "Schnelle Trocknung (50% schneller als CT)",
        "Geringes Schwindmaß (<0,05%)",
        "Selbstnivellierend als Fließestrich",
        "Ideal für Fußbodenheizung (gute Wärmeleitfähigkeit)",
        "Spannungsarm - weniger Fugen nötig",
        "Glatte Oberfläche",
        "Staubarme Verarbeitung",
        "Große Flächen ohne Fugen möglich (bis 1000m²)"
      ],
      nachteile: [
        "Nicht für Nassräume ohne Abdichtung",
        "Feuchteempfindlich (quillt bei Wasser)",
        "Nicht frostbeständig",
        "Korrosiv gegenüber unverzinktem Stahl",
        "Begrenzte Festigkeit im Vergleich zu CT",
        "Empfindlich gegen Staunässe",
        "Spezielle Grundierung für viele Beläge nötig"
      ],
      anwendung: [
        "Wohnräume (ideal)",
        "Bürogebäude",
        "Hotels",
        "Altenheime",
        "Schulen (Klassenzimmer)",
        "Verwaltungsgebäude",
        "Museen und Ausstellungsräume",
        "Sanierung (geringe Aufbauhöhe)"
      ],
      normen: ["DIN EN 13813", "DIN 18560", "DIN EN 13454"],
      besonderheiten: "Auch als CAF (Calciumsulfat-Fließestrich) sehr beliebt, erreicht selbstnivellierend perfekt ebene Flächen"
    },
    {
      code: "MA",
      name: "Magnesiaestrich",
      fullName: "Magnesite screed",
      bindemittel: "Kaustische Magnesia (MgO) + Magnesiumchlorid-Lösung",
      zusammensetzung: "Magnesia, MgCl₂-Lösung, organische/mineralische Füllstoffe (Holz, Kork, Quarz)",
      festigkeitsklassen: ["C10", "C15", "C20", "C25", "C30", "C35", "C40"],
      biegezugklassen: ["F3", "F4", "F5", "F7", "F10", "F15"],
      trockenzeit: {
        begehbar: "1-2 Tage",
        belegreif: "3-7 Tage",
        heizestrich: "Nicht üblich"
      },
      restfeuchte: {
        unbeheizt: "≤ 1,5%",
        beheizt: "Nicht anwendbar"
      },
      schichtdicken: {
        verbund: "≥ 8 mm",
        trennschicht: "≥ 20 mm",
        schwimmend: "≥ 25 mm",
        heizestrich: "Nicht empfohlen"
      },
      kosten: {
        material: "20-30 €/m²",
        einbau: "25-35 €/m²",
        gesamt: "45-65 €/m²"
      },
      vorteile: [
        "Staubfrei (wichtig für Reinräume)",
        "Elektrisch ableitfähig möglich (ESD-Schutz)",
        "Fugenfrei verlegbar",
        "Sehr schnelle Trocknung",
        "Elastisch (fußwarm)",
        "Schallabsorbierend",
        "Antistatisch",
        "Bakteriostatisch",
        "Nicht brennbar (A1)"
      ],
      nachteile: [
        "Korrosiv gegenüber Metallen",
        "Feuchteempfindlich",
        "Aufwendige Verarbeitung",
        "Hohe Kosten",
        "Begrenzte Verfügbarkeit",
        "Spezielle Fachkenntnisse erforderlich",
        "Empfindlich gegen falsche Mischung"
      ],
      anwendung: [
        "Industriebereiche mit ESD-Anforderung",
        "Reinräume",
        "Krankenhäuser (OP-Bereiche)",
        "Elektronikfertigung",
        "Historische Gebäude (Sanierung)",
        "Spezialanwendungen",
        "Labore"
      ],
      normen: ["DIN EN 13813", "DIN 18560", "DIN EN 14016"],
      besonderheiten: "Auch als Steinholzestrich bekannt, kann mit verschiedenen Zuschlägen (Holz, Kork) elastische Eigenschaften erhalten"
    },
    {
      code: "AS",
      name: "Gussasphaltestrich",
      fullName: "Mastic asphalt screed",
      bindemittel: "Bitumen",
      zusammensetzung: "Bitumen, Gesteinsmehle, Sand, Splitt",
      festigkeitsklassen: ["IC10", "IC15", "IC40", "IC100"],
      biegezugklassen: ["Nicht anwendbar - viskoelastisches Verhalten"],
      trockenzeit: {
        begehbar: "2-3 Stunden",
        belegreif: "Nach Abkühlung (24h)",
        heizestrich: "Nicht möglich"
      },
      restfeuchte: {
        unbeheizt: "0% (wasserfrei)",
        beheizt: "Nicht anwendbar"
      },
      schichtdicken: {
        verbund: "Nicht üblich",
        trennschicht: "≥ 25 mm",
        schwimmend: "≥ 25 mm",
        heizestrich: "Nicht möglich"
      },
      kosten: {
        material: "25-35 €/m²",
        einbau: "30-40 €/m²",
        gesamt: "55-75 €/m²"
      },
      vorteile: [
        "Sofort begehbar nach Abkühlung",
        "Absolut wasserdicht",
        "Dampfdicht",
        "Rissfrei",
        "Fugenlos",
        "Selbstdichtend bei kleinen Beschädigungen",
        "Sehr langlebig (>50 Jahre)",
        "Recyclingfähig"
      ],
      nachteile: [
        "Heiße Verarbeitung (220-250°C)",
        "Geruchsbelästigung bei Verarbeitung",
        "Temperaturempfindlich (weich bei Hitze)",
        "Nicht für Fußbodenheizung",
        "Schwarz (ästhetisch begrenzt)",
        "Schwere Geräte für Einbau nötig",
        "Gesundheitsschutz bei Verarbeitung wichtig"
      ],
      anwendung: [
        "Industriehallen (schwere Lasten)",
        "Parkdecks",
        "Balkone und Terrassen",
        "Flachdachabdichtung",
        "Brücken",
        "Kühlhäuser",
        "Feuchträume in der Industrie",
        "Werkstätten"
      ],
      normen: ["DIN EN 13813", "DIN 18560", "DIN EN 12697"],
      besonderheiten: "Einziger Estrich mit wasserdichtender Funktion, IC-Klassen beziehen sich auf Eindringtiefe (Indentation)"
    },
    {
      code: "SR",
      name: "Kunstharzestrich",
      fullName: "Synthetic resin screed",
      bindemittel: "Epoxidharz (EP), Polyurethan (PU), Methylmethacrylat (MMA)",
      zusammensetzung: "Reaktionsharz (2K), Quarzsand, Farbpigmente, Additive",
      festigkeitsklassen: ["C20", "C25", "C30", "C35", "C40", "C50", "C60", "C70", "C80"],
      biegezugklassen: ["F10", "F15", "F20", "F30", "F40", "F50"],
      trockenzeit: {
        begehbar: "6-24 Stunden",
        belegreif: "1-3 Tage",
        heizestrich: "Nicht üblich"
      },
      restfeuchte: {
        unbeheizt: "0% (lösemittelfrei)",
        beheizt: "Nicht anwendbar"
      },
      schichtdicken: {
        verbund: "≥ 3 mm (Beschichtung)",
        trennschicht: "≥ 6 mm",
        schwimmend: "≥ 15 mm",
        heizestrich: "Nicht empfohlen"
      },
      kosten: {
        material: "40-80 €/m²",
        einbau: "40-60 €/m²",
        gesamt: "80-140 €/m²"
      },
      vorteile: [
        "Höchste chemische Beständigkeit",
        "Sehr schnelle Aushärtung",
        "Extrem hohe Festigkeit möglich",
        "Wasserdicht und dampfdicht",
        "Dekorative Gestaltung möglich",
        "Rutschhemmung einstellbar",
        "Elektrisch ableitfähig möglich",
        "Fugenlos",
        "Dünnschichtig möglich (3mm)",
        "Rissüberbrückend"
      ],
      nachteile: [
        "Sehr hohe Kosten",
        "Aufwendige Untergrundvorbereitung",
        "Begrenzte Verarbeitungszeit (Topfzeit)",
        "Temperaturabhängige Verarbeitung",
        "Gesundheitsschutz erforderlich",
        "UV-Beständigkeit begrenzt (vergilbt)",
        "Nicht dampfdiffusionsoffen",
        "Fachfirma erforderlich"
      ],
      anwendung: [
        "Lebensmittelindustrie",
        "Pharmazeutische Industrie",
        "Chemische Industrie",
        "Elektronikfertigung (ESD)",
        "Großküchen",
        "Labore",
        "Reinräume",
        "Parkhäuser (Beschichtung)",
        "Verkaufsräume (dekorativ)",
        "Werkstätten und Produktionshallen"
      ],
      normen: ["DIN EN 13813", "DIN 18560", "DIN EN 13892"],
      besonderheiten: "Große Vielfalt an Systemen: EP (Epoxid) für Chemikalienbeständigkeit, PU (Polyurethan) für Elastizität, MMA für schnelle Härtung"
    }
  ]

  // Einbauarten
  const einbauarten = [
    {
      name: "Verbundestrich",
      beschreibung: "Direkt mit dem Untergrund verbunden",
      vorteile: ["Geringe Aufbauhöhe", "Hohe Belastbarkeit", "Keine Hohlstellen"],
      nachteile: ["Rissübertragung möglich", "Aufwendige Untergrundvorbereitung"],
      dicke: "10-40 mm",
      anwendung: "Keller, Garagen, Industrieböden"
    },
    {
      name: "Estrich auf Trennschicht",
      beschreibung: "Durch Folie oder Papier vom Untergrund getrennt",
      vorteile: ["Keine Rissübertragung", "Einfache Verarbeitung"],
      nachteile: ["Höherer Aufbau", "Geringere Belastbarkeit als Verbund"],
      dicke: "30-50 mm",
      anwendung: "Wohnräume, Büros ohne Dämmung"
    },
    {
      name: "Schwimmender Estrich",
      beschreibung: "Auf Dämmschicht ohne Verbindung zu angrenzenden Bauteilen",
      vorteile: ["Gute Wärmedämmung", "Guter Schallschutz", "Standard im Wohnbau"],
      nachteile: ["Größere Schichtdicke nötig", "Federnde Eigenschaften"],
      dicke: "35-80 mm",
      anwendung: "Standard im Wohnungsbau"
    },
    {
      name: "Heizestrich",
      beschreibung: "Estrich mit integrierter Fußbodenheizung",
      vorteile: ["Gleichmäßige Wärmeverteilung", "Energieeffizient", "Komfortabel"],
      nachteile: ["Längere Trockenzeit", "Aufheizprotokoll nötig"],
      dicke: "45-70 mm",
      anwendung: "Moderne Wohngebäude"
    }
  ]

  // Spezialausführungen
  const spezialausfuehrungen = [
    {
      name: "Schnellestrich",
      basis: "CT/CA modifiziert",
      trockenzeit: "1-7 Tage",
      kosten: "+30-50%",
      anwendung: "Sanierung, Zeitdruck"
    },
    {
      name: "Fließestrich",
      basis: "CA/CT",
      vorteil: "Selbstnivellierend",
      kosten: "+10-20%",
      anwendung: "Große Flächen, ebene Böden"
    },
    {
      name: "Faserbewehrter Estrich",
      basis: "CT/CA",
      vorteil: "Rissminimierung",
      kosten: "+15-25%",
      anwendung: "Große Flächen, hohe Lasten"
    },
    {
      name: "Leichtestrich",
      basis: "CT mit Leichtzuschlag",
      vorteil: "Geringes Gewicht",
      kosten: "+20-30%",
      anwendung: "Sanierung, Holzdecken"
    }
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <nav className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li><Link href="/wissen" className="text-gray-500 hover:text-gray-700">Wissen</Link></li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li className="text-gray-900 font-medium">Estricharten</li>
          </ol>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 lg:px-8 border-b bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="mx-auto max-w-5xl text-center">
          <Badge className="mb-4 bg-indigo-100 text-indigo-800">
            Materialguide • EN 13813 • DIN 18560 • 2025
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Alle Estricharten im detaillierten Vergleich
          </h1>
          <p className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
            Der umfassende Guide zu allen Estrichtypen nach DIN und EN 13813.
            Mit technischen Eigenschaften, Kosten, Anwendungsbereichen und Entscheidungshilfen
            für die richtige Estrichauswahl.
          </p>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-4xl mx-auto">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">5</div>
              <div className="text-sm text-gray-600">Haupttypen</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">C5-C80</div>
              <div className="text-sm text-gray-600">Festigkeiten</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">23-140€</div>
              <div className="text-sm text-gray-600">pro m²</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">1-28</div>
              <div className="text-sm text-gray-600">Tage Trockenzeit</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">10-80mm</div>
              <div className="text-sm text-gray-600">Schichtdicken</div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              <Download className="mr-2 h-4 w-4" />
              Vergleichstabelle PDF
            </Button>
            <Button size="lg" variant="outline">
              <Calculator className="mr-2 h-4 w-4" />
              Estrich-Kalkulator
            </Button>
          </div>
        </div>
      </section>

      {/* Schnellnavigation */}
      <section className="px-6 py-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Schnellnavigation</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {estricharten.map((estrich) => (
              <a
                key={estrich.code}
                href={`#${estrich.code.toLowerCase()}-${estrich.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-flex items-center px-4 py-2 bg-white border rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
              >
                <Badge className="mr-2">{estrich.code}</Badge>
                <span className="text-sm font-medium">{estrich.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Hauptinhalt */}
      <article className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Einführung */}
          <section className="prose prose-lg max-w-none mb-12">
            <h2 className="text-3xl font-bold mb-6">Estricharten nach EN 13813 - Die Grundlagen</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Die <strong>EN 13813</strong> definiert fünf Haupttypen von Estrichen, die sich durch ihre
              Bindemittel unterscheiden. Jeder Estrichtyp hat spezifische Eigenschaften, die ihn für
              bestimmte Anwendungen prädestinieren. Die richtige Auswahl hängt von Faktoren wie
              Nutzung, Belastung, Trockenzeit, Feuchtigkeit und Budget ab.
            </p>

            <Alert className="my-6">
              <Info className="h-4 w-4" />
              <AlertTitle>Wichtig für die Praxis</AlertTitle>
              <AlertDescription>
                Die Wahl des richtigen Estrichtyps entscheidet über Funktionalität, Dauerhaftigkeit
                und Wirtschaftlichkeit. Fehler bei der Auswahl können zu kostspieligen Schäden führen.
                Beachten Sie immer die spezifischen Anforderungen Ihres Projekts.
              </AlertDescription>
            </Alert>
          </section>

          {/* Detaillierte Tabs für jeden Estrichtyp */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Die 5 Haupttypen im Detail</h2>

            <Tabs defaultValue="CT" className="space-y-8">
              <TabsList className="grid grid-cols-5 w-full h-auto">
                <TabsTrigger value="CT" className="flex flex-col py-3">
                  <Badge className="mb-1">CT</Badge>
                  <span className="text-xs">Zement</span>
                </TabsTrigger>
                <TabsTrigger value="CA" className="flex flex-col py-3">
                  <Badge className="mb-1">CA</Badge>
                  <span className="text-xs">Calciumsulfat</span>
                </TabsTrigger>
                <TabsTrigger value="MA" className="flex flex-col py-3">
                  <Badge className="mb-1">MA</Badge>
                  <span className="text-xs">Magnesia</span>
                </TabsTrigger>
                <TabsTrigger value="AS" className="flex flex-col py-3">
                  <Badge className="mb-1">AS</Badge>
                  <span className="text-xs">Gussasphalt</span>
                </TabsTrigger>
                <TabsTrigger value="SR" className="flex flex-col py-3">
                  <Badge className="mb-1">SR</Badge>
                  <span className="text-xs">Kunstharz</span>
                </TabsTrigger>
              </TabsList>

              {estricharten.map((estrich) => (
                <TabsContent key={estrich.code} value={estrich.code} className="space-y-6" id={`${estrich.code.toLowerCase()}-${estrich.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  {/* Header Card */}
                  <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-3xl">{estrich.name}</CardTitle>
                          <CardDescription className="text-lg mt-2">
                            {estrich.fullName} • EN 13813 Code: <span className="font-mono font-bold text-indigo-600">{estrich.code}</span>
                          </CardDescription>
                        </div>
                        <Badge className="text-xl px-4 py-2 bg-indigo-600">{estrich.code}</Badge>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Technische Daten */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FlaskConical className="h-5 w-5 text-indigo-600" />
                          Zusammensetzung & Bindemittel
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-600 mb-1">Bindemittel:</p>
                          <p className="font-medium">{estrich.bindemittel}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600 mb-1">Zusammensetzung:</p>
                          <p className="text-sm">{estrich.zusammensetzung}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600 mb-1">Normen:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {estrich.normen.map((norm) => (
                              <Badge key={norm} variant="outline" className="text-xs">{norm}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Gauge className="h-5 w-5 text-indigo-600" />
                          Festigkeitsklassen
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">Druckfestigkeit:</p>
                            <div className="flex flex-wrap gap-1">
                              {estrich.festigkeitsklassen.map((klasse) => (
                                <Badge key={klasse} variant="secondary" className="text-xs">{klasse}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">Biegezugfestigkeit:</p>
                            <div className="flex flex-wrap gap-1">
                              {estrich.biegezugklassen.map((klasse) => (
                                <Badge key={klasse} variant="secondary" className="text-xs">{klasse}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-indigo-600" />
                          Trockenzeiten
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Begehbar:</span>
                            <span className="font-medium">{estrich.trockenzeit.begehbar}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Belegreif:</span>
                            <span className="font-medium">{estrich.trockenzeit.belegreif}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Heizestrich:</span>
                            <span className="font-medium">{estrich.trockenzeit.heizestrich}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm font-semibold text-gray-600 mb-2">Restfeuchte (CM-%):</p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Unbeheizt:</span>
                              <span className="font-medium">{estrich.restfeuchte.unbeheizt}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Beheizt:</span>
                              <span className="font-medium">{estrich.restfeuchte.beheizt}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Layers className="h-5 w-5 text-indigo-600" />
                          Schichtdicken
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Verbund:</span>
                            <span className="font-medium">{estrich.schichtdicken.verbund}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Trennschicht:</span>
                            <span className="font-medium">{estrich.schichtdicken.trennschicht}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Schwimmend:</span>
                            <span className="font-medium">{estrich.schichtdicken.schwimmend}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Heizestrich:</span>
                            <span className="font-medium">{estrich.schichtdicken.heizestrich}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Euro className="h-5 w-5 text-indigo-600" />
                          Kosten (Richtwerte 2025)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Material:</span>
                            <span className="font-medium">{estrich.kosten.material}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Einbau:</span>
                            <span className="font-medium">{estrich.kosten.einbau}</span>
                          </div>
                          <div className="pt-2 border-t">
                            <div className="flex justify-between">
                              <span className="font-semibold">Gesamt:</span>
                              <span className="font-bold text-lg text-indigo-600">{estrich.kosten.gesamt}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          *Preise können regional und je nach Projekt variieren
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building className="h-5 w-5 text-indigo-600" />
                          Anwendungsbereiche
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {estrich.anwendung.map((anwendung) => (
                            <div key={anwendung} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{anwendung}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Vor- und Nachteile */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="border-green-200 bg-green-50">
                      <CardHeader>
                        <CardTitle className="text-green-900 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Vorteile
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {estrich.vorteile.map((vorteil) => (
                            <li key={vorteil} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{vorteil}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-orange-200 bg-orange-50">
                      <CardHeader>
                        <CardTitle className="text-orange-900 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          Nachteile
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {estrich.nachteile.map((nachteil) => (
                            <li key={nachteil} className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{nachteil}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Besonderheiten */}
                  <Card className="border-indigo-200 bg-indigo-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-indigo-600" />
                        Besonderheiten & Expertentipp
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{estrich.besonderheiten}</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </section>

          {/* Große Vergleichstabelle */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Vergleichstabelle aller Estricharten</h2>
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-4 py-3 text-left font-semibold">Eigenschaft</th>
                    <th className="border px-4 py-3 text-center">CT<br/>Zement</th>
                    <th className="border px-4 py-3 text-center">CA<br/>Calciumsulfat</th>
                    <th className="border px-4 py-3 text-center">MA<br/>Magnesia</th>
                    <th className="border px-4 py-3 text-center">AS<br/>Gussasphalt</th>
                    <th className="border px-4 py-3 text-center">SR<br/>Kunstharz</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2 font-medium bg-gray-50">Festigkeit</td>
                    <td className="border px-4 py-2 text-center">C5-C80</td>
                    <td className="border px-4 py-2 text-center">C20-C80</td>
                    <td className="border px-4 py-2 text-center">C10-C40</td>
                    <td className="border px-4 py-2 text-center">IC10-IC100</td>
                    <td className="border px-4 py-2 text-center">C20-C80</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border px-4 py-2 font-medium">Belegreif</td>
                    <td className="border px-4 py-2 text-center">28 Tage</td>
                    <td className="border px-4 py-2 text-center">7-14 Tage</td>
                    <td className="border px-4 py-2 text-center">3-7 Tage</td>
                    <td className="border px-4 py-2 text-center">24 Std</td>
                    <td className="border px-4 py-2 text-center">1-3 Tage</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 font-medium bg-gray-50">Kosten/m²</td>
                    <td className="border px-4 py-2 text-center">23-37€</td>
                    <td className="border px-4 py-2 text-center">28-43€</td>
                    <td className="border px-4 py-2 text-center">45-65€</td>
                    <td className="border px-4 py-2 text-center">55-75€</td>
                    <td className="border px-4 py-2 text-center">80-140€</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border px-4 py-2 font-medium">Nassräume</td>
                    <td className="border px-4 py-2 text-center text-green-600">✓✓</td>
                    <td className="border px-4 py-2 text-center text-red-600">✗</td>
                    <td className="border px-4 py-2 text-center text-orange-600">○</td>
                    <td className="border px-4 py-2 text-center text-green-600">✓✓</td>
                    <td className="border px-4 py-2 text-center text-green-600">✓✓</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 font-medium bg-gray-50">Heizestrich</td>
                    <td className="border px-4 py-2 text-center text-green-600">✓</td>
                    <td className="border px-4 py-2 text-center text-green-600">✓✓</td>
                    <td className="border px-4 py-2 text-center text-red-600">✗</td>
                    <td className="border px-4 py-2 text-center text-red-600">✗</td>
                    <td className="border px-4 py-2 text-center text-orange-600">○</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border px-4 py-2 font-medium">Außenbereich</td>
                    <td className="border px-4 py-2 text-center text-green-600">✓</td>
                    <td className="border px-4 py-2 text-center text-red-600">✗</td>
                    <td className="border px-4 py-2 text-center text-red-600">✗</td>
                    <td className="border px-4 py-2 text-center text-green-600">✓✓</td>
                    <td className="border px-4 py-2 text-center text-green-600">✓</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 font-medium bg-gray-50">Schwindverhalten</td>
                    <td className="border px-4 py-2 text-center text-orange-600">Mittel</td>
                    <td className="border px-4 py-2 text-center text-green-600">Gering</td>
                    <td className="border px-4 py-2 text-center text-green-600">Gering</td>
                    <td className="border px-4 py-2 text-center text-green-600">Keine</td>
                    <td className="border px-4 py-2 text-center text-green-600">Gering</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border px-4 py-2 font-medium">Chemikalienbeständig</td>
                    <td className="border px-4 py-2 text-center text-orange-600">○</td>
                    <td className="border px-4 py-2 text-center text-red-600">✗</td>
                    <td className="border px-4 py-2 text-center text-orange-600">○</td>
                    <td className="border px-4 py-2 text-center text-orange-600">○</td>
                    <td className="border px-4 py-2 text-center text-green-600">✓✓</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-2 text-sm text-gray-600">
                Legende: ✓✓ = sehr gut geeignet | ✓ = geeignet | ○ = bedingt geeignet | ✗ = nicht geeignet
              </div>
            </div>
          </section>

          {/* Einbauarten */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Einbauarten von Estrich</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {einbauarten.map((einbauart) => (
                <Card key={einbauart.name}>
                  <CardHeader>
                    <CardTitle>{einbauart.name}</CardTitle>
                    <CardDescription>{einbauart.beschreibung}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Schichtdicke:</p>
                      <Badge variant="outline">{einbauart.dicke}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Vorteile:</p>
                      <ul className="text-sm space-y-1">
                        {einbauart.vorteile.map((vorteil) => (
                          <li key={vorteil} className="flex items-start gap-1">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{vorteil}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Nachteile:</p>
                      <ul className="text-sm space-y-1">
                        {einbauart.nachteile.map((nachteil) => (
                          <li key={nachteil} className="flex items-start gap-1">
                            <AlertCircle className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{nachteil}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Typische Anwendung:</p>
                      <p className="text-sm text-gray-700">{einbauart.anwendung}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Spezialausführungen */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Spezialausführungen & Sonderestriche</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {spezialausfuehrungen.map((spezial) => (
                <Card key={spezial.name}>
                  <CardHeader>
                    <CardTitle className="text-lg">{spezial.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-600">Basis:</span> {spezial.basis}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Vorteil:</span> {spezial.vorteil || spezial.trockenzeit}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Mehrkosten:</span> <Badge variant="outline">{spezial.kosten}</Badge>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Anwendung:</span> {spezial.anwendung}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Auswahlhilfe */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Auswahlhilfe: Welcher Estrich für welchen Zweck?</h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <Home className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle>Wohnbereich Standard</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className="bg-blue-600">Empfehlung: CA</Badge>
                    <p className="text-sm text-gray-700">
                      Calciumsulfatestrich bietet schnelle Trocknung, geringe Schwindung
                      und ist ideal für Fußbodenheizung.
                    </p>
                    <div className="text-xs text-gray-600">
                      Alternative: CT bei Nassräumen
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <Droplets className="h-8 w-8 text-green-600 mb-2" />
                  <CardTitle>Nassräume & Außen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className="bg-green-600">Empfehlung: CT</Badge>
                    <p className="text-sm text-gray-700">
                      Zementestrich ist feuchtebeständig und frostfest.
                      Perfekt für Bäder und Außenbereiche.
                    </p>
                    <div className="text-xs text-gray-600">
                      Alternative: AS für absolute Dichtheit
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <Factory className="h-8 w-8 text-purple-600 mb-2" />
                  <CardTitle>Industrie & Gewerbe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className="bg-purple-600">Empfehlung: SR</Badge>
                    <p className="text-sm text-gray-700">
                      Kunstharzestrich für höchste Belastungen und
                      Chemikalienbeständigkeit.
                    </p>
                    <div className="text-xs text-gray-600">
                      Alternative: CT-C60 bei geringerem Budget
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <Zap className="h-8 w-8 text-orange-600 mb-2" />
                  <CardTitle>Schnelle Sanierung</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className="bg-orange-600">Empfehlung: Schnellestrich</Badge>
                    <p className="text-sm text-gray-700">
                      Modifizierte CT/CA-Systeme mit Trockenzeit
                      von nur 1-7 Tagen.
                    </p>
                    <div className="text-xs text-gray-600">
                      Alternative: AS bei sofortiger Nutzung
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <Thermometer className="h-8 w-8 text-red-600 mb-2" />
                  <CardTitle>Fußbodenheizung</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className="bg-red-600">Empfehlung: CA/CAF</Badge>
                    <p className="text-sm text-gray-700">
                      Calciumsulfat-Fließestrich umschließt Rohre
                      optimal und hat beste Wärmeleitung.
                    </p>
                    <div className="text-xs text-gray-600">
                      Alternative: CT bei Feuchträumen
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-gray-50">
                <CardHeader>
                  <Shield className="h-8 w-8 text-gray-600 mb-2" />
                  <CardTitle>Spezialanforderungen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className="bg-gray-600">Empfehlung: MA</Badge>
                    <p className="text-sm text-gray-700">
                      Magnesiaestrich für ESD-Schutz, Reinräume
                      oder historische Sanierungen.
                    </p>
                    <div className="text-xs text-gray-600">
                      Individuelle Beratung empfohlen
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Häufige Fragen zu Estricharten</h2>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Welcher Estrich ist der günstigste?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    <strong>Zementestrich (CT)</strong> ist mit 23-37€/m² der günstigste Estrich.
                    Allerdings sollten Sie auch die lange Trockenzeit von 28 Tagen einkalkulieren,
                    die zu höheren Bauzeiten und damit indirekten Kosten führen kann.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Kann ich jeden Estrich für Fußbodenheizung verwenden?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Nein. <strong>Calciumsulfatestrich (CA)</strong> und <strong>Zementestrich (CT)</strong>
                    sind für Fußbodenheizung geeignet. CA ist aufgrund der besseren Wärmeleitung und
                    geringeren Schwindung oft die erste Wahl. Gussasphalt (AS) und Kunstharzestrich (SR)
                    sind nicht geeignet, da sie temperaturempfindlich sind.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Was ist der Unterschied zwischen Anhydrit- und Calciumsulfatestrich?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Es gibt keinen Unterschied - es sind zwei Bezeichnungen für denselben Estrich.
                    <strong>Anhydrit</strong> ist der mineralogische Name für wasserfreies Calciumsulfat,
                    während <strong>CA (Calciumsulfatestrich)</strong> die normgerechte Bezeichnung nach EN 13813 ist.
                    Umgangssprachlich werden beide Begriffe synonym verwendet.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Warum darf Calciumsulfatestrich nicht in Nassräumen verwendet werden?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Calciumsulfatestrich ist <strong>hygroskopisch</strong>, das heißt er zieht Feuchtigkeit an
                    und kann bei Wasserkontakt aufquellen. Dies führt zu Festigkeitsverlust und Schäden.
                    In Nassräumen muss daher immer Zementestrich (CT) verwendet werden, oder der CA-Estrich
                    muss vollständig und dauerhaft gegen Feuchtigkeit abgedichtet werden.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Wie lange muss ich warten, bis ich Parkett verlegen kann?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Das hängt vom Estrichtyp ab. Die Restfeuchte muss per <strong>CM-Messung</strong> geprüft werden:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• <strong>CT:</strong> ≤ 2,0 CM-% (unbeheizt) / ≤ 1,8 CM-% (beheizt) - ca. 4-6 Wochen</li>
                    <li>• <strong>CA:</strong> ≤ 0,5 CM-% (unbeheizt) / ≤ 0,3 CM-% (beheizt) - ca. 1-2 Wochen</li>
                    <li>• <strong>Schnellestrich:</strong> Nach Herstellerangabe - ca. 3-7 Tage</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Checkliste */}
          <section className="mb-16">
            <Card className="border-2 border-indigo-200">
              <CardHeader className="bg-indigo-50">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-indigo-600" />
                  Checkliste: Estrichauswahl
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <h3 className="font-semibold mb-3">Beantworten Sie diese Fragen für die richtige Estrichauswahl:</h3>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>Wird der Estrich in Feuchträumen verlegt? → Wenn ja: CT oder AS</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>Ist eine Fußbodenheizung geplant? → Wenn ja: CA oder CT</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>Muss der Boden schnell nutzbar sein? → Wenn ja: Schnellestrich, AS oder SR</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>Sind hohe Lasten zu erwarten? → Wenn ja: CT-C40+ oder SR</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>Ist Chemikalienbeständigkeit erforderlich? → Wenn ja: SR</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>Soll der Estrich im Außenbereich verlegt werden? → Wenn ja: CT oder AS</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>Ist das Budget begrenzt? → Wenn ja: CT Standard</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>Sind große fugenlose Flächen gewünscht? → Wenn ja: CA, MA oder AS</span>
                  </label>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Tipp:</strong> Bei Unsicherheit sollten Sie immer einen Fachplaner oder
                    Estrichleger konsultieren. Die falsche Estrichauswahl kann zu kostspieligen
                    Schäden führen.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </article>

      {/* CTA Section */}
      <section className="px-6 py-16 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <Construction className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-3xl font-bold mb-4">
            Rezepturverwaltung für alle Estricharten
          </h2>
          <p className="text-lg text-indigo-100 mb-8">
            Mit EstrichManager verwalten Sie Rezepturen für alle Estricharten digital.
            Automatische EN 13813 Bezeichnung, DoP-Erstellung und Qualitätskontrolle
            für CT, CA, MA, AS und SR.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/demo">
                Rezepturverwaltung Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 border-white text-white hover:bg-white/20"
            >
              <Link href="/register">
                Kostenlos testen
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Weitere Ressourcen */}
      <section className="px-6 py-12 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-6">Weiterführende Informationen</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/wissen/en-13813">
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardHeader>
                  <BookOpen className="h-6 w-6 text-blue-600 mb-2" />
                  <CardTitle className="text-lg">EN 13813 Norm</CardTitle>
                  <CardDescription>
                    Die Estrichnorm im Detail erklärt
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/wissen/dop-erstellung">
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardHeader>
                  <FileText className="h-6 w-6 text-green-600 mb-2" />
                  <CardTitle className="text-lg">DoP erstellen</CardTitle>
                  <CardDescription>
                    Leistungserklärungen für alle Estricharten
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/wissen/fpc-dokumentation">
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardHeader>
                  <ClipboardCheck className="h-6 w-6 text-purple-600 mb-2" />
                  <CardTitle className="text-lg">FPC-System</CardTitle>
                  <CardDescription>
                    Qualitätskontrolle nach Estrichtyp
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/tools/estrich-kalkulator">
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardHeader>
                  <Calculator className="h-6 w-6 text-orange-600 mb-2" />
                  <CardTitle className="text-lg">Estrich-Rechner</CardTitle>
                  <CardDescription>
                    Mengen und Kosten kalkulieren
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Schema.org für SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Estricharten Übersicht - Alle Typen nach DIN & EN 13813",
            "description": "Umfassender Vergleich aller Estricharten: CT, CA, MA, AS, SR. Mit Eigenschaften, Kosten und Anwendungsbereichen.",
            "author": {
              "@type": "Organization",
              "name": "EstrichManager"
            },
            "datePublished": "2025-01-15",
            "dateModified": "2025-01-15",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://estrichmanager.de/wissen/estrich-arten"
            }
          })
        }}
      />
    </main>
  )
}