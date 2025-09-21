'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  FileText, 
  Shield, 
  Bell, 
  Languages, 
  Palette,
  Database,
  Key,
  Users,
  Mail,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Download,
  Upload,
  Printer,
  Settings,
  Globe
} from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [companyData, setCompanyData] = useState({
    name: 'Muster GmbH',
    address: 'Musterstraße 1',
    zipCode: '12345',
    city: 'Musterstadt',
    country: 'Deutschland',
    vatId: 'DE123456789',
    phone: '+49 123 456789',
    email: 'info@muster-gmbh.de',
    website: 'www.muster-gmbh.de'
  })

  const [dopSettings, setDopSettings] = useState({
    language: 'de',
    includeQRCode: true,
    includeWatermark: false,
    autoNumbering: true,
    numberingPrefix: 'DOP',
    startNumber: 1001,
    signatureRequired: true,
    defaultSignatory: 'Max Mustermann',
    defaultPosition: 'Geschäftsführer'
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    testReportReminders: true,
    calibrationReminders: true,
    auditAlerts: true,
    dopExpiryAlerts: true,
    reminderDays: 30
  })

  const [systemSettings, setSystemSettings] = useState({
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'de-DE',
    measurementUnit: 'metric',
    decimalPlaces: 2,
    autoSave: true,
    autoSaveInterval: 5,
    darkMode: false,
    compactView: false
  })

  const handleSave = async () => {
    setSaving(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Einstellungen erfolgreich gespeichert', {
        description: 'Alle Änderungen wurden übernommen.'
      })
    } catch (error) {
      toast.error('Fehler beim Speichern', {
        description: 'Die Einstellungen konnten nicht gespeichert werden.'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Einstellungen</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihre EN 13813 Systemeinstellungen und Konfigurationen
        </p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company">Unternehmen</TabsTrigger>
          <TabsTrigger value="dop">Leistungserklärung</TabsTrigger>
          <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Unternehmensdaten
              </CardTitle>
              <CardDescription>
                Diese Informationen werden in Leistungserklärungen und Berichten verwendet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Firmenname</Label>
                  <Input 
                    id="company-name"
                    value={companyData.name}
                    onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vat-id">USt-IdNr.</Label>
                  <Input 
                    id="vat-id"
                    value={companyData.vatId}
                    onChange={(e) => setCompanyData({...companyData, vatId: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Straße und Hausnummer</Label>
                <Input 
                  id="address"
                  value={companyData.address}
                  onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip">PLZ</Label>
                  <Input 
                    id="zip"
                    value={companyData.zipCode}
                    onChange={(e) => setCompanyData({...companyData, zipCode: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Stadt</Label>
                  <Input 
                    id="city"
                    value={companyData.city}
                    onChange={(e) => setCompanyData({...companyData, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Land</Label>
                  <Input 
                    id="country"
                    value={companyData.country}
                    onChange={(e) => setCompanyData({...companyData, country: e.target.value})}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input 
                    id="phone"
                    type="tel"
                    value={companyData.phone}
                    onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={companyData.email}
                    onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website"
                  type="url"
                  value={companyData.website}
                  onChange={(e) => setCompanyData({...companyData, website: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Zertifizierungen
              </CardTitle>
              <CardDescription>
                Notified Body und Zertifizierungsinformationen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Notified Body</Label>
                  <Select defaultValue="0757">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0757">0757 - MPA NRW</SelectItem>
                      <SelectItem value="0762">0762 - VDZ</SelectItem>
                      <SelectItem value="0769">0769 - KIWA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>AVCP System</Label>
                  <Select defaultValue="4">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1+">System 1+</SelectItem>
                      <SelectItem value="3">System 3</SelectItem>
                      <SelectItem value="4">System 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">ISO 9001:2015 zertifiziert</span>
                </div>
                <Badge variant="secondary">Gültig bis 31.12.2025</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dop" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                DoP-Einstellungen
              </CardTitle>
              <CardDescription>
                Konfiguration für Leistungserklärungen nach EN 13813
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sprache</Label>
                  <Select 
                    value={dopSettings.language}
                    onValueChange={(value) => setDopSettings({...dopSettings, language: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="en">Englisch</SelectItem>
                      <SelectItem value="fr">Französisch</SelectItem>
                      <SelectItem value="it">Italienisch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Druckformat</Label>
                  <Select defaultValue="a4">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">DIN A4</SelectItem>
                      <SelectItem value="letter">US Letter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>QR-Code einbinden</Label>
                    <p className="text-sm text-muted-foreground">
                      Fügt einen QR-Code mit Link zur Online-DoP hinzu
                    </p>
                  </div>
                  <Switch 
                    checked={dopSettings.includeQRCode}
                    onCheckedChange={(checked) => setDopSettings({...dopSettings, includeQRCode: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Wasserzeichen</Label>
                    <p className="text-sm text-muted-foreground">
                      Fügt ein Firmen-Wasserzeichen im Hintergrund hinzu
                    </p>
                  </div>
                  <Switch 
                    checked={dopSettings.includeWatermark}
                    onCheckedChange={(checked) => setDopSettings({...dopSettings, includeWatermark: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatische Nummerierung</Label>
                    <p className="text-sm text-muted-foreground">
                      Vergibt automatisch fortlaufende DoP-Nummern
                    </p>
                  </div>
                  <Switch 
                    checked={dopSettings.autoNumbering}
                    onCheckedChange={(checked) => setDopSettings({...dopSettings, autoNumbering: checked})}
                  />
                </div>
              </div>

              {dopSettings.autoNumbering && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Präfix</Label>
                      <Input 
                        value={dopSettings.numberingPrefix}
                        onChange={(e) => setDopSettings({...dopSettings, numberingPrefix: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Startnummer</Label>
                      <Input 
                        type="number"
                        value={dopSettings.startNumber}
                        onChange={(e) => setDopSettings({...dopSettings, startNumber: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      Nächste DoP-Nummer: <span className="font-mono font-semibold">{dopSettings.numberingPrefix}-{dopSettings.startNumber + 42}</span>
                    </p>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Digitale Signatur erforderlich</Label>
                    <p className="text-sm text-muted-foreground">
                      DoPs müssen vor Veröffentlichung signiert werden
                    </p>
                  </div>
                  <Switch 
                    checked={dopSettings.signatureRequired}
                    onCheckedChange={(checked) => setDopSettings({...dopSettings, signatureRequired: checked})}
                  />
                </div>

                {dopSettings.signatureRequired && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Standardunterzeichner</Label>
                      <Input 
                        value={dopSettings.defaultSignatory}
                        onChange={(e) => setDopSettings({...dopSettings, defaultSignatory: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Input 
                        value={dopSettings.defaultPosition}
                        onChange={(e) => setDopSettings({...dopSettings, defaultPosition: e.target.value})}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Benachrichtigungseinstellungen
              </CardTitle>
              <CardDescription>
                Konfigurieren Sie, wann und wie Sie benachrichtigt werden möchten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>E-Mail-Benachrichtigungen</Label>
                  <p className="text-sm text-muted-foreground">
                    Wichtige Systembenachrichtigungen per E-Mail erhalten
                  </p>
                </div>
                <Switch 
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Erinnerungen</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Prüfberichte</Label>
                    <p className="text-sm text-muted-foreground">
                      Erinnerung an ausstehende Prüfberichte
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.testReportReminders}
                    onCheckedChange={(checked) => setNotifications({...notifications, testReportReminders: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Kalibrierungen</Label>
                    <p className="text-sm text-muted-foreground">
                      Erinnerung an fällige Gerätekalibrierungen
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.calibrationReminders}
                    onCheckedChange={(checked) => setNotifications({...notifications, calibrationReminders: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Audits</Label>
                    <p className="text-sm text-muted-foreground">
                      Benachrichtigung über anstehende Audits
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.auditAlerts}
                    onCheckedChange={(checked) => setNotifications({...notifications, auditAlerts: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>DoP-Ablauf</Label>
                    <p className="text-sm text-muted-foreground">
                      Warnung vor ablaufenden Leistungserklärungen
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.dopExpiryAlerts}
                    onCheckedChange={(checked) => setNotifications({...notifications, dopExpiryAlerts: checked})}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Vorlaufzeit für Erinnerungen</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    className="w-24"
                    value={notifications.reminderDays}
                    onChange={(e) => setNotifications({...notifications, reminderDays: parseInt(e.target.value)})}
                  />
                  <span className="text-sm text-muted-foreground">Tage im Voraus</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Benachrichtigungen werden an folgende Adresse gesendet:
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">{companyData.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Systemeinstellungen
              </CardTitle>
              <CardDescription>
                Allgemeine Systemkonfiguration und Anzeigeoptionen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Datumsformat</Label>
                  <Select 
                    value={systemSettings.dateFormat}
                    onValueChange={(value) => setSystemSettings({...systemSettings, dateFormat: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Zahlenformat</Label>
                  <Select 
                    value={systemSettings.numberFormat}
                    onValueChange={(value) => setSystemSettings({...systemSettings, numberFormat: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de-DE">1.234,56 (Deutsch)</SelectItem>
                      <SelectItem value="en-US">1,234.56 (English)</SelectItem>
                      <SelectItem value="fr-FR">1 234,56 (Français)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Maßeinheiten</Label>
                  <Select 
                    value={systemSettings.measurementUnit}
                    onValueChange={(value) => setSystemSettings({...systemSettings, measurementUnit: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metrisch (kg, m, °C)</SelectItem>
                      <SelectItem value="imperial">Imperial (lb, ft, °F)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dezimalstellen</Label>
                  <Select 
                    value={systemSettings.decimalPlaces.toString()}
                    onValueChange={(value) => setSystemSettings({...systemSettings, decimalPlaces: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatisches Speichern</Label>
                    <p className="text-sm text-muted-foreground">
                      Änderungen werden automatisch gespeichert
                    </p>
                  </div>
                  <Switch 
                    checked={systemSettings.autoSave}
                    onCheckedChange={(checked) => setSystemSettings({...systemSettings, autoSave: checked})}
                  />
                </div>

                {systemSettings.autoSave && (
                  <div className="space-y-2">
                    <Label>Speicherintervall</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number"
                        className="w-24"
                        value={systemSettings.autoSaveInterval}
                        onChange={(e) => setSystemSettings({...systemSettings, autoSaveInterval: parseInt(e.target.value)})}
                      />
                      <span className="text-sm text-muted-foreground">Minuten</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dunkler Modus</Label>
                    <p className="text-sm text-muted-foreground">
                      Dunkles Farbschema verwenden
                    </p>
                  </div>
                  <Switch 
                    checked={systemSettings.darkMode}
                    onCheckedChange={(checked) => setSystemSettings({...systemSettings, darkMode: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Kompakte Ansicht</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduzierte Abstände für mehr Inhalt
                    </p>
                  </div>
                  <Switch 
                    checked={systemSettings.compactView}
                    onCheckedChange={(checked) => setSystemSettings({...systemSettings, compactView: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Datenmanagement
              </CardTitle>
              <CardDescription>
                Exportieren und importieren Sie Ihre Daten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Daten exportieren
                </Button>
                <Button variant="outline" className="justify-start">
                  <Upload className="mr-2 h-4 w-4" />
                  Daten importieren
                </Button>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      Letztes Backup:
                    </p>
                    <p className="text-amber-700 dark:text-amber-300">
                      02.09.2025, 14:30 Uhr (vor 2 Stunden)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Normkonformität
              </CardTitle>
              <CardDescription>
                EN 13813:2002 Compliance-Einstellungen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-900 dark:text-green-100">
                      System ist vollständig konform
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Alle Anforderungen der EN 13813:2002 werden erfüllt
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Prüfintervalle</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">ITT (Initial Type Testing)</span>
                      <Badge>Einmalig</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">FPC (Factory Production Control)</span>
                      <Badge>Fortlaufend</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Audit-Intervall</span>
                      <Badge>Jährlich</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Erforderliche Prüfungen</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Druckfestigkeit',
                      'Biegezugfestigkeit', 
                      'Verschleißwiderstand',
                      'Oberflächenhärte',
                      'Haftfestigkeit',
                      'Schlagfestigkeit',
                      'Brandverhalten',
                      'pH-Wert'
                    ].map((test) => (
                      <div key={test} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{test}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Dokumentationsanforderungen</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Leistungserklärung (DoP)</span>
                      <Badge variant="destructive">Pflicht</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">CE-Kennzeichnung</span>
                      <Badge variant="destructive">Pflicht</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Technische Dokumentation</span>
                      <Badge variant="destructive">Pflicht</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">FPC-Dokumentation</span>
                      <Badge variant="destructive">Pflicht</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Normaktualisierungen</CardTitle>
              <CardDescription>
                Bleiben Sie über Änderungen der EN 13813 informiert
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">EN 13813:2002</p>
                      <p className="text-sm text-muted-foreground">Aktuelle Version</p>
                    </div>
                    <Badge variant="outline">Aktiv</Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4" />
                  <span>Automatische Prüfung auf Updates aktiviert</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 mt-8">
        <Button variant="outline">
          Abbrechen
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Speichern...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Einstellungen speichern
            </>
          )}
        </Button>
      </div>
    </div>
  )
}