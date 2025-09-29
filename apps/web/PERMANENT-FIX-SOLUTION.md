# 🔧 Permanente Lösung für Loading-Probleme

## Problem-Analyse

### 1. **Root Causes:**
- Multiple Supabase Client Instanzen (`createClientComponentClient()` wird mehrfach aufgerufen)
- Keine Timeouts bei Datenbankabfragen
- Auth State nicht synchron zwischen Komponenten
- Queries hängen ohne Fehlerbehandlung

### 2. **Symptome:**
- "Multiple GoTrueClient instances detected"
- Ewiges Loading bei verschiedenen Seiten
- Session Timeouts
- Queries die nie zurückkommen

## 🚀 Permanente Lösung

### Solution 1: Singleton Supabase Client

```typescript
// lib/supabase/singleton-client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database.types'

let clientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function getSupabaseSingleton() {
  if (!clientInstance && typeof window !== 'undefined') {
    clientInstance = createClientComponentClient<Database>()
  }
  return clientInstance
}
```

### Solution 2: Query Wrapper mit Timeout

```typescript
// lib/supabase/query-with-timeout.ts
export async function queryWithTimeout<T>(
  queryFn: () => Promise<T>,
  timeoutMs: number = 10000,
  fallbackValue?: T
): Promise<T> {
  const timeoutPromise = new Promise<T>((_, reject) =>
    setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
  )

  try {
    return await Promise.race([queryFn(), timeoutPromise])
  } catch (error) {
    console.warn('Query timeout or error:', error)
    if (fallbackValue !== undefined) {
      return fallbackValue
    }
    throw error
  }
}
```

### Solution 3: Generischer Loading Hook

```typescript
// hooks/use-safe-loading.ts
import { useState, useCallback } from 'react'

export function useSafeLoading<T>(
  defaultValue: T,
  maxLoadingTime: number = 10000
) {
  const [data, setData] = useState<T>(defaultValue)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadData = useCallback(async (loader: () => Promise<T>) => {
    setLoading(true)
    setError(null)

    const timeoutId = setTimeout(() => {
      setLoading(false)
      setError(new Error('Loading timeout'))
    }, maxLoadingTime)

    try {
      const result = await loader()
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }, [maxLoadingTime])

  return { data, loading, error, loadData }
}
```

## 📝 Implementierung für lab-values

```typescript
// app/(auth)/en13813/lab-values/page.tsx
import { queryWithTimeout } from '@/lib/supabase/query-with-timeout'
import { getSupabaseSingleton } from '@/lib/supabase/singleton-client'
import { useSafeLoading } from '@/hooks/use-safe-loading'

export default function LabValuesPage() {
  const supabase = getSupabaseSingleton() // Singleton!
  const { data: labValues, loading, loadData } = useSafeLoading<LabValue[]>([])

  useEffect(() => {
    loadData(async () => {
      return await queryWithTimeout(async () => {
        const { data, error } = await supabase
          .from('en13813_lab_values')
          .select('*')

        if (error) throw error
        return data || []
      }, 10000, []) // 10s timeout, empty array fallback
    })
  }, [])

  // Kein ewiges Loading mehr!
  if (loading) {
    return <div>Lade Laborwerte... (max 10 Sekunden)</div>
  }

  // ...rest
}
```

## 🔨 Quick Fix (Sofort anwendbar)

### Für ALLE Seiten mit Loading-Problemen:

1. **Ersetze** `createClientComponentClient()` mit Singleton
2. **Wrappe** alle Queries in `queryWithTimeout()`
3. **Nutze** `useSafeLoading` Hook
4. **Setze** explizite Timeouts (10 Sekunden)

### Beispiel-Pattern:

```typescript
// VORHER (Problem):
const supabase = createClientComponentClient() // Multiple instances!
const { data } = await supabase.from('table').select('*') // Kann hängen!

// NACHHER (Gelöst):
const supabase = getSupabaseSingleton() // Eine Instanz!
const data = await queryWithTimeout(
  () => supabase.from('table').select('*'),
  10000,
  [] // Fallback
)
```

## ⚡ Sofort-Maßnahmen

### 1. Kritische Dateien die gefixt werden müssen:
- `/app/(auth)/en13813/lab-values/page.tsx`
- `/app/(auth)/en13813/audit/page.tsx`
- `/app/(auth)/en13813/batches/page.tsx`
- `/app/(auth)/en13813/test-reports/page.tsx`

### 2. Pattern für jeden Fix:
```typescript
const loadData = async () => {
  try {
    setLoading(true) // Start

    const result = await Promise.race([
      actualQuery(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 10000)
      )
    ])

    setData(result)
  } catch (error) {
    console.error('Load failed:', error)
    setData([]) // Fallback
  } finally {
    setLoading(false) // IMMER beenden!
  }
}
```

## 🎯 Langfristige Lösung

### 1. **Zentrale Query-Service**
```typescript
class QueryService {
  private static instance: QueryService
  private supabase: SupabaseClient

  static getInstance() {
    if (!this.instance) {
      this.instance = new QueryService()
    }
    return this.instance
  }

  async query<T>(table: string, options: QueryOptions): Promise<T> {
    // Zentrale Timeout-Logik
    // Zentrale Error-Behandlung
    // Zentrale Cache-Logik
  }
}
```

### 2. **React Query Integration**
```typescript
// Nutze TanStack Query für alle Datenbankabfragen
import { useQuery } from '@tanstack/react-query'

function useLabValues() {
  return useQuery({
    queryKey: ['lab-values'],
    queryFn: fetchLabValues,
    staleTime: 5 * 60 * 1000, // 5 Minuten
    retry: 2,
    retryDelay: 1000
  })
}
```

## ✅ Checkliste für permanente Lösung

- [ ] Singleton Supabase Client implementieren
- [ ] Query Timeout Wrapper erstellen
- [ ] Safe Loading Hook implementieren
- [ ] Alle Pages mit dem Pattern updaten
- [ ] React Query für Caching einführen
- [ ] Zentrale Error Boundary hinzufügen
- [ ] Loading States vereinheitlichen

## 🚨 Sofort-Fix für lab-values

```bash
# Diese Änderung sofort anwenden!
```

Die Änderung in der nächsten Nachricht...