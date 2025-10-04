import { SupabaseClient } from '@supabase/supabase-js'

export interface RecipeDraft {
  id?: string
  user_id?: string
  draft_name: string
  draft_data: any
  created_at?: string
  updated_at?: string
  sync_status?: 'local' | 'synced' | 'pending'
}

/**
 * Hybrid Draft Service
 *
 * Diese Lösung kombiniert localStorage (immer verfügbar) mit Cloud-Speicher (wenn Auth vorhanden).
 *
 * Features:
 * - Funktioniert IMMER, auch ohne Auth
 * - Synchronisiert automatisch mit Cloud wenn möglich
 * - Keine Timeouts mehr
 * - Robuste Fehlerbehandlung
 */
export class RecipeDraftHybridService {
  private localStorageKey = 'en13813_recipe_drafts'
  private syncTimeout: NodeJS.Timeout | null = null

  constructor(private supabase: SupabaseClient) {}

  /**
   * Speichert einen Entwurf (localStorage first, dann Cloud-Sync)
   */
  async save(draftName: string, draftData: any): Promise<RecipeDraft | null> {
    console.log('💾 Hybrid save:', draftName)

    // 1. IMMER zuerst in localStorage speichern (funktioniert immer!)
    const localDraft = this.saveToLocalStorage(draftName, draftData)

    if (!localDraft) {
      console.error('Failed to save to localStorage')
      return null
    }

    // 2. Versuche Cloud-Sync im Hintergrund (non-blocking)
    this.attemptCloudSync(localDraft).catch(error => {
      console.log('Cloud sync will be retried later:', error.message)
    })

    return localDraft
  }

  /**
   * Listet alle Entwürfe (kombiniert local + cloud)
   */
  async list(): Promise<RecipeDraft[]> {
    const localDrafts = this.getLocalDrafts()
    const cloudDrafts = await this.getCloudDrafts()

    // Merge drafts, prefer cloud version if exists
    const mergedMap = new Map<string, RecipeDraft>()

    // Add local drafts first
    localDrafts.forEach(draft => {
      mergedMap.set(draft.draft_name, { ...draft, sync_status: 'local' })
    })

    // Override with cloud drafts (newer)
    cloudDrafts.forEach(draft => {
      mergedMap.set(draft.draft_name, { ...draft, sync_status: 'synced' })
    })

    return Array.from(mergedMap.values())
      .sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at || 0).getTime()
        const dateB = new Date(b.updated_at || b.created_at || 0).getTime()
        return dateB - dateA // Newest first
      })
  }

  /**
   * Löscht einen Entwurf (lokal und cloud)
   */
  async delete(draftName: string): Promise<boolean> {
    // Delete from localStorage
    this.deleteFromLocalStorage(draftName)

    // Try to delete from cloud (non-blocking)
    this.deleteFromCloud(draftName).catch(error => {
      console.log('Cloud delete will be retried:', error.message)
    })

    return true
  }

  // ============ PRIVATE METHODS ============

  /**
   * Speichert in localStorage (funktioniert IMMER)
   */
  private saveToLocalStorage(draftName: string, draftData: any): RecipeDraft {
    try {
      const drafts = this.getLocalDrafts()
      const existingIndex = drafts.findIndex(d => d.draft_name === draftName)

      const draft: RecipeDraft = {
        id: crypto.randomUUID(),
        draft_name: draftName,
        draft_data: draftData,
        created_at: existingIndex >= 0 ? drafts[existingIndex].created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: 'local'
      }

      if (existingIndex >= 0) {
        drafts[existingIndex] = draft
      } else {
        drafts.push(draft)
      }

      localStorage.setItem(this.localStorageKey, JSON.stringify(drafts))
      console.log('✅ Saved to localStorage')
      return draft
    } catch (error) {
      console.error('localStorage save failed:', error)
      throw error
    }
  }

  /**
   * Holt alle lokalen Entwürfe
   */
  private getLocalDrafts(): RecipeDraft[] {
    try {
      const stored = localStorage.getItem(this.localStorageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to parse local drafts:', error)
      return []
    }
  }

  /**
   * Löscht aus localStorage
   */
  private deleteFromLocalStorage(draftName: string): void {
    const drafts = this.getLocalDrafts()
    const filtered = drafts.filter(d => d.draft_name !== draftName)
    localStorage.setItem(this.localStorageKey, JSON.stringify(filtered))
  }

  /**
   * Versucht Cloud-Sync (komplett non-blocking, keine Auth-Waits!)
   */
  private async attemptCloudSync(draft: RecipeDraft): Promise<void> {
    // WICHTIG: Niemals auf Auth warten - immer async!
    this.supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        console.log('No auth, skipping cloud sync')
        return
      }

      // Nur wenn User vorhanden, versuche Cloud-Sync
      this.performCloudSync(user.id, draft).catch(error => {
        console.log('Cloud sync will retry later:', error.message)
      })
    }).catch(() => {
      console.log('Auth check failed, working offline')
    })
  }

  /**
   * Führt den eigentlichen Cloud-Sync durch
   */
  private async performCloudSync(userId: string, draft: RecipeDraft): Promise<void> {
    try {

      // Save to cloud with timeout protection
      const savePromise = this.supabase
        .from('en13813_recipe_drafts')
        .upsert({
          user_id: userId,
          draft_name: draft.draft_name,
          draft_data: draft.draft_data,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,draft_name'
        })
        .select()
        .single()

      const saveTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Save timeout')), 2000)
      )

      await Promise.race([savePromise, saveTimeout])
      console.log('✅ Synced to cloud')

      // Update local draft status
      const drafts = this.getLocalDrafts()
      const index = drafts.findIndex(d => d.draft_name === draft.draft_name)
      if (index >= 0) {
        drafts[index].sync_status = 'synced'
        localStorage.setItem(this.localStorageKey, JSON.stringify(drafts))
      }
    } catch (error: any) {
      console.log('Cloud sync failed (will work offline):', error.message)
      // This is OK - we work offline
    }
  }

  /**
   * Holt Cloud-Entwürfe (ohne Auth-Wait!)
   */
  private async getCloudDrafts(): Promise<RecipeDraft[]> {
    // Direkt empty array zurückgeben wenn kein User
    // Auth-Check läuft parallel, blockiert aber nicht
    return new Promise((resolve) => {
      // Set timeout first - garantiert dass wir nicht hängen
      const timeoutId = setTimeout(() => {
        console.log('Cloud fetch skipped (timeout)')
        resolve([])
      }, 500) // Sehr kurzes Timeout!

      // Versuche User zu bekommen (non-blocking)
      this.supabase.auth.getUser()
        .then(({ data: { user } }) => {
          if (!user) {
            clearTimeout(timeoutId)
            resolve([])
            return Promise.resolve()
          }

          // Fetch cloud drafts
          return this.supabase
            .from('en13813_recipe_drafts')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .then(({ data }) => {
              clearTimeout(timeoutId)
              resolve(data || [])
            })
        })
        .catch(() => {
          clearTimeout(timeoutId)
          resolve([])
        })
    })
  }

  /**
   * Löscht aus Cloud (fire-and-forget)
   */
  private async deleteFromCloud(draftName: string): Promise<void> {
    // Non-blocking delete - fire and forget
    this.supabase.auth.getUser()
      .then(({ data: { user } }) => {
        if (!user) return Promise.resolve()

        return this.supabase
          .from('en13813_recipe_drafts')
          .delete()
          .eq('user_id', user.id)
          .eq('draft_name', draftName)
          .then(() => console.log('✅ Deleted from cloud'))
      })
      .catch(() => {
        console.log('Cloud delete failed (local delete successful)')
      })
  }

  /**
   * Synchronisiert alle lokalen Entwürfe mit der Cloud
   */
  async syncAllDrafts(): Promise<void> {
    const localDrafts = this.getLocalDrafts()
    const unsyncedDrafts = localDrafts.filter(d => d.sync_status !== 'synced')

    console.log(`📤 Syncing ${unsyncedDrafts.length} drafts to cloud...`)

    for (const draft of unsyncedDrafts) {
      await this.attemptCloudSync(draft)
    }
  }
}