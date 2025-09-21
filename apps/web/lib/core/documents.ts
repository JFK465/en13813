import { SupabaseClient } from '@supabase/supabase-js'
import { BaseService, AppError } from './base.service'
import type { Database } from '@/types/database.types'

type Document = Database['public']['Tables']['documents']['Row']
type DocumentInsert = Database['public']['Tables']['documents']['Insert']
type DocumentUpdate = Database['public']['Tables']['documents']['Update']
type DocumentVersion = Database['public']['Tables']['document_versions']['Row']

export interface DocumentMetadata {
  title: string
  type: 'policy' | 'certificate' | 'report' | 'evidence' | 'audit' | 'other'
  category?: string
  tags?: string[]
  metadata?: Record<string, any>
  retention_until?: string
}

export interface UploadProgress {
  progress: number
  status: 'uploading' | 'processing' | 'complete' | 'error'
  message?: string
}

export class DocumentService extends BaseService<Document> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'documents')
  }
  
  async uploadWithVersion(
    file: File, 
    metadata: DocumentMetadata,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<Document> {
    const tenantId = await this.getCurrentTenantId()
    
    try {
      onProgress?.({ progress: 10, status: 'uploading', message: 'Creating document record...' })
      
      // 1. Create document record
      const documentData: DocumentInsert = {
        tenant_id: tenantId,
        title: metadata.title,
        type: metadata.type,
        category: metadata.category,
        tags: metadata.tags || [],
        metadata: metadata.metadata || {},
        retention_until: metadata.retention_until
      }
      
      const document = await this.create(documentData)
      
      onProgress?.({ progress: 30, status: 'uploading', message: 'Uploading file...' })
      
      // 2. Upload to Supabase Storage
      const fileName = `${tenantId}/${document.id}/${Date.now()}-${file.name}`
      const { data: upload, error: uploadError } = await this.supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (uploadError) {
        await this.delete(document.id)
        throw new AppError(`Upload failed: ${uploadError.message}`, uploadError.name)
      }
      
      onProgress?.({ progress: 60, status: 'processing', message: 'Creating version record...' })
      
      // 3. Calculate checksum
      const checksum = await this.calculateChecksum(file)
      
      // 4. Create version record
      const { data: version, error: versionError } = await this.supabase
        .from('document_versions')
        .insert({
          document_id: document.id,
          version_number: '1.0.0',
          storage_path: upload.path,
          file_size: file.size,
          mime_type: file.type,
          checksum
        })
        .select()
        .single()
      
      if (versionError) {
        await this.supabase.storage.from('documents').remove([upload.path])
        await this.delete(document.id)
        throw new AppError(`Version creation failed: ${versionError.message}`, versionError.code)
      }
      
      onProgress?.({ progress: 80, status: 'processing', message: 'Finalizing...' })
      
      // 5. Update document with current version
      const updatedDocument = await this.update(document.id, { 
        current_version_id: version.id 
      })
      
      onProgress?.({ progress: 100, status: 'complete', message: 'Upload complete!' })
      
      return updatedDocument
      
    } catch (error) {
      onProgress?.({ progress: 0, status: 'error', message: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  }
  
  async createVersion(
    documentId: string,
    file: File,
    changelog?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<DocumentVersion> {
    const tenantId = await this.getCurrentTenantId()
    
    // Check if document exists and user has permission
    const document = await this.getById(documentId)
    if (!document) {
      throw new AppError('Document not found', 'DOCUMENT_NOT_FOUND', 404)
    }
    
    onProgress?.({ progress: 10, status: 'uploading', message: 'Getting current version...' })
    
    // Get current version number
    const { data: latestVersion } = await this.supabase
      .from('document_versions')
      .select('version_number')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    // Increment version number
    const nextVersion = this.incrementVersion(latestVersion?.version_number || '1.0.0')
    
    onProgress?.({ progress: 30, status: 'uploading', message: 'Uploading new version...' })
    
    // Upload new version
    const fileName = `${tenantId}/${documentId}/${Date.now()}-${file.name}`
    const { data: upload, error: uploadError } = await this.supabase.storage
      .from('documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      throw new AppError(`Upload failed: ${uploadError.message}`, uploadError.name)
    }
    
    onProgress?.({ progress: 60, status: 'processing', message: 'Creating version record...' })
    
    // Calculate checksum
    const checksum = await this.calculateChecksum(file)
    
    // Create version record
    const { data: version, error: versionError } = await this.supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: nextVersion,
        storage_path: upload.path,
        file_size: file.size,
        mime_type: file.type,
        checksum,
        changelog
      })
      .select()
      .single()
    
    if (versionError) {
      await this.supabase.storage.from('documents').remove([upload.path])
      throw new AppError(`Version creation failed: ${versionError.message}`, versionError.code)
    }
    
    onProgress?.({ progress: 80, status: 'processing', message: 'Updating document...' })
    
    // Update document with new current version
    await this.update(documentId, { 
      current_version_id: version.id,
      status: 'draft' // New version starts as draft
    })
    
    onProgress?.({ progress: 100, status: 'complete', message: 'New version created!' })
    
    return version
  }
  
  async getSignedUrl(documentId: string, versionId?: string, expiresIn = 3600): Promise<string> {
    // Get document with permission check (RLS handles this)
    const { data: doc, error } = await this.supabase
      .from('documents')
      .select('*, document_versions(*)')
      .eq('id', documentId)
      .single()
    
    if (error || !doc) {
      throw new AppError('Document not found', 'DOCUMENT_NOT_FOUND', 404)
    }
    
    // Find the specific version or use current
    const version = versionId 
      ? doc.document_versions.find(v => v.id === versionId)
      : doc.document_versions.find(v => v.id === doc.current_version_id)
    
    if (!version) {
      throw new AppError('Document version not found', 'VERSION_NOT_FOUND', 404)
    }
    
    // Generate signed URL
    const { data, error: urlError } = await this.supabase.storage
      .from('documents')
      .createSignedUrl(version.storage_path, expiresIn)
    
    if (urlError || !data) {
      throw new AppError('Failed to generate download URL', 'URL_GENERATION_FAILED')
    }
    
    // Log access
    await this.logDocumentAccess(documentId, versionId, 'download')
    
    return data.signedUrl
  }
  
  async searchDocuments(
    query: string,
    filters: {
      type?: string
      category?: string
      status?: string
      tags?: string[]
    } = {},
    page = 0,
    pageSize = 20
  ): Promise<{ items: Document[]; hasMore: boolean; total: number }> {
    let dbQuery = this.supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
    
    // Text search
    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,category.ilike.%${query}%`)
    }
    
    // Filters
    if (filters.type) {
      dbQuery = dbQuery.eq('type', filters.type)
    }
    if (filters.category) {
      dbQuery = dbQuery.eq('category', filters.category)
    }
    if (filters.status) {
      dbQuery = dbQuery.eq('status', filters.status)
    }
    if (filters.tags && filters.tags.length > 0) {
      dbQuery = dbQuery.contains('tags', filters.tags)
    }
    
    const { data, error, count } = await dbQuery
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order('created_at', { ascending: false })
    
    if (error) throw new AppError(error.message, error.code)
    
    return {
      items: data || [],
      hasMore: (count || 0) > (page + 1) * pageSize,
      total: count || 0
    }
  }
  
  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    const { data, error } = await this.supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })
    
    if (error) throw new AppError(error.message, error.code)
    
    return data || []
  }
  
  async softDelete(id: string): Promise<void> {
    await this.update(id, { deleted_at: new Date().toISOString() })
  }
  
  private async calculateChecksum(file: File): Promise<string> {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
  
  private incrementVersion(version: string): string {
    const parts = version.split('.').map(Number)
    parts[2]++ // Increment patch version
    return parts.join('.')
  }
  
  private async logDocumentAccess(
    documentId: string, 
    versionId?: string, 
    action = 'view'
  ): Promise<void> {
    try {
      await this.supabase.from('document_access_logs').insert({
        document_id: documentId,
        version_id: versionId,
        action
      })
    } catch (error) {
      // Non-critical error
      console.error('Failed to log document access:', error)
    }
  }
}