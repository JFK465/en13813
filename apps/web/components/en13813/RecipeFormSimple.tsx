'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'

export function RecipeFormSimple() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast({
      title: "Rezeptur gespeichert",
      description: "Die Rezeptur wurde erfolgreich angelegt.",
    })

    router.push('/en13813/recipes')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grunddaten</CardTitle>
          <CardDescription>
            Basis-Informationen zur Rezeptur
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipe_code">Rezeptur-Code *</Label>
              <Input
                id="recipe_code"
                name="recipe_code"
                placeholder="z.B. TEST-001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Version *</Label>
              <Input
                id="version"
                name="version"
                defaultValue="1.0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Bezeichnung *</Label>
            <Input
              id="name"
              name="name"
              placeholder="z.B. Zementestrich CT-C25-F4"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Bindemitteltyp *</Label>
              <Select name="type" defaultValue="CT">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CT">CT - Zementestrich</SelectItem>
                  <SelectItem value="CA">CA - Calciumsulfatestrich</SelectItem>
                  <SelectItem value="MA">MA - Magnesiaestrich</SelectItem>
                  <SelectItem value="AS">AS - Gussasphaltestrich</SelectItem>
                  <SelectItem value="SR">SR - Kunstharzestrich</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" defaultValue="draft">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Entwurf</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="archived">Archiviert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mechanische Eigenschaften</CardTitle>
          <CardDescription>
            Festigkeitsklassen nach EN 13813
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="compressive_strength_class">Druckfestigkeitsklasse *</Label>
              <Select name="compressive_strength_class" defaultValue="C25">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C5">C5</SelectItem>
                  <SelectItem value="C7">C7</SelectItem>
                  <SelectItem value="C12">C12</SelectItem>
                  <SelectItem value="C16">C16</SelectItem>
                  <SelectItem value="C20">C20</SelectItem>
                  <SelectItem value="C25">C25</SelectItem>
                  <SelectItem value="C30">C30</SelectItem>
                  <SelectItem value="C35">C35</SelectItem>
                  <SelectItem value="C40">C40</SelectItem>
                  <SelectItem value="C50">C50</SelectItem>
                  <SelectItem value="C60">C60</SelectItem>
                  <SelectItem value="C70">C70</SelectItem>
                  <SelectItem value="C80">C80</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flexural_strength_class">Biegezugfestigkeitsklasse *</Label>
              <Select name="flexural_strength_class" defaultValue="F4">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="F1">F1</SelectItem>
                  <SelectItem value="F2">F2</SelectItem>
                  <SelectItem value="F3">F3</SelectItem>
                  <SelectItem value="F4">F4</SelectItem>
                  <SelectItem value="F5">F5</SelectItem>
                  <SelectItem value="F7">F7</SelectItem>
                  <SelectItem value="F10">F10</SelectItem>
                  <SelectItem value="F15">F15</SelectItem>
                  <SelectItem value="F20">F20</SelectItem>
                  <SelectItem value="F30">F30</SelectItem>
                  <SelectItem value="F40">F40</SelectItem>
                  <SelectItem value="F50">F50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avcp_system">AVCP System *</Label>
            <Select name="avcp_system" defaultValue="4">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">System 1</SelectItem>
                <SelectItem value="1+">System 1+</SelectItem>
                <SelectItem value="2+">System 2+</SelectItem>
                <SelectItem value="3">System 3</SelectItem>
                <SelectItem value="4">System 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Abbrechen
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Speichert..." : "Rezeptur speichern"}
        </Button>
      </div>
    </form>
  )
}