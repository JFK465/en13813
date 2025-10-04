import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-600">
            © {currentYear} EN13813 Compliance Management. Alle Rechte vorbehalten.
          </div>

          <div className="flex gap-6 text-sm">
            <Link
              href="/impressum"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
