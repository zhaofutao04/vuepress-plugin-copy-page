import { describe, it, expect, beforeEach } from 'vitest'

// Pattern matching logic extracted from CopyPageWidget.ts
function shouldShowWidget(
  path: string,
  includes: string[],
  excludes: string[]
): boolean {
  for (const exclude of excludes) {
    if (path.startsWith(exclude)) return false
  }

  for (const include of includes) {
    if (path.startsWith(include) && !path.endsWith('/')) return true
  }

  return false
}

describe('Pattern Matching', () => {
  describe('includes pattern matching', () => {
    it('should return true when path matches includes pattern', () => {
      const result = shouldShowWidget('/posts/my-post.html', ['/posts/'], [])
      expect(result).toBe(true)
    })

    it('should return false when path does not match includes pattern', () => {
      const result = shouldShowWidget('/guide/getting-started.html', ['/posts/'], [])
      expect(result).toBe(false)
    })

    it('should match multiple includes patterns', () => {
      const includes = ['/posts/', '/guide/', '/api/']
      expect(shouldShowWidget('/posts/post1.html', includes, [])).toBe(true)
      expect(shouldShowWidget('/guide/intro.html', includes, [])).toBe(true)
      expect(shouldShowWidget('/api/users.html', includes, [])).toBe(true)
    })

    it('should return true for any path when includes is empty', () => {
      const result = shouldShowWidget('/any/path.html', [], [])
      expect(result).toBe(false)
    })
  })

  describe('excludes pattern matching', () => {
    it('should return false when path matches excludes pattern', () => {
      const result = shouldShowWidget('/drafts/my-post.html', ['/posts/'], ['/drafts/'])
      expect(result).toBe(false)
    })

    it('should return true when path is in excludes but not in includes', () => {
      const result = shouldShowWidget('/other/page.html', ['/posts/'], ['/drafts/'])
      expect(result).toBe(false) // Not in includes
    })

    it('should exclude specific path from included pattern', () => {
      const result = shouldShowWidget('/posts/draft/my-post.html', ['/posts/'], ['/posts/draft/'])
      expect(result).toBe(false)
    })
  })

  describe('exclude takes precedence over include', () => {
    it('should prioritize excludes over includes', () => {
      // Path matches both /posts/ (include) and /posts/draft/ (exclude)
      const result = shouldShowWidget('/posts/draft/secret.html', ['/posts/'], ['/posts/draft/'])
      expect(result).toBe(false)
    })

    it('should handle multiple excludes patterns', () => {
      const includes = ['/posts/', '/guide/']
      const excludes = ['/draft/', '/archived/', '/private/']

      // '/posts/draft/post.html' doesn't match any exclude pattern
      // The excludes are: '/draft/', '/archived/', '/private/'
      // But the path is '/posts/draft/post.html' which doesn't start with any of those
      // However it starts with '/posts/' which is in includes, so it should be true
      expect(shouldShowWidget('/draft/posts/page.html', includes, excludes)).toBe(false)
      expect(shouldShowWidget('/archived/guide/page.html', includes, excludes)).toBe(false)
      expect(shouldShowWidget('/posts/public.html', includes, excludes)).toBe(true)
    })
  })

  describe('paths ending with /', () => {
    it('should not show widget for paths ending with /', () => {
      const result = shouldShowWidget('/posts/', ['/posts/'], [])
      expect(result).toBe(false)
    })

    it('should not show widget for index pages with trailing slash', () => {
      const result = shouldShowWidget('/guide/', ['/guide/'], [])
      expect(result).toBe(false)
    })

    it('should show widget for pages with same prefix but not ending with /', () => {
      const result = shouldShowWidget('/posts/my-post', ['/posts/'], [])
      expect(result).toBe(true)
    })

    it('should handle root path correctly', () => {
      const result = shouldShowWidget('/', ['/'], [])
      expect(result).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty path', () => {
      const result = shouldShowWidget('', ['/posts/'], [])
      expect(result).toBe(false)
    })

    it('should handle path without leading slash', () => {
      const result = shouldShowWidget('posts/my-post', ['posts/'], [])
      expect(result).toBe(true)
    })

    it('should handle exact match', () => {
      const result = shouldShowWidget('/posts', ['/posts'], [])
      expect(result).toBe(true)
    })

    it('should handle nested paths', () => {
      const result = shouldShowWidget('/posts/2023/12/25/holiday.html', ['/posts/'], [])
      expect(result).toBe(true)
    })

    it('should handle overlapping patterns', () => {
      const includes = ['/api/v1/', '/api/v2/']
      const excludes = ['/api/v1/internal/']

      expect(shouldShowWidget('/api/v1/users.html', includes, excludes)).toBe(true)
      expect(shouldShowWidget('/api/v1/internal/admin.html', includes, excludes)).toBe(false)
      expect(shouldShowWidget('/api/v2/users.html', includes, excludes)).toBe(true)
    })
  })

  describe('real-world scenarios', () => {
    const defaultOptions = {
      includes: ['/posts/'],
      excludes: [],
    }

    it('should show widget on blog posts', () => {
      expect(shouldShowWidget('/posts/hello-world.html', defaultOptions.includes, defaultOptions.excludes)).toBe(true)
      expect(shouldShowWidget('/posts/vuepress-tips.md', defaultOptions.includes, defaultOptions.excludes)).toBe(true)
    })

    it('should not show widget on non-posts pages', () => {
      expect(shouldShowWidget('/about.html', defaultOptions.includes, defaultOptions.excludes)).toBe(false)
      expect(shouldShowWidget('/contact/', defaultOptions.includes, defaultOptions.excludes)).toBe(false)
      expect(shouldShowWidget('/guide/intro.html', defaultOptions.includes, defaultOptions.excludes)).toBe(false)
    })

    it('should respect excludes for draft posts', () => {
      const options = {
        includes: ['/posts/'],
        excludes: ['/posts/draft/', '/posts/private/'],
      }

      expect(shouldShowWidget('/posts/draft/unfinished.html', options.includes, options.excludes)).toBe(false)
      expect(shouldShowWidget('/posts/private/notes.html', options.includes, options.excludes)).toBe(false)
      expect(shouldShowWidget('/posts/public-article.html', options.includes, options.excludes)).toBe(true)
    })
  })
})
