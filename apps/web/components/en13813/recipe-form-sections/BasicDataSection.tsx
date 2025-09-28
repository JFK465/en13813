'use client'

import { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface BasicDataSectionProps {
  form: UseFormReturn<any>
}

export default function BasicDataSection({ form }: BasicDataSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="recipe_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rezeptur-Code *</FormLabel>
              <FormControl>
                <Input placeholder="z.B. CT-001-2024" {...field} />
              </FormControl>
              <FormDescription>
                Eindeutiger Code zur Identifikation
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="version"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Version *</FormLabel>
              <FormControl>
                <Input placeholder="1.0" {...field} />
              </FormControl>
              <FormDescription>
                Versionsnummer der Rezeptur
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bezeichnung *</FormLabel>
            <FormControl>
              <Input
                placeholder="z.B. Zementestrich CT-C25-F4 für Industrieböden"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Aussagekräftige Bezeichnung der Rezeptur
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bindemitteltyp *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Bindemittel wählen" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CT">CT - Zementestrich</SelectItem>
                  <SelectItem value="CA">CA - Calciumsulfatestrich</SelectItem>
                  <SelectItem value="MA">MA - Magnesiaestrich</SelectItem>
                  <SelectItem value="AS">AS - Gussasphaltestrich</SelectItem>
                  <SelectItem value="SR">SR - Kunstharzestrich</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Hauptbindemittel nach EN 13813
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Status wählen" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Entwurf</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="archived">Archiviert</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Aktueller Status der Rezeptur
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="avcp_system"
        render={({ field }) => (
          <FormItem>
            <FormLabel>AVCP System *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="AVCP System wählen" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="1">System 1</SelectItem>
                <SelectItem value="1+">System 1+</SelectItem>
                <SelectItem value="2+">System 2+</SelectItem>
                <SelectItem value="3">System 3</SelectItem>
                <SelectItem value="4">System 4</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              System zur Bewertung und Überprüfung der Leistungsbeständigkeit
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}