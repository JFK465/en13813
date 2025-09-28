import { SupabaseClient } from '@supabase/supabase-js'

export interface RecipeDraft {
  id?: string
  user_id?: string
  draft_name: string
  draft_data: any
  created_at?: string
  updated_at?: string
}

export class RecipeDraftService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Liste alle Entwürfe des aktuellen Users
   */
  async list(): Promise<RecipeDraft[]> {
    try {
      const { data, error } = await this.supabase
        .from('en13813_recipe_drafts')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error listing drafts:', error)
      return []
    }
  }

  /**
   * Speichere oder update einen Entwurf
   */
  async save(draftName: string, draftData: any): Promise<RecipeDraft | null> {
    try {
      console.log('💾 Attempting to save draft:', draftName)

      // Get current user with timeout protection
      let userId: string

      try {
        // Add timeout to auth check
        const authPromise = this.supabase.auth.getUser()
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth timeout')), 3000)
        )

        const { data: { user }, error: userError } = await Promise.race([
          authPromise,
          timeoutPromise
        ]).catch(() => ({ data: { user: null }, error: new Error('Auth failed') })) as any

        console.log('🔑 Auth check result:', { user: !!user, error: userError?.message })

        if (user?.id) {
          userId = user.id
          console.log('✅ Using authenticated user ID')
        } else {
          // Fallback for development - use a consistent dev user ID
          console.warn('No authenticated user, using development fallback')
          userId = 'dev-user-' + (typeof window !== 'undefined' ? window.location.hostname : 'unknown')
        }
      } catch (authError) {
        console.error('Auth check failed:', authError)
        // Use development fallback
        userId = 'dev-user-fallback'
      }

      console.log('🆔 Using userId:', userId)

      // Check if draft with same name exists with timeout
      console.log('🔍 Checking for existing draft...')

      const checkPromise = this.supabase
        .from('en13813_recipe_drafts')
        .select('id')
        .eq('draft_name', draftName)
        .eq('user_id', userId)
        .single()

      const timeoutPromise2 = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      )

      const { data: existing, error: checkError } = await Promise.race([
        checkPromise,
        timeoutPromise2
      ]).catch((err) => {
        console.error('Check failed:', err)
        return { data: null, error: err }
      }) as any

      console.log('📊 Existing draft check:', { existing: !!existing, error: (checkError as any)?.code })

      if (existing && (checkError as any)?.code !== 'PGRST116') { // PGRST116 = no rows returned
        // Update existing draft with timeout
        console.log('🔄 Updating existing draft...')

        const updatePromise = this.supabase
          .from('en13813_recipe_drafts')
          .update({
            draft_data: draftData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single()

        const timeoutPromiseUpdate = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Update timeout')), 5000)
        )

        const { data, error } = await Promise.race([
          updatePromise,
          timeoutPromiseUpdate
        ]).catch((err) => {
          console.error('Update failed:', err)
          return { data: null, error: err }
        }) as any

        if (error) {
          console.error('❌ Update error:', error)
          throw error
        }
        console.log('✅ Draft updated successfully')
        return data
      } else {
        // Create new draft with timeout
        console.log('➕ Creating new draft...')

        const insertPromise = this.supabase
          .from('en13813_recipe_drafts')
          .insert({
            user_id: userId,
            draft_name: draftName,
            draft_data: draftData
          })
          .select()
          .single()

        const timeoutPromise3 = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Insert timeout')), 5000)
        )

        const { data, error } = await Promise.race([
          insertPromise,
          timeoutPromise3
        ]).catch((err) => {
          console.error('Insert failed:', err)
          return { data: null, error: err }
        }) as any

        if (error) {
          console.error('❌ Insert error:', error)
          throw error
        }
        console.log('✅ Draft created successfully')
        return data
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      return null
    }
  }

  /**
   * Lade einen spezifischen Entwurf
   */
  async get(draftId: string): Promise<RecipeDraft | null> {
    try {
      const { data, error } = await this.supabase
        .from('en13813_recipe_drafts')
        .select('*')
        .eq('id', draftId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting draft:', error)
      return null
    }
  }

  /**
   * Lösche einen Entwurf
   */
  async delete(draftId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('en13813_recipe_drafts')
        .delete()
        .eq('id', draftId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting draft:', error)
      return false
    }
  }

  /**
   * Konvertiere einen Entwurf in ein finales Rezept
   */
  async convertToRecipe(draftId: string): Promise<boolean> {
    try {
      const draft = await this.get(draftId)
      if (!draft) return false

      // Create the recipe from draft data
      const { error: recipeError } = await this.supabase
        .from('en13813_recipes')
        .insert(draft.draft_data)

      if (recipeError) throw recipeError

      // Delete the draft after successful conversion
      await this.delete(draftId)
      return true
    } catch (error) {
      console.error('Error converting draft to recipe:', error)
      return false
    }
  }
}