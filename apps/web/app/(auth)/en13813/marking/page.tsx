'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Package,
  FileText,
  AlertTriangle,
  CheckCircle,
  Download,
  Printer,
  QrCode,
  Info,
  Shield,
  ClipboardCheck,
  Truck,
} from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import MarkingDeliveryNoteService from '@/modules/en13813/services/marking-delivery-note.service'
import type { Recipe, Batch } from '@/modules/en13813/types'

export default function MarkingDeliveryNotePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [quantity, setQuantity] = useState<{ value: number; unit: 'kg' | 't' | 'm³' }>({ value: 1000, unit: 'kg' })
  const [validationResult, setValidationResult] = useState<any>(null)
  const [markingData, setMarkingData] = useState<any>(null)
  const [deliveryData, setDeliveryData] = useState({
    deliveryNoteNumber: '',
    customerName: '',
    customerAddress: '',
    projectName: '',
    vehicleNumber: '',
    driverName: '',
    remarks: '',
  })

  // Mock-Daten laden
  useEffect(() => {
    loadMockData()
  }, [])

  const loadMockData = () => {
    // Mock Recipes
    const mockRecipes: Recipe[] = [
      {
        id: '1',
        tenant_id: 'tenant1',
        created_at: new Date().toISOString(),
        recipe_code: 'REC-001',
        name: 'CT-Estrich Premium C25-F4',
        binder_type: 'CT',
        compressive_strength_class: '25',
        flexural_strength_class: '4',
        en_designation: 'EN 13813 CT-C25-F4',
        manufacturer_name: 'Mustermann Estrichwerke GmbH',
        manufacturer_address: 'Industriestraße 123, 12345 Musterstadt',
        max_grain_size: '8 mm',
        layer_thickness_range: '40-80 mm',
        shelf_life_months: 6,
        mixing_instructions: 'Ca. 3,5-4,0 L Wasser pro 25 kg Sack. Mindestens 3 Minuten intensiv mischen.',
        application_instructions: 'Untergrund vorbereiten, Randdämmstreifen anbringen. Estrich einbringen und abziehen.',
        health_safety_instructions: 'Enthält Zement. Reagiert mit Feuchtigkeit/Wasser stark alkalisch. Reizt die Haut. Gefahr ernster Augenschäden. Schutzhandschuhe/Schutzkleidung/Augenschutz tragen.',
        safety_data_sheet_url: 'https://example.com/sdb/ct-estrich-premium.pdf',
        water_addition_ratio: '3,5-4,0 L pro 25 kg',
        mixing_time_minutes: 3,
        pot_life_minutes: 45,
        intended_use: {
          wearing_surface: false,
          with_flooring: true,
          heated_screed: true,
          indoor_only: true,
        },
        status: 'active',
        is_validated: true,
      },
      {
        id: '2',
        tenant_id: 'tenant1',
        created_at: new Date().toISOString(),
        recipe_code: 'REC-002',
        name: 'CA-Fließestrich CAF-C30-F5',
        binder_type: 'CA',
        compressive_strength_class: '30',
        flexural_strength_class: '5',
        en_designation: 'EN 13813 CA-C30-F5',
        manufacturer_name: 'Mustermann Estrichwerke GmbH',
        manufacturer_address: 'Industriestraße 123, 12345 Musterstadt',
        max_grain_size: '5 mm',
        layer_thickness_range: '35-60 mm',
        shelf_life_months: 3,
        intended_use: {
          wearing_surface: false,
          with_flooring: true,
          heated_screed: true,
          indoor_only: true,
        },
        status: 'active',
        is_validated: true,
      },
    ]
    setRecipes(mockRecipes)

    // Mock Batches
    const mockBatches: Batch[] = [
      {
        id: 'batch1',
        tenant_id: 'tenant1',
        created_at: new Date().toISOString(),
        recipe_id: '1',
        batch_number: 'BATCH-2025-001',
        production_date: new Date('2025-01-15').toISOString(),
        production_site: 'Werk Musterstadt',
        quantity_tons: 25,
        qc_passed: true,
        status: 'released',
      },
      {
        id: 'batch2',
        tenant_id: 'tenant1',
        created_at: new Date().toISOString(),
        recipe_id: '1',
        batch_number: 'BATCH-2025-002',
        production_date: new Date('2025-01-16').toISOString(),
        production_site: 'Werk Musterstadt',
        quantity_tons: 30,
        qc_passed: true,
        status: 'released',
      },
    ]
    setBatches(mockBatches)
  }

  const handleRecipeSelect = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId)
    setSelectedRecipe(recipe || null)

    if (recipe) {
      // Validiere Marking-Compliance mit Mengenangabe
      const result = MarkingDeliveryNoteService.validateMarkingCompliance(recipe, quantity)
      setValidationResult(result)

      // Filtere Batches für diese Rezeptur
      const recipeBatches = batches.filter(b => b.recipe_id === recipeId)
      if (recipeBatches.length > 0 && !selectedBatch) {
        setSelectedBatch(recipeBatches[0])
      }
    }
  }

  const handleBatchSelect = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId)
    setSelectedBatch(batch || null)
  }

  const generateMarkingLabel = () => {
    if (!selectedRecipe || !selectedBatch) return

    const data = MarkingDeliveryNoteService.generateMarkingLabel({
      recipe: selectedRecipe,
      batch: selectedBatch,
      quantity,
      includeCE: true,
    })

    setMarkingData(data)
  }

  const generateDeliveryNote = () => {
    if (!selectedRecipe || !selectedBatch || !markingData) return

    const deliveryNoteData = MarkingDeliveryNoteService.generateDeliveryNote({
      deliveryNoteNumber: deliveryData.deliveryNoteNumber || `LS-${Date.now()}`,
      deliveryDate: new Date(),
      customerName: deliveryData.customerName,
      customerAddress: deliveryData.customerAddress,
      projectName: deliveryData.projectName,
      recipe: selectedRecipe,
      batch: selectedBatch,
      quantity,
      ceMarkingRequired: true,
      vehicleNumber: deliveryData.vehicleNumber,
      driverName: deliveryData.driverName,
      remarks: deliveryData.remarks,
    })

    console.log('Delivery Note Generated:', deliveryNoteData)
    // Hier würde PDF-Generation erfolgen
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Package className="w-8 h-8" />
          Marking & Lieferschein
        </h1>
        <p className="text-muted-foreground mt-2">
          EN 13813:2002 Klausel 8 - Kennzeichnung und Lieferscheine
        </p>
      </div>

      <Tabs defaultValue="marking" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="marking">
            <Shield className="w-4 h-4 mr-2" />
            Marking/Label
          </TabsTrigger>
          <TabsTrigger value="delivery">
            <Truck className="w-4 h-4 mr-2" />
            Lieferschein
          </TabsTrigger>
          <TabsTrigger value="validation">
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Validierung
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Produkt & Charge auswählen</CardTitle>
              <CardDescription>
                Wählen Sie die Rezeptur und Charge für das Marking-Label
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rezeptur</Label>
                  <Select onValueChange={handleRecipeSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rezeptur wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipes.map(recipe => (
                        <SelectItem key={recipe.id} value={recipe.id}>
                          {recipe.name} ({recipe.en_designation})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Charge</Label>
                  <Select
                    onValueChange={handleBatchSelect}
                    disabled={!selectedRecipe}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Charge wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches
                        .filter(b => b.recipe_id === selectedRecipe?.id)
                        .map(batch => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.batch_number} ({format(new Date(batch.production_date), 'dd.MM.yyyy')})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Menge</Label>
                  <Input
                    type="number"
                    value={quantity.value}
                    onChange={e => setQuantity({ ...quantity, value: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Einheit</Label>
                  <Select
                    value={quantity.unit}
                    onValueChange={unit => setQuantity({ ...quantity, unit: unit as 'kg' | 't' | 'm³' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="t">t</SelectItem>
                      <SelectItem value="m³">m³</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={generateMarkingLabel}
                disabled={!selectedRecipe || !selectedBatch}
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                Marking-Label generieren
              </Button>
            </CardContent>
          </Card>

          {markingData && (
            <Card>
              <CardHeader>
                <CardTitle>Generiertes Marking-Label</CardTitle>
                <CardDescription>
                  Alle Pflichtangaben gemäß EN 13813 Klausel 8
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">1. Bezeichnung</p>
                      <p className="font-mono font-semibold">{markingData.designation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">2. Produktname</p>
                      <p className="font-semibold">{markingData.productName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">3. Menge</p>
                      <p className="font-semibold">{markingData.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">4. Herstelldatum</p>
                      <p className="font-semibold">{markingData.productionDate}</p>
                      {markingData.shelfLife && (
                        <p className="text-sm">Haltbar bis: {markingData.shelfLife}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">5. Chargennummer</p>
                      <p className="font-mono font-semibold">{markingData.batchNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">6. Größtkorn/Dicke</p>
                      <p className="font-semibold">
                        {markingData.maxGrainSize || markingData.layerThickness || 'Nicht angegeben'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">7. Mischhinweise</p>
                    <p className="text-sm bg-white p-3 rounded border">
                      {markingData.mixingInstructions}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      8. H&S-Hinweise (Health & Safety)
                      <Badge className="ml-2" variant="destructive">PFLICHT</Badge>
                    </p>
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-sm">
                        {markingData.healthSafetyInstructions}
                      </AlertDescription>
                    </Alert>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">9. Hersteller</p>
                    <p className="font-semibold">{markingData.manufacturerName}</p>
                    <p className="text-sm">{markingData.manufacturerAddress}</p>
                  </div>

                  {markingData.ceMarking && (
                    <div className="border-t pt-4 mt-4">
                      <p className="font-semibold mb-2">CE-Kennzeichnung (Annex ZA.3)</p>
                      <div className="bg-white border-2 border-black p-4 rounded">
                        <div className="text-center mb-3">
                          <span className="text-3xl font-bold">CE</span>
                          <span className="ml-2 text-xl">{markingData.ceMarking.year}</span>
                        </div>
                        <div className="text-sm space-y-1">
                          <p className="font-semibold">{markingData.ceMarking.standard}</p>
                          <p className="italic">{markingData.ceMarking.productDescription}</p>
                          <div className="mt-3 pt-2 border-t">
                            <p className="font-semibold mb-1">Essential characteristics:</p>
                            {Object.entries(markingData.ceMarking.declaredPerformance).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-xs">
                                <span>{key}:</span>
                                <span className="font-mono font-semibold">{value as string}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Gemäß EN 13813:2002 Annex ZA.3 - AVCP System 4 (ohne NB-Nummer)
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="default">
                    <Download className="w-4 h-4 mr-2" />
                    Als PDF exportieren
                  </Button>
                  <Button variant="outline">
                    <Printer className="w-4 h-4 mr-2" />
                    Drucken
                  </Button>
                  <Button variant="outline">
                    <QrCode className="w-4 h-4 mr-2" />
                    QR-Code generieren
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lieferschein-Daten</CardTitle>
              <CardDescription>
                Erfassen Sie die Lieferinformationen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Lieferschein-Nr.</Label>
                  <Input
                    placeholder="LS-2025-001"
                    value={deliveryData.deliveryNoteNumber}
                    onChange={e => setDeliveryData({ ...deliveryData, deliveryNoteNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Projektname</Label>
                  <Input
                    placeholder="Bauprojekt Musterstraße"
                    value={deliveryData.projectName}
                    onChange={e => setDeliveryData({ ...deliveryData, projectName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Kunde</Label>
                <Input
                  placeholder="Bauunternehmen GmbH"
                  value={deliveryData.customerName}
                  onChange={e => setDeliveryData({ ...deliveryData, customerName: e.target.value })}
                />
              </div>

              <div>
                <Label>Lieferadresse</Label>
                <Textarea
                  placeholder="Baustelle Musterstraße 123, 12345 Musterstadt"
                  value={deliveryData.customerAddress}
                  onChange={e => setDeliveryData({ ...deliveryData, customerAddress: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fahrzeug</Label>
                  <Input
                    placeholder="MS-AB 123"
                    value={deliveryData.vehicleNumber}
                    onChange={e => setDeliveryData({ ...deliveryData, vehicleNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Fahrer</Label>
                  <Input
                    placeholder="Max Mustermann"
                    value={deliveryData.driverName}
                    onChange={e => setDeliveryData({ ...deliveryData, driverName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Bemerkungen</Label>
                <Textarea
                  placeholder="Besondere Hinweise..."
                  value={deliveryData.remarks}
                  onChange={e => setDeliveryData({ ...deliveryData, remarks: e.target.value })}
                />
              </div>

              <Button
                onClick={generateDeliveryNote}
                disabled={!markingData || !deliveryData.customerName}
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                Lieferschein generieren
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance-Validierung</CardTitle>
              <CardDescription>
                Prüfung der EN 13813 Klausel 8 Anforderungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {validationResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {validationResult.isCompliant ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-600">
                          Vollständig konform mit EN 13813 Klausel 8
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-red-600">
                          Nicht konform - Pflichtfelder fehlen
                        </span>
                      </>
                    )}
                  </div>

                  {validationResult.missingFields.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <p className="font-semibold mb-2">Fehlende Pflichtfelder:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {validationResult.missingFields.map((field: string, idx: number) => (
                            <li key={idx}>{field}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {validationResult.validationErrors && validationResult.validationErrors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <p className="font-semibold mb-2">Validierungsfehler:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {validationResult.validationErrors.map((error: string, idx: number) => (
                            <li key={idx} className="text-sm">{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {validationResult.warnings.length > 0 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <p className="font-semibold mb-2">Warnungen:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {validationResult.warnings.map((warning: string, idx: number) => (
                            <li key={idx}>{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">EN 13813 Klausel 8 - Checkliste:</h4>
                    <div className="space-y-2">
                      {[
                        { nr: '1', field: 'Designation (EN-Bezeichnung)', required: true },
                        { nr: '2', field: 'Produktname', required: true },
                        { nr: '3', field: 'Menge', required: true },
                        { nr: '4', field: 'Herstelldatum & Haltbarkeit', required: true },
                        { nr: '5', field: 'Batch-/Chargennummer', required: true },
                        { nr: '6', field: 'Max. Größtkorn oder Dickenbereich', required: true },
                        { nr: '7', field: 'Misch-/Verarbeitungshinweise', required: true },
                        { nr: '8', field: 'H&S-Hinweise (Health & Safety)', required: true },
                        { nr: '9', field: 'Hersteller/Adresse', required: true },
                      ].map(item => {
                        const isPresent = selectedRecipe &&
                          ((item.nr === '8' && selectedRecipe.health_safety_instructions) ||
                           (item.nr === '1' && selectedRecipe.en_designation) ||
                           (item.nr === '2' && selectedRecipe.name) ||
                           (item.nr === '9' && selectedRecipe.manufacturer_name))

                        return (
                          <div key={item.nr} className="flex items-center gap-2">
                            {isPresent ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-orange-600" />
                            )}
                            <span className="text-sm">
                              {item.nr}. {item.field}
                              {item.required && <Badge variant="outline" className="ml-2 text-xs">Pflicht</Badge>}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Wählen Sie eine Rezeptur aus, um die Compliance zu prüfen.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}