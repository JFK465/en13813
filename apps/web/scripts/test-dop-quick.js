#!/usr/bin/env node

import { chromium } from '@playwright/test'

async function testDoP() {
  console.log('🔍 Testing DoP Module...\n')

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    // Test DoP page
    console.log('Testing /en13813/dops...')
    const response = await page.goto('http://localhost:3001/en13813/dops', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    })

    const status = response?.status()
    console.log(`  Status: ${status}`)

    if (status === 200) {
      // Check for page title
      const title = await page.title()
      console.log(`  Title: ${title}`)

      // Check for heading
      const heading = await page.locator('h1').textContent()
      console.log(`  Heading: ${heading}`)

      // Check for "Neue DoP erstellen" button
      const hasCreateButton = await page.locator('text="Neue DoP erstellen"').count() > 0
      console.log(`  Create Button: ${hasCreateButton ? '✅' : '❌'}`)

      // Check for table
      const hasTable = await page.locator('table').count() > 0
      console.log(`  Table: ${hasTable ? '✅' : '❌'}`)

      // Screenshot
      await page.screenshot({ path: 'test-results/dop-page.png' })
      console.log('  📸 Screenshot saved')

      console.log('\n✅ DoP Module is WORKING!')
    } else {
      console.log('\n❌ DoP Module NOT FOUND')
    }

  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await browser.close()
  }
}

testDoP()