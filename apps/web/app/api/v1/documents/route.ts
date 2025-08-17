import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { withSecurity, createSecureAPIResponse, createAPIErrorResponse } from '@/lib/security/api-security'
import { validationSchemas } from '@/lib/security/validation'

// Validation schemas
const documentCreateSchema = z.object({
  title: validationSchemas.documentTitle,
  type: z.enum(['policy', 'certificate', 'report', 'evidence', 'audit', 'other']),
  category: validationSchemas.documentCategory.optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.object({}).optional()
})

const documentQuerySchema = z.object({
  page: validationSchemas.page.optional(),
  limit: validationSchemas.limit.optional(),
  type: z.enum(['policy', 'certificate', 'report', 'evidence', 'audit', 'other']).optional(),
  status: z.enum(['draft', 'pending_approval', 'approved', 'archived', 'expired']).optional(),
  search: validationSchemas.searchQuery.optional(),
  tags: z.string().optional() // Comma-separated tags
})

/**
 * @swagger
 * /api/v1/documents:
 *   get:
 *     summary: List documents
 *     description: Retrieve a paginated list of documents with optional filtering
 *     tags: [Documents]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [policy, certificate, report, evidence, audit, other]
 *         description: Filter by document type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, pending_approval, approved, archived, expired]
 *         description: Filter by document status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
 *     responses:
 *       200:
 *         description: List of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
async function getDocuments(request: NextRequest) {
  const supabase = await createClient()
  
  // Parse and validate query parameters
  const url = new URL(request.url)
  const queryParams = Object.fromEntries(url.searchParams.entries())
  
  const validation = documentQuerySchema.safeParse(queryParams)
  if (!validation.success) {
    return createAPIErrorResponse(
      'Invalid query parameters',
      400,
      { errors: validation.error.errors }
    )
  }

  const { page = 1, limit = 20, type, status, search, tags } = validation.data

  try {
    // Build query
    let query = supabase
      .from('documents')
      .select('*', { count: 'exact' })

    // Apply filters
    if (type) {
      query = query.eq('type', type)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim())
      query = query.contains('tags', tagArray)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      return createAPIErrorResponse('Database error', 500)
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return createSecureAPIResponse({
      data: data || [],
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    })

  } catch (error: any) {
    console.error('Documents API error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

/**
 * @swagger
 * /api/v1/documents:
 *   post:
 *     summary: Create a new document
 *     description: Create a new document entry (without file upload)
 *     tags: [Documents]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DocumentCreate'
 *     responses:
 *       201:
 *         description: Document created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
async function createDocument(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = documentCreateSchema.safeParse(body)
    if (!validation.success) {
      return createAPIErrorResponse(
        'Validation error',
        400,
        { errors: validation.error.errors }
      )
    }

    const { title, type, category, tags = [], metadata = {} } = validation.data

    // Get current user from API key context (this would be set by the security wrapper)
    const userId = request.headers.get('x-user-id')
    const tenantId = request.headers.get('x-tenant-id')
    
    if (!userId || !tenantId) {
      return createAPIErrorResponse('Authentication context missing', 401)
    }

    // Create document
    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        tenant_id: tenantId,
        title,
        type,
        category,
        tags,
        metadata,
        status: 'draft',
        created_by: userId
      })
      .select()
      .single()

    if (error) {
      console.error('Document creation error:', error)
      return createAPIErrorResponse('Failed to create document', 500)
    }

    return createSecureAPIResponse(
      { data: document },
      201
    )

  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return createAPIErrorResponse('Invalid JSON body', 400)
    }
    console.error('Create document error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

// Apply security and rate limiting
export const GET = withSecurity(getDocuments, {
  requireAPIKey: true,
  rateLimit: 'api',
  validateQuery: documentQuerySchema
})

export const POST = withSecurity(createDocument, {
  requireAPIKey: true,
  rateLimit: 'api',
  validateBody: documentCreateSchema,
  permissions: ['documents:write']
})