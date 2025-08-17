'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { DocumentService, DocumentMetadata, UploadProgress } from '@/lib/core/documents'
import type { Database } from '@/types/database.types'

type Document = Database['public']['Tables']['documents']['Row']
type DocumentVersion = Database['public']['Tables']['document_versions']['Row']

interface UseDocumentsOptions {
  page?: number
  pageSize?: number
  filters?: {
    type?: string
    category?: string
    status?: string
    tags?: string[]
  }
  search?: string
}

export function useDocuments(options: UseDocumentsOptions = {}) {
  const supabase = createClient()
  const documentService = new DocumentService(supabase)
  const queryClient = useQueryClient()
  
  const {
    page = 0,
    pageSize = 20,
    filters = {},
    search = ''
  } = options
  
  // Query for documents list
  const {
    data: documentsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['documents', page, pageSize, filters, search],
    queryFn: () => documentService.searchDocuments(search, filters, page, pageSize),
    staleTime: 30 * 1000, // 30 seconds
  })
  
  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ 
      file, 
      metadata, 
      onProgress 
    }: { 
      file: File
      metadata: DocumentMetadata
      onProgress?: (progress: UploadProgress) => void
    }) => {
      return documentService.uploadWithVersion(file, metadata, onProgress)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
  
  // Create version mutation
  const createVersionMutation = useMutation({
    mutationFn: async ({
      documentId,
      file,
      changelog,
      onProgress
    }: {
      documentId: string
      file: File
      changelog?: string
      onProgress?: (progress: UploadProgress) => void
    }) => {
      return documentService.createVersion(documentId, file, changelog, onProgress)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['document-versions', variables.documentId] })
    },
  })
  
  // Update document mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Document> }) => {
      return documentService.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
  
  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentService.softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
  
  // Get signed URL for download
  const getDownloadUrl = useCallback(async (documentId: string, versionId?: string) => {
    return documentService.getSignedUrl(documentId, versionId)
  }, [documentService])
  
  return {
    // Data
    documents: documentsData?.items || [],
    hasMore: documentsData?.hasMore || false,
    total: documentsData?.total || 0,
    
    // States
    isLoading,
    error,
    
    // Actions
    upload: uploadMutation.mutateAsync,
    createVersion: createVersionMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    getDownloadUrl,
    refetch,
    
    // Mutation states
    isUploading: uploadMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isCreatingVersion: createVersionMutation.isPending,
  }
}

export function useDocument(documentId: string) {
  const supabase = createClient()
  const documentService = new DocumentService(supabase)
  
  // Query for single document
  const {
    data: document,
    isLoading,
    error
  } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => documentService.findById(documentId),
    enabled: !!documentId,
  })
  
  return {
    document,
    isLoading,
    error,
  }
}

export function useDocumentVersions(documentId: string) {
  const supabase = createClient()
  const documentService = new DocumentService(supabase)
  
  // Query for document versions
  const {
    data: versions,
    isLoading,
    error
  } = useQuery({
    queryKey: ['document-versions', documentId],
    queryFn: () => documentService.getDocumentVersions(documentId),
    enabled: !!documentId,
  })
  
  return {
    versions: versions || [],
    isLoading,
    error,
  }
}

// Hook for upload progress tracking
export function useUploadProgress() {
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  
  const resetProgress = useCallback(() => {
    setProgress(null)
  }, [])
  
  const onProgress = useCallback((newProgress: UploadProgress) => {
    setProgress(newProgress)
  }, [])
  
  return {
    progress,
    onProgress,
    resetProgress,
  }
}