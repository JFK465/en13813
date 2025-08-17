'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { EN13813RecipeService } from '../services/recipe.service'
import { DoPGeneratorService } from '../services/dop-generator.service'
import type { Recipe, RecipeFilters, ValidationResult } from '../types'

export function useEN13813() {
  const queryClient = useQueryClient()
  const recipeService = new EN13813RecipeService()
  const dopService = new DoPGeneratorService()

  // Queries
  const recipesQuery = useQuery({
    queryKey: ['en13813', 'recipes'],
    queryFn: () => recipeService.list()
  })

  const searchRecipesQuery = (filters: RecipeFilters) => useQuery({
    queryKey: ['en13813', 'recipes', filters],
    queryFn: () => recipeService.searchRecipes(filters)
  })

  // Mutations
  const createRecipeMutation = useMutation({
    mutationFn: (recipe: Partial<Recipe>) => recipeService.createWithValidation(recipe),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['en13813', 'recipes'] })
    }
  })

  const updateRecipeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Recipe> }) => 
      recipeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['en13813', 'recipes'] })
    }
  })

  const deleteRecipeMutation = useMutation({
    mutationFn: (id: string) => recipeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['en13813', 'recipes'] })
    }
  })

  const generateDoPMutation = useMutation({
    mutationFn: ({ recipeId, batchId }: { recipeId: string; batchId?: string }) =>
      dopService.generateDoP(recipeId, batchId, { includeQR: true, includeCELabel: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['en13813', 'dops'] })
    }
  })

  const importRecipesMutation = useMutation({
    mutationFn: (file: File) => recipeService.importFromCSV(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['en13813', 'recipes'] })
    }
  })

  // Helper functions
  const validateRecipe = async (recipe: Partial<Recipe>): Promise<ValidationResult> => {
    return recipeService.validateRecipe(recipe)
  }

  const duplicateRecipe = async (recipeId: string, newName: string) => {
    return recipeService.duplicateRecipe(recipeId, newName)
  }

  return {
    // Data
    recipes: recipesQuery.data || [],
    isLoading: recipesQuery.isLoading,
    error: recipesQuery.error,

    // Actions
    createRecipe: createRecipeMutation.mutate,
    updateRecipe: updateRecipeMutation.mutate,
    deleteRecipe: deleteRecipeMutation.mutate,
    generateDoP: generateDoPMutation.mutate,
    importRecipes: importRecipesMutation.mutate,
    
    // Utils
    validateRecipe,
    duplicateRecipe,
    searchRecipes: searchRecipesQuery,

    // States
    isCreating: createRecipeMutation.isPending,
    isUpdating: updateRecipeMutation.isPending,
    isDeleting: deleteRecipeMutation.isPending,
    isGenerating: generateDoPMutation.isPending,
    isImporting: importRecipesMutation.isPending
  }
}

export function useRecipe(recipeId: string) {
  const recipeService = new EN13813RecipeService()

  return useQuery({
    queryKey: ['en13813', 'recipes', recipeId],
    queryFn: () => recipeService.findById(recipeId),
    enabled: !!recipeId
  })
}

export function useTestReports(recipeId: string) {
  const recipeService = new EN13813RecipeService()

  return useQuery({
    queryKey: ['en13813', 'test-reports', recipeId],
    queryFn: () => recipeService.getTestReports(recipeId),
    enabled: !!recipeId
  })
}