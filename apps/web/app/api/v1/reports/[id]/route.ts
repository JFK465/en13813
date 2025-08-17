import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withSecurity, createSecureAPIResponse, createAPIErrorResponse } from '@/lib/security/api-security'

/**
 * @swagger
 * /api/v1/reports/{id}:
 *   get:
 *     summary: Get report details
 *     description: Retrieve details of a specific report
 *     tags: [Reports]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Report'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
async function getReport(request: NextRequest, context: { params?: { id: string } }) {
  const params = context.params!;
  const supabase = await createClient()
  
  try {
    const { data: report, error } = await (supabase as any)
      .from('reports')
      .select(`
        *,
        report_templates(name, type, description)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createAPIErrorResponse('Report not found', 404)
      }
      return createAPIErrorResponse('Database error', 500)
    }

    return createSecureAPIResponse({ data: report })

  } catch (error: any) {
    console.error('Get report error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

/**
 * @swagger
 * /api/v1/reports/{id}/download:
 *   get:
 *     summary: Download report file
 *     description: Download the generated report file
 *     tags: [Reports]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           text/html:
 *             schema:
 *               type: string
 *           text/csv:
 *             schema:
 *               type: string
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
async function downloadReport(request: NextRequest, context: { params?: { id: string } }) {
  const params = context.params!;
  const supabase = await createClient()
  
  try {
    // Get report details
    const { data: report, error: reportError } = await (supabase as any)
      .from('reports')
      .select('*')
      .eq('id', params.id)
      .single()

    if (reportError || !report) {
      return createAPIErrorResponse('Report not found', 404)
    }

    // Check if report is completed
    if (report.status !== 'completed') {
      return createAPIErrorResponse('Report is not ready for download', 400)
    }

    // Check if report has a file path
    if (!report.file_path) {
      return createAPIErrorResponse('Report file not found', 404)
    }

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('reports')
      .download(report.file_path)

    if (downloadError || !fileData) {
      return createAPIErrorResponse('Failed to download report file', 500)
    }

    // Determine content type based on format
    const contentTypes: Record<string, string> = {
      pdf: 'application/pdf',
      html: 'text/html',
      csv: 'text/csv',
      json: 'application/json'
    }

    const contentType = contentTypes[report.format] || 'application/octet-stream'
    
    // Create filename
    const filename = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.${report.format}`

    // Return file as response
    return new NextResponse(fileData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': report.file_size?.toString() || '',
        'Cache-Control': 'private, no-cache'
      }
    })

  } catch (error: any) {
    console.error('Download report error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

/**
 * @swagger
 * /api/v1/reports/{id}:
 *   delete:
 *     summary: Delete report
 *     description: Delete a report (soft delete)
 *     tags: [Reports]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Report ID
 *     responses:
 *       204:
 *         description: Report deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
async function deleteReport(request: NextRequest, context: { params?: { id: string } }) {
  const params = context.params!;
  const supabase = await createClient()
  
  try {
    // Soft delete - set status to archived
    const { error } = await (supabase as any)
      .from('reports')
      .update({ 
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return createAPIErrorResponse('Report not found', 404)
      }
      return createAPIErrorResponse('Database error', 500)
    }

    return new NextResponse(null, { status: 204 })

  } catch (error: any) {
    console.error('Delete report error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

// Apply security and rate limiting
export const GET = withSecurity(getReport, {
  requireAPIKey: true,
  rateLimit: 'api',
  permissions: ['reports:read']
})

export const DELETE = withSecurity(deleteReport, {
  requireAPIKey: true,
  rateLimit: 'api',
  permissions: ['reports:delete']
})

