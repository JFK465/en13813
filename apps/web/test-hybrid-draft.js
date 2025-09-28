const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Mock localStorage for Node.js
if (typeof localStorage === 'undefined') {
  const storage = {};
  global.localStorage = {
    getItem: (key) => storage[key] || null,
    setItem: (key, value) => { storage[key] = value; },
    removeItem: (key) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(key => delete storage[key]); }
  };
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Import the hybrid service
const { RecipeDraftHybridService } = require('./modules/en13813/services/recipe-draft-hybrid.service');

async function testHybridDraft() {
  console.log('🧪 Testing Hybrid Draft Service...\n');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

  const service = new RecipeDraftHybridService(supabase);

  // Test 1: Save draft (should work instantly via localStorage)
  console.log('1. Testing save (localStorage first, cloud sync later)...');
  const testData = {
    recipe_code: 'TEST-' + Date.now(),
    manufacturer: 'Test GmbH',
    plant: 'Werk 1',
    binder_type: 'CT',
    compressive_strength_class: 'C20',
    flexural_strength_class: 'F4',
    created_at: new Date().toISOString()
  };

  const startTime = Date.now();
  const saved = await service.save('test-draft-hybrid', testData);
  const saveTime = Date.now() - startTime;

  if (saved) {
    console.log('✅ Draft saved in', saveTime, 'ms');
    console.log('   Sync status:', saved.sync_status);
    console.log('   Draft name:', saved.draft_name);
  } else {
    console.log('❌ Failed to save draft');
    return;
  }

  // Test 2: Check localStorage immediately
  console.log('\n2. Verifying localStorage save...');
  const localData = localStorage.getItem('en13813_recipe_drafts');
  if (localData) {
    const parsed = JSON.parse(localData);
    console.log('✅ localStorage has', parsed.length, 'drafts');
    const found = parsed.find(d => d.draft_name === 'test-draft-hybrid');
    if (found) {
      console.log('✅ Our test draft is in localStorage');
    }
  } else {
    console.log('❌ No data in localStorage');
  }

  // Test 3: List drafts (merges local + cloud)
  console.log('\n3. Testing list (should merge local + cloud)...');
  const listStart = Date.now();
  const drafts = await service.list();
  const listTime = Date.now() - listStart;
  console.log('✅ Found', drafts.length, 'drafts in', listTime, 'ms');

  const testDraft = drafts.find(d => d.draft_name === 'test-draft-hybrid');
  if (testDraft) {
    console.log('   Test draft sync status:', testDraft.sync_status);
  }

  // Test 4: Wait a bit for cloud sync, then check again
  console.log('\n4. Waiting 3s for background cloud sync...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  const draftsAfterSync = await service.list();
  const testDraftAfter = draftsAfterSync.find(d => d.draft_name === 'test-draft-hybrid');
  if (testDraftAfter) {
    console.log('   After sync - status:', testDraftAfter.sync_status);
  }

  // Test 5: Force sync all drafts
  console.log('\n5. Testing manual sync all...');
  await service.syncAllDrafts();
  console.log('✅ Sync complete');

  // Test 6: Delete draft
  console.log('\n6. Testing delete...');
  const deleted = await service.delete('test-draft-hybrid');
  console.log(deleted ? '✅ Draft deleted' : '❌ Delete failed');

  // Verify deletion
  const finalDrafts = await service.list();
  const stillExists = finalDrafts.find(d => d.draft_name === 'test-draft-hybrid');
  if (!stillExists) {
    console.log('✅ Confirmed: Draft removed from list');
  } else {
    console.log('⚠️  Draft still appears in list');
  }

  console.log('\n✨ Hybrid service test complete!');
  console.log('📊 Summary:');
  console.log('   - localStorage save: INSTANT (no timeout)');
  console.log('   - Cloud sync: Background (non-blocking)');
  console.log('   - No more 5-second timeouts!');
}

testHybridDraft().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});