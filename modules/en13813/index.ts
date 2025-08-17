// EN 13813 Module - DoP Generator für Estrichmörtel
export * from './types'
export * from './services'
export * from './components'
export * from './hooks'

export const EN13813_MODULE = {
  id: 'en13813',
  name: 'EN 13813 DoP-Generator',
  description: 'Leistungserklärungen für Estrichmörtel nach EN 13813',
  version: '1.0.0',
  icon: '🏗️',
  routes: [
    { path: '/en13813', name: 'Übersicht' },
    { path: '/en13813/recipes', name: 'Rezepturen' },
    { path: '/en13813/dops', name: 'Leistungserklärungen' },
    { path: '/en13813/tests', name: 'Prüfberichte' },
    { path: '/en13813/compliance', name: 'Compliance-Kalender' }
  ]
}