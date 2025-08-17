import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { withSecurity, createSecureAPIResponse, createAPIErrorResponse } from '@/lib/security/api-security'
import { validationSchemas } from '@/lib/security/validation'

// Validation schemas
const documentUpdateSchema = z.object({
  title: validationSchemas.documentTitle.optional(),
  type: z.enum(['policy', 'certificate', 'report', 'evidence', 'audit', 'other']).optional(),
  category: validationSchemas.documentCategory.optional(),
  status: z.enum(['draft', 'pending_approval', 'approved', 'archived', 'expired']).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.object({}).optional()
})

/**
 * @swagger
 * /api/v1/documents/{id}:
 *   get:
 *     summary: Get document by ID
 *     description: Retrieve a specific document by its ID
 *     tags: [Documents]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
async function getDocument(request: NextRequest, context: { params?: { id: string } }) {
  const params = context.params!;
  const supabase = await createClient()
  
  try {
    const { data: document, error } = await supabase
      .from('documents')
      .select(`
        *,
        document_versions (
          id,
          version_number,
          file_size,
          mime_type,
          created_at,
          created_by
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createAPIErrorResponse('Document not found', 404)
      }
      return createAPIErrorResponse('Database error', 500)
    }

    return createSecureAPIResponse({ data: document })

  } catch (error: any) {
    console.error('Get document error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

/**
 * @swagger
 * /api/v1/documents/{id}:
 *   put:
 *     summary: Update document
 *     description: Update an existing document
 *     tags: [Documents]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *               type:
 *                 type: string
 *                 enum: [policy, certificate, report, evidence, audit, other]
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, pending_approval, approved, archived, expired]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Document updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
async function updateDocument(request: NextRequest, context: { params?: { id: string } }) {
  const params = context.params!;
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = documentUpdateSchema.safeParse(body)
    if (!validation.success) {
      return createAPIErrorResponse(
        'Validation error',
        400,
        { errors: validation.error.errors }
      )
    }

    const updateData = {
      ...validation.data,
      updated_at: new Date().toISOString()
    }

    // Update document
    const { data: document, error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createAPIErrorResponse('Document not found', 404)
      }
      return createAPIErrorResponse('Database error', 500)
    }

    return createSecureAPIResponse({ data: document })

  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return createAPIErrorResponse('Invalid JSON body', 400)
    }
    console.error('Update document error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

/**
 * @swagger
 * /api/v1/documents/{id}:
 *   delete:
 *     summary: Delete document
 *     description: Delete a document (soft delete)
 *     tags: [Documents]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Document ID
 *     responses:
 *       204:
 *         description: Document deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
async function deleteDocument(request: NextRequest, context: { params?: { id: string } }) {
  const params = context.params!;
  const supabase = await createClient()
  
  try {
    // Soft delete - set deleted_at timestamp
    const { error } = await supabase
      .from('documents')
      .update({ 
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .is('deleted_at', null) // Only delete if not already deleted

    if (error) {
      if (error.code === 'PGRST116') {
        return createAPIErrorResponse('Document not found', 404)
      }
      return createAPIErrorResponse('Database error', 500)
    }

    return new NextResponse(null, { status: 204 })

  } catch (error: any) {
    console.error('Delete document error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

// Apply security and rate limiting
export const GET = withSecurity(getDocument, {
  requireAPIKey: true,
  rateLimit: 'api',
  permissions: ['documents:read']
})

export const PUT = withSecurity(updateDocument, {
  requireAPIKey: true,
  rateLimit: 'api',
  validateBody: documentUpdateSchema,
  permissions: ['documents:write']
})

export const DELETE = withSecurity(deleteDocument, {
  requireAPIKey: true,
  rateLimit: 'api',
  permissions: ['documents:delete']
})