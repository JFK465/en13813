// Re-export the advanced form as the default RecipeForm
export { RecipeFormAdvanced as RecipeForm } from './RecipeFormAdvanced'
export { ComplianceDashboard } from './ComplianceDashboard'

// Keep the old form available if needed
export { RecipeForm as RecipeFormBasic } from './RecipeForm'

// Export individual components for flexibility
export { MaterialComposition } from './MaterialComposition'
export { ITTTestPlan } from './ITTTestPlan'
export { FPCControlPlan } from './FPCControlPlan'