import { describe, it, expect } from 'vitest'
import type { CopyPageI18n } from '../../src/types.js'
import { builtinI18n, defaultI18n } from '../../src/types.js'

describe('Internationalization', () => {
  describe('builtin i18n', () => {
    it('should have en-US locale', () => {
      expect(builtinI18n['en-US']).toBeDefined()
    })

    it('should have zh-CN locale', () => {
      expect(builtinI18n['zh-CN']).toBeDefined()
    })

    it('should have all required keys in en-US', () => {
      const keys: Array<keyof CopyPageI18n> = [
        'copyPage',
        'copied',
        'copyFailed',
        'copiedToClipboard',
        'copyAsMarkdown',
        'viewAsMarkdown',
        'viewAsMarkdownDesc',
      ]
      for (const key of keys) {
        expect(builtinI18n['en-US']![key]).toBeTruthy()
      }
    })

    it('should have all required keys in zh-CN', () => {
      const keys: Array<keyof CopyPageI18n> = [
        'copyPage',
        'copied',
        'copyFailed',
        'copiedToClipboard',
        'copyAsMarkdown',
        'viewAsMarkdown',
        'viewAsMarkdownDesc',
      ]
      for (const key of keys) {
        expect(builtinI18n['zh-CN']![key]).toBeTruthy()
      }
    })
  })

  describe('defaultI18n', () => {
    it('should be the same as en-US builtin', () => {
      expect(defaultI18n).toEqual(builtinI18n['en-US'])
    })

    it('should have English text', () => {
      expect(defaultI18n.copyPage).toBe('Copy page')
      expect(defaultI18n.copied).toBe('Copied!')
      expect(defaultI18n.copyFailed).toBe('Copy failed')
    })
  })

  describe('zh-CN translations', () => {
    it('should have Chinese text', () => {
      const zhCN = builtinI18n['zh-CN']!
      expect(zhCN.copyPage).toBe('复制页面')
      expect(zhCN.copied).toBe('已复制!')
      expect(zhCN.copyFailed).toBe('复制失败')
    })
  })

  describe('i18n resolution logic', () => {
    /**
     * Simulates the t() function from CopyPageWidget.ts
     */
    function resolveI18n(
      key: keyof CopyPageI18n,
      locale: string,
      userI18n?: Record<string, CopyPageI18n>
    ): string {
      const user = userI18n?.[locale]
      const fallback = builtinI18n['en-US']!
      const builtin = builtinI18n[locale] ?? fallback

      return user?.[key] || builtin[key] || fallback[key] || ''
    }

    it('should return builtin en-US by default', () => {
      const result = resolveI18n('copyPage', 'en-US')
      expect(result).toBe('Copy page')
    })

    it('should return builtin zh-CN for Chinese locale', () => {
      const result = resolveI18n('copyPage', 'zh-CN')
      expect(result).toBe('复制页面')
    })

    it('should fall back to en-US for unknown locale', () => {
      const result = resolveI18n('copyPage', 'fr-FR')
      expect(result).toBe('Copy page')
    })

    it('should prefer user i18n over builtin', () => {
      const userI18n = {
        'en-US': {
          copyPage: 'Custom Copy',
          copied: 'Done!',
          copyFailed: 'Oops',
          copiedToClipboard: 'Got it!',
          copyAsMarkdown: 'Get Markdown',
          viewAsMarkdown: 'See Markdown',
          viewAsMarkdownDesc: 'Open in new tab',
        },
      }
      const result = resolveI18n('copyPage', 'en-US', userI18n)
      expect(result).toBe('Custom Copy')
    })

    it('should use builtin for keys not overridden by user', () => {
      const userI18n = {
        'en-US': {
          copyPage: 'Custom Copy',
        } as CopyPageI18n,
      }
      // copyFailed is not in user override, should fall back to builtin
      const result = resolveI18n('copyFailed', 'en-US', userI18n)
      expect(result).toBe('Copy failed')
    })

    it('should support adding new locales via user i18n', () => {
      const userI18n = {
        'ja-JP': {
          copyPage: 'ページをコピー',
          copied: 'コピー済み',
          copyFailed: 'コピー失敗',
          copiedToClipboard: 'クリップボードにコピーしました',
          copyAsMarkdown: 'Markdownとしてコピー',
          viewAsMarkdown: 'Markdownを表示',
          viewAsMarkdownDesc: '新しいタブで表示',
        },
      }
      const result = resolveI18n('copyPage', 'ja-JP', userI18n)
      expect(result).toBe('ページをコピー')
    })
  })
})
