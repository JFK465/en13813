import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database.types'

// Singleton pattern to prevent multiple Supabase client instances
let clientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function getSupabaseSingleton() {
  if (!clientInstance && typeof window !== 'undefined') {
    clientInstance = createClientComponentClient<Database>()
  }
  return clientInstance!
}