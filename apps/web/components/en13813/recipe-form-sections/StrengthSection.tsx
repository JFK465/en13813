'use client'

import { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface StrengthSectionProps {
  form: UseFormReturn<any>
}

export default function StrengthSection({ form }: StrengthSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="compressive_strength_class"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Druckfestigkeitsklasse *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Klasse wählen" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {['C5', 'C7', 'C12', 'C16', 'C20', 'C25', 'C30', 'C35', 'C40', 'C50', 'C60', 'C70', 'C80'].map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Druckfestigkeit nach 28 Tagen in N/mm²
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="flexural_strength_class"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biegezugfestigkeitsklasse *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Klasse wählen" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {['F1', 'F2', 'F3', 'F4', 'F5', 'F7', 'F10', 'F15', 'F20', 'F30', 'F40', 'F50'].map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Biegezugfestigkeit nach 28 Tagen in N/mm²
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Weitere Festigkeitseigenschaften können hier ergänzt werden */}
      <div className="rounded-lg border p-4 bg-muted/10">
        <p className="text-sm text-muted-foreground">
          Weitere Festigkeitseigenschaften wie Verschleißwiderstand, Oberflächenhärte etc.
          können bei Bedarf ergänzt werden.
        </p>
      </div>
    </div>
  )
}