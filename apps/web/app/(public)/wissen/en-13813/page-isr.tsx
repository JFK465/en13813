import { Metadata } from 'next'

// ISR - Seite wird statisch generiert und alle 3600 Sekunden (1 Stunde) neu gebaut
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'EN 13813 Norm - Alles über Estrichnorm und Anforderungen',
  description: 'Umfassender Leitfaden zur EN 13813 Norm für Estrichwerke. CE-Kennzeichnung, Leistungserklärung, FPC und ITT verständlich erklärt.',
  keywords: 'EN 13813, Estrichnorm, CE-Kennzeichnung, Leistungserklärung, FPC, ITT, Estrich Norm',
}

// Server Component - wird bei Build/ISR vorgerendert
export default async function EN13813Page() {
  // Könnte auch Daten von Supabase fetchen
  // const data = await fetchFromSupabase()

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <h1>EN 13813 - Die Estrichnorm im Detail</h1>
      {/* Statischer Content, perfekt für SEO */}
      <section>
        <h2>Was ist EN 13813?</h2>
        <p>Die EN 13813 ist die europäische Norm für Estrichmörtel...</p>
      </section>
      {/* Weitere Inhalte */}
    </article>
  )
}