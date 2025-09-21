'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CSVImportService } from '@/modules/en13813/services/csv-import.service'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/components/ui/use-toast'
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react'
import Link from 'next/link'

export default function ImportRecipesPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const [csvContent, setCsvContent] = useState<string>('')
  
  const router = useRouter()
  const supabase = createClientComponentClient()
  const importService = new CSVImportService(supabase)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Fehler',
        description: 'Bitte wählen Sie eine CSV-Datei aus',
        variant: 'destructive'
      })
      return
    }

    setFile(selectedFile)
    setImportResult(null)

    // Read file content
    const reader = new FileReader()
    reader.onload = (event) => {
      setCsvContent(event.target?.result as string)
    }
    reader.readAsText(selectedFile)
  }

  async function handleImport() {
    if (!csvContent) return

    setImporting(true)
    try {
      const result = await importService.importRecipesFromCSV(csvContent)
      setImportResult(result)

      if (result.success > 0) {
        toast({
          title: 'Import erfolgreich',
          description: `${result.success} Rezepturen wurden importiert`
        })
      }

      if (result.errors.length > 0) {
        toast({
          title: 'Import teilweise fehlgeschlagen',
          description: `${result.errors.length} Fehler beim Import`,
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Import fehlgeschlagen',
        description: error.message || 'Ein unbekannter Fehler ist aufgetreten',
        variant: 'destructive'
      })
    } finally {
      setImporting(false)
    }
  }

  function downloadTemplate() {
    const template = importService.generateRecipeTemplate()
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rezepturen_vorlage.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: 'Vorlage heruntergeladen',
      description: 'Die CSV-Vorlage wurde heruntergeladen'
    })
  }

  const getProgress = () => {
    if (!importResult) return 0
    const total = importResult.success + importResult.failed
    if (total === 0) return 0
    return (importResult.success / total) * 100
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/en13813/recipes" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Rezepturen importieren</h1>
          <p className="text-muted-foreground mt-1">
            Importieren Sie mehrere Rezepturen gleichzeitig aus einer CSV-Datei
          </p>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Anleitung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">So funktioniert der Import:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Laden Sie die CSV-Vorlage herunter</li>
                <li>Füllen Sie die Vorlage mit Ihren Rezepturdaten aus</li>
                <li>Speichern Sie die Datei im CSV-Format</li>
                <li>Laden Sie die ausgefüllte CSV-Datei hier hoch</li>
              </ol>
            </div>
            
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              CSV-Vorlage herunterladen
            </Button>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>CSV-Datei hochladen</CardTitle>
            <CardDescription>
              Wählen Sie die CSV-Datei mit Ihren Rezepturdaten aus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
                disabled={importing}
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer space-y-2"
              >
                <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Klicken Sie hier, um eine Datei auszuwählen
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Nur CSV-Dateien werden unterstützt
                  </p>
                </div>
              </label>
            </div>

            {file && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertTitle>Datei ausgewählt</AlertTitle>
                <AlertDescription>
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleImport} 
              disabled={!file || importing}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {importing ? 'Importiere...' : 'Import starten'}
            </Button>
          </CardContent>
        </Card>

        {/* Import Progress */}
        {importing && (
          <Card>
            <CardHeader>
              <CardTitle>Import läuft...</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={0} className="w-full animate-pulse" />
              <p className="text-sm text-muted-foreground mt-2">
                Bitte warten Sie, während die Rezepturen importiert werden...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Import Results */}
        {importResult && (
          <Card>
            <CardHeader>
              <CardTitle>Import-Ergebnis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Fortschritt</span>
                  <span className="text-sm text-muted-foreground">
                    {importResult.success} von {importResult.success + importResult.failed}
                  </span>
                </div>
                <Progress value={getProgress()} className="w-full" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle>Erfolgreich</AlertTitle>
                  <AlertDescription>
                    {importResult.success} Rezepturen importiert
                  </AlertDescription>
                </Alert>

                <Alert variant={importResult.failed > 0 ? "destructive" : "default"}>
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Fehlgeschlagen</AlertTitle>
                  <AlertDescription>
                    {importResult.failed} Rezepturen übersprungen
                  </AlertDescription>
                </Alert>
              </div>

              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Fehlerdetails:</h4>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {importResult.errors.map((error: any, index: number) => (
                      <Alert key={index} variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Zeile {error.row}</AlertTitle>
                        <AlertDescription>{error.error}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null)
                    setImportResult(null)
                    setCsvContent('')
                  }}
                >
                  Neuer Import
                </Button>
                <Button onClick={() => router.push('/en13813/recipes')}>
                  Zur Rezeptur-Übersicht
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}