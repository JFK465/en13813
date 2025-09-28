'use client'

import { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  Info,
  Flame,
  Droplets,
  Shield,
  Link,
  Thermometer,
  Timer,
  Gauge,
  TestTube,
  Package,
  AlertTriangle,
  Building,
  Factory
} from 'lucide-react'

// Helper für Zahleneingaben
const numOrUndef = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = parseFloat(e.target.value)
  return isNaN(val) ? undefined : val
}

interface AdvancedFieldsProps {
  form: UseFormReturn<any>
}

export default function RecipeFormAdvanced({ form }: AdvancedFieldsProps) {
  const watchedValues = form.watch()
  const type = watchedValues.type

  return (
    <div className="space-y-6">
      {/* === VERSCHLEISSWIDERSTAND === */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Gauge className="h-4 w-4" />
          Verschleißwiderstand
        </h3>

        {(type === 'CT' && watchedValues.intended_use?.wearing_surface && !watchedValues.intended_use?.with_flooring) && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              CT-Nutzschicht ohne Belag: Verschleißwiderstand ist Pflichtangabe
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="wear_resistance_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prüfverfahren</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen Sie eine Methode" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Keine Prüfung</SelectItem>
                  {type !== 'SR' && (
                    <SelectItem value="bohme">Böhme (EN 13892-3) - Klasse A</SelectItem>
                  )}
                  <SelectItem value="bca">BCA (EN 13892-4) - Klasse AR</SelectItem>
                  <SelectItem value="rolling_wheel">Rolling Wheel (EN 13892-5) - Klasse RWA</SelectItem>
                </SelectContent>
              </Select>
              {type === 'SR' && (
                <FormDescription>
                  Kunstharzestrich: Nur BCA (AR) oder Rolling Wheel (RWA) zulässig
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {watchedValues.wear_resistance_method && watchedValues.wear_resistance_method !== 'none' && (
          <FormField
            control={form.control}
            name="wear_resistance_class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verschleißklasse</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Klasse wählen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {watchedValues.wear_resistance_method === 'bohme' && (
                      <>
                        <SelectItem value="A50">A50 (≤ 50 cm³/50cm²)</SelectItem>
                        <SelectItem value="A22">A22 (≤ 22 cm³/50cm²)</SelectItem>
                        <SelectItem value="A15">A15 (≤ 15 cm³/50cm²)</SelectItem>
                        <SelectItem value="A12">A12 (≤ 12 cm³/50cm²)</SelectItem>
                        <SelectItem value="A9">A9 (≤ 9 cm³/50cm²)</SelectItem>
                        <SelectItem value="A6">A6 (≤ 6 cm³/50cm²)</SelectItem>
                        <SelectItem value="A3">A3 (≤ 3 cm³/50cm²)</SelectItem>
                        <SelectItem value="A1.5">A1.5 (≤ 1,5 cm³/50cm²)</SelectItem>
                      </>
                    )}
                    {watchedValues.wear_resistance_method === 'bca' && (
                      <>
                        <SelectItem value="AR0.5">AR0.5 (≤ 0,05 mm)</SelectItem>
                        <SelectItem value="AR1">AR1 (≤ 0,1 mm)</SelectItem>
                        <SelectItem value="AR2">AR2 (≤ 0,2 mm)</SelectItem>
                        <SelectItem value="AR4">AR4 (≤ 0,4 mm)</SelectItem>
                        <SelectItem value="AR6">AR6 (≤ 0,6 mm)</SelectItem>
                      </>
                    )}
                    {watchedValues.wear_resistance_method === 'rolling_wheel' && (
                      <>
                        <SelectItem value="RWFC300">RWFC300 (≤ 300 mm³)</SelectItem>
                        <SelectItem value="RWFC450">RWFC450 (≤ 450 mm³)</SelectItem>
                        <SelectItem value="RWFC550">RWFC550 (≤ 550 mm³)</SelectItem>
                        <SelectItem value="RWFC750">RWFC750 (≤ 750 mm³)</SelectItem>
                        <SelectItem value="RWFC1000">RWFC1000 (≤ 1000 mm³)</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <Separator />

      {/* === OBERFLÄCHENHÄRTE === */}
      {['CT', 'CA', 'MA'].includes(type) && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Oberflächenhärte
          </h3>

          {type === 'MA' && watchedValues.intended_use?.wearing_surface && !watchedValues.intended_use?.with_flooring && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                MA-Nutzschicht ohne Belag: Oberflächenhärte (SH) ist Pflichtangabe
              </AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="surface_hardness_class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SH-Klasse</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NPD">NPD - No Performance Determined</SelectItem>
                    <SelectItem value="SH200">SH200 (≥ 200 N/mm²)</SelectItem>
                    <SelectItem value="SH150">SH150 (≥ 150 N/mm²)</SelectItem>
                    <SelectItem value="SH125">SH125 (≥ 125 N/mm²)</SelectItem>
                    <SelectItem value="SH100">SH100 (≥ 100 N/mm²)</SelectItem>
                    <SelectItem value="SH75">SH75 (≥ 75 N/mm²)</SelectItem>
                    <SelectItem value="SH50">SH50 (≥ 50 N/mm²)</SelectItem>
                    <SelectItem value="SH40">SH40 (≥ 40 N/mm²)</SelectItem>
                    <SelectItem value="SH30">SH30 (≥ 30 N/mm²)</SelectItem>
                    <SelectItem value="SH20">SH20 (≥ 20 N/mm²)</SelectItem>
                    <SelectItem value="SH10">SH10 (≥ 10 N/mm²)</SelectItem>
                    <SelectItem value="SH5">SH5 (≥ 5 N/mm²)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Nach EN 13892-6
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      <Separator />

      {/* === RWFC (MIT BODENBELAG) === */}
      {watchedValues.intended_use?.with_flooring && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4" />
            RWFC - Rollbeanspruchung unter Bodenbelag
          </h3>

          <FormField
            control={form.control}
            name="rwfc_class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RWFC-Klasse</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NPD">NPD - No Performance Determined</SelectItem>
                    <SelectItem value="RWFC10">RWFC10</SelectItem>
                    <SelectItem value="RWFC15">RWFC15</SelectItem>
                    <SelectItem value="RWFC20">RWFC20</SelectItem>
                    <SelectItem value="RWFC25">RWFC25</SelectItem>
                    <SelectItem value="RWFC30">RWFC30</SelectItem>
                    <SelectItem value="RWFC40">RWFC40</SelectItem>
                    <SelectItem value="RWFC50">RWFC50</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Nach EN 13892-7 (für Estriche mit Bodenbelag)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      <Separator />

      {/* === VERWENDUNGSZWECK === */}
      <Card>
        <CardHeader>
          <CardTitle>Verwendungszweck</CardTitle>
          <CardDescription>
            Definiert die Anwendungsbereiche der Rezeptur
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="intended_use.wearing_surface"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Nutzschicht
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="intended_use.with_flooring"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Mit Bodenbelag
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="intended_use.heated_screed"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Heizestrich
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="intended_use.industrial_use"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Industriebereich
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="intended_use.wet_areas"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Nassbereich
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="intended_use.outdoor_use"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Außenbereich
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="intended_use.chemical_resistance"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Chemikalienbeständig
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* === MATERIALZUSAMMENSETZUNG === */}
      <Card>
        <CardHeader>
          <CardTitle>Materialzusammensetzung</CardTitle>
          <CardDescription>
            Bindemittel, Zuschläge und Wassergehalt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bindemittel */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Bindemittel</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="materials.binder_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bindemittelart</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. CEM I 42,5 R" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="materials.binder_designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bezeichnung</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Portlandzement" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="materials.binder_amount_kg_m3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Menge (kg/m³)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="z.B. 350"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="materials.binder_supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieferant</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. HeidelbergCement" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="materials.binder_certificate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zertifikat-Nr.</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. CE-0123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Zuschläge */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Zuschläge</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="materials.aggregate_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zuschlagart</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Quarzsand" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="materials.aggregate_designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bezeichnung</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Sand 0/4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="materials.aggregate_max_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Größtkorn (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="z.B. 8"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="materials.aggregate_amount_kg_m3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Menge (kg/m³)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="z.B. 1800"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="materials.aggregate_bulk_density"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rohdichte (kg/m³)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="z.B. 2650"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="materials.aggregate_moisture_content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eigenfeuchte (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="z.B. 2.5"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Wasser */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Wasser</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="materials.water_content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wassermenge (l/m³)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="z.B. 175"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="materials.water_binder_ratio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>W/B-Wert</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Automatisch berechnet"
                        {...field}
                        readOnly
                      />
                    </FormControl>
                    <FormDescription>
                      Automatisch berechnet
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="materials.water_quality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wasserqualität</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="drinking">Trinkwasser</SelectItem>
                        <SelectItem value="process">Brauchwasser</SelectItem>
                        <SelectItem value="recycled">Recyclingwasser</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === MISCHVORSCHRIFT === */}
      <Card>
        <CardHeader>
          <CardTitle>Mischvorschrift</CardTitle>
          <CardDescription>
            Parameter für den Mischprozess
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="mixing_procedure.sequence"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mischfolge</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="z.B. 1. Trockenmischung 30s, 2. Wasserzugabe, 3. Nachmischung 90s"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="mixing_procedure.mixer_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mischertyp</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="forced">Zwangsmischer</SelectItem>
                      <SelectItem value="free_fall">Freifallmischer</SelectItem>
                      <SelectItem value="continuous">Kontinuierlichmischer</SelectItem>
                      <SelectItem value="planetary">Planetenmischer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mixing_procedure.batch_size_liters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chargengröße (Liter)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="z.B. 250"
                      {...field}
                      onChange={(e) => field.onChange(numOrUndef(e))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mixing_procedure.mixing_time_dry_seconds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trockenmischzeit (s)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="z.B. 30"
                      {...field}
                      onChange={(e) => field.onChange(numOrUndef(e))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mixing_procedure.mixing_time_wet_seconds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nassmischzeit (s)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="z.B. 90"
                      {...field}
                      onChange={(e) => field.onChange(numOrUndef(e))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mixing_procedure.mixing_speed_rpm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Drehzahl (U/min)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="z.B. 140"
                      {...field}
                      onChange={(e) => field.onChange(numOrUndef(e))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* === FRISCHMÖRTEL === */}
      <Card>
        <CardHeader>
          <CardTitle>Frischmörteleigenschaften</CardTitle>
          <CardDescription>
            Konsistenz, Verarbeitungszeit und Erstarrungszeit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fresh_mortar.consistency_target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konsistenz-Sollwert</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. F4, steif, plastisch" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fresh_mortar.consistency_tolerance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konsistenz-Toleranz</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. ±10 mm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fresh_mortar.processing_time_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verarbeitungszeit (min)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="z.B. 45"
                      {...field}
                      onChange={(e) => field.onChange(numOrUndef(e))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fresh_mortar.setting_time_initial_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Erstarrungsbeginn (min)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="z.B. 180"
                      {...field}
                      onChange={(e) => field.onChange(numOrUndef(e))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fresh_mortar.setting_time_final_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Erstarrungsende (min)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="z.B. 360"
                      {...field}
                      onChange={(e) => field.onChange(numOrUndef(e))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fresh_mortar.setting_time_norm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prüfnorm Erstarrung</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EN196-3">EN 196-3 (Vicat)</SelectItem>
                      <SelectItem value="EN13454-2">EN 13454-2 (CA)</SelectItem>
                      <SelectItem value="EN480-2">EN 480-2</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === 'CA' && (
              <FormField
                control={form.control}
                name="fresh_mortar.ph_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>pH-Wert*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="14"
                        step="0.1"
                        placeholder="≥ 7 für CA"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormDescription>
                      Muss bei CA ≥ 7 sein (EN 13813)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="fresh_mortar.temperature_min_celsius"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min. Verarbeitungstemp. (°C)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="z.B. 5"
                      {...field}
                      onChange={(e) => field.onChange(numOrUndef(e))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fresh_mortar.temperature_max_celsius"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max. Verarbeitungstemp. (°C)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="z.B. 30"
                      {...field}
                      onChange={(e) => field.onChange(numOrUndef(e))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* === VERARBEITUNG === */}
      <Card>
        <CardHeader>
          <CardTitle>Verarbeitung</CardTitle>
          <CardDescription>
            Schichtdicken und Einbauparameter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="processing.layer_thickness_min_mm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min. Schichtdicke (mm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="z.B. 35"
                      {...field}
                      onChange={(e) => field.onChange(numOrUndef(e))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="processing.layer_thickness_max_mm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max. Schichtdicke (mm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="z.B. 80"
                      {...field}
                      onChange={(e) => field.onChange(numOrUndef(e))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* === ERWEITERTE EIGENSCHAFTEN === */}
      <Card>
        <CardHeader>
          <CardTitle>Erweiterte Eigenschaften</CardTitle>
          <CardDescription>
            Zusätzliche mechanische und physikalische Eigenschaften
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="extended_properties.elastic_modulus_class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-Modul Klasse</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NPD">NPD - No Performance Determined</SelectItem>
                      <SelectItem value="E1">E1 (≥ 1 GPa)</SelectItem>
                      <SelectItem value="E5">E5 (≥ 5 GPa)</SelectItem>
                      <SelectItem value="E10">E10 (≥ 10 GPa)</SelectItem>
                      <SelectItem value="E15">E15 (≥ 15 GPa)</SelectItem>
                      <SelectItem value="E20">E20 (≥ 20 GPa)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="extended_properties.shrinkage_mm_m"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schwindmaß (mm/m)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="z.B. 0.5"
                      {...field}
                      onChange={(e) => field.onChange(numOrUndef(e))}
                    />
                  </FormControl>
                  <FormDescription>
                    Nach 28 Tagen
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedValues.intended_use?.heated_screed && (
              <FormField
                control={form.control}
                name="extended_properties.thermal_conductivity_w_mk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wärmeleitfähigkeit λ (W/mK)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="z.B. 1.4"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormDescription>
                      Wichtig für Heizestriche
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="extended_properties.chemical_resistance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chemikalienbeständigkeit</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="z.B. Beständig gegen verdünnte Säuren, Laugen..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* === BRANDVERHALTEN === */}
      <Card>
        <CardHeader>
          <CardTitle>Brandverhalten</CardTitle>
          <CardDescription>
            Brandklasse nach EN 13501-1
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="fire_class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brandklasse</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="A1fl">A1fl - Nicht brennbar (ohne Prüfung bei CT/CA)</SelectItem>
                    <SelectItem value="A2fl">A2fl - Nicht brennbar</SelectItem>
                    <SelectItem value="Bfl">Bfl - Schwer entflammbar</SelectItem>
                    <SelectItem value="Cfl">Cfl - Schwer entflammbar</SelectItem>
                    <SelectItem value="Dfl">Dfl - Normal entflammbar</SelectItem>
                    <SelectItem value="Efl">Efl - Normal entflammbar</SelectItem>
                    <SelectItem value="Ffl">Ffl - Leicht entflammbar</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {type === 'CT' && 'CT meist A1fl ohne Prüfung'}
                  {type === 'SR' && 'SR je nach Harz Bfl bis Efl'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gefährliche Stoffe */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="extended_properties.dangerous_substances"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gefährliche Stoffe</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="z.B. Keine gefährlichen Stoffe gemäß EN 13813"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === 'SR' && (
              <>
                <FormField
                  control={form.control}
                  name="extended_properties.tvoc_emission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TVOC-Emission (µg/m³)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="z.B. 500"
                          {...field}
                          onChange={(e) => field.onChange(numOrUndef(e))}
                        />
                      </FormControl>
                      <FormDescription>
                        Nach 28 Tagen (AgBB-Schema)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="extended_properties.formaldehyde_emission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formaldehyd-Emission (ppm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.001"
                          placeholder="z.B. 0.05"
                          {...field}
                          onChange={(e) => field.onChange(numOrUndef(e))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* === QUALITÄTSKONTROLLE === */}
      <Card>
        <CardHeader>
          <CardTitle>Qualitätskontrolle</CardTitle>
          <CardDescription>
            Kalibrierung und Toleranzen für die Produktion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="quality_control.calibration_scales"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Waagen kalibriert
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quality_control.calibration_mixers"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Mischer kalibriert
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quality_control.calibration_testing"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Prüfgeräte kalibriert
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="quality_control.tolerance_binder_percent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bindemittel-Toleranz (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="z.B. 2"
                      {...field}
                      onChange={(e) => field.onChange(numOrUndef(e))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quality_control.tolerance_water_percent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wasser-Toleranz (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="z.B. 3"
                      {...field}
                      onChange={(e) => field.onChange(numOrUndef(e))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quality_control.tolerance_temperature_celsius"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperatur-Toleranz (°C)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="z.B. 2"
                      {...field}
                      onChange={(e) => field.onChange(numOrUndef(e))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Abweichungsmanagement</h3>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="quality_control.deviation_minor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Geringfügige Abweichung</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Definition und Maßnahmen bei geringfügigen Abweichungen"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quality_control.deviation_major"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Erhebliche Abweichung</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Definition und Maßnahmen bei erheblichen Abweichungen"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quality_control.deviation_critical"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kritische Abweichung</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Definition und Maßnahmen bei kritischen Abweichungen"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === RÜCKVERFOLGBARKEIT === */}
      <Card>
        <CardHeader>
          <CardTitle>Rückverfolgbarkeit</CardTitle>
          <CardDescription>
            Dokumentation und Archivierung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="traceability.batch_linking_enabled"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Chargenverfolgung aktiviert
                </FormLabel>
              </FormItem>
            )}
          />

          {watchedValues.traceability?.batch_linking_enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="traceability.retention_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aufbewahrungsort</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Zentralarchiv" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="traceability.retention_duration_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aufbewahrungsdauer (Monate)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="z.B. 60"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormDescription>
                      EN 13813 empfiehlt 5 Jahre
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="traceability.retention_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rückstellmenge (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="z.B. 5"
                        {...field}
                        onChange={(e) => field.onChange(numOrUndef(e))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* === HERSTELLERINFORMATIONEN === */}
      <Card>
        <CardHeader>
          <CardTitle>Herstellerinformationen</CardTitle>
          <CardDescription>
            Für Konformitätserklärung und CE-Kennzeichnung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="manufacturer.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firmenname</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. EstrichWerke GmbH" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="manufacturer.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Industriestr. 1, 12345 Musterstadt" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="manufacturer.authorized_rep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bevollmächtigter</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Max Mustermann" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="manufacturer.signatory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unterzeichner DoP</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Dr. Ing. Schmidt" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}