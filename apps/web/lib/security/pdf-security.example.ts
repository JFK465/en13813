/**
 * Example: Secure PDF Generation with Image Validation
 * Demonstrates how to use the pdf-security module to prevent CVE-2025-57810
 */

import jsPDF from 'jspdf';
import {
  safeAddImageToPDF,
  fetchAndValidateImageForPDF,
  validateImageForPDF
} from './pdf-security';

/**
 * Example 1: Generate PDF with validated local image
 */
export async function generatePDFWithLocalImage(
  imageBase64: string,
  title: string
): Promise<Uint8Array> {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.text(title, 20, 20);

  try {
    // Safely add image with validation
    await safeAddImageToPDF(
      doc,
      imageBase64,
      20, // x position
      40, // y position
      170, // width
      100, // height
      'product-image',
      'JPEG',
      0
    );

    doc.setFontSize(10);
    doc.text('Image added securely with validation', 20, 150);
  } catch (error) {
    // Handle validation error
    doc.setFontSize(10);
    doc.text('Image could not be added: ' + (error as Error).message, 20, 40);
  }

  return new Uint8Array(doc.output('arraybuffer'));
}

/**
 * Example 2: Generate PDF with remote image
 */
export async function generatePDFWithRemoteImage(
  imageUrl: string,
  title: string
): Promise<Uint8Array> {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.text(title, 20, 20);

  try {
    // Fetch and validate remote image
    const validation = await fetchAndValidateImageForPDF(imageUrl, {
      maxWidth: 2048,
      maxHeight: 2048,
      maxSizeMB: 5,
      allowedTypes: ['image/jpeg', 'image/png']
    });

    if (validation.isValid && validation.sanitizedData) {
      // Safely add validated image
      await safeAddImageToPDF(
        doc,
        validation.sanitizedData,
        20,
        40,
        170,
        100,
        'remote-image',
        'PNG',
        0
      );

      doc.setFontSize(10);
      doc.text('Remote image added securely', 20, 150);
    } else {
      // Handle validation failure
      doc.setFontSize(10);
      doc.text('Image validation failed: ' + (validation.error || 'Unknown error'), 20, 40);
    }
  } catch (error) {
    // Handle fetch error
    doc.setFontSize(10);
    doc.text('Failed to fetch image: ' + (error as Error).message, 20, 40);
  }

  return new Uint8Array(doc.output('arraybuffer'));
}

/**
 * Example 3: Generate PDF with user-uploaded image
 */
export async function generatePDFWithUploadedImage(
  file: File,
  title: string
): Promise<Uint8Array> {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.text(title, 20, 20);

  try {
    // Validate uploaded file
    const validation = await validateImageForPDF(file, {
      maxWidth: 3000,
      maxHeight: 3000,
      maxSizeMB: 8
    });

    if (validation.isValid && validation.sanitizedData) {
      // Convert file to base64 for jsPDF
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await safeAddImageToPDF(
        doc,
        base64,
        20,
        40,
        170,
        100,
        file.name,
        'JPEG',
        0
      );

      doc.setFontSize(10);
      doc.text(`Uploaded image "${file.name}" added securely`, 20, 150);
    } else {
      doc.setFontSize(10);
      doc.text('Upload validation failed: ' + (validation.error || 'Unknown error'), 20, 40);
    }
  } catch (error) {
    doc.setFontSize(10);
    doc.text('Failed to process upload: ' + (error as Error).message, 20, 40);
  }

  return new Uint8Array(doc.output('arraybuffer'));
}

/**
 * Example 4: Batch image processing with validation
 */
export async function generatePDFWithMultipleImages(
  images: Array<{ data: string | File; name: string }>,
  title: string
): Promise<Uint8Array> {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.text(title, 20, 20);

  let yPosition = 40;
  const successfulImages: string[] = [];
  const failedImages: Array<{ name: string; error: string }> = [];

  for (const image of images) {
    try {
      const validation = await validateImageForPDF(image.data, {
        maxWidth: 1024,
        maxHeight: 1024,
        maxSizeMB: 2
      });

      if (validation.isValid && validation.sanitizedData) {
        // Add new page if needed
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }

        await safeAddImageToPDF(
          doc,
          validation.sanitizedData,
          20,
          yPosition,
          80,
          60,
          image.name,
          'JPEG',
          0
        );

        doc.setFontSize(8);
        doc.text(image.name, 105, yPosition + 30);

        successfulImages.push(image.name);
        yPosition += 70;
      } else {
        failedImages.push({
          name: image.name,
          error: validation.error || 'Validation failed'
        });
      }
    } catch (error) {
      failedImages.push({
        name: image.name,
        error: (error as Error).message
      });
    }
  }

  // Add summary page
  doc.addPage();
  doc.setFontSize(14);
  doc.text('Processing Summary', 20, 20);

  doc.setFontSize(10);
  doc.text(`Successfully added: ${successfulImages.length} images`, 20, 35);
  doc.text(`Failed: ${failedImages.length} images`, 20, 45);

  if (failedImages.length > 0) {
    let y = 60;
    doc.setFontSize(9);
    doc.text('Failed images:', 20, y);
    y += 10;

    for (const failed of failedImages) {
      doc.text(`- ${failed.name}: ${failed.error}`, 25, y);
      y += 7;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    }
  }

  return new Uint8Array(doc.output('arraybuffer'));
}

/**
 * Usage in EN13813 context
 */
export async function generateEN13813DeliveryNoteWithLogo(
  logoUrl: string,
  deliveryData: any
): Promise<Uint8Array> {
  const doc = new jsPDF();

  // Validate and add company logo
  try {
    const logoValidation = await fetchAndValidateImageForPDF(logoUrl, {
      maxWidth: 500,
      maxHeight: 200,
      maxSizeMB: 1,
      allowedTypes: ['image/png', 'image/jpeg']
    });

    if (logoValidation.isValid && logoValidation.sanitizedData) {
      await safeAddImageToPDF(
        doc,
        logoValidation.sanitizedData,
        15,
        15,
        40,
        15,
        'company-logo'
      );
    }
  } catch (error) {
    // Continue without logo if validation fails
    console.warn('Logo could not be added:', error);
  }

  // Add delivery note content
  doc.setFontSize(20);
  doc.text('EN 13813 Lieferschein', 105, 25, { align: 'center' });

  // ... rest of delivery note generation

  return new Uint8Array(doc.output('arraybuffer'));
}