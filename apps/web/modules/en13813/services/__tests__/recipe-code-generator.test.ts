import { describe, it, expect } from '@jest/globals'
import { generateRecipeCode } from '../recipe-code-generator'
import type { Recipe } from '../../types'

describe('Recipe Code Generator', () => {
  const baseRecipe: Partial<Recipe> = {
    binder_type: 'CT',
    compressive_strength_class: 'C25',
    flexural_strength_class: 'F4',
  }

  describe('Basis-Bezeichnung', () => {
    it('sollte korrekte Bezeichnung für CT-C25-F4 generieren', () => {
      const code = generateRecipeCode(baseRecipe as Recipe)
      expect(code).toBe('CT-C25-F4')
    })

    it('sollte alle Bindemitteltypen unterstützen', () => {
      const binderTypes = ['CT', 'CA', 'MA', 'AS', 'SR'] as const

      binderTypes.forEach(type => {
        const recipe = { ...baseRecipe, binder_type: type } as Recipe
        const code = generateRecipeCode(recipe)
        expect(code).toContain(type)
      })
    })
  })

  describe('Verschleißwiderstand', () => {
    it('sollte Böhme-Klasse (A) hinzufügen', () => {
      const recipe = {
        ...baseRecipe,
        wear_resistance_method: 'bohme',
        wear_resistance_class: 'A22',
      } as Recipe

      const code = generateRecipeCode(recipe)
      expect(code).toBe('CT-C25-F4-A22')
    })

    it('sollte BCA-Klasse (AR) hinzufügen', () => {
      const recipe = {
        ...baseRecipe,
        wear_resistance_method: 'bca',
        wear_resistance_class: 'AR6',
      } as Recipe

      const code = generateRecipeCode(recipe)
      expect(code).toBe('CT-C25-F4-AR6')
    })

    it('sollte Rollrad-Klasse (RWA) hinzufügen', () => {
      const recipe = {
        ...baseRecipe,
        wear_resistance_method: 'rolling_wheel',
        wear_resistance_class: 'RWA300',
      } as Recipe

      const code = generateRecipeCode(recipe)
      expect(code).toBe('CT-C25-F4-RWA300')
    })
  })

  describe('Spezielle Eigenschaften', () => {
    it('sollte Oberflächenhärte für MA hinzufügen', () => {
      const recipe = {
        binder_type: 'MA',
        compressive_strength_class: 'C30',
        flexural_strength_class: 'F5',
        surface_hardness_class: 'SH200',
      } as Recipe

      const code = generateRecipeCode(recipe)
      expect(code).toBe('MA-C30-F5-SH200')
    })

    it('sollte Haftfestigkeit für SR hinzufügen', () => {
      const recipe = {
        binder_type: 'SR',
        compressive_strength_class: 'C20',
        flexural_strength_class: 'F4',
        bond_strength_class: 'B2.0',
      } as Recipe

      const code = generateRecipeCode(recipe)
      expect(code).toBe('SR-C20-F4-B2.0')
    })

    it('sollte Brandschutzklasse hinzufügen wenn nicht A1fl', () => {
      const recipe = {
        ...baseRecipe,
        fire_class: 'Bfl-s1',
      } as Recipe

      const code = generateRecipeCode(recipe)
      expect(code).toBe('CT-C25-F4-Bfl-s1')
    })

    it('sollte A1fl Brandschutzklasse nicht hinzufügen', () => {
      const recipe = {
        ...baseRecipe,
        fire_class: 'A1fl',
      } as Recipe

      const code = generateRecipeCode(recipe)
      expect(code).toBe('CT-C25-F4')
    })
  })

  describe('Kombinierte Eigenschaften', () => {
    it('sollte alle Eigenschaften in korrekter Reihenfolge kombinieren', () => {
      const recipe = {
        binder_type: 'CT',
        compressive_strength_class: 'C35',
        flexural_strength_class: 'F7',
        wear_resistance_method: 'bohme',
        wear_resistance_class: 'A12',
        fire_class: 'Cfl-s1',
      } as Recipe

      const code = generateRecipeCode(recipe)
      expect(code).toBe('CT-C35-F7-A12-Cfl-s1')
    })
  })

  describe('Edge Cases', () => {
    it('sollte mit fehlenden optionalen Eigenschaften umgehen', () => {
      const recipe = {
        binder_type: 'CT',
        compressive_strength_class: 'C25',
        flexural_strength_class: 'F4',
        wear_resistance_class: undefined,
        fire_class: undefined,
      } as Recipe

      const code = generateRecipeCode(recipe)
      expect(code).toBe('CT-C25-F4')
    })

    it('sollte NPD-Werte ignorieren', () => {
      const recipe = {
        ...baseRecipe,
        fire_class: 'NPD',
        wear_resistance_class: 'NPD',
      } as Recipe

      const code = generateRecipeCode(recipe)
      expect(code).toBe('CT-C25-F4')
    })
  })
})