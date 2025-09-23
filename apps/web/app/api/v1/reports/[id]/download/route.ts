// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withSecurity, createAPIErrorResponse } from '@/lib/security/api-security'

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
 *       400:
 *         description: Report not ready for download
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
      return createAPIErrorResponse(
        `Report is not ready for download. Current status: ${report.status}`,
        400
      )
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
      console.error('Storage download error:', downloadError)
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
    
    // Create safe filename
    const safeTitle = report.title
      .replace(/[^a-zA-Z0-9\s-_]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .substring(0, 100) // Limit length
    
    const timestamp = new Date(report.created_at).toISOString().split('T')[0]
    const filename = `${safeTitle}_${timestamp}.${report.format}`

    // Convert Blob to ArrayBuffer for proper streaming
    const arrayBuffer = await fileData.arrayBuffer()

    // Return file as response with proper headers
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': arrayBuffer.byteLength.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        // Security headers for file downloads
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    })

  } catch (error: any) {
    console.error('Download report error:', error)
    return createAPIErrorResponse('Internal server error', 500)
  }
}

// Apply security and rate limiting
export const GET = withSecurity(downloadReport, {
  requireAPIKey: true,
  rateLimit: 'api',
  permissions: ['reports:read']
})