'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Download,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Info
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import * as XLSX from '@e965/xlsx'

interface Recipe {
  recipe_code: string
  name: string
  product_name: string
  manufacturer_name: string
  manufacturer_address: string
  binder_type: 'CT' | 'CA' | 'MA' | 'SR' | 'AS'
  compressive_strength_class: string
  flexural_strength_class: string
  fire_class: string
  wear_resistance_bohme_class?: string
  wear_resistance_bca_class?: string
  wear_resistance_rollrad_class?: string
  surface_hardness_class?: string
  rwfc_class?: string
  bond_strength_class?: string
  impact_resistance_class?: string
  electrical_resistance_class?: string
  chemical_resistance?: string
  ph_value?: number
  notified_body_name?: string
  notified_body_number?: string
  notified_body_certificate?: string
  status?: string
}

interface ImportResult {
  row: number
  recipe_code: string
  status: 'success' | 'error' | 'warning'
  message: string
}

export default function RecipeBatchImportExport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResults, setImportResults] = useState<ImportResult[]>([])
  const [previewData, setPreviewData] = useState<Recipe[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Validiere Rezepturdaten
  const validateRecipe = (recipe: any, row: number): ImportResult | null => {
    // Pflichtfelder
    const requiredFields = [
      'recipe_code',
      'name',
      'product_name',
      'manufacturer_name',
      'manufacturer_address',
      'binder_type',
      'compressive_strength_class',
      'flexural_strength_class',
      'fire_class'
    ]

    for (const field of requiredFields) {
      if (!recipe[field]) {
        return {
          row,
          recipe_code: recipe.recipe_code || `Zeile ${row}`,
          status: 'error',
          message: `Pflichtfeld '${field}' fehlt`
        }
      }
    }

    // Validiere Bindemitteltyp
    const validBinders = ['CT', 'CA', 'MA', 'SR', 'AS']
    if (!validBinders.includes(recipe.binder_type)) {
      return {
        row,
        recipe_code: recipe.recipe_code,
        status: 'error',
        message: `Ungültiger Bindemitteltyp: ${recipe.binder_type}`
      }
    }

    // Validiere pH-Wert für CA-Estriche
    if (recipe.binder_type === 'CA' && recipe.ph_value && recipe.ph_value < 7) {
      return {
        row,
        recipe_code: recipe.recipe_code,
        status: 'error',
        message: 'pH-Wert muss ≥ 7 für CA-Estriche sein'
      }
    }

    // Validiere Festigkeitsklassen Format
    const strengthPattern = /^[CF]\d+$/
    if (!recipe.compressive_strength_class.match(/^C\d+$/)) {
      return {
        row,
        recipe_code: recipe.recipe_code,
        status: 'warning',
        message: 'Druckfestigkeitsklasse sollte Format C## haben'
      }
    }

    if (!recipe.flexural_strength_class.match(/^F\d+$/)) {
      return {
        row,
        recipe_code: recipe.recipe_code,
        status: 'warning',
        message: 'Biegezugfestigkeitsklasse sollte Format F## haben'
      }
    }

    return null
  }

  // Excel/CSV Import
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // Konvertiere Excel-Spaltennamen zu Schema-Namen
        const mappedData = jsonData.map((row: any) => ({
          recipe_code: row['Rezeptur-Code'] || row['recipe_code'],
          name: row['Name'] || row['name'],
          product_name: row['Produktname'] || row['product_name'],
          manufacturer_name: row['Hersteller'] || row['manufacturer_name'],
          manufacturer_address: row['Hersteller-Adresse'] || row['manufacturer_address'],
          binder_type: row['Bindemitteltyp'] || row['binder_type'],
          compressive_strength_class: row['Druckfestigkeit'] || row['compressive_strength_class'],
          flexural_strength_class: row['Biegezugfestigkeit'] || row['flexural_strength_class'],
          fire_class: row['Brandklasse'] || row['fire_class'],
          wear_resistance_bohme_class: row['Verschleiß Böhme'] || row['wear_resistance_bohme_class'],
          wear_resistance_bca_class: row['Verschleiß BCA'] || row['wear_resistance_bca_class'],
          wear_resistance_rollrad_class: row['Verschleiß Rollrad'] || row['wear_resistance_rollrad_class'],
          surface_hardness_class: row['Oberflächenhärte'] || row['surface_hardness_class'],
          rwfc_class: row['RWFC-Klasse'] || row['rwfc_class'],
          bond_strength_class: row['Haftzugfestigkeit'] || row['bond_strength_class'],
          impact_resistance_class: row['Schlagfestigkeit'] || row['impact_resistance_class'],
          electrical_resistance_class: row['Elektrischer Widerstand'] || row['electrical_resistance_class'],
          chemical_resistance: row['Chemische Beständigkeit'] || row['chemical_resistance'],
          ph_value: parseFloat(row['pH-Wert'] || row['ph_value']) || undefined,
          notified_body_name: row['Benannte Stelle'] || row['notified_body_name'],
          notified_body_number: row['Benannte Stelle Nr.'] || row['notified_body_number'],
          notified_body_certificate: row['Zertifikat'] || row['notified_body_certificate'],
          status: 'draft'
        }))

        setPreviewData(mappedData)

        // Validiere alle Zeilen
        const results: ImportResult[] = []
        mappedData.forEach((recipe, index) => {
          const validationResult = validateRecipe(recipe, index + 2) // +2 wegen Header-Zeile
          if (validationResult) {
            results.push(validationResult)
          }
        })

        setImportResults(results)

        toast({
          title: 'Datei geladen',
          description: `${mappedData.length} Rezepturen gefunden, ${results.filter(r => r.status === 'error').length} Fehler`,
          variant: results.some(r => r.status === 'error') ? 'destructive' : 'default'
        })
      } catch (error) {
        console.error('Error reading file:', error)
        toast({
          title: 'Fehler',
          description: 'Datei konnte nicht gelesen werden',
          variant: 'destructive'
        })
      }
    }

    reader.readAsBinaryString(file)
  }

  // Import ausführen
  const executeImport = async () => {
    if (!previewData.length) return

    setImporting(true)
    setImportProgress(0)
    const results: ImportResult[] = []

    try {
      for (let i = 0; i < previewData.length; i++) {
        const recipe = previewData[i]

        // Validierung
        const validationResult = validateRecipe(recipe, i + 2)
        if (validationResult && validationResult.status === 'error') {
          results.push(validationResult)
          continue
        }

        // API-Aufruf
        const response = await fetch('/api/en13813/recipes/compliant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recipe)
        })

        if (response.ok) {
          results.push({
            row: i + 2,
            recipe_code: recipe.recipe_code,
            status: 'success',
            message: 'Erfolgreich importiert'
          })
        } else {
          const error = await response.json()
          results.push({
            row: i + 2,
            recipe_code: recipe.recipe_code,
            status: 'error',
            message: error.error || 'Import fehlgeschlagen'
          })
        }

        setImportProgress(((i + 1) / previewData.length) * 100)
      }

      setImportResults(results)

      const successCount = results.filter(r => r.status === 'success').length
      const errorCount = results.filter(r => r.status === 'error').length

      toast({
        title: 'Import abgeschlossen',
        description: `${successCount} erfolgreich, ${errorCount} fehlgeschlagen`,
        variant: errorCount > 0 ? 'destructive' : 'default'
      })
    } catch (error) {
      console.error('Import error:', error)
      toast({
        title: 'Fehler',
        description: 'Import fehlgeschlagen',
        variant: 'destructive'
      })
    } finally {
      setImporting(false)
    }
  }

  // Export
  const handleExport = async (format: 'xlsx' | 'csv' | 'json') => {
    setExporting(true)

    try {
      // Lade alle Rezepturen
      const response = await fetch('/api/en13813/recipes')
      const data = await response.json()
      const recipes = data.recipes || []

      if (recipes.length === 0) {
        toast({
          title: 'Keine Daten',
          description: 'Keine Rezepturen zum Exportieren gefunden',
          variant: 'destructive'
        })
        return
      }

      // Bereite Daten für Export vor
      const exportData = recipes.map((r: any) => ({
        'Rezeptur-Code': r.recipe_code,
        'Name': r.name,
        'Produktname': r.product_name,
        'Hersteller': r.manufacturer_name,
        'Hersteller-Adresse': r.manufacturer_address,
        'Bindemitteltyp': r.binder_type,
        'Druckfestigkeit': r.compressive_strength_class,
        'Biegezugfestigkeit': r.flexural_strength_class,
        'Brandklasse': r.fire_class,
        'Verschleiß Böhme': r.wear_resistance_bohme_class || '',
        'Verschleiß BCA': r.wear_resistance_bca_class || '',
        'Verschleiß Rollrad': r.wear_resistance_rollrad_class || '',
        'Oberflächenhärte': r.surface_hardness_class || '',
        'RWFC-Klasse': r.rwfc_class || '',
        'Haftzugfestigkeit': r.bond_strength_class || '',
        'Schlagfestigkeit': r.impact_resistance_class || '',
        'Elektrischer Widerstand': r.electrical_resistance_class || '',
        'Chemische Beständigkeit': r.chemical_resistance || '',
        'pH-Wert': r.ph_value || '',
        'Benannte Stelle': r.notified_body_name || '',
        'Benannte Stelle Nr.': r.notified_body_number || '',
        'Zertifikat': r.notified_body_certificate || '',
        'Status': r.status,
        'Erstellt am': new Date(r.created_at).toLocaleDateString('de-DE')
      }))

      // Export basierend auf Format
      const timestamp = new Date().toISOString().split('T')[0]
      let blob: Blob
      let filename: string

      switch (format) {
        case 'xlsx':
          const worksheet = XLSX.utils.json_to_sheet(exportData)
          const workbook = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Rezepturen')
          const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
          blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          filename = `EN13813_Rezepturen_${timestamp}.xlsx`
          break

        case 'csv':
          const worksheet2 = XLSX.utils.json_to_sheet(exportData)
          const csvData = XLSX.utils.sheet_to_csv(worksheet2)
          blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
          filename = `EN13813_Rezepturen_${timestamp}.csv`
          break

        case 'json':
          blob = new Blob([JSON.stringify(recipes, null, 2)], { type: 'application/json' })
          filename = `EN13813_Rezepturen_${timestamp}.json`
          break

        default:
          throw new Error('Ungültiges Export-Format')
      }

      // Download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: 'Export erfolgreich',
        description: `${recipes.length} Rezepturen exportiert`,
        variant: 'default'
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Fehler',
        description: 'Export fehlgeschlagen',
        variant: 'destructive'
      })
    } finally {
      setExporting(false)
    }
  }

  // Download Vorlage
  const downloadTemplate = () => {
    const template = [
      {
        'Rezeptur-Code': 'CT-C25-F4-A22',
        'Name': 'Zement-Estrich Standard',
        'Produktname': 'StandardFloor CT25',
        'Hersteller': 'Musterfirma GmbH',
        'Hersteller-Adresse': 'Musterstraße 1, 12345 Musterstadt',
        'Bindemitteltyp': 'CT',
        'Druckfestigkeit': 'C25',
        'Biegezugfestigkeit': 'F4',
        'Brandklasse': 'A1fl',
        'Verschleiß Böhme': 'A22',
        'Verschleiß BCA': '',
        'Verschleiß Rollrad': '',
        'Oberflächenhärte': '',
        'RWFC-Klasse': '',
        'Haftzugfestigkeit': '',
        'Schlagfestigkeit': '',
        'Elektrischer Widerstand': '',
        'Chemische Beständigkeit': '',
        'pH-Wert': '',
        'Benannte Stelle': '',
        'Benannte Stelle Nr.': '',
        'Zertifikat': ''
      }
    ]

    const worksheet = XLSX.utils.json_to_sheet(template)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vorlage')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'EN13813_Import_Vorlage.xlsx'
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: 'Vorlage heruntergeladen',
      description: 'Bitte füllen Sie die Vorlage aus und laden Sie sie wieder hoch',
      variant: 'default'
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rezepturen importieren</CardTitle>
              <CardDescription>
                Importieren Sie mehrere Rezepturen aus Excel- oder CSV-Dateien
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload-Bereich */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="mb-2">Excel- oder CSV-Datei hier ablegen oder</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Datei auswählen
                </Button>
                <Button
                  variant="ghost"
                  className="ml-2"
                  onClick={downloadTemplate}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Vorlage herunterladen
                </Button>
              </div>

              {selectedFile && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    {selectedFile.name} ({previewData.length} Rezepturen)
                  </AlertDescription>
                </Alert>
              )}

              {/* Validierungsergebnisse */}
              {importResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Validierungsergebnisse</h3>
                    <div className="flex gap-2">
                      <Badge variant="default">
                        {importResults.filter(r => r.status === 'success').length} OK
                      </Badge>
                      <Badge variant="secondary">
                        {importResults.filter(r => r.status === 'warning').length} Warnungen
                      </Badge>
                      <Badge variant="destructive">
                        {importResults.filter(r => r.status === 'error').length} Fehler
                      </Badge>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Zeile</TableHead>
                          <TableHead>Rezeptur-Code</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Meldung</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importResults.map((result, index) => (
                          <TableRow key={index}>
                            <TableCell>{result.row}</TableCell>
                            <TableCell>{result.recipe_code}</TableCell>
                            <TableCell>
                              {result.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                              {result.status === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                              {result.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                            </TableCell>
                            <TableCell>{result.message}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Import-Fortschritt */}
              {importing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Import läuft...</span>
                    <span>{Math.round(importProgress)}%</span>
                  </div>
                  <Progress value={importProgress} />
                </div>
              )}

              {/* Import-Button */}
              {previewData.length > 0 && !importing && (
                <div className="flex justify-end">
                  <Button
                    onClick={executeImport}
                    disabled={importResults.some(r => r.status === 'error')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {previewData.length} Rezepturen importieren
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rezepturen exportieren</CardTitle>
              <CardDescription>
                Exportieren Sie alle Rezepturen in verschiedenen Formaten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Der Export enthält alle Rezepturen Ihres Mandanten mit allen EN13813-relevanten Feldern.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:border-blue-500" onClick={() => handleExport('xlsx')}>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <FileSpreadsheet className="h-8 w-8 mb-2 text-green-600" />
                    <p className="font-semibold">Excel</p>
                    <p className="text-sm text-gray-600">.xlsx</p>
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleExport('xlsx')
                      }}
                      disabled={exporting}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:border-blue-500" onClick={() => handleExport('csv')}>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <FileText className="h-8 w-8 mb-2 text-blue-600" />
                    <p className="font-semibold">CSV</p>
                    <p className="text-sm text-gray-600">.csv</p>
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleExport('csv')
                      }}
                      disabled={exporting}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:border-blue-500" onClick={() => handleExport('json')}>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <FileText className="h-8 w-8 mb-2 text-purple-600" />
                    <p className="font-semibold">JSON</p>
                    <p className="text-sm text-gray-600">.json</p>
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleExport('json')
                      }}
                      disabled={exporting}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}