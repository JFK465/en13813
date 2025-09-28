-- Make manufacturer fields optional for recipes
-- These fields can be set later when creating DOPs

ALTER TABLE en13813_recipes
  ALTER COLUMN product_name DROP NOT NULL,
  ALTER COLUMN manufacturer_name DROP NOT NULL,
  ALTER COLUMN manufacturer_address DROP NOT NULL;

-- Add comment to clarify
COMMENT ON COLUMN en13813_recipes.product_name IS 'Product name - can be same as recipe name';
COMMENT ON COLUMN en13813_recipes.manufacturer_name IS 'Manufacturer name - required for DOP generation';
COMMENT ON COLUMN en13813_recipes.manufacturer_address IS 'Manufacturer address - required for DOP generation';