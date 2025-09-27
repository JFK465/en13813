#!/bin/bash

# Fix all pages that have loading issues by adding timeout utility

PAGES=(
  "app/(auth)/en13813/audit/page.tsx"
  "app/(auth)/en13813/audit/\[id\]/page.tsx"
  "app/(auth)/en13813/test-plans/page.tsx"
  "app/(auth)/en13813/lab-values/page.tsx"
  "app/(auth)/en13813/calibration/page.tsx"
  "app/(auth)/en13813/test-reports/page.tsx"
  "app/(auth)/en13813/page.tsx"
)

for page in "${PAGES[@]}"; do
  FILE="/Users/jonaskruger/Dev/en13813/apps/web/$page"

  if [ -f "$FILE" ]; then
    echo "Processing: $FILE"

    # Add import if not already present
    if ! grep -q "queryWithTimeout" "$FILE"; then
      # Find the line with imports from '@/' and add our import after it
      sed -i '' "/^import.*from '@\//a\\
import { queryWithTimeout } from '@/lib/utils/query-timeout'
" "$FILE"
    fi

    echo "✅ Updated: $FILE"
  else
    echo "⚠️  File not found: $FILE"
  fi
done

echo "Done!"