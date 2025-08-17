import { DocumentService } from '@/lib/core/documents'
import { setupTestEnvironment } from '@/tests/utils/test-db'
import { createMockFile } from '@/tests/utils/test-helpers'

describe('DocumentService', () => {
  let documentService: DocumentService
  let testEnv: any

  beforeEach(async () => {
    testEnv = await setupTestEnvironment()
    documentService = new DocumentService()
    
    // Mock the getCurrentTenantId method
    jest.spyOn(documentService as any, 'getCurrentTenantId').mockResolvedValue(testEnv.tenant.id)
  })

  afterEach(async () => {
    await testEnv.cleanup()
    jest.clearAllMocks()
  })

  describe('createDocument', () => {
    const documentData = {
      title: 'Test Document',
      description: 'Test document description',
      category: 'policy' as const,
      content: 'This is the document content',
      tags: ['test', 'policy'],
      metadata: { department: 'IT' },
    }

    it('should create document successfully', async () => {
      const documentId = await documentService.createDocument(documentData, testEnv.user.id)

      expect(documentId).toBeDefined()
      expect(typeof documentId).toBe('string')

      const createdDocument = await documentService.getById(documentId)
      expect(createdDocument).toMatchObject({
        title: documentData.title,
        description: documentData.description,
        category: documentData.category,
        content: documentData.content,
        tags: documentData.tags,
        metadata: documentData.metadata,
        version: 1,
        status: 'draft',
      })
    })

    it('should handle missing title', async () => {
      const invalidData = {
        ...documentData,
        title: '',
      }

      await expect(
        documentService.createDocument(invalidData, testEnv.user.id)
      ).rejects.toThrow()
    })

    it('should set default values correctly', async () => {
      const minimalData = {
        title: 'Minimal Document',
        content: 'Content',
      }

      const documentId = await documentService.createDocument(minimalData, testEnv.user.id)
      const createdDocument = await documentService.getById(documentId)

      expect(createdDocument).toMatchObject({
        category: 'other',
        status: 'draft',
        version: 1,
        tags: [],
        metadata: {},
      })
    })
  })

  describe('updateDocument', () => {
    let documentId: string

    beforeEach(async () => {
      const document = await testEnv.testDb.createTestDocument(testEnv.tenant.id, testEnv.user.id)
      documentId = document.id
    })

    it('should update document successfully', async () => {
      const updateData = {
        title: 'Updated Document Title',
        description: 'Updated description',
        content: 'Updated content',
        tags: ['updated', 'test'],
      }

      const success = await documentService.updateDocument(documentId, updateData, testEnv.user.id)

      expect(success).toBe(true)

      const updatedDocument = await documentService.getById(documentId)
      expect(updatedDocument).toMatchObject(updateData)
    })

    it('should increment version on content change', async () => {
      const updateData = {
        content: 'New content version',
      }

      await documentService.updateDocument(documentId, updateData, testEnv.user.id)

      const updatedDocument = await documentService.getById(documentId)
      expect(updatedDocument?.version).toBe(2)
    })

    it('should not increment version on metadata-only changes', async () => {
      const updateData = {
        tags: ['new-tag'],
        metadata: { newField: 'value' },
      }

      await documentService.updateDocument(documentId, updateData, testEnv.user.id)

      const updatedDocument = await documentService.getById(documentId)
      expect(updatedDocument?.version).toBe(1)
    })

    it('should handle non-existent document', async () => {
      const nonExistentId = 'non-existent-id'
      const updateData = { title: 'Updated Title' }

      await expect(
        documentService.updateDocument(nonExistentId, updateData, testEnv.user.id)
      ).rejects.toThrow()
    })
  })

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const file = createMockFile('test-document.pdf', 'application/pdf')
      const metadata = {
        title: 'Uploaded Document',
        description: 'Document from file upload',
        category: 'procedure' as const,
      }

      const documentId = await documentService.uploadFile(file, metadata, testEnv.user.id)

      expect(documentId).toBeDefined()

      const document = await documentService.getById(documentId)
      expect(document).toMatchObject({
        title: metadata.title,
        description: metadata.description,
        category: metadata.category,
        mimeType: 'application/pdf',
        fileSize: expect.any(Number),
        filePath: expect.stringContaining('.pdf'),
      })
    })

    it('should validate file type', async () => {
      const invalidFile = createMockFile('malicious.exe', 'application/executable')
      const metadata = {
        title: 'Malicious File',
        category: 'other' as const,
      }

      await expect(
        documentService.uploadFile(invalidFile, metadata, testEnv.user.id)
      ).rejects.toThrow('Invalid file type')
    })

    it('should validate file size', async () => {
      // Create a mock file that exceeds size limit
      const largeFile = new File(['x'.repeat(100 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf',
      })
      const metadata = {
        title: 'Large File',
        category: 'other' as const,
      }

      await expect(
        documentService.uploadFile(largeFile, metadata, testEnv.user.id)
      ).rejects.toThrow('File too large')
    })
  })

  describe('getDocuments', () => {
    beforeEach(async () => {
      // Create multiple test documents
      await testEnv.testDb.createTestDocument(testEnv.tenant.id, testEnv.user.id, {
        title: 'Document 1',
        category: 'policy',
        status: 'published',
        tags: ['policy', 'hr'],
      })

      await testEnv.testDb.createTestDocument(testEnv.tenant.id, testEnv.user.id, {
        title: 'Document 2',
        category: 'procedure',
        status: 'draft',
        tags: ['procedure', 'it'],
      })

      await testEnv.testDb.createTestDocument(testEnv.tenant.id, testEnv.user.id, {
        title: 'Document 3',
        category: 'policy',
        status: 'archived',
        tags: ['policy', 'finance'],
      })
    })

    it('should fetch all documents', async () => {
      const documents = await documentService.getDocuments()

      expect(documents).toHaveLength(3)
      expect(documents.map(d => d.title)).toEqual(
        expect.arrayContaining(['Document 1', 'Document 2', 'Document 3'])
      )
    })

    it('should filter by category', async () => {
      const policyDocuments = await documentService.getDocuments({
        category: 'policy',
      })

      expect(policyDocuments).toHaveLength(2)
      expect(policyDocuments.every(d => d.category === 'policy')).toBe(true)
    })

    it('should filter by status', async () => {
      const publishedDocuments = await documentService.getDocuments({
        status: 'published',
      })

      expect(publishedDocuments).toHaveLength(1)
      expect(publishedDocuments[0].status).toBe('published')
    })

    it('should search by title', async () => {
      const searchResults = await documentService.getDocuments({
        search: 'Document 2',
      })

      expect(searchResults).toHaveLength(1)
      expect(searchResults[0].title).toBe('Document 2')
    })

    it('should filter by tags', async () => {
      const hrDocuments = await documentService.getDocuments({
        tags: ['hr'],
      })

      expect(hrDocuments).toHaveLength(1)
      expect(hrDocuments[0].tags).toContain('hr')
    })

    it('should sort documents', async () => {
      const sortedDocuments = await documentService.getDocuments({
        sortBy: 'title',
        sortOrder: 'asc',
      })

      const titles = sortedDocuments.map(d => d.title)
      expect(titles).toEqual(['Document 1', 'Document 2', 'Document 3'])
    })

    it('should paginate results', async () => {
      const page1 = await documentService.getDocuments({
        page: 1,
        limit: 2,
      })

      const page2 = await documentService.getDocuments({
        page: 2,
        limit: 2,
      })

      expect(page1).toHaveLength(2)
      expect(page2).toHaveLength(1)
      
      // Ensure no overlap
      const page1Ids = page1.map(d => d.id)
      const page2Ids = page2.map(d => d.id)
      expect(page1Ids).not.toEqual(expect.arrayContaining(page2Ids))
    })
  })

  describe('deleteDocument', () => {
    let documentId: string

    beforeEach(async () => {
      const document = await testEnv.testDb.createTestDocument(testEnv.tenant.id, testEnv.user.id)
      documentId = document.id
    })

    it('should soft delete document successfully', async () => {
      const success = await documentService.deleteDocument(documentId, testEnv.user.id)

      expect(success).toBe(true)

      // Document should no longer be fetchable
      const deletedDocument = await documentService.getById(documentId)
      expect(deletedDocument).toBeNull()
    })

    it('should handle non-existent document', async () => {
      const nonExistentId = 'non-existent-id'

      await expect(
        documentService.deleteDocument(nonExistentId, testEnv.user.id)
      ).rejects.toThrow()
    })
  })

  describe('createVersion', () => {
    let documentId: string

    beforeEach(async () => {
      const document = await testEnv.testDb.createTestDocument(testEnv.tenant.id, testEnv.user.id, {
        content: 'Original content',
        version: 1,
      })
      documentId = document.id
    })

    it('should create new version successfully', async () => {
      const versionData = {
        content: 'Updated content for version 2',
        changeLog: 'Updated content and improved formatting',
      }

      const versionId = await documentService.createVersion(
        documentId,
        versionData,
        testEnv.user.id
      )

      expect(versionId).toBeDefined()

      // Check that document version was incremented
      const document = await documentService.getById(documentId)
      expect(document?.version).toBe(2)
      expect(document?.content).toBe(versionData.content)

      // Check version history
      const versions = await documentService.getVersionHistory(documentId)
      expect(versions).toHaveLength(2)
      expect(versions[0].version).toBe(2) // Latest first
      expect(versions[1].version).toBe(1)
    })
  })

  describe('getVersionHistory', () => {
    let documentId: string

    beforeEach(async () => {
      const document = await testEnv.testDb.createTestDocument(testEnv.tenant.id, testEnv.user.id)
      documentId = document.id

      // Create additional versions
      await documentService.createVersion(
        documentId,
        { content: 'Version 2 content', changeLog: 'Second version' },
        testEnv.user.id
      )
      await documentService.createVersion(
        documentId,
        { content: 'Version 3 content', changeLog: 'Third version' },
        testEnv.user.id
      )
    })

    it('should return version history in descending order', async () => {
      const versions = await documentService.getVersionHistory(documentId)

      expect(versions).toHaveLength(3)
      expect(versions.map(v => v.version)).toEqual([3, 2, 1])
    })
  })

  describe('searchDocuments', () => {
    beforeEach(async () => {
      await testEnv.testDb.createTestDocument(testEnv.tenant.id, testEnv.user.id, {
        title: 'ISO 50001 Energy Management Policy',
        content: 'This document outlines our energy management approach according to ISO 50001 standard',
        tags: ['iso', 'energy', 'policy'],
      })

      await testEnv.testDb.createTestDocument(testEnv.tenant.id, testEnv.user.id, {
        title: 'GDPR Data Protection Procedure',
        content: 'Procedures for handling personal data in compliance with GDPR regulations',
        tags: ['gdpr', 'data', 'procedure'],
      })
    })

    it('should search in title and content', async () => {
      const results = await documentService.searchDocuments('ISO 50001')

      expect(results).toHaveLength(1)
      expect(results[0].title).toContain('ISO 50001')
    })

    it('should search in content', async () => {
      const results = await documentService.searchDocuments('personal data')

      expect(results).toHaveLength(1)
      expect(results[0].content).toContain('personal data')
    })

    it('should return empty results for non-matching search', async () => {
      const results = await documentService.searchDocuments('non-existent-term')

      expect(results).toHaveLength(0)
    })

    it('should be case insensitive', async () => {
      const results = await documentService.searchDocuments('gdpr')

      expect(results).toHaveLength(1)
      expect(results[0].title).toContain('GDPR')
    })
  })
})