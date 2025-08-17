'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadApiSpec() {
      try {
        const response = await fetch('/api/docs')
        if (!response.ok) {
          throw new Error('Failed to load API specification')
        }
        const apiSpec = await response.json()
        setSpec(apiSpec)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadApiSpec()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API Documentation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load API Documentation</h1>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
            <p className="text-gray-600">Compliance SaaS Platform REST API</p>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download OpenAPI Spec
            </a>
          </div>
        </div>
      </div>

      <div className="swagger-ui-container">
        {spec && (
          <SwaggerUI
            spec={spec}
            docExpansion="list"
            defaultModelExpandDepth={2}
            defaultModelsExpandDepth={1}
            displayRequestDuration={true}
            tryItOutEnabled={true}
            requestInterceptor={(request: any) => {
              // Add custom headers or modify requests here
              return request
            }}
            responseInterceptor={(response: any) => {
              // Handle responses here
              return response
            }}
          />
        )}
      </div>

      <style jsx global>{`
        .swagger-ui-container {
          max-width: none;
        }
        
        .swagger-ui .topbar {
          display: none;
        }
        
        .swagger-ui .info {
          margin: 20px 0;
        }
        
        .swagger-ui .scheme-container {
          background: #fafafa;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          border: 1px solid #ebebeb;
        }
        
        .swagger-ui .btn.authorize {
          color: #fff;
          background-color: #3b82f6;
          border-color: #3b82f6;
        }
        
        .swagger-ui .btn.authorize:hover {
          background-color: #2563eb;
          border-color: #2563eb;
        }
        
        .swagger-ui .opblock.opblock-get .opblock-summary-method {
          background: #10b981;
        }
        
        .swagger-ui .opblock.opblock-post .opblock-summary-method {
          background: #3b82f6;
        }
        
        .swagger-ui .opblock.opblock-put .opblock-summary-method {
          background: #f59e0b;
        }
        
        .swagger-ui .opblock.opblock-delete .opblock-summary-method {
          background: #ef4444;
        }
      `}</style>
    </div>
  )
}