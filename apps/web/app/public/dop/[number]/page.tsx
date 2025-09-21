import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, CheckCircle, Building, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PageProps {
  params: {
    number: string
  }
}

export default async function PublicDoPPage({ params }: PageProps) {
  const supabase = createServerComponentClient({ cookies })

  // Fetch DoP by number (public access, no auth required)
  const { data: dop, error } = await supabase
    .from('en13813_dops')
    .select(`
      *,
      recipe:en13813_recipes(
        recipe_code,
        name,
        product_name,
        binder_type,
        compressive_strength_class,
        flexural_strength_class,
        wear_resistance_bohme_class,
        wear_resistance_bca_class,
        surface_hardness_class,
        bond_strength_class,
        fire_class,
        manufacturer_name,
        manufacturer_address
      )
    `)
    .eq('dop_number', params.number)
    .eq('status', 'published')
    .single()

  if (error || !dop) {
    notFound()
  }

  const recipe = dop.recipe

  // Format EN designation
  const formatENDesignation = () => {
    const parts = [recipe.binder_type]
    if (recipe.compressive_strength_class) parts.push(recipe.compressive_strength_class)
    if (recipe.flexural_strength_class) parts.push(recipe.flexural_strength_class)
    if (recipe.wear_resistance_bohme_class) parts.push(recipe.wear_resistance_bohme_class)
    if (recipe.wear_resistance_bca_class) parts.push(recipe.wear_resistance_bca_class)
    if (recipe.surface_hardness_class) parts.push(recipe.surface_hardness_class)
    if (recipe.bond_strength_class) parts.push(recipe.bond_strength_class)
    if (recipe.fire_class && recipe.fire_class !== 'NPD') parts.push(recipe.fire_class)
    return parts.join('-')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">
            {dop.language === 'de' ? 'LEISTUNGSERKLÄRUNG' : 'DECLARATION OF PERFORMANCE'}
          </h1>
          <p className="text-xl text-gray-600">Nr. {dop.dop_number}</p>
          <p className="text-sm text-gray-500 mt-2">
            gemäß Verordnung (EU) Nr. 305/2011
          </p>
        </div>

        {/* Main Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Produktinformationen
              </span>
              <Badge variant="secondary">{formatENDesignation()}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 1. Product Code */}
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-1">
                1. Eindeutiger Kenncode des Produkttyps
              </h3>
              <p className="text-lg">{recipe.recipe_code}</p>
            </div>

            {/* 2. Product Name */}
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-1">
                2. Handelsname
              </h3>
              <p className="text-lg">{recipe.product_name}</p>
            </div>

            {/* 3. Intended Use */}
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-1">
                3. Verwendungszweck
              </h3>
              <p>Estrichmörtel zur Verwendung in Gebäuden gemäß EN 13813</p>
            </div>

            {/* 4. Manufacturer */}
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-1">
                4. Hersteller
              </h3>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium">{dop.manufacturer_data?.name || recipe.manufacturer_name}</p>
                <p className="text-sm text-gray-600">
                  {dop.manufacturer_data?.address || recipe.manufacturer_address}
                </p>
                {dop.manufacturer_data?.postalCode && (
                  <p className="text-sm text-gray-600">
                    {dop.manufacturer_data.postalCode} {dop.manufacturer_data.city}
                  </p>
                )}
                {dop.manufacturer_data?.country && (
                  <p className="text-sm text-gray-600">{dop.manufacturer_data.country}</p>
                )}
              </div>
            </div>

            {/* 5. System */}
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-1">
                5. System zur Bewertung und Überprüfung der Leistungsbeständigkeit
              </h3>
              <p>System 4</p>
            </div>

            {/* 6. Standard */}
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-1">
                6. Harmonisierte Norm
              </h3>
              <p>EN 13813:2002</p>
            </div>
          </CardContent>
        </Card>

        {/* Performance Declaration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              7. Erklärte Leistung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Wesentliche Merkmale</th>
                  <th className="text-left py-2">Leistung</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Freisetzung korrosiver Substanzen</td>
                  <td className="py-2">{recipe.binder_type}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Druckfestigkeit</td>
                  <td className="py-2">{recipe.compressive_strength_class}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Biegezugfestigkeit</td>
                  <td className="py-2">{recipe.flexural_strength_class}</td>
                </tr>
                {recipe.wear_resistance_bohme_class && (
                  <tr className="border-b">
                    <td className="py-2">Verschleißwiderstand (Böhme)</td>
                    <td className="py-2">{recipe.wear_resistance_bohme_class}</td>
                  </tr>
                )}
                {recipe.wear_resistance_bca_class && (
                  <tr className="border-b">
                    <td className="py-2">Verschleißwiderstand (BCA)</td>
                    <td className="py-2">{recipe.wear_resistance_bca_class}</td>
                  </tr>
                )}
                {recipe.surface_hardness_class && (
                  <tr className="border-b">
                    <td className="py-2">Oberflächenhärte</td>
                    <td className="py-2">{recipe.surface_hardness_class}</td>
                  </tr>
                )}
                {recipe.bond_strength_class && (
                  <tr className="border-b">
                    <td className="py-2">Haftzugfestigkeit</td>
                    <td className="py-2">{recipe.bond_strength_class}</td>
                  </tr>
                )}
                <tr className="border-b">
                  <td className="py-2">Brandverhalten</td>
                  <td className="py-2">{recipe.fire_class}</td>
                </tr>
                <tr>
                  <td className="py-2">Freisetzung gefährlicher Substanzen</td>
                  <td className="py-2">NPD</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Declaration */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-sm mb-4">
              Die Leistung des oben genannten Produkts entspricht der erklärten Leistung.
              Verantwortlich für die Erstellung dieser Leistungserklärung ist allein der Hersteller.
            </p>

            {dop.signatory && (
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Unterzeichnet für den Hersteller und im Namen des Herstellers von:</p>
                <div className="mt-4">
                  <p className="font-medium">{dop.signatory.name}</p>
                  <p className="text-sm text-gray-600">{dop.signatory.position}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {dop.signatory.place}, {format(new Date(dop.issue_date), 'dd.MM.yyyy', { locale: de })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>Diese Leistungserklärung wurde elektronisch erstellt und ist ohne Unterschrift gültig.</p>
          <p className="mt-2">
            Ausgestellt am: {format(new Date(dop.issue_date), 'dd.MM.yyyy', { locale: de })}
          </p>
          {dop.valid_until && (
            <p>
              Gültig bis: {format(new Date(dop.valid_until), 'dd.MM.yyyy', { locale: de })}
            </p>
          )}
          <p className="mt-4 font-medium">
            DoP {dop.dop_number} - Version {dop.version}
          </p>
        </div>
      </div>
    </div>
  )
}