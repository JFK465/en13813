'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useDocuments } from '@/hooks/core/useDocuments'
import { formatDate, formatFileSize, getFileIcon, debounce } from '@/lib/utils'
import type { Database } from '@/types/database.types'

type Document = Database['public']['Tables']['documents']['Row']

interface DocumentListProps {
  onDocumentSelect?: (document: Document) => void
  className?: string
}

const documentTypeLabels = {
  policy: 'Richtlinie',
  certificate: 'Zertifikat',
  report: 'Bericht',
  evidence: 'Nachweis',
  audit: 'Audit',
  other: 'Sonstiges'
}

const statusLabels = {
  draft: 'Entwurf',
  pending_approval: 'Wartet auf Freigabe',
  approved: 'Freigegeben',
  archived: 'Archiviert',
  expired: 'Abgelaufen'
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  archived: 'bg-blue-100 text-blue-800',
  expired: 'bg-red-100 text-red-800'
}

export function DocumentList({ onDocumentSelect, className }: DocumentListProps) {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    category: ''
  })
  const [page, setPage] = useState(0)
  
  const {
    documents,
    hasMore,
    total,
    isLoading,
    getDownloadUrl,
    delete: deleteDocument,
    isDeleting
  } = useDocuments({
    search,
    filters: Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    ),
    page,
    pageSize: 20
  })
  
  const debouncedSearch = debounce((value: string) => {
    setSearch(value)
    setPage(0)
  }, 300)
  
  const handleDownload = async (document: Document) => {
    try {
      const url = await getDownloadUrl(document.id)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Download failed:', error)
    }
  }
  
  const handleDelete = async (documentId: string) => {
    if (confirm('Sind Sie sicher, dass Sie dieses Dokument löschen möchten?')) {
      try {
        await deleteDocument(documentId)
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }
  
  const loadMore = () => {
    setPage(prev => prev + 1)
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters */}
      <div className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Dokumente durchsuchen..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.type}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, type: e.target.value }))
              setPage(0)
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Alle Typen</option>
            {Object.entries(documentTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, status: e.target.value }))
              setPage(0)
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Alle Status</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Kategorie..."
            value={filters.category}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, category: e.target.value }))
              setPage(0)
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      
      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {total} Dokument{total !== 1 ? 'e' : ''} gefunden
        </p>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSearch('')
            setFilters({ type: '', status: '', category: '' })
            setPage(0)
          }}
        >
          Filter zurücksetzen
        </Button>
      </div>
      
      {/* Document Grid */}
      {isLoading && page === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((document) => (
            <div
              key={document.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onDocumentSelect?.(document)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getFileIcon()}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {document.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {documentTypeLabels[document.type]}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[document.status]}`}>
                    {statusLabels[document.status]}
                  </span>
                </div>
              </div>
              
              {document.category && (
                <p className="text-sm text-gray-600 mb-2">
                  📁 {document.category}
                </p>
              )}
              
              {document.tags && document.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {document.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="text-xs text-gray-500 mb-3">
                Erstellt: {formatDate(document.created_at)}
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(document)
                  }}
                >
                  📥 Download
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(document.id)
                  }}
                >
                  🗑️ Löschen
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Lädt...' : 'Weitere laden'}
          </Button>
        </div>
      )}
      
      {/* Empty State */}
      {!isLoading && documents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl text-gray-400 mb-4">📂</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Keine Dokumente gefunden
          </h3>
          <p className="text-gray-500">
            {search || Object.values(filters).some(f => f)
              ? 'Versuchen Sie andere Suchkriterien.'
              : 'Laden Sie Ihr erstes Dokument hoch, um zu beginnen.'
            }
          </p>
        </div>
      )}
    </div>
  )
}