import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateFileUpload, generateSecureFilename, calculateFileChecksum } from '@/lib/security/file-upload'
import { withSecurity, createSecureAPIResponse, createAPIErrorResponse } from '@/lib/security/api-security'
import { z } from 'zod'

const uploadSchema = z.object({
  type: z.enum(['document', 'image', 'avatar', 'export']),
  category: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional()
})

async function uploadHandler(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return createAPIErrorResponse('Authentication required', 401)
    }

    // Get user profile for tenant info
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.tenant_id) {
      return createAPIErrorResponse('User profile or tenant not found', 404)
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const metadata = {
      type: formData.get('type') as string || 'document',
      category: formData.get('category') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string
    }

    if (!file) {
      return createAPIErrorResponse('No file provided', 400)
    }

    // Validate metadata
    const metadataValidation = uploadSchema.safeParse(metadata)
    if (!metadataValidation.success) {
      return createAPIErrorResponse(
        'Invalid metadata',
        400,
        { errors: metadataValidation.error.errors }
      )
    }

    // Validate file upload
    const fileValidation = await validateFileUpload(file, metadata.type as any)
    if (!fileValidation.valid) {
      return createAPIErrorResponse(fileValidation.error!, 400)
    }

    // Generate secure filename
    const secureFilename = generateSecureFilename(file.name, user.id)
    const storagePath = `${profile.tenant_id}/${metadata.type}s/${secureFilename}`

    // Calculate file checksum
    const checksum = await calculateFileChecksum(file)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      return createAPIErrorResponse(
        'Upload failed: ' + uploadError.message,
        500
      )
    }

    // Store file metadata in database (for documents)
    if (metadata.type === 'document') {
      const { data: document, error: dbError } = await supabase
        .from('documents')
        .insert({
          tenant_id: profile.tenant_id,
          title: metadata.title || file.name,
          type: 'other', // Default document type
          category: metadata.category,
          status: 'draft',
          tags: [],
          metadata: {
            original_filename: file.name,
            file_size: file.size,
            mime_type: file.type,
            upload_warnings: fileValidation.warnings
          },
          created_by: user.id
        })
        .select()
        .single()

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage
          .from('documents')
          .remove([storagePath])
        
        return createAPIErrorResponse(
          'Database error: ' + dbError.message,
          500
        )
      }

      // Create document version
      await supabase
        .from('document_versions')
        .insert({
          document_id: document.id,
          version_number: '1.0',
          storage_path: storagePath,
          file_size: file.size,
          mime_type: file.type,
          checksum: checksum,
          created_by: user.id
        })

      return createSecureAPIResponse({
        success: true,
        document,
        upload: {
          path: storagePath,
          size: file.size,
          checksum,
          warnings: fileValidation.warnings
        }
      })
    }

    // For non-document uploads, return upload info
    return createSecureAPIResponse({
      success: true,
      upload: {
        path: storagePath,
        url: uploadData.path,
        size: file.size,
        checksum,
        warnings: fileValidation.warnings
      }
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return createAPIErrorResponse(
      'Internal server error',
      500,
      process.env.NODE_ENV === 'development' ? { error: error.message } : undefined
    )
  }
}

// Apply security wrapper with file upload rate limiting
export const POST = withSecurity(uploadHandler, {
  requireAuth: true,
  rateLimit: 'upload'
})