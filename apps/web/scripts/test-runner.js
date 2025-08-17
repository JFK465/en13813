#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')

// Test suite configurations
const TEST_SUITES = {
  unit: {
    command: 'npm',
    args: ['run', 'test'],
    description: 'Unit tests (Jest + Testing Library)'
  },
  integration: {
    command: 'npm',
    args: ['run', 'test:integration'],
    description: 'Integration tests (API endpoints)'
  },
  e2e: {
    command: 'npm',
    args: ['run', 'test:e2e'],
    description: 'E2E tests (Playwright)'
  },
  coverage: {
    command: 'npm',
    args: ['run', 'test:coverage'],
    description: 'Unit tests with coverage report'
  },
  all: {
    command: 'npm',
    args: ['run', 'test:all'],
    description: 'All test suites'
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const suite = args[0] || 'unit'
const watch = args.includes('--watch')
const debug = args.includes('--debug')
const ui = args.includes('--ui')

// Validate test suite
if (!TEST_SUITES[suite]) {
  console.error(`❌ Invalid test suite: ${suite}`)
  console.log('\nAvailable test suites:')
  Object.entries(TEST_SUITES).forEach(([key, config]) => {
    console.log(`  ${key.padEnd(12)} - ${config.description}`)
  })
  process.exit(1)
}

// Set environment variables
process.env.NODE_ENV = 'test'
process.env.CI = process.env.CI || 'false'

// Helper function to run commands
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🏃 Running: ${command} ${args.join(' ')}`)
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code)
      } else {
        reject(new Error(`Command failed with exit code ${code}`))
      }
    })

    child.on('error', reject)
  })
}

// Setup test environment
async function setupTestEnvironment() {
  console.log('🔧 Setting up test environment...')
  
  // Check if required dependencies are installed
  try {
    await runCommand('npm', ['ls', '@playwright/test'], { stdio: 'pipe' })
  } catch (error) {
    console.log('📦 Installing Playwright browsers...')
    await runCommand('npx', ['playwright', 'install'])
  }

  // Setup test database if needed
  if (suite === 'integration' || suite === 'all') {
    console.log('🗄️ Setting up test database...')
    // Add database setup commands here
  }
}

// Main test runner
async function runTests() {
  try {
    console.log(`🚀 Starting ${suite} test suite...`)
    console.log(`📝 ${TEST_SUITES[suite].description}`)
    
    await setupTestEnvironment()

    let testArgs = [...TEST_SUITES[suite].args]

    // Add flags based on options
    if (watch && (suite === 'unit' || suite === 'coverage')) {
      testArgs.push('--watch')
    }

    if (debug && suite === 'e2e') {
      testArgs.push('--debug')
    }

    if (ui && suite === 'e2e') {
      testArgs.push('--ui')
    }

    const startTime = Date.now()
    await runCommand(TEST_SUITES[suite].command, testArgs)
    const endTime = Date.now()
    
    console.log(`✅ Tests completed successfully in ${endTime - startTime}ms`)
    
    // Show coverage report location if coverage was run
    if (suite === 'coverage') {
      console.log('📊 Coverage report available at: coverage/lcov-report/index.html')
    }
    
    // Show Playwright report location if E2E tests were run
    if (suite === 'e2e') {
      console.log('📊 Playwright report available at: playwright-report/index.html')
    }

  } catch (error) {
    console.error(`❌ Tests failed: ${error.message}`)
    process.exit(1)
  }
}

// Run specific test patterns
if (args.includes('--pattern')) {
  const patternIndex = args.indexOf('--pattern')
  const pattern = args[patternIndex + 1]
  if (pattern) {
    process.env.JEST_TEST_PATTERN = pattern
    console.log(`🎯 Running tests matching pattern: ${pattern}`)
  }
}

// Show help
if (args.includes('--help') || args.includes('-h')) {
  console.log('🧪 Test Runner Help')
  console.log('\nUsage: node scripts/test-runner.js [suite] [options]')
  console.log('\nTest Suites:')
  Object.entries(TEST_SUITES).forEach(([key, config]) => {
    console.log(`  ${key.padEnd(12)} - ${config.description}`)
  })
  console.log('\nOptions:')
  console.log('  --watch      Watch for file changes (unit/coverage only)')
  console.log('  --debug      Run in debug mode (e2e only)')
  console.log('  --ui         Run with UI mode (e2e only)')
  console.log('  --pattern    Run tests matching pattern')
  console.log('  --help, -h   Show this help message')
  console.log('\nExamples:')
  console.log('  npm run test-runner unit --watch')
  console.log('  npm run test-runner e2e --ui')
  console.log('  npm run test-runner coverage')
  console.log('  npm run test-runner integration')
  process.exit(0)
}

// Run the tests
runTests()