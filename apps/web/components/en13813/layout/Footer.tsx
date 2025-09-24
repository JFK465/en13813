import Link from 'next/link'
import { Building2, Mail, Phone, MapPin, FileText, Shield, Users, HelpCircle } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="text-white font-bold text-lg">EN13813</h3>
                <p className="text-sm text-gray-400">Compliance Management</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Ihre Plattform für Qualitätsmanagement und EN13813-Konformität in der Estrich-Industrie.
            </p>
            <div className="space-y-2">
              <a href="tel:+4912345678900" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                <Phone className="h-4 w-4" />
                +49 (0) 123 456789-00
              </a>
              <a href="mailto:info@en13813.de" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                <Mail className="h-4 w-4" />
                info@en13813.de
              </a>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>
                  Musterstraße 123<br />
                  12345 Musterstadt
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Funktionen</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/en13813/recipes" className="text-sm hover:text-white transition-colors">
                  Rezeptverwaltung
                </Link>
              </li>
              <li>
                <Link href="/en13813/batches" className="text-sm hover:text-white transition-colors">
                  Chargenverarbeitung
                </Link>
              </li>
              <li>
                <Link href="/en13813/tests" className="text-sm hover:text-white transition-colors">
                  Prüfungen & Tests
                </Link>
              </li>
              <li>
                <Link href="/en13813/dop" className="text-sm hover:text-white transition-colors">
                  Leistungserklärungen
                </Link>
              </li>
              <li>
                <Link href="/en13813/marking" className="text-sm hover:text-white transition-colors">
                  CE-Kennzeichnung
                </Link>
              </li>
              <li>
                <Link href="/en13813/deviations" className="text-sm hover:text-white transition-colors">
                  Abweichungsmanagement
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Ressourcen</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/wissen" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                  <FileText className="h-4 w-4" />
                  Wissensdatenbank
                </Link>
              </li>
              <li>
                <Link href="/wissen/glossar" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                  <HelpCircle className="h-4 w-4" />
                  Glossar
                </Link>
              </li>
              <li>
                <Link href="/wissen/normen" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                  <Shield className="h-4 w-4" />
                  Normen & Standards
                </Link>
              </li>
              <li>
                <Link href="/support" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                  <Users className="h-4 w-4" />
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Konformität</h4>
            <div className="space-y-3">
              <div className="p-3 bg-gray-800 rounded-lg">
                <p className="text-xs font-medium text-gray-400 mb-1">Zertifiziert nach</p>
                <p className="text-sm text-white font-semibold">DIN EN 13813</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <p className="text-xs font-medium text-gray-400 mb-1">Bauproduktenverordnung</p>
                <p className="text-sm text-white font-semibold">EU 305/2011</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <p className="text-xs font-medium text-gray-400 mb-1">System AVCP</p>
                <p className="text-sm text-white font-semibold">System 3 & 4</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} EN13813 Compliance Management. Alle Rechte vorbehalten.
            </p>
            <div className="flex gap-6">
              <Link href="/datenschutz" className="text-sm text-gray-400 hover:text-white transition-colors">
                Datenschutz
              </Link>
              <Link href="/impressum" className="text-sm text-gray-400 hover:text-white transition-colors">
                Impressum
              </Link>
              <Link href="/agb" className="text-sm text-gray-400 hover:text-white transition-colors">
                AGB
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}