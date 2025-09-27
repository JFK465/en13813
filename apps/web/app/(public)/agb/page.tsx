export default function AGBPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Allgemeine Geschäftsbedingungen</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 mb-6">Stand: Januar 2025</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">§ 1 Geltungsbereich</h2>
        <p>Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen der EstrichManager GmbH und den Nutzern der EstrichManager-Plattform.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">§ 2 Vertragsgegenstand</h2>
        <p>EstrichManager ist eine Software-as-a-Service (SaaS) Lösung für das Qualitätsmanagement in der Estrichindustrie gemäß EN 13813.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">§ 3 Beta-Phase</h2>
        <p>Die Software befindet sich derzeit in der Beta-Phase. Die Nutzung während der Beta-Phase ist kostenlos. Wir behalten uns vor, nach Ende der Beta-Phase kostenpflichtige Tarife einzuführen.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">§ 4 Datenschutz</h2>
        <p>Der Schutz Ihrer Daten hat für uns höchste Priorität. Details finden Sie in unserer Datenschutzerklärung.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">§ 5 Haftung</h2>
        <p>Die Haftung der EstrichManager GmbH ist auf Vorsatz und grobe Fahrlässigkeit beschränkt.</p>
      </div>
    </div>
  )
}