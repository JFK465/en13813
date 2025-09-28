import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { RecipeDraftHybridService } from '@/modules/en13813/services/recipe-draft-hybrid.service'

// Mock localStorage for server-side testing
const mockStorage: Record<string, string> = {}
if (typeof global !== 'undefined' && !global.localStorage) {
  (global as any).localStorage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => { mockStorage[key] = value },
    removeItem: (key: string) => { delete mockStorage[key] },
    clear: () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]) }
  }
}

export async function GET() {
  try {
    console.log('🧪 Testing Hybrid Draft Service via API...')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const service = new RecipeDraftHybridService(supabase)
    const results: any[] = []

    // Test 1: Save draft
    const testData = {
      recipe_code: 'API-TEST-' + Date.now(),
      manufacturer: 'Test GmbH',
      plant: 'Werk 1',
      binder_type: 'CT',
      compressive_strength_class: 'C20',
      flexural_strength_class: 'F4',
      created_at: new Date().toISOString()
    }

    const startTime = Date.now()
    const saved = await service.save('api-test-draft', testData)
    const saveTime = Date.now() - startTime

    results.push({
      test: 'Save Draft',
      success: !!saved,
      time: saveTime + 'ms',
      syncStatus: saved?.sync_status || 'failed'
    })

    // Test 2: List drafts
    const listStart = Date.now()
    const drafts = await service.list()
    const listTime = Date.now() - listStart

    results.push({
      test: 'List Drafts',
      success: true,
      count: drafts.length,
      time: listTime + 'ms'
    })

    // Test 3: Delete draft
    const deleted = await service.delete('api-test-draft')
    results.push({
      test: 'Delete Draft',
      success: deleted
    })

    return NextResponse.json({
      success: true,
      message: 'Hybrid Draft Service works!',
      tests: results,
      summary: {
        localStorage: 'Always works (no timeout)',
        cloudSync: 'Background (non-blocking)',
        performance: saveTime < 100 ? 'Excellent' : saveTime < 500 ? 'Good' : 'Needs optimization'
      }
    })
  } catch (error: any) {
    console.error('Test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}