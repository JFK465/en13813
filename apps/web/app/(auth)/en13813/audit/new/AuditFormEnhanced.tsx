'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { calculateAVCPSystem, getMandatoryProperties, KA_TABLE_12 } from '@/modules/en13813/types/audit.types';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface AuditFormEnhancedProps {
  form: any;
}

export function AuditFormEnhanced({ form }: AuditFormEnhancedProps) {
  const [calculatedAVCP, setCalculatedAVCP] = useState<'1' | '3' | '4'>('4');
  const [mandatoryProperties, setMandatoryProperties] = useState<string[][]>([]);
  const [conformityCheck, setConformityCheck] = useState<{ passed: boolean; message: string } | null>(null);

  const watchRfRegulated = form.watch('rf_regulated');
  const watchRfImprovement = form.watch('rf_improvement_stage');
  const watchDangerousSubstances = form.watch('dangerous_substances_regulated');
  const watchBinderTypes = form.watch('binder_types');
  const watchIntendedUse = form.watch('intended_use');
  const watchConformityMethod = form.watch('conformity_method');
  const watchSampleSize = form.watch('sample_size');
  const watchMeanValue = form.watch('mean_value');
  const watchStandardDeviation = form.watch('standard_deviation');

  // AVCP-System automatisch berechnen
  useEffect(() => {
    const avcp = calculateAVCPSystem(watchRfRegulated, watchRfImprovement, watchDangerousSubstances);
    setCalculatedAVCP(avcp);
    form.setValue('avcp_system', avcp);
  }, [watchRfRegulated, watchRfImprovement, watchDangerousSubstances, form]);

  // Pflichtmerkmale berechnen
  useEffect(() => {
    if (watchBinderTypes && watchIntendedUse) {
      const properties = watchBinderTypes.map((binder: string) =>
        getMandatoryProperties(binder as any, watchIntendedUse === 'wearing_layer')
      );
      setMandatoryProperties(properties);
    }
  }, [watchBinderTypes, watchIntendedUse]);

  // Konformitätsbewertung prüfen
  useEffect(() => {
    if (watchConformityMethod === 'variables' && watchSampleSize && watchMeanValue && watchStandardDeviation) {
      // kA aus Tabelle 12 holen
      let ka = KA_TABLE_12[watchSampleSize];
      if (!ka) {
        // Interpolation für Zwischenwerte
        const keys = Object.keys(KA_TABLE_12).map(Number).sort((a, b) => a - b);
        const lower = keys.filter(k => k <= watchSampleSize).pop() || keys[0];
        const upper = keys.find(k => k > watchSampleSize) || keys[keys.length - 1];
        ka = KA_TABLE_12[lower]; // Konservativ: niedrigeren kA-Wert nehmen
      }

      form.setValue('ka_value', ka);

      // Konformitätsprüfung: charakteristischer Wert = Mittelwert - kA * s
      const characteristicValue = watchMeanValue - ka * watchStandardDeviation;
      const declaredValue = watchMeanValue; // Vereinfacht: deklarierter Wert = Mittelwert
      const lowerLimit = declaredValue * 0.9; // -10% Grenze
      const upperLimit = declaredValue * 1.1; // +10% Grenze

      const passed = characteristicValue >= lowerLimit;
      setConformityCheck({
        passed,
        message: passed
          ? `✓ Konformität erfüllt: Charakteristischer Wert (${characteristicValue.toFixed(2)}) liegt innerhalb ±10% Grenze`
          : `✗ Konformität verletzt: Charakteristischer Wert (${characteristicValue.toFixed(2)}) unterschreitet -10% Grenze (${lowerLimit.toFixed(2)})`
      });
    }
  }, [watchConformityMethod, watchSampleSize, watchMeanValue, watchStandardDeviation, form]);

  return (
    <>
      {/* AVCP-System Berechnung */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AVCP-System (automatisch berechnet)</CardTitle>
          <CardDescription>
            Basierend auf regulatorischen Anforderungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="rf_regulated"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Reaktion auf Feuer reguliert</FormLabel>
                    <FormDescription className="text-xs">
                      Brandschutz-Anforderungen
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rf_improvement_stage"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                      disabled={!watchRfRegulated}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Verbesserungsstufe vorhanden</FormLabel>
                    <FormDescription className="text-xs">
                      z.B. Flammschutz-Additiv
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dangerous_substances_regulated"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Gefahrstoffe reguliert</FormLabel>
                    <FormDescription className="text-xs">
                      Am Einsatzort geregelt
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Berechnetes AVCP-System: {calculatedAVCP}</strong>
              {calculatedAVCP === '1' && ' - Zertifizierung durch notifizierte Stelle erforderlich'}
              {calculatedAVCP === '3' && ' - Erstprüfung durch notifizierte Stelle erforderlich'}
              {calculatedAVCP === '4' && ' - Herstellererklärung ausreichend'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Produktspezifische Pflichtmerkmale */}
      {mandatoryProperties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Normative Eigenschaften (Tabelle 1)</CardTitle>
            <CardDescription>
              Pflichtprüfungen basierend auf Bindemittel und Verwendung
            </CardDescription>
          </CardHeader>
          <CardContent>
            {watchBinderTypes?.map((binder: string, index: number) => (
              <div key={binder} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{binder}</Badge>
                  <span className="text-sm font-medium">
                    {watchIntendedUse === 'wearing_layer' ? 'Nutzschicht' : 'Keine Nutzschicht'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {mandatoryProperties[index]?.map((prop) => (
                    <Badge key={prop} variant="secondary" className="justify-start">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {prop}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ITT & Änderungen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ITT - Initial Type Testing</CardTitle>
          <CardDescription>
            Erstprüfungen gemäß EN 13813 Clause 5 & 6.2
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="itt_available"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>ITT vorhanden (inkl. Norm-Prüfmethoden)</FormLabel>
                  <FormDescription>
                    Alle normativen Eigenschaften geprüft
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="itt_after_change"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>ITT bei Material-/Prozessänderung erneut durchgeführt</FormLabel>
                  <FormDescription>
                    Re-ITT nach wesentlichen Änderungen
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Konformitätsbewertung */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Konformitätsbewertung (Clause 9)</CardTitle>
          <CardDescription>
            Stichprobenplan mit Pk = 10%, CR = 5%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="conformity_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bewertungsmethode</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen Sie die Methode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="variables">By variables (statistisch)</SelectItem>
                    <SelectItem value="attributes">By attributes (n ≥ 20 erforderlich)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchConformityMethod === 'variables' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="sample_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stichprobenumfang (n)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="3"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Min. 3 Proben</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mean_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mittelwert (x̄)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="standard_deviation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standardabweichung (s)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch('ka_value') && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>kA-Wert aus Tabelle 12: {form.watch('ka_value')}</strong>
                    <br />
                    Charakteristischer Wert = {watchMeanValue} - {form.watch('ka_value')} × {watchStandardDeviation} = {(watchMeanValue - form.watch('ka_value') * watchStandardDeviation).toFixed(2)}
                  </AlertDescription>
                </Alert>
              )}

              {conformityCheck && (
                <Alert variant={conformityCheck.passed ? "default" : "destructive"}>
                  {conformityCheck.passed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertDescription>{conformityCheck.message}</AlertDescription>
                </Alert>
              )}
            </>
          )}

          {watchConformityMethod === 'attributes' && watchSampleSize && watchSampleSize < 20 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Attributverfahren erfordert mindestens n = 20 Stichproben!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Designation & Marking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Designation & Marking (Clause 7-8)</CardTitle>
          <CardDescription>
            Bezeichnung und Kennzeichnung nach EN 13813
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Bezeichnungsformat:</strong>
              <ul className="mt-2 space-y-1">
                <li>• CT/CA/MA: "EN 13813 CT-C20-F4-AR1"</li>
                <li>• AS: "EN 13813 AS-IC10"</li>
                <li>• SR: "EN 13813 SR-B2,0-AR1-IR4"</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div>
            <h4 className="font-medium mb-2">9 Pflichtangaben für Kennzeichnung:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Bezeichnung (EN 13813 + Code)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Produktname</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Menge/Gewicht</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Herstelldatum/Haltbarkeit</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Batch-/Chargennummer</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Max. Korngröße oder Schichtdicke</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Misch-/Verarbeitungsanleitung</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span>H&S-Hinweise</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Herstelleradresse</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}