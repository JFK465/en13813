'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DocumentUpload } from '@/components/core/DocumentManager/DocumentUpload'
import { DocumentList } from '@/components/core/DocumentManager/DocumentList'
import type { Database } from '@/types/database.types'

type Document = Database['public']['Tables']['documents']['Row']

type View = 'list' | 'upload'

export default function DocumentsPage() {
  const [currentView, setCurrentView] = useState<View>('list')
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  
  const handleUploadComplete = () => {
    setCurrentView('list')
  }
  
  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document)
    // TODO: Open document detail modal/sidebar
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dokumente</h1>
              <p className="mt-2 text-sm text-gray-600">
                Verwalten Sie Ihre Compliance-Dokumente zentral und sicher
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant={currentView === 'list' ? 'default' : 'outline'}
                onClick={() => setCurrentView('list')}
              >
                📋 Übersicht
              </Button>
              <Button
                variant={currentView === 'upload' ? 'default' : 'outline'}
                onClick={() => setCurrentView('upload')}
              >
                📤 Hochladen
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="pb-12">
          {currentView === 'list' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <DocumentList 
                  onDocumentSelect={handleDocumentSelect}
                />
              </div>
            </div>
          )}
          
          {currentView === 'upload' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Neues Dokument hochladen
                </h2>
                <DocumentUpload 
                  onUploadComplete={handleUploadComplete}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Document Detail Modal/Sidebar */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedDocument.title}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDocument(null)}
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Typ
                    </label>
                    <p className="text-sm text-gray-900">{selectedDocument.type}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <p className="text-sm text-gray-900">{selectedDocument.status}</p>
                  </div>
                  
                  {selectedDocument.category && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Kategorie
                      </label>
                      <p className="text-sm text-gray-900">{selectedDocument.category}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Erstellt
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedDocument.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
                
                {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedDocument.retention_until && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Aufbewahrung bis
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedDocument.retention_until).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                )}
                
                <div className="flex space-x-3 pt-4">
                  <Button onClick={() => {}}>
                    📥 Download
                  </Button>
                  <Button variant="outline" onClick={() => {}}>
                    📝 Bearbeiten
                  </Button>
                  <Button variant="outline" onClick={() => {}}>
                    📋 Versionen
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}