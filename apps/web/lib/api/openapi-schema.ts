// OpenAPI schema for API documentation
export const openApiSchema = {
  openapi: '3.0.0',
  info: {
    title: 'Compliance SaaS API',
    version: '1.0.0',
    description: `
# Compliance SaaS Platform API

Enterprise-grade API for compliance management, document workflows, and reporting.

## Authentication

All API endpoints require authentication using API keys:

\`\`\`
Authorization: Bearer sk_your_api_key_here
\`\`\`

## Rate Limiting

API requests are rate limited:
- **Standard endpoints**: 100 requests per minute
- **File uploads**: 10 requests per hour  
- **Report generation**: 5 requests per 10 minutes

Rate limit information is included in response headers:
- \`X-RateLimit-Limit\`: Request limit for the time window
- \`X-RateLimit-Remaining\`: Remaining requests in current window
- \`X-RateLimit-Reset\`: Time when the rate limit resets

## Webhooks

The API supports webhooks for real-time event notifications. See the webhooks section for details.

## Error Handling

The API uses conventional HTTP response codes and returns JSON error objects:

\`\`\`json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
\`\`\`
    `,
    contact: {
      name: 'API Support',
      email: 'api@compliance-saas.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'https://api.compliance-saas.com/v1',
      description: 'Production server'
    },
    {
      url: 'https://api-staging.compliance-saas.com/v1', 
      description: 'Staging server'
    },
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Development server'
    }
  ],
  security: [
    {
      ApiKeyAuth: []
    }
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'API Key',
        description: 'API key authentication. Use format: Bearer sk_your_api_key'
      }
    },
    schemas: {
      // Common schemas
      Error: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'string',
            description: 'Error message'
          },
          code: {
            type: 'string',
            description: 'Error code'
          },
          details: {
            type: 'object',
            description: 'Additional error details'
          }
        }
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            minimum: 1,
            description: 'Current page number'
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            description: 'Number of items per page'
          },
          total: {
            type: 'integer',
            description: 'Total number of items'
          },
          totalPages: {
            type: 'integer',
            description: 'Total number of pages'
          }
        }
      },
      
      // Document schemas
      Document: {
        type: 'object',
        required: ['id', 'title', 'type', 'status', 'created_at'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique document identifier'
          },
          title: {
            type: 'string',
            maxLength: 255,
            description: 'Document title'
          },
          type: {
            type: 'string',
            enum: ['policy', 'certificate', 'report', 'evidence', 'audit', 'other'],
            description: 'Document type'
          },
          category: {
            type: 'string',
            nullable: true,
            description: 'Document category'
          },
          status: {
            type: 'string',
            enum: ['draft', 'pending_approval', 'approved', 'archived', 'expired'],
            description: 'Document status'
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Document tags'
          },
          metadata: {
            type: 'object',
            description: 'Additional document metadata'
          },
          current_version_id: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            description: 'Current version ID'
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp'
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp'
          },
          created_by: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            description: 'Creator user ID'
          }
        }
      },
      DocumentCreate: {
        type: 'object',
        required: ['title', 'type'],
        properties: {
          title: {
            type: 'string',
            maxLength: 255,
            description: 'Document title'
          },
          type: {
            type: 'string',
            enum: ['policy', 'certificate', 'report', 'evidence', 'audit', 'other'],
            description: 'Document type'
          },
          category: {
            type: 'string',
            description: 'Document category'
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Document tags'
          },
          metadata: {
            type: 'object',
            description: 'Additional document metadata'
          }
        }
      },

      // Workflow schemas
      WorkflowInstance: {
        type: 'object',
        required: ['id', 'title', 'status', 'created_at'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Workflow instance ID'
          },
          workflow_id: {
            type: 'string',
            format: 'uuid',
            description: 'Workflow template ID'
          },
          title: {
            type: 'string',
            description: 'Workflow title'
          },
          description: {
            type: 'string',
            nullable: true,
            description: 'Workflow description'
          },
          status: {
            type: 'string',
            enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'],
            description: 'Workflow status'
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'urgent'],
            description: 'Workflow priority'
          },
          resource_type: {
            type: 'string',
            description: 'Type of resource being processed'
          },
          resource_id: {
            type: 'string',
            format: 'uuid',
            description: 'ID of resource being processed'
          },
          current_step_id: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            description: 'Current step ID'
          },
          due_date: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'Due date'
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp'
          },
          started_by: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            description: 'User who started the workflow'
          }
        }
      },
      WorkflowStep: {
        type: 'object',
        required: ['id', 'step_name', 'step_type', 'status'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Step ID'
          },
          step_name: {
            type: 'string',
            description: 'Step name'
          },
          step_type: {
            type: 'string',
            enum: ['approval', 'review', 'notification', 'condition', 'parallel'],
            description: 'Step type'
          },
          step_order: {
            type: 'integer',
            description: 'Step order in workflow'
          },
          status: {
            type: 'string',
            enum: ['pending', 'in_progress', 'completed', 'skipped', 'failed'],
            description: 'Step status'
          },
          assigned_to: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            description: 'Assigned user ID'
          },
          decision: {
            type: 'string',
            nullable: true,
            description: 'Step decision'
          },
          comments: {
            type: 'string',
            nullable: true,
            description: 'Step comments'
          },
          completed_at: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'Completion timestamp'
          }
        }
      },
      WorkflowStepAction: {
        type: 'object',
        required: ['action'],
        properties: {
          action: {
            type: 'string',
            enum: ['approve', 'reject', 'request_changes', 'delegate', 'comment'],
            description: 'Action to perform'
          },
          decision: {
            type: 'string',
            description: 'Decision reason'
          },
          comments: {
            type: 'string',
            description: 'Action comments'
          },
          delegateTo: {
            type: 'string',
            format: 'uuid',
            description: 'User ID to delegate to (for delegate action)'
          }
        }
      },

      // Report schemas
      Report: {
        type: 'object',
        required: ['id', 'title', 'type', 'status', 'created_at'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Report ID'
          },
          title: {
            type: 'string',
            description: 'Report title'
          },
          description: {
            type: 'string',
            nullable: true,
            description: 'Report description'
          },
          type: {
            type: 'string',
            enum: ['compliance_dashboard', 'audit_report', 'document_overview', 'workflow_summary'],
            description: 'Report type'
          },
          format: {
            type: 'string',
            enum: ['pdf', 'html', 'csv', 'json'],
            description: 'Report format'
          },
          status: {
            type: 'string',
            enum: ['draft', 'generating', 'completed', 'failed', 'archived'],
            description: 'Report status'
          },
          file_size: {
            type: 'integer',
            nullable: true,
            description: 'File size in bytes'
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp'
          },
          completed_at: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'Completion timestamp'
          }
        }
      },
      ReportGenerate: {
        type: 'object',
        required: ['templateId', 'title'],
        properties: {
          templateId: {
            type: 'string',
            format: 'uuid',
            description: 'Report template ID'
          },
          title: {
            type: 'string',
            description: 'Report title'
          },
          description: {
            type: 'string',
            description: 'Report description'
          },
          format: {
            type: 'string',
            enum: ['pdf', 'html', 'csv', 'json'],
            default: 'pdf',
            description: 'Report format'
          },
          parameters: {
            type: 'object',
            description: 'Report parameters'
          }
        }
      },

      // Webhook schemas
      WebhookEvent: {
        type: 'object',
        required: ['id', 'event', 'data', 'timestamp'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Event ID'
          },
          event: {
            type: 'string',
            description: 'Event type'
          },
          data: {
            type: 'object',
            description: 'Event data'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Event timestamp'
          },
          tenant_id: {
            type: 'string',
            format: 'uuid',
            description: 'Tenant ID'
          }
        }
      }
    },
    
    responses: {
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      Unauthorized: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      Forbidden: {
        description: 'Access forbidden',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/Error' },
                {
                  type: 'object',
                  properties: {
                    details: {
                      type: 'object',
                      properties: {
                        errors: {
                          type: 'array',
                          items: {
                            type: 'string'
                          }
                        }
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      },
      RateLimitExceeded: {
        description: 'Rate limit exceeded',
        headers: {
          'X-RateLimit-Limit': {
            schema: {
              type: 'integer'
            },
            description: 'Request limit for the time window'
          },
          'X-RateLimit-Remaining': {
            schema: {
              type: 'integer'
            },
            description: 'Remaining requests in current window'
          },
          'X-RateLimit-Reset': {
            schema: {
              type: 'integer'
            },
            description: 'Time when the rate limit resets (Unix timestamp)'
          },
          'Retry-After': {
            schema: {
              type: 'integer'
            },
            description: 'Seconds to wait before retrying'
          }
        },
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      }
    }
  },
  
  paths: {
    // Document endpoints will be added by route handlers
  },
  
  tags: [
    {
      name: 'Documents',
      description: 'Document management operations'
    },
    {
      name: 'Workflows', 
      description: 'Workflow and approval process operations'
    },
    {
      name: 'Reports',
      description: 'Report generation and management'
    },
    {
      name: 'Webhooks',
      description: 'Webhook configuration and events'
    },
    {
      name: 'API Keys',
      description: 'API key management'
    }
  ]
}