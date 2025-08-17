import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Document Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login')
    await page.fill('[data-testid="email-input"]', 'admin@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // Navigate to documents
    await page.goto('/documents')
    await expect(page).toHaveURL('/documents')
  })

  test('should display documents interface', async ({ page }) => {
    // Should show documents list
    await expect(page.locator('[data-testid="documents-list"]')).toBeVisible()
    
    // Should show search and filters
    await expect(page.locator('[data-testid="documents-search"]')).toBeVisible()
    await expect(page.locator('[data-testid="documents-filters"]')).toBeVisible()
    
    // Should show upload button
    await expect(page.locator('[data-testid="upload-document-button"]')).toBeVisible()
    
    // Should show new document button
    await expect(page.locator('[data-testid="new-document-button"]')).toBeVisible()
  })

  test('should create a new document', async ({ page }) => {
    // Click new document button
    await page.click('[data-testid="new-document-button"]')
    
    // Should navigate to document editor
    await expect(page).toHaveURL(/\/documents\/new/)
    
    // Fill in document details
    await page.fill('[data-testid="document-title"]', 'Test Policy Document')
    await page.fill('[data-testid="document-description"]', 'This is a test policy document')
    
    // Select category
    await page.click('[data-testid="document-category"]')
    await page.click('[data-testid="category-policy"]')
    
    // Add content
    await page.fill('[data-testid="document-content"]', 'This is the content of the test policy document.')
    
    // Add tags
    await page.fill('[data-testid="document-tags"]', 'policy, test, compliance')
    
    // Save document
    await page.click('[data-testid="save-document-button"]')
    
    // Should show success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
    
    // Should redirect to documents list
    await expect(page).toHaveURL('/documents')
    
    // Document should appear in list
    await expect(page.locator('[data-testid="document-item"]').first()).toContainText('Test Policy Document')
  })

  test('should upload a file', async ({ page }) => {
    // Create a test file
    const testFile = path.join(__dirname, '../fixtures/test-document.pdf')
    
    // Click upload button
    await page.click('[data-testid="upload-document-button"]')
    
    // Should open upload modal
    await expect(page.locator('[data-testid="upload-modal"]')).toBeVisible()
    
    // Upload file
    const fileInput = page.locator('[data-testid="file-input"]')
    await fileInput.setInputFiles(testFile)
    
    // Fill in metadata
    await page.fill('[data-testid="upload-title"]', 'Uploaded PDF Document')
    await page.fill('[data-testid="upload-description"]', 'Document uploaded from PDF file')
    
    // Select category
    await page.click('[data-testid="upload-category"]')
    await page.click('[data-testid="category-procedure"]')
    
    // Upload
    await page.click('[data-testid="upload-submit-button"]')
    
    // Should show upload progress
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible()
    
    // Should show success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
    
    // Should close modal
    await expect(page.locator('[data-testid="upload-modal"]')).not.toBeVisible()
    
    // Document should appear in list
    await expect(page.locator('[data-testid="document-item"]').first()).toContainText('Uploaded PDF Document')
  })

  test('should search documents', async ({ page }) => {
    // Create test documents
    const documents = [
      { title: 'ISO 50001 Energy Policy', content: 'Energy management policy' },
      { title: 'GDPR Data Protection', content: 'Personal data protection procedures' },
      { title: 'Fire Safety Procedure', content: 'Emergency evacuation procedures' },
    ]
    
    for (const doc of documents) {
      await page.click('[data-testid="new-document-button"]')
      await page.fill('[data-testid="document-title"]', doc.title)
      await page.fill('[data-testid="document-content"]', doc.content)
      await page.click('[data-testid="save-document-button"]')
      await page.waitForTimeout(500)
    }
    
    // Search for ISO
    await page.fill('[data-testid="documents-search"]', 'ISO')
    await page.press('[data-testid="documents-search"]', 'Enter')
    
    // Should show only ISO document
    await expect(page.locator('[data-testid="document-item"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="document-item"]')).toContainText('ISO 50001')
    
    // Search for GDPR
    await page.fill('[data-testid="documents-search"]', 'GDPR')
    await page.press('[data-testid="documents-search"]', 'Enter')
    
    // Should show only GDPR document
    await expect(page.locator('[data-testid="document-item"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="document-item"]')).toContainText('GDPR')
    
    // Clear search
    await page.fill('[data-testid="documents-search"]', '')
    await page.press('[data-testid="documents-search"]', 'Enter')
    
    // Should show all documents
    await expect(page.locator('[data-testid="document-item"]')).toHaveCount(3)
  })

  test('should filter documents by category', async ({ page }) => {
    // Create documents with different categories
    const documents = [
      { title: 'Policy Document', category: 'policy' },
      { title: 'Procedure Document', category: 'procedure' },
      { title: 'Manual Document', category: 'manual' },
    ]
    
    for (const doc of documents) {
      await page.click('[data-testid="new-document-button"]')
      await page.fill('[data-testid="document-title"]', doc.title)
      await page.click('[data-testid="document-category"]')
      await page.click(`[data-testid="category-${doc.category}"]`)
      await page.click('[data-testid="save-document-button"]')
      await page.waitForTimeout(500)
    }
    
    // Filter by policy
    await page.click('[data-testid="category-filter"]')
    await page.click('[data-testid="filter-policy"]')
    
    // Should show only policy documents
    await expect(page.locator('[data-testid="document-item"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="document-item"]')).toContainText('Policy Document')
    
    // Filter by procedure
    await page.click('[data-testid="category-filter"]')
    await page.click('[data-testid="filter-procedure"]')
    
    // Should show only procedure documents
    await expect(page.locator('[data-testid="document-item"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="document-item"]')).toContainText('Procedure Document')
    
    // Clear filter
    await page.click('[data-testid="category-filter"]')
    await page.click('[data-testid="filter-all"]')
    
    // Should show all documents
    await expect(page.locator('[data-testid="document-item"]')).toHaveCount(3)
  })

  test('should edit document', async ({ page }) => {
    // Create a document first
    await page.click('[data-testid="new-document-button"]')
    await page.fill('[data-testid="document-title"]', 'Original Document')
    await page.fill('[data-testid="document-content"]', 'Original content')
    await page.click('[data-testid="save-document-button"]')
    
    // Click on document to view
    await page.click('[data-testid="document-item"]')
    
    // Should navigate to document view
    await expect(page).toHaveURL(/\/documents\/[^/]+$/)
    
    // Click edit button
    await page.click('[data-testid="edit-document-button"]')
    
    // Should switch to edit mode
    await expect(page.locator('[data-testid="document-title"]')).toBeVisible()
    
    // Edit document
    await page.fill('[data-testid="document-title"]', 'Updated Document Title')
    await page.fill('[data-testid="document-content"]', 'Updated document content')
    
    // Save changes
    await page.click('[data-testid="save-document-button"]')
    
    // Should show success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
    
    // Should show updated content
    await expect(page.locator('[data-testid="document-title-display"]')).toContainText('Updated Document Title')
    await expect(page.locator('[data-testid="document-content-display"]')).toContainText('Updated document content')
  })

  test('should show document version history', async ({ page }) => {
    // Create a document
    await page.click('[data-testid="new-document-button"]')
    await page.fill('[data-testid="document-title"]', 'Versioned Document')
    await page.fill('[data-testid="document-content"]', 'Version 1 content')
    await page.click('[data-testid="save-document-button"]')
    
    // Edit document to create version 2
    await page.click('[data-testid="document-item"]')
    await page.click('[data-testid="edit-document-button"]')
    await page.fill('[data-testid="document-content"]', 'Version 2 content')
    await page.click('[data-testid="save-document-button"]')
    
    // Edit again to create version 3
    await page.click('[data-testid="edit-document-button"]')
    await page.fill('[data-testid="document-content"]', 'Version 3 content')
    await page.click('[data-testid="save-document-button"]')
    
    // Click version history tab
    await page.click('[data-testid="version-history-tab"]')
    
    // Should show all versions
    await expect(page.locator('[data-testid="version-item"]')).toHaveCount(3)
    
    // Should show latest version first
    const versions = page.locator('[data-testid="version-item"]')
    await expect(versions.nth(0)).toContainText('Version 3')
    await expect(versions.nth(1)).toContainText('Version 2')
    await expect(versions.nth(2)).toContainText('Version 1')
    
    // Click on older version
    await versions.nth(1).click()
    
    // Should show version 2 content
    await expect(page.locator('[data-testid="document-content-display"]')).toContainText('Version 2 content')
  })

  test('should delete document', async ({ page }) => {
    // Create a document
    await page.click('[data-testid="new-document-button"]')
    await page.fill('[data-testid="document-title"]', 'Document to Delete')
    await page.click('[data-testid="save-document-button"]')
    
    // Click on document to view
    await page.click('[data-testid="document-item"]')
    
    // Click delete button
    await page.click('[data-testid="delete-document-button"]')
    
    // Should show confirmation dialog
    await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible()
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete"]')
    
    // Should show success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
    
    // Should redirect to documents list
    await expect(page).toHaveURL('/documents')
    
    // Document should not appear in list
    await expect(page.locator('[data-testid="document-item"]')).not.toBeVisible()
  })

  test('should share document', async ({ page }) => {
    // Create a document
    await page.click('[data-testid="new-document-button"]')
    await page.fill('[data-testid="document-title"]', 'Document to Share')
    await page.click('[data-testid="save-document-button"]')
    
    // Click on document to view
    await page.click('[data-testid="document-item"]')
    
    // Click share button
    await page.click('[data-testid="share-document-button"]')
    
    // Should open share modal
    await expect(page.locator('[data-testid="share-modal"]')).toBeVisible()
    
    // Add email address
    await page.fill('[data-testid="share-email"]', 'colleague@example.com')
    
    // Select permission level
    await page.click('[data-testid="share-permission"]')
    await page.click('[data-testid="permission-read"]')
    
    // Add message
    await page.fill('[data-testid="share-message"]', 'Please review this document')
    
    // Send share invitation
    await page.click('[data-testid="send-share-button"]')
    
    // Should show success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
    
    // Should close modal
    await expect(page.locator('[data-testid="share-modal"]')).not.toBeVisible()
  })

  test('should export document as PDF', async ({ page }) => {
    // Create a document
    await page.click('[data-testid="new-document-button"]')
    await page.fill('[data-testid="document-title"]', 'Document to Export')
    await page.fill('[data-testid="document-content"]', 'This document will be exported as PDF')
    await page.click('[data-testid="save-document-button"]')
    
    // Click on document to view
    await page.click('[data-testid="document-item"]')
    
    // Start download listener
    const downloadPromise = page.waitForEvent('download')
    
    // Click export PDF button
    await page.click('[data-testid="export-pdf-button"]')
    
    // Wait for download
    const download = await downloadPromise
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/\.pdf$/)
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
  })

  test('should validate file upload restrictions', async ({ page }) => {
    // Try to upload invalid file type
    await page.click('[data-testid="upload-document-button"]')
    
    // Create a test file with invalid extension
    const invalidFile = path.join(__dirname, '../fixtures/malicious.exe')
    
    const fileInput = page.locator('[data-testid="file-input"]')
    await fileInput.setInputFiles(invalidFile)
    
    // Should show error message
    await expect(page.locator('[data-testid="file-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="file-error"]')).toContainText('Invalid file type')
    
    // Upload button should be disabled
    await expect(page.locator('[data-testid="upload-submit-button"]')).toBeDisabled()
  })
})