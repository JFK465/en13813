import { validateFile } from './validation'

// File type allowlists for different use cases
export const allowedFileTypes = {
  documents: {
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/rtf',
      'application/json'
    ],
    extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf', 'json'],
    maxSize: 25 * 1024 * 1024 // 25MB
  },
  images: {
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ],
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  avatars: {
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp'
    ],
    extensions: ['jpg', 'jpeg', 'png', 'webp'],
    maxSize: 2 * 1024 * 1024 // 2MB
  },
  exports: {
    mimeTypes: [
      'application/pdf',
      'text/csv',
      'application/json',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    extensions: ['pdf', 'csv', 'json', 'xlsx'],
    maxSize: 50 * 1024 * 1024 // 50MB
  }
}

// Dangerous file extensions that should never be uploaded
const dangerousExtensions = [
  'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar', 'app', 'deb', 'pkg', 'dmg',
  'php', 'asp', 'aspx', 'jsp', 'htm', 'html', 'xml', 'svg', 'py', 'rb', 'pl', 'sh', 'ps1',
  'msi', 'dll', 'sys', 'drv', 'inf', 'reg', 'hta', 'ws', 'wsf', 'wsc', 'sct', 'lnk'
]

// Magic bytes for file type verification
const fileMagicBytes: Record<string, number[][]> = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'image/jpeg': [[0xFF, 0xD8, 0xFF]], // JPEG
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]], // PNG
  'image/gif': [[0x47, 0x49, 0x46, 0x38]], // GIF8
  'application/zip': [[0x50, 0x4B, 0x03, 0x04], [0x50, 0x4B, 0x05, 0x06]], // ZIP
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [[0x50, 0x4B]], // DOCX (ZIP-based)
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [[0x50, 0x4B]], // XLSX (ZIP-based)
}

// Validate file upload security
export async function validateFileUpload(
  file: File, 
  uploadType: keyof typeof allowedFileTypes
): Promise<{
  valid: boolean
  error?: string
  warnings?: string[]
}> {
  const warnings: string[] = []
  const config = allowedFileTypes[uploadType]

  // Basic file validation
  const basicValidation = validateFile(file, {
    maxSize: config.maxSize,
    allowedTypes: config.mimeTypes,
    allowedExtensions: config.extensions
  })

  if (!basicValidation.valid) {
    return { valid: false, error: basicValidation.error }
  }

  // Check for dangerous extensions
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension && dangerousExtensions.includes(extension)) {
    return { 
      valid: false, 
      error: `File extension .${extension} is not allowed for security reasons` 
    }
  }

  // Verify file content matches claimed type (magic bytes check)
  const magicBytesValidation = await verifyFileContent(file)
  if (!magicBytesValidation.valid) {
    if (magicBytesValidation.error) {
      return { valid: false, error: magicBytesValidation.error }
    }
    if (magicBytesValidation.warning) {
      warnings.push(magicBytesValidation.warning)
    }
  }

  // Additional security checks
  const securityChecks = await performSecurityChecks(file)
  if (!securityChecks.valid) {
    return { valid: false, error: securityChecks.error }
  }
  if (securityChecks.warnings) {
    warnings.push(...securityChecks.warnings)
  }

  return { 
    valid: true, 
    warnings: warnings.length > 0 ? warnings : undefined 
  }
}

// Verify file content matches claimed MIME type
async function verifyFileContent(file: File): Promise<{
  valid: boolean
  error?: string
  warning?: string
}> {
  try {
    // Read first 32 bytes to check magic bytes
    const buffer = await file.slice(0, 32).arrayBuffer()
    const bytes = new Uint8Array(buffer)
    
    const expectedMagicBytes = fileMagicBytes[file.type]
    if (!expectedMagicBytes) {
      // No magic bytes defined for this type, skip verification
      return { valid: true }
    }

    // Check if any of the expected magic byte patterns match
    const matches = expectedMagicBytes.some(pattern => 
      pattern.every((byte, index) => bytes[index] === byte)
    )

    if (!matches) {
      // For Office documents, they're ZIP-based so check for ZIP signature
      if (file.type.includes('openxmlformats') && 
          bytes[0] === 0x50 && bytes[1] === 0x4B) {
        return { valid: true }
      }

      return {
        valid: false,
        error: `File content does not match claimed type ${file.type}`
      }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: true,
      warning: 'Could not verify file content, proceeding with caution'
    }
  }
}

// Perform additional security checks
async function performSecurityChecks(file: File): Promise<{
  valid: boolean
  error?: string
  warnings?: string[]
}> {
  const warnings: string[] = []

  // Check file name for suspicious patterns
  const suspiciousPatterns = [
    /\.(php|asp|jsp|cgi)\./i, // Double extensions
    /[<>:"|?*]/, // Invalid filename characters
    /^\.|\.\./, // Hidden files or path traversal
    /[\x00-\x1f\x7f-\x9f]/, // Control characters
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      return { 
        valid: false, 
        error: 'Filename contains suspicious patterns' 
      }
    }
  }

  // Check for excessively long filename
  if (file.name.length > 255) {
    return { 
      valid: false, 
      error: 'Filename is too long' 
    }
  }

  // Check for unusual file size patterns
  if (file.size === 0) {
    return { 
      valid: false, 
      error: 'Empty files are not allowed' 
    }
  }

  // Check for suspicious MIME type mismatches
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension && file.type) {
    const mimeToExtension: Record<string, string[]> = {
      'application/pdf': ['pdf'],
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'text/plain': ['txt'],
      'application/json': ['json'],
    }

    const expectedExtensions = mimeToExtension[file.type]
    if (expectedExtensions && !expectedExtensions.includes(extension)) {
      warnings.push(`File extension .${extension} doesn't match MIME type ${file.type}`)
    }
  }

  return { 
    valid: true, 
    warnings: warnings.length > 0 ? warnings : undefined 
  }
}

// Generate secure filename
export function generateSecureFilename(originalName: string, userId?: string): string {
  // Extract extension
  const extension = originalName.split('.').pop()?.toLowerCase() || ''
  
  // Remove dangerous characters and normalize
  const baseName = originalName
    .replace(/\.[^.]*$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9\-_\s]/g, '') // Remove special chars
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 50) // Limit length

  // Generate unique suffix
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const userSuffix = userId ? userId.substring(0, 8) : 'anon'

  return `${baseName}_${userSuffix}_${timestamp}_${randomSuffix}.${extension}`
}

// Calculate file checksum for integrity verification
export async function calculateFileChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Scan file for malicious content (basic implementation)
export async function scanFileForMalware(file: File): Promise<{
  clean: boolean
  threats?: string[]
  error?: string
}> {
  try {
    // Read file content for analysis
    const text = await file.text()
    const threats: string[] = []

    // Basic malware patterns (extend with more sophisticated detection)
    const malwarePatterns = [
      /<script[^>]*>.*?<\/script>/gi, // Script tags
      /javascript:/gi, // JavaScript protocol
      /vbscript:/gi, // VBScript protocol
      /data:text\/html/gi, // Data URLs with HTML
      /document\.cookie/gi, // Cookie theft
      /window\.location/gi, // Redirection
      /eval\s*\(/gi, // Code evaluation
      /setTimeout\s*\(/gi, // Delayed execution
      /setInterval\s*\(/gi, // Repeated execution
    ]

    for (const pattern of malwarePatterns) {
      if (pattern.test(text)) {
        threats.push(`Suspicious pattern detected: ${pattern.source}`)
      }
    }

    // Check for suspicious file signatures
    if (text.includes('%PDF') && file.type !== 'application/pdf') {
      threats.push('PDF signature found in non-PDF file')
    }

    if (text.includes('PK') && !file.type.includes('zip') && !file.type.includes('office')) {
      threats.push('ZIP signature found in unexpected file type')
    }

    return {
      clean: threats.length === 0,
      threats: threats.length > 0 ? threats : undefined
    }
  } catch (error) {
    return {
      clean: true, // Assume clean if we can't scan
      error: 'Could not scan file content'
    }
  }
}

// Upload quota checking
export interface UploadQuota {
  dailyLimit: number
  monthlyLimit: number
  totalSizeLimit: number
  dailyUsed: number
  monthlyUsed: number
  totalSizeUsed: number
}

export function checkUploadQuota(file: File, quota: UploadQuota): {
  allowed: boolean
  reason?: string
  remainingDaily?: number
  remainingMonthly?: number
} {
  // Check daily limit
  if (quota.dailyUsed >= quota.dailyLimit) {
    return {
      allowed: false,
      reason: 'Daily upload limit exceeded'
    }
  }

  // Check monthly limit
  if (quota.monthlyUsed >= quota.monthlyLimit) {
    return {
      allowed: false,
      reason: 'Monthly upload limit exceeded'
    }
  }

  // Check total size limit
  if (quota.totalSizeUsed + file.size > quota.totalSizeLimit) {
    return {
      allowed: false,
      reason: 'Total storage limit exceeded'
    }
  }

  return {
    allowed: true,
    remainingDaily: quota.dailyLimit - quota.dailyUsed - 1,
    remainingMonthly: quota.monthlyLimit - quota.monthlyUsed - 1
  }
}