import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { withSecurity, createSecureAPIResponse, createAPIErrorResponse } from '@/lib/security/api-security'
import { validationSchemas } from '@/lib/security/validation'

// Validation schemas
const reportQuerySchema = z.object({
  page: validationSchemas.page.optional(),
  limit: validationSchemas.limit.optional(),
  type: z.enum(['compliance_dashboard', 'audit_report', 'document_overview', 'workflow_summary']).optional(),
  status: z.enum(['draft', 'generating', 'completed', 'failed', 'archived']).optional(),
  format: z.enum(['pdf', 'html', 'csv', 'json']).optional()
})

const reportGenerateSchema = z.object({
  templateId: validationSchemas.uuid,
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  format: z.enum(['pdf', 'html', 'csv', 'json']).default('pdf'),
  parameters: z.object({}).optional()
})

/**
 * @swagger
 * /api/v1/reports:
 *   get:
 *     summary: List reports
 *     description: Retrieve a paginated list of generated reports
 *     tags: [Reports]
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
 *           enum: [compliance_dashboard, audit_report, document_overview, workflow_summary]
 *         description: Filter by report type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, generating, completed, failed, archived]
 *         description: Filter by report status
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, html, csv, json]
 *         description: Filter by report format
 *     responses:
 *       200:
 *         description: List of reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
async function getReports(request: NextRequest) {
  const supabase = await createClient()
  
  // Parse and validate query parameters
  const url = new URL(request.url)
  const queryParams = Object.fromEntries(url.searchParams.entries())
  
  const validation = reportQuerySchema.safeParse(queryParams)
  if (!validation.success) {
    return createAPIErrorResponse(
      'Invalid query parameters',
      400,
      { errors: validation.error.errors }
    )
  }

  const { page = 1, limit = 20, type, status, format } = validation.data

  try {
    // Build query
    let query = (supabase as any)
      .from('reports')
      .select(`
        *,
        report_templates(name, type, description)
      `, { count: 'exact' })

    // Apply filters
    if (type) {
      query = query.eq('type', type)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (format) {
      query = query.eq('format', format)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      console.error('Reports query error:', error)
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
    console.error('Reports API error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

/**
 * @swagger
 * /api/v1/reports:
 *   post:
 *     summary: Generate a new report
 *     description: Start generation of a new report from a template
 *     tags: [Reports]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportGenerate'
 *     responses:
 *       202:
 *         description: Report generation started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Report'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
async function generateReport(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = reportGenerateSchema.safeParse(body)
    if (!validation.success) {
      return createAPIErrorResponse(
        'Validation error',
        400,
        { errors: validation.error.errors }
      )
    }

    const { templateId, title, description, format, parameters = {} } = validation.data

    // Get authentication context
    const userId = request.headers.get('x-user-id')
    const tenantId = request.headers.get('x-tenant-id')
    
    if (!userId || !tenantId) {
      return createAPIErrorResponse('Authentication context missing', 401)
    }

    // Verify report template exists and is active
    const { data: template, error: templateError } = await (supabase as any)
      .from('report_templates')
      .select('*')
      .eq('id', templateId)
      .eq('is_active', true)
      .single()

    if (templateError || !template) {
      return createAPIErrorResponse('Report template not found or inactive', 404)
    }

    // Create report record
    const { data: report, error: reportError } = await (supabase as any)
      .from('reports')
      .insert({
        tenant_id: tenantId,
        template_id: templateId,
        title,
        description,
        type: template.type,
        format,
        status: 'generating',
        parameters,
        created_by: userId,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        report_templates(name, type, description)
      `)
      .single()

    if (reportError) {
      console.error('Report creation error:', reportError)
      return createAPIErrorResponse('Failed to create report', 500)
    }

    // TODO: Trigger background report generation
    // This would typically involve:
    // 1. Enqueuing a background job (e.g., with Vercel Functions or separate worker)
    // 2. Calling the ReportService to generate the actual report
    // 3. Updating the report status once complete
    
    // For now, we'll simulate async generation by immediately starting it
    try {
      // Import and use ReportService (this would be done in a background job)
      const { ReportService } = await import('@/lib/core/reports')
      const reportService = new ReportService(supabase)
      
      // Generate report in background (don't await)
      // Start background report generation
      setTimeout(() => {
        reportService.generateReport({
          templateId,
          title,
          description,
          format,
          parameters
        })
      }, 0)
    } catch (error) {
      console.error('Failed to start report generation:', error)
    }

    return createSecureAPIResponse(
      { data: report },
      202
    )

  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return createAPIErrorResponse('Invalid JSON body', 400)
    }
    console.error('Generate report error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

// Apply security and rate limiting
export const GET = withSecurity(getReports, {
  requireAPIKey: true,
  rateLimit: 'api',
  validateQuery: reportQuerySchema
})

export const POST = withSecurity(generateReport, {
  requireAPIKey: true,
  rateLimit: 'reports', // Special rate limit for report generation
  validateBody: reportGenerateSchema,
  permissions: ['reports:write']
})