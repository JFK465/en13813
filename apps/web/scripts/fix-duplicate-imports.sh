#!/bin/bash

# Fix duplicate queryWithTimeout imports

FILES=(
  "app/(auth)/en13813/audit/page.tsx"
  "app/(auth)/en13813/test-plans/page.tsx"
  "app/(auth)/en13813/lab-values/page.tsx"
  "app/(auth)/en13813/calibration/page.tsx"
  "app/(auth)/en13813/test-reports/page.tsx"
  "app/(auth)/en13813/page.tsx"
)

for file in "${FILES[@]}"; do
  FILE="/Users/jonaskruger/Dev/en13813/apps/web/$file"

  if [ -f "$FILE" ]; then
    echo "Fixing: $FILE"

    # Remove all duplicate imports of queryWithTimeout, keep only first one
    awk '!seen[$0]++ || !/queryWithTimeout/' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"

    echo "✅ Fixed: $FILE"
  fi
done

echo "Done!"