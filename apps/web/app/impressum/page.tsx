import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impressum | EN13813 Compliance Management',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-slate-900">Impressum</h1>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800">Angaben gemäß § 5 TMG</h2>
            <p className="text-slate-700">
              Jonas Krüger<br />
              Meisenweg 13<br />
              78465 Konstanz
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800">Kontakt</h2>
            <p className="text-slate-700">
              E-Mail: <a href="mailto:info@jfkconsulting.de" className="text-blue-600 hover:text-blue-800">info@jfkconsulting.de</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p className="text-slate-700">
              Jonas Krüger<br />
              Meisenweg 13<br />
              78465 Konstanz
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800">Haftungsausschluss</h2>

            <h3 className="text-xl font-medium mb-2 text-slate-800">Haftung für Inhalte</h3>
            <p className="text-slate-700 mb-4">
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>

            <h3 className="text-xl font-medium mb-2 text-slate-800">Haftung für Links</h3>
            <p className="text-slate-700 mb-4">
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>

            <h3 className="text-xl font-medium mb-2 text-slate-800">Urheberrecht</h3>
            <p className="text-slate-700">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
