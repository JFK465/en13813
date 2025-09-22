'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft, Save } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { auditSchema, type AuditFormData } from '@/modules/en13813/schemas/audit.schema';
import { AuditService } from '@/modules/en13813/services/audit.service';
import { useCurrentTenant } from '@/hooks/use-current-tenant';
import { toast } from 'sonner';
import { AuditFormEnhanced } from './AuditFormEnhanced';

const auditService = new AuditService();

export default function NewAuditPage() {
  const router = useRouter();
  const { currentTenant } = useCurrentTenant();
  const [saving, setSaving] = useState(false);

  const form = useForm<AuditFormData>({
    resolver: zodResolver(auditSchema) as any,
    defaultValues: {
      audit_type: 'internal',
      status: 'planned',
      audit_date: new Date().toISOString().split('T')[0],
      auditor_name: '',
      audit_scope: '',

      // Erweiterte Felder
      binder_types: [],
      intended_use: 'non_wearing_layer',
      rf_regulated: false,
      rf_improvement_stage: false,
      dangerous_substances_regulated: false,
      avcp_system: '4',
      itt_available: false,
      itt_after_change: false,
      conformity_method: 'variables',

      // Audit-Ergebnisse
      nonconformities_count: 0,
      observations_count: 0,
      opportunities_count: 0,
      corrective_actions_required: false
    }
  });

  const onSubmit = async (data: AuditFormData) => {
    // Verwende Demo-Tenant-ID falls kein echter Tenant vorhanden
    const tenantId = currentTenant?.id || 'demo-tenant-id';

    try {
      setSaving(true);
      console.log('Creating audit with data:', data);

      const audit = await auditService.createAudit(data, tenantId);
      toast.success('Audit erfolgreich erstellt');
      router.push(`/en13813/audit/${audit.id}`);
    } catch (error) {
      console.error('Error creating audit:', error);
      toast.error('Fehler beim Erstellen des Audits');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Zurück
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Neues Audit erstellen</h1>
        <p className="text-muted-foreground mt-2">
          EN 13813 konformes Audit mit allen normativen Anforderungen
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
          {/* Basis-Informationen */}
          <Card>
            <CardHeader>
              <CardTitle>Audit-Grunddaten</CardTitle>
              <CardDescription>
                Allgemeine Informationen zum Audit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control as any}
                  name="audit_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audit-Typ</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wählen Sie den Audit-Typ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="internal">Internes Audit</SelectItem>
                          <SelectItem value="external">Externes Audit</SelectItem>
                          <SelectItem value="certification">Zertifizierungsaudit</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Art des durchzuführenden Audits
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="audit_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Audit-Datum</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), 'PPP', { locale: de })
                              ) : (
                                <span>Datum wählen</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                            initialFocus
                            locale={de}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Geplantes Datum für die Durchführung
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control as any}
                name="auditor_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Auditor</FormLabel>
                    <FormControl>
                      <Input placeholder="Name des Auditors" {...field} />
                    </FormControl>
                    <FormDescription>
                      Name der Person, die das Audit durchführt
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="audit_scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Audit-Umfang</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Beschreiben Sie den Umfang des Audits..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detaillierte Beschreibung des Audit-Umfangs und der zu prüfenden Bereiche
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="next_audit_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Nächstes Audit-Datum (optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), 'PPP', { locale: de })
                            ) : (
                              <span>Datum wählen</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                          initialFocus
                          locale={de}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Geplanter Termin für das Folgeaudit
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Produktspezifische Informationen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Produktspezifische Informationen</CardTitle>
              <CardDescription>
                Diese Angaben bestimmen die relevanten Prüfanforderungen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control as any}
                name="binder_types"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bindemitteltypen</FormLabel>
                    <FormDescription>
                      Wählen Sie alle relevanten Bindemitteltypen
                    </FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {['CT', 'CA', 'MA', 'AS', 'SR'].map((type) => (
                        <label key={type} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            value={type}
                            checked={field.value?.includes(type as any) || false}
                            onChange={(e) => {
                              const current = field.value || [];
                              if (e.target.checked) {
                                field.onChange([...current, type]);
                              } else {
                                field.onChange(current.filter((t: string) => t !== type));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm font-medium">
                            {type === 'CT' && 'CT - Zementestrich'}
                            {type === 'CA' && 'CA - Calciumsulfatestrich'}
                            {type === 'MA' && 'MA - Magnesiaestrich'}
                            {type === 'AS' && 'AS - Gussasphaltestrich'}
                            {type === 'SR' && 'SR - Reaktionsharzestrich'}
                          </span>
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="intended_use"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verwendungszweck</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen Sie den Verwendungszweck" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="wearing_layer">Nutzschicht</SelectItem>
                        <SelectItem value="non_wearing_layer">Keine Nutzschicht</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Bestimmt ob Verschleißprüfungen erforderlich sind
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Erweiterte EN 13813 Komponente */}
          <AuditFormEnhanced form={form} />

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Erstelle Audit...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Audit erstellen
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}