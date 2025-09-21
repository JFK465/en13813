'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, FileText, QrCode, Send, CheckCircle, AlertCircle, Printer } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import * as QRCode from 'qrcode'
import { format } from 'date-fns'
import { de, enUS } from 'date-fns/locale'

interface Recipe {
  id: string
  recipe_code: string
  name: string
  product_name: string
  manufacturer_name: string
  manufacturer_address: string
  binder_type: string
  compressive_strength_class: string
  flexural_strength_class: string
  wear_resistance_bohme_class?: string
  wear_resistance_bca_class?: string
  wear_resistance_rollrad_class?: string
  surface_hardness_class?: string
  bond_strength_class?: string
  fire_class: string
  ph_value?: number
  notified_body_name?: string
  notified_body_number?: string
  notified_body_certificate?: string
}

interface DoP {
  id?: string
  recipe_id: string
  dop_number: string
  version: number
  language: 'de' | 'en' | 'fr'
  issue_date: string
  valid_until?: string
  manufacturer_data: {
    name: string
    address: string
    postalCode: string
    city: string
    country: string
    phone?: string
    email?: string
    website?: string
  }
  signatory?: {
    name: string
    position: string
    place: string
  }
  qr_code_data?: string
  public_url?: string
  status: 'draft' | 'approved' | 'published'
}

export default function DoPGenerator() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [dopData, setDopData] = useState<Partial<DoP>>({
    language: 'de',
    version: 1,
    status: 'draft',
    manufacturer_data: {
      name: '',
      address: '',
      postalCode: '',
      city: '',
      country: 'Deutschland',
      phone: '',
      email: '',
      website: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [generatedDoP, setGeneratedDoP] = useState<DoP | null>(null)

  // Lade Rezepte
  useEffect(() => {
    loadRecipes()
  }, [])

  const loadRecipes = async () => {
    try {
      const response = await fetch('/api/en13813/recipes')
      if (!response.ok) throw new Error('Fehler beim Laden der Rezepte')
      const data = await response.json()
      setRecipes(data.recipes || [])
    } catch (error) {
      console.error('Error loading recipes:', error)
      toast({
        title: 'Fehler',
        description: 'Rezepte konnten nicht geladen werden',
        variant: 'destructive'
      })
    }
  }

  // Generiere DoP-Nummer
  const generateDoPNumber = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `DoP-${year}-${random}`
  }

  // Validiere DoP-Daten
  const validateDoP = (): boolean => {
    const errors: string[] = []

    if (!selectedRecipe) {
      errors.push('Bitte wählen Sie eine Rezeptur aus')
    }

    if (!dopData.dop_number) {
      errors.push('DoP-Nummer ist erforderlich')
    }

    if (!dopData.manufacturer_data?.name) {
      errors.push('Herstellername ist erforderlich')
    }

    if (!dopData.manufacturer_data?.address) {
      errors.push('Herstelleradresse ist erforderlich')
    }

    if (!dopData.signatory?.name) {
      errors.push('Name des Unterzeichners ist erforderlich')
    }

    if (!dopData.signatory?.position) {
      errors.push('Position des Unterzeichners ist erforderlich')
    }

    // EN13813 spezifische Validierung
    if (selectedRecipe) {
      // System 2+ erfordert benannte Stelle für bestimmte Eigenschaften
      const requiresNotifiedBody =
        selectedRecipe.fire_class &&
        !['A1fl', 'Ffl'].includes(selectedRecipe.fire_class)

      if (requiresNotifiedBody && !selectedRecipe.notified_body_number) {
        errors.push('Benannte Stelle erforderlich für Brandverhalten Klasse ' + selectedRecipe.fire_class)
      }

      // CA-Estriche müssen pH ≥ 7 haben
      if (selectedRecipe.binder_type === 'CA' && (!selectedRecipe.ph_value || selectedRecipe.ph_value < 7)) {
        errors.push('pH-Wert muss ≥ 7 für CA-Estriche sein')
      }
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  // Generiere QR-Code
  const generateQRCode = async (url: string): Promise<string> => {
    try {
      return await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
    } catch (error) {
      console.error('QR Code generation error:', error)
      return ''
    }
  }

  // Erstelle DoP
  const createDoP = async () => {
    if (!validateDoP() || !selectedRecipe) return

    setLoading(true)
    try {
      // Generiere öffentliche URL für QR-Code
      const publicUrl = `${window.location.origin}/public/dop/${dopData.dop_number}`
      const qrCodeData = await generateQRCode(publicUrl)

      const dopPayload = {
        ...dopData,
        recipe_id: selectedRecipe.id,
        dop_number: dopData.dop_number || generateDoPNumber(),
        issue_date: new Date().toISOString(),
        valid_until: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 10 Jahre
        qr_code_data: qrCodeData,
        public_url: publicUrl,
        manufacturer_data: {
          ...dopData.manufacturer_data,
          name: dopData.manufacturer_data?.name || selectedRecipe.manufacturer_name,
          address: dopData.manufacturer_data?.address || selectedRecipe.manufacturer_address
        }
      }

      // Speichere DoP in Datenbank
      const response = await fetch('/api/en13813/dops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dopPayload)
      })

      if (!response.ok) {
        throw new Error('Fehler beim Erstellen der DoP')
      }

      const result = await response.json()
      setGeneratedDoP(result.dop)

      toast({
        title: 'Erfolg',
        description: 'Leistungserklärung wurde erfolgreich erstellt',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error creating DoP:', error)
      toast({
        title: 'Fehler',
        description: 'DoP konnte nicht erstellt werden',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Download PDF
  const downloadPDF = async (dopId: string) => {
    try {
      const response = await fetch(`/api/en13813/dops/${dopId}/pdf`)
      if (!response.ok) throw new Error('PDF-Download fehlgeschlagen')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `DoP_${dopData.dop_number}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Erfolg',
        description: 'PDF wurde heruntergeladen',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast({
        title: 'Fehler',
        description: 'PDF konnte nicht heruntergeladen werden',
        variant: 'destructive'
      })
    }
  }

  // Formatiere EN-Bezeichnung
  const formatENDesignation = (recipe: Recipe): string => {
    const parts = [recipe.binder_type]

    if (recipe.compressive_strength_class) {
      parts.push(recipe.compressive_strength_class)
    }

    if (recipe.flexural_strength_class) {
      parts.push(recipe.flexural_strength_class)
    }

    // Verschleißwiderstand
    if (recipe.wear_resistance_bohme_class) {
      parts.push(recipe.wear_resistance_bohme_class)
    } else if (recipe.wear_resistance_bca_class) {
      parts.push(recipe.wear_resistance_bca_class)
    } else if (recipe.wear_resistance_rollrad_class) {
      parts.push(recipe.wear_resistance_rollrad_class)
    }

    // Weitere Eigenschaften
    if (recipe.surface_hardness_class) parts.push(recipe.surface_hardness_class)
    if (recipe.bond_strength_class) parts.push(recipe.bond_strength_class)
    if (recipe.fire_class && recipe.fire_class !== 'NPD') parts.push(recipe.fire_class)

    return parts.join('-')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Leistungserklärung (DoP) Generator
          </CardTitle>
          <CardDescription>
            Erstellen Sie EN 13813-konforme Leistungserklärungen gemäß Verordnung (EU) Nr. 305/2011
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recipe" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="recipe">1. Rezeptur</TabsTrigger>
              <TabsTrigger value="manufacturer">2. Hersteller</TabsTrigger>
              <TabsTrigger value="signatory">3. Unterzeichner</TabsTrigger>
              <TabsTrigger value="preview">4. Vorschau</TabsTrigger>
            </TabsList>

            <TabsContent value="recipe" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Rezeptur auswählen</Label>
                  <Select
                    value={selectedRecipe?.id}
                    onValueChange={(value) => {
                      const recipe = recipes.find(r => r.id === value)
                      setSelectedRecipe(recipe || null)
                      if (recipe) {
                        setDopData(prev => ({
                          ...prev,
                          recipe_id: recipe.id,
                          dop_number: generateDoPNumber()
                        }))
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen Sie eine Rezeptur" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipes.map(recipe => (
                        <SelectItem key={recipe.id} value={recipe.id}>
                          {recipe.recipe_code} - {recipe.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedRecipe && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Rezeptur-Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">Rezeptur-Code:</span>
                          <span className="ml-2">{selectedRecipe.recipe_code}</span>
                        </div>
                        <div>
                          <span className="font-semibold">Produktname:</span>
                          <span className="ml-2">{selectedRecipe.product_name}</span>
                        </div>
                        <div>
                          <span className="font-semibold">EN-Bezeichnung:</span>
                          <Badge className="ml-2" variant="secondary">
                            {formatENDesignation(selectedRecipe)}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-semibold">Bindemitteltyp:</span>
                          <span className="ml-2">{selectedRecipe.binder_type}</span>
                        </div>
                        <div>
                          <span className="font-semibold">Druckfestigkeit:</span>
                          <span className="ml-2">{selectedRecipe.compressive_strength_class}</span>
                        </div>
                        <div>
                          <span className="font-semibold">Biegezugfestigkeit:</span>
                          <span className="ml-2">{selectedRecipe.flexural_strength_class}</span>
                        </div>
                        <div>
                          <span className="font-semibold">Brandverhalten:</span>
                          <span className="ml-2">{selectedRecipe.fire_class}</span>
                        </div>
                      </div>

                      {selectedRecipe.notified_body_number && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Benannte Stelle: {selectedRecipe.notified_body_name} ({selectedRecipe.notified_body_number})
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>DoP-Nummer</Label>
                    <Input
                      value={dopData.dop_number || ''}
                      onChange={(e) => setDopData(prev => ({ ...prev, dop_number: e.target.value }))}
                      placeholder="DoP-2024-0001"
                    />
                  </div>
                  <div>
                    <Label>Sprache</Label>
                    <Select
                      value={dopData.language}
                      onValueChange={(value: 'de' | 'en' | 'fr') =>
                        setDopData(prev => ({ ...prev, language: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manufacturer" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Herstellername</Label>
                  <Input
                    value={dopData.manufacturer_data?.name || ''}
                    onChange={(e) => setDopData(prev => ({
                      ...prev,
                      manufacturer_data: {
                        ...prev.manufacturer_data!,
                        name: e.target.value
                      }
                    }))}
                    placeholder="Estrichwerke GmbH"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Adresse</Label>
                  <Input
                    value={dopData.manufacturer_data?.address || ''}
                    onChange={(e) => setDopData(prev => ({
                      ...prev,
                      manufacturer_data: {
                        ...prev.manufacturer_data!,
                        address: e.target.value
                      }
                    }))}
                    placeholder="Musterstraße 1"
                  />
                </div>
                <div>
                  <Label>PLZ</Label>
                  <Input
                    value={dopData.manufacturer_data?.postalCode || ''}
                    onChange={(e) => setDopData(prev => ({
                      ...prev,
                      manufacturer_data: {
                        ...prev.manufacturer_data!,
                        postalCode: e.target.value
                      }
                    }))}
                    placeholder="12345"
                  />
                </div>
                <div>
                  <Label>Stadt</Label>
                  <Input
                    value={dopData.manufacturer_data?.city || ''}
                    onChange={(e) => setDopData(prev => ({
                      ...prev,
                      manufacturer_data: {
                        ...prev.manufacturer_data!,
                        city: e.target.value
                      }
                    }))}
                    placeholder="Musterstadt"
                  />
                </div>
                <div>
                  <Label>Land</Label>
                  <Input
                    value={dopData.manufacturer_data?.country || ''}
                    onChange={(e) => setDopData(prev => ({
                      ...prev,
                      manufacturer_data: {
                        ...prev.manufacturer_data!,
                        country: e.target.value
                      }
                    }))}
                    placeholder="Deutschland"
                  />
                </div>
                <div>
                  <Label>Telefon (optional)</Label>
                  <Input
                    value={dopData.manufacturer_data?.phone || ''}
                    onChange={(e) => setDopData(prev => ({
                      ...prev,
                      manufacturer_data: {
                        ...prev.manufacturer_data!,
                        phone: e.target.value
                      }
                    }))}
                    placeholder="+49 123 456789"
                  />
                </div>
                <div>
                  <Label>E-Mail (optional)</Label>
                  <Input
                    type="email"
                    value={dopData.manufacturer_data?.email || ''}
                    onChange={(e) => setDopData(prev => ({
                      ...prev,
                      manufacturer_data: {
                        ...prev.manufacturer_data!,
                        email: e.target.value
                      }
                    }))}
                    placeholder="info@estrichwerke.de"
                  />
                </div>
                <div>
                  <Label>Website (optional)</Label>
                  <Input
                    value={dopData.manufacturer_data?.website || ''}
                    onChange={(e) => setDopData(prev => ({
                      ...prev,
                      manufacturer_data: {
                        ...prev.manufacturer_data!,
                        website: e.target.value
                      }
                    }))}
                    placeholder="www.estrichwerke.de"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="signatory" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Name des Unterzeichners</Label>
                  <Input
                    value={dopData.signatory?.name || ''}
                    onChange={(e) => setDopData(prev => ({
                      ...prev,
                      signatory: {
                        ...prev.signatory!,
                        name: e.target.value
                      }
                    }))}
                    placeholder="Max Mustermann"
                  />
                </div>
                <div>
                  <Label>Position</Label>
                  <Input
                    value={dopData.signatory?.position || ''}
                    onChange={(e) => setDopData(prev => ({
                      ...prev,
                      signatory: {
                        ...prev.signatory!,
                        position: e.target.value
                      }
                    }))}
                    placeholder="Geschäftsführer / Technischer Leiter"
                  />
                </div>
                <div>
                  <Label>Ort</Label>
                  <Input
                    value={dopData.signatory?.place || ''}
                    onChange={(e) => setDopData(prev => ({
                      ...prev,
                      signatory: {
                        ...prev.signatory!,
                        place: e.target.value
                      }
                    }))}
                    placeholder="Musterstadt"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {selectedRecipe && dopData.manufacturer_data?.name && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Vorschau der Leistungserklärung</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border p-4 rounded-lg space-y-3">
                      <h3 className="font-bold text-lg text-center">
                        {dopData.language === 'de' ? 'LEISTUNGSERKLÄRUNG' : 'DECLARATION OF PERFORMANCE'}
                      </h3>
                      <p className="text-center text-sm">Nr. {dopData.dop_number}</p>
                      <p className="text-center text-xs text-gray-600">
                        gemäß Verordnung (EU) Nr. 305/2011
                      </p>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-semibold">1. Eindeutiger Kenncode:</span>
                          <span className="ml-2">{selectedRecipe.recipe_code}</span>
                        </div>
                        <div>
                          <span className="font-semibold">2. Handelsname:</span>
                          <span className="ml-2">{selectedRecipe.product_name}</span>
                        </div>
                        <div>
                          <span className="font-semibold">3. Verwendungszweck:</span>
                          <span className="ml-2">Estrichmörtel zur Verwendung in Gebäuden gemäß EN 13813</span>
                        </div>
                        <div>
                          <span className="font-semibold">4. Hersteller:</span>
                          <div className="ml-4">
                            {dopData.manufacturer_data.name}<br />
                            {dopData.manufacturer_data.address}<br />
                            {dopData.manufacturer_data.postalCode} {dopData.manufacturer_data.city}<br />
                            {dopData.manufacturer_data.country}
                          </div>
                        </div>
                        <div>
                          <span className="font-semibold">5. System AVCP:</span>
                          <span className="ml-2">System 4</span>
                        </div>
                        <div>
                          <span className="font-semibold">6. Harmonisierte Norm:</span>
                          <span className="ml-2">EN 13813:2002</span>
                        </div>
                        <div>
                          <span className="font-semibold">7. Erklärte Leistung:</span>
                          <div className="ml-4 mt-2">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left p-2">Wesentliche Merkmale</th>
                                  <th className="text-left p-2">Leistung</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b">
                                  <td className="p-2">Freisetzung korrosiver Substanzen</td>
                                  <td className="p-2">{selectedRecipe.binder_type}</td>
                                </tr>
                                <tr className="border-b">
                                  <td className="p-2">Druckfestigkeit</td>
                                  <td className="p-2">{selectedRecipe.compressive_strength_class}</td>
                                </tr>
                                <tr className="border-b">
                                  <td className="p-2">Biegezugfestigkeit</td>
                                  <td className="p-2">{selectedRecipe.flexural_strength_class}</td>
                                </tr>
                                <tr className="border-b">
                                  <td className="p-2">Brandverhalten</td>
                                  <td className="p-2">{selectedRecipe.fire_class}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t">
                        <p className="text-sm">
                          Die Leistung des oben genannten Produkts entspricht der erklärten Leistung.
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm">_______________________</p>
                            <p className="text-xs">{dopData.signatory?.name}</p>
                            <p className="text-xs">{dopData.signatory?.position}</p>
                          </div>
                          <div>
                            <p className="text-sm">_______________________</p>
                            <p className="text-xs">{dopData.signatory?.place}, {format(new Date(), 'dd.MM.yyyy', { locale: de })}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 justify-end">
                      <Button
                        variant="outline"
                        disabled={loading || !validateDoP()}
                        onClick={() => {
                          if (validateDoP()) {
                            setDopData(prev => ({ ...prev, status: 'draft' }))
                            createDoP()
                          }
                        }}
                      >
                        Als Entwurf speichern
                      </Button>
                      <Button
                        disabled={loading || !validateDoP()}
                        onClick={() => {
                          if (validateDoP()) {
                            setDopData(prev => ({ ...prev, status: 'approved' }))
                            createDoP()
                          }
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        DoP erstellen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedDoP && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>Leistungserklärung wurde erfolgreich erstellt!</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadPDF(generatedDoP.id!)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          PDF herunterladen
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.print()}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Drucken
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}