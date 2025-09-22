#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to replace console.log/error/warn with logger
function migrateLogging(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;

  // Check if file already imports logger
  const hasLoggerImport = content.includes("import logger from '@/lib/logger'") ||
                          content.includes('import logger from "../../../lib/logger"');

  // Add logger import if not present and console is used
  if (!hasLoggerImport && content.match(/console\.(log|error|warn)/)) {
    // Find the last import statement
    const importMatches = content.match(/^import .* from .*/gm);
    if (importMatches) {
      const lastImport = importMatches[importMatches.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      content = content.slice(0, lastImportIndex + lastImport.length) +
                "\nimport logger from '@/lib/logger';" +
                content.slice(lastImportIndex + lastImport.length);
      hasChanges = true;
    }
  }

  // Replace console.error with logger.error
  content = content.replace(
    /console\.error\(['"]([^'"]+)['"](,\s*([^)]+))?\)/g,
    (match, message, _, errorVar) => {
      hasChanges = true;
      if (errorVar) {
        // Extract variable name from error parameter
        const cleanErrorVar = errorVar.trim();
        return `logger.error('${message}', {\n        error: ${cleanErrorVar} as Error,\n        errorCode: '${getErrorCode(message)}'\n      })`;
      } else {
        return `logger.error('${message}')`;
      }
    }
  );

  // Replace console.warn with logger.warn
  content = content.replace(
    /console\.warn\(['"`]([^'"`]+)['"`, ]*([^)]*)\)/g,
    (match, message, params) => {
      hasChanges = true;
      if (params && params.trim()) {
        return `logger.warn('${message}', { data: ${params} })`;
      } else {
        return `logger.warn('${message}')`;
      }
    }
  );

  // Replace console.log with logger.info or logger.debug
  content = content.replace(
    /console\.log\(['"`]([^'"`]+)['"`, ]*([^)]*)\)/g,
    (match, message, params) => {
      hasChanges = true;
      const level = isDebugMessage(message) ? 'debug' : 'info';
      if (params && params.trim()) {
        return `logger.${level}('${message}', { data: ${params} })`;
      } else {
        return `logger.${level}('${message}')`;
      }
    }
  );

  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Migrated: ${path.relative(process.cwd(), filePath)}`);
    return true;
  }
  return false;
}

// Helper to generate error codes from messages
function getErrorCode(message) {
  return message
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 50);
}

// Helper to determine if message is debug level
function isDebugMessage(message) {
  const debugPatterns = [
    /^updating/i,
    /^loading/i,
    /^fetching/i,
    /^processing/i,
    /^debug/i,
    /^trace/i
  ];
  return debugPatterns.some(pattern => pattern.test(message));
}

// Main execution
async function main() {
  console.log('🔄 Starting logging migration...\n');

  // Find all TypeScript files in services directory
  const serviceFiles = glob.sync('modules/en13813/services/**/*.ts', {
    cwd: process.cwd(),
    absolute: true
  });

  console.log(`Found ${serviceFiles.length} service files to check\n`);

  let migratedCount = 0;
  for (const file of serviceFiles) {
    if (migrateLogging(file)) {
      migratedCount++;
    }
  }

  console.log(`\n✨ Migration complete! ${migratedCount} files updated.`);
}

main().catch(console.error);