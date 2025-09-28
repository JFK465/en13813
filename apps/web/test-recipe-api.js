// Test script for recipe API
async function testRecipeAPI() {
  console.log('🧪 Testing Recipe API...\n')

  const baseUrl = 'http://localhost:3001'

  // 1. First login
  console.log('1️⃣ Logging in...')
  const loginResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'geniusgoods465@gmail.com',
      password: 'Jonas1312',
      redirect: false,
      callbackUrl: '/en13813'
    }),
  })

  const cookies = loginResponse.headers.get('set-cookie')
  console.log('Login response:', loginResponse.status)

  // 2. Test minimal recipe data
  console.log('\n2️⃣ Testing minimal recipe data...')
  const minimalRecipe = {
    recipe_code: `TEST-${Date.now()}`,
    name: 'Test Recipe Minimal',
    binder_type: 'CT',
    compressive_strength_class: 'C25',
    flexural_strength_class: 'F4'
  }

  const minimalResponse = await fetch(`${baseUrl}/api/en13813/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies || ''
    },
    body: JSON.stringify(minimalRecipe),
  })

  const minimalResult = await minimalResponse.text()
  console.log('Minimal recipe response:', minimalResponse.status)
  console.log('Response body:', minimalResult)

  // 3. Test with missing required DB fields
  console.log('\n3️⃣ Testing with DB required fields...')
  const fullRecipe = {
    recipe_code: `TEST-FULL-${Date.now()}`,
    name: 'Test Recipe Full',
    binder_type: 'CT',
    compressive_strength_class: 'C25',
    flexural_strength_class: 'F4',
    product_name: 'Test Product',
    manufacturer_name: 'Test Manufacturer',
    manufacturer_address: 'Test Address 123'
  }

  const fullResponse = await fetch(`${baseUrl}/api/en13813/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies || ''
    },
    body: JSON.stringify(fullRecipe),
  })

  const fullResult = await fullResponse.text()
  console.log('Full recipe response:', fullResponse.status)
  console.log('Response body:', fullResult)
}

// Run the test
testRecipeAPI().catch(console.error)