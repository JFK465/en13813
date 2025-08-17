import { NextRequest } from 'next/server'
import { openApiSchema } from '@/lib/api/openapi-schema'

/**
 * GET /api/docs
 * Returns the OpenAPI 3.0 specification as JSON
 */
export async function GET(request: NextRequest) {
  try {
    return new Response(JSON.stringify(openApiSchema, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  } catch (error) {
    console.error('Error generating OpenAPI spec:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate API documentation' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}