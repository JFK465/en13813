/**
 * PDF Security Module
 * Provides input validation and sanitization for PDF generation
 * Addresses CVE-2025-57810 in jsPDF <= 3.0.1
 */

import { AppError } from '@/lib/core/base.service';

// Maximum allowed dimensions for images in PDF generation
const MAX_IMAGE_WIDTH = 4096;
const MAX_IMAGE_HEIGHT = 4096;
const MAX_IMAGE_SIZE_MB = 10;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedData?: string | ArrayBuffer | Blob | File;
}

/**
 * Validates image data before passing to jsPDF.addImage
 * Prevents DoS attacks via malicious PNG files (CVE-2025-57810)
 */
export async function validateImageForPDF(
  imageData: string | ArrayBuffer | File | Blob,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    maxSizeMB?: number;
    allowedTypes?: string[];
  }
): Promise<ImageValidationResult> {
  const maxWidth = options?.maxWidth || MAX_IMAGE_WIDTH;
  const maxHeight = options?.maxHeight || MAX_IMAGE_HEIGHT;
  const maxSizeMB = options?.maxSizeMB || MAX_IMAGE_SIZE_MB;
  const allowedTypes = options?.allowedTypes || ALLOWED_IMAGE_TYPES;

  try {
    let blob: Blob;

    // Convert input to Blob for validation
    if (imageData instanceof File || imageData instanceof Blob) {
      blob = imageData;
    } else if (typeof imageData === 'string') {
      // Handle base64 or data URL
      if (imageData.startsWith('data:')) {
        const response = await fetch(imageData);
        blob = await response.blob();
      } else {
        // Assume base64 string
        const binaryString = atob(imageData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: 'image/png' });
      }
    } else if (imageData instanceof ArrayBuffer) {
      blob = new Blob([imageData]);
    } else {
      return {
        isValid: false,
        error: 'Invalid image data format'
      };
    }

    // Check file size
    const sizeMB = blob.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return {
        isValid: false,
        error: `Image size exceeds limit of ${maxSizeMB}MB`
      };
    }

    // Check MIME type
    if (!allowedTypes.includes(blob.type)) {
      return {
        isValid: false,
        error: `Image type ${blob.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    // Validate image dimensions using Image API
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);

    return new Promise((resolve) => {
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        if (img.width > maxWidth || img.height > maxHeight) {
          resolve({
            isValid: false,
            error: `Image dimensions (${img.width}x${img.height}) exceed maximum allowed (${maxWidth}x${maxHeight})`
          });
        } else {
          // Return original data if validation passes
          resolve({
            isValid: true,
            sanitizedData: imageData
          });
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          isValid: false,
          error: 'Failed to load image for validation'
        });
      };

      img.src = objectUrl;
    });
  } catch (error) {
    return {
      isValid: false,
      error: `Image validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Safe wrapper for jsPDF.addImage method
 * Always validate images before adding to PDF
 */
export async function safeAddImageToPDF(
  doc: any, // jsPDF instance
  imageData: string | ArrayBuffer | File | Blob,
  x: number,
  y: number,
  width: number,
  height: number,
  alias?: string,
  compression?: string,
  rotation?: number
): Promise<void> {
  const validation = await validateImageForPDF(imageData);

  if (!validation.isValid) {
    throw new AppError(
      `Image validation failed: ${validation.error}`,
      'INVALID_IMAGE_DATA',
      400
    );
  }

  // Only proceed with validated image data
  if (validation.sanitizedData) {
    // Convert Blob/File back to supported format for jsPDF
    let imageDataForPdf: string | ArrayBuffer;

    if (validation.sanitizedData instanceof Blob || validation.sanitizedData instanceof File) {
      // Convert Blob to ArrayBuffer for jsPDF
      const arrayBuffer = await validation.sanitizedData.arrayBuffer();
      imageDataForPdf = arrayBuffer;
    } else {
      imageDataForPdf = validation.sanitizedData;
    }

    doc.addImage(imageDataForPdf, x, y, width, height, alias, compression, rotation);
  }
}

/**
 * Validates URL before fetching image data
 * Prevents SSRF attacks
 */
export function validateImageURL(url: string): boolean {
  try {
    const parsedUrl = new URL(url);

    // Only allow HTTPS URLs
    if (parsedUrl.protocol !== 'https:') {
      return false;
    }

    // Prevent internal network access
    const hostname = parsedUrl.hostname.toLowerCase();
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
      'metadata.google.internal',
      '169.254.169.254' // AWS metadata endpoint
    ];

    if (blockedHosts.includes(hostname)) {
      return false;
    }

    // Check for private IP ranges
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipPattern.test(hostname)) {
      const parts = hostname.split('.').map(Number);
      // Check for private IP ranges (RFC 1918)
      if (
        parts[0] === 10 || // 10.0.0.0/8
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || // 172.16.0.0/12
        (parts[0] === 192 && parts[1] === 168) // 192.168.0.0/16
      ) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch and validate image from URL for PDF usage
 */
export async function fetchAndValidateImageForPDF(
  url: string,
  options?: Parameters<typeof validateImageForPDF>[1]
): Promise<ImageValidationResult> {
  if (!validateImageURL(url)) {
    return {
      isValid: false,
      error: 'Invalid or unsafe URL'
    };
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'image/*'
      },
      // Add timeout to prevent hanging on slow responses
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      return {
        isValid: false,
        error: `Failed to fetch image: HTTP ${response.status}`
      };
    }

    const blob = await response.blob();
    return validateImageForPDF(blob, options);
  } catch (error) {
    return {
      isValid: false,
      error: `Failed to fetch image: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Example usage guidance comment
/**
 * Usage Example:
 *
 * import { safeAddImageToPDF, fetchAndValidateImageForPDF } from '@/lib/security/pdf-security';
 * import jsPDF from 'jspdf';
 *
 * const doc = new jsPDF();
 *
 * // For local images/base64
 * await safeAddImageToPDF(doc, imageBase64, 10, 10, 100, 100);
 *
 * // For remote images
 * const validation = await fetchAndValidateImageForPDF('https://example.com/image.png');
 * if (validation.isValid && validation.sanitizedData) {
 *   await safeAddImageToPDF(doc, validation.sanitizedData, 10, 10, 100, 100);
 * }
 */