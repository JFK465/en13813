#!/bin/bash

# Fix property names in all service files

echo "Fixing property names in service files..."

# Fix in FPC service
sed -i '' 's/recipe\.estrich_type/recipe.binder_type/g' apps/web/modules/en13813/services/fpc.service.ts

# Fix in recipe code generator
sed -i '' 's/recipe\.estrich_type/recipe.binder_type/g' apps/web/modules/en13813/services/recipe-code-generator.ts

# Fix in dop generator
sed -i '' 's/recipe\.estrich_type/recipe.binder_type/g' apps/web/modules/en13813/services/dop-generator.service.ts

# Fix in test reports service
sed -i '' 's/recipe\.estrich_type/recipe.binder_type/g' apps/web/modules/en13813/services/test-reports.service.ts
sed -i '' "s/'estrich_type'/'binder_type'/g" apps/web/modules/en13813/services/test-reports.service.ts
sed -i '' 's/estrich_type:/binder_type:/g' apps/web/modules/en13813/services/test-reports.service.ts

# Fix in ITT mapping service
sed -i '' 's/recipe\.estrich_type/recipe.binder_type/g' apps/web/modules/en13813/services/itt-mapping.service.ts

# Fix in PDF generator
sed -i '' 's/recipe\.estrich_type/recipe.binder_type/g' apps/web/modules/en13813/services/pdf-generator.service.ts

# Fix in test reports EN13813 complete service
sed -i '' 's/recipe\.estrich_type/recipe.binder_type/g' apps/web/modules/en13813/services/test-reports-en13813-complete.service.ts
sed -i '' "s/'estrich_type'/'binder_type'/g" apps/web/modules/en13813/services/test-reports-en13813-complete.service.ts

# Fix compressive_strength to compressive_strength_class
sed -i '' 's/recipe\.compressive_strength\([^_]\)/recipe.compressive_strength_class\1/g' apps/web/modules/en13813/services/*.ts

# Fix flexural_strength to flexural_strength_class
sed -i '' 's/recipe\.flexural_strength\([^_]\)/recipe.flexural_strength_class\1/g' apps/web/modules/en13813/services/*.ts

echo "Property names fixed successfully"