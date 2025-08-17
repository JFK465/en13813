'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { useDocuments, useUploadProgress } from '@/hooks/core/useDocuments'
import { formatFileSize } from '@/lib/utils'
import type { DocumentMetadata } from '@/lib/core/documents'

interface DocumentUploadProps {
  onUploadComplete?: () => void
  className?: string
}

export function DocumentUpload({ onUploadComplete, className }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<Partial<DocumentMetadata>>({
    type: 'other',
    tags: []
  })
  
  const { upload, isUploading } = useDocuments()
  const { progress, onProgress, resetProgress } = useUploadProgress()
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setSelectedFile(file)
      setMetadata(prev => ({
        ...prev,
        title: prev.title || file.name.replace(/\.[^/.]+$/, "")
      }))
    }
  }, [])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'text/*': ['.txt', '.csv']
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024 // 50MB
  })
  
  const handleUpload = async () => {
    if (!selectedFile || !metadata.title || !metadata.type) {
      return
    }
    
    try {
      await upload({
        file: selectedFile,
        metadata: metadata as DocumentMetadata,
        onProgress
      })
      
      // Reset form
      setSelectedFile(null)
      setMetadata({ type: 'other', tags: [] })
      resetProgress()
      onUploadComplete?.()
      
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }
  
  const removeFile = () => {
    setSelectedFile(null)
    resetProgress()
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* File Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${selectedFile ? 'border-green-500 bg-green-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {selectedFile ? (
          <div className="space-y-2">
            <div className="text-2xl">📄</div>
            <p className="font-medium text-green-700">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
            <Button variant="outline" size="sm" onClick={removeFile}>
              Andere Datei wählen
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl text-gray-400">📁</div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Datei hier ablegen...' : 'Datei hier ablegen oder klicken'}
              </p>
              <p className="text-sm text-gray-500">
                PDF, Word, Excel, Bilder bis 50MB
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Upload Progress */}
      {progress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{progress.message}</span>
            <span>{progress.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Metadata Form */}
      {selectedFile && !isUploading && (
        <div className="space-y-4 border-t pt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dokumententitel *
            </label>
            <input
              type="text"
              value={metadata.title || ''}
              onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="z.B. ISO 50001 Zertifikat 2024"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dokumententyp *
            </label>
            <select
              value={metadata.type}
              onChange={(e) => setMetadata(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="policy">Richtlinie</option>
              <option value="certificate">Zertifikat</option>
              <option value="report">Bericht</option>
              <option value="evidence">Nachweis</option>
              <option value="audit">Audit</option>
              <option value="other">Sonstiges</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategorie
            </label>
            <input
              type="text"
              value={metadata.category || ''}
              onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="z.B. Energiemanagement, Arbeitsschutz"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (durch Komma getrennt)
            </label>
            <input
              type="text"
              value={metadata.tags?.join(', ') || ''}
              onChange={(e) => setMetadata(prev => ({ 
                ...prev, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="z.B. ISO50001, Zertifikat, 2024"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aufbewahrung bis
            </label>
            <input
              type="date"
              value={metadata.retention_until || ''}
              onChange={(e) => setMetadata(prev => ({ ...prev, retention_until: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <Button 
            onClick={handleUpload}
            disabled={!metadata.title || !metadata.type}
            className="w-full"
          >
            Dokument hochladen
          </Button>
        </div>
      )}
    </div>
  )
}