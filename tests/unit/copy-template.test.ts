import { describe, it, expect } from 'vitest'
import type { CopyMeta, CopyTemplate } from '../../src/types.js'

/**
 * Apply template logic extracted from CopyPageWidget.ts for unit testing.
 */
function applyTemplate(
  content: string,
  meta: CopyMeta,
  template?: CopyTemplate
): string {
  if (template && typeof template === 'function') {
    return (template as (content: string, meta: CopyMeta) => string)(content, meta)
  }

  switch (template) {
    case 'withUrl':
      return `Source: ${meta.url}\n\n${content}`
    case 'withTimestamp':
      return `Copied at: ${meta.timestamp}\n\n${content}`
    case 'full':
      return `# ${meta.title}\n\nSource: ${meta.url}\nCopied at: ${meta.timestamp}\n\n---\n\n${content}`
    default:
      return content
  }
}

const sampleContent = '# Hello World\n\nThis is a test page.'
const sampleMeta: CopyMeta = {
  path: '/posts/hello.html',
  url: 'https://example.com/posts/hello.html',
  title: 'Hello World',
  timestamp: '2026-01-01T00:00:00.000Z',
}

describe('Copy Templates', () => {
  describe('default template', () => {
    it('should return content unchanged', () => {
      const result = applyTemplate(sampleContent, sampleMeta, 'default')
      expect(result).toBe(sampleContent)
    })

    it('should return content unchanged when template is undefined', () => {
      const result = applyTemplate(sampleContent, sampleMeta, undefined)
      expect(result).toBe(sampleContent)
    })
  })

  describe('withUrl template', () => {
    it('should prepend source URL', () => {
      const result = applyTemplate(sampleContent, sampleMeta, 'withUrl')
      expect(result).toBe(`Source: ${sampleMeta.url}\n\n${sampleContent}`)
    })

    it('should include the full URL', () => {
      const result = applyTemplate(sampleContent, sampleMeta, 'withUrl')
      expect(result).toContain('https://example.com/posts/hello.html')
    })
  })

  describe('withTimestamp template', () => {
    it('should prepend timestamp', () => {
      const result = applyTemplate(sampleContent, sampleMeta, 'withTimestamp')
      expect(result).toBe(`Copied at: ${sampleMeta.timestamp}\n\n${sampleContent}`)
    })

    it('should include ISO timestamp', () => {
      const result = applyTemplate(sampleContent, sampleMeta, 'withTimestamp')
      expect(result).toContain('2026-01-01T00:00:00.000Z')
    })
  })

  describe('full template', () => {
    it('should include title, URL, timestamp, and content', () => {
      const result = applyTemplate(sampleContent, sampleMeta, 'full')
      expect(result).toContain(`# ${sampleMeta.title}`)
      expect(result).toContain(`Source: ${sampleMeta.url}`)
      expect(result).toContain(`Copied at: ${sampleMeta.timestamp}`)
      expect(result).toContain(sampleContent)
    })

    it('should separate header from content with horizontal rule', () => {
      const result = applyTemplate(sampleContent, sampleMeta, 'full')
      expect(result).toContain('---')
    })

    it('should format correctly', () => {
      const result = applyTemplate(sampleContent, sampleMeta, 'full')
      const expected = `# Hello World\n\nSource: https://example.com/posts/hello.html\nCopied at: 2026-01-01T00:00:00.000Z\n\n---\n\n${sampleContent}`
      expect(result).toBe(expected)
    })
  })

  describe('custom function template', () => {
    it('should call the custom function with content and meta', () => {
      const customFn = (content: string, meta: CopyMeta) =>
        `Title: ${meta.title}\n\n${content}`
      const result = applyTemplate(sampleContent, sampleMeta, customFn)
      expect(result).toBe(`Title: Hello World\n\n${sampleContent}`)
    })

    it('should support complex transformations', () => {
      const customFn = (content: string, meta: CopyMeta) =>
        `---\nurl: ${meta.url}\ndate: ${meta.timestamp}\n---\n\n${content}`
      const result = applyTemplate(sampleContent, sampleMeta, customFn)
      expect(result).toContain('url: https://example.com/posts/hello.html')
      expect(result).toContain('date: 2026-01-01T00:00:00.000Z')
      expect(result).toContain(sampleContent)
    })

    it('should allow content to be completely replaced', () => {
      const customFn = () => 'completely replaced'
      const result = applyTemplate(sampleContent, sampleMeta, customFn)
      expect(result).toBe('completely replaced')
    })
  })

  describe('edge cases', () => {
    it('should handle empty content', () => {
      const result = applyTemplate('', sampleMeta, 'withUrl')
      expect(result).toBe(`Source: ${sampleMeta.url}\n\n`)
    })

    it('should handle empty meta fields', () => {
      const emptyMeta: CopyMeta = { path: '', url: '', title: '', timestamp: '' }
      const result = applyTemplate(sampleContent, emptyMeta, 'full')
      expect(result).toContain('# \n')
      expect(result).toContain('Source: \n')
    })

    it('should handle content with special characters', () => {
      const specialContent = '# Test <script>alert("xss")</script>\n\n`code block`'
      const result = applyTemplate(specialContent, sampleMeta, 'default')
      expect(result).toBe(specialContent)
    })
  })
})
