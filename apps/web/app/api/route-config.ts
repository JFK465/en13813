/**
 * Global API Route Configuration
 * Forces all API routes to be dynamic to prevent static generation errors
 */

// Force dynamic rendering for all API routes that use cookies/auth
export const dynamic = 'force-dynamic';

// Disable static generation for API routes
export const revalidate = 0;

// Allow streaming responses
export const runtime = 'nodejs';