// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { PluginObject } from 'vuepress'
import * as fs from 'fs'

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>()
  return {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  }
})

// Import after mock setup so the mock is active
const { copyPagePlugin } = await import('../../src/index.js')

describe('copyPagePlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('plugin factory function', () => {
    it('should create plugin with default name', () => {
      const plugin = copyPagePlugin() as PluginObject
      expect(plugin.name).toBe('vuepress-plugin-copy-page')
    })

    it('should create plugin with custom options', () => {
      const plugin = copyPagePlugin({
        includes: ['/guide/', '/api/'],
        excludes: ['/draft/'],
      }) as PluginObject
      expect(plugin.name).toBe('vuepress-plugin-copy-page')
      expect(plugin.extendsPage).toBeDefined()
      expect(plugin.clientConfigFile).toBeDefined()
    })

    it('should have extendsPage hook', () => {
      const plugin = copyPagePlugin() as PluginObject
      expect(typeof plugin.extendsPage).toBe('function')
    })

    it('should have clientConfigFile hook', () => {
      const plugin = copyPagePlugin() as PluginObject
      expect(typeof plugin.clientConfigFile).toBe('function')
    })
  })

  describe('CopyPageOptions type', () => {
    it('should accept all optional properties', () => {
      const plugin1 = copyPagePlugin({
        includes: ['/posts/'],
        excludes: ['/draft/'],
        urlPrefix: 'https://example.com',
        copyTemplate: 'withUrl',
      }) as PluginObject
      expect(plugin1.name).toBe('vuepress-plugin-copy-page')

      const plugin2 = copyPagePlugin({}) as PluginObject
      expect(plugin2.name).toBe('vuepress-plugin-copy-page')

      const plugin3 = copyPagePlugin({ includes: ['/docs/'] }) as PluginObject
      expect(plugin3.name).toBe('vuepress-plugin-copy-page')
    })

    it('should accept all copyTemplate presets', () => {
      const templates = ['default', 'withUrl', 'withTimestamp', 'full'] as const
      for (const copyTemplate of templates) {
        const plugin = copyPagePlugin({ copyTemplate }) as PluginObject
        expect(plugin.name).toBe('vuepress-plugin-copy-page')
      }
    })

    it('should accept custom function copyTemplate', () => {
      const plugin = copyPagePlugin({
        copyTemplate: (content, meta) => `# ${meta.title}\n\n${content}`,
      }) as PluginObject
      expect(plugin.name).toBe('vuepress-plugin-copy-page')
    })
  })

  describe('extendsPage hook', () => {
    it('should read markdown source from page file', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue('# Hello\n\nWorld')

      const plugin = copyPagePlugin() as PluginObject
      const mockPage = {
        filePath: '/path/to/page.md',
        path: '/posts/page.html',
      }

      plugin.extendsPage!(mockPage as any)

      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/page.md')
      expect(fs.readFileSync).toHaveBeenCalledWith('/path/to/page.md', 'utf-8')
    })

    it('should skip pages without filePath', () => {
      const plugin = copyPagePlugin() as PluginObject
      const mockPage = { filePath: null, path: '/test/' }
      plugin.extendsPage!(mockPage as any)

      expect(fs.existsSync).not.toHaveBeenCalled()
    })

    it('should skip pages with non-existent files', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      const plugin = copyPagePlugin() as PluginObject
      const mockPage = { filePath: '/missing/file.md', path: '/test/' }
      plugin.extendsPage!(mockPage as any)

      expect(fs.existsSync).toHaveBeenCalledWith('/missing/file.md')
      expect(fs.readFileSync).not.toHaveBeenCalled()
    })
  })

  describe('clientConfigFile hook', () => {
    const createMockApp = (tempDir = '/tmp/vuepress') => ({
      dir: {
        temp: () => tempDir,
      },
    })

    it('should generate config file with default options', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      const plugin = copyPagePlugin() as PluginObject
      const result = plugin.clientConfigFile!(createMockApp() as any)

      expect(fs.mkdirSync).toHaveBeenCalledWith('/tmp/vuepress/copy-page', { recursive: true })
      expect(fs.writeFileSync).toHaveBeenCalled()
      expect(result).toBe('/tmp/vuepress/copy-page/data.ts')

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0]![1] as string
      expect(writtenContent).toContain('__COPY_PAGE_OPTIONS__')
      expect(writtenContent).toContain('__MARKDOWN_SOURCES__')
      expect(writtenContent).toContain('/posts/')
    })

    it('should include custom options in generated config', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      const plugin = copyPagePlugin({
        includes: ['/docs/', '/guide/'],
        excludes: ['/draft/'],
        urlPrefix: 'https://example.com',
        copyTemplate: 'withUrl',
      }) as PluginObject

      plugin.clientConfigFile!(createMockApp() as any)

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0]![1] as string
      expect(writtenContent).toContain('/docs/')
      expect(writtenContent).toContain('/guide/')
      expect(writtenContent).toContain('/draft/')
      expect(writtenContent).toContain('https://example.com')
      expect(writtenContent).toContain('withUrl')
    })

    it('should include i18n options in generated config', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      const plugin = copyPagePlugin({
        i18n: {
          'ja-JP': {
            copyPage: 'ページをコピー',
            copied: 'コピー済み',
            copyFailed: 'コピー失敗',
            copiedToClipboard: 'クリップボードにコピーしました',
            copyAsMarkdown: 'Markdownとしてコピー',
            viewAsMarkdown: 'Markdownを表示',
            viewAsMarkdownDesc: '新しいタブで表示',
          },
        },
      }) as PluginObject

      plugin.clientConfigFile!(createMockApp() as any)

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0]![1] as string
      expect(writtenContent).toContain('ja-JP')
      expect(writtenContent).toContain('ページをコピー')
    })

    it('should serialize function templates', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      const plugin = copyPagePlugin({
        copyTemplate: (content: string) => `Custom: ${content}`,
      }) as PluginObject

      plugin.clientConfigFile!(createMockApp() as any)

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0]![1] as string
      expect(writtenContent).toContain('__FUNCTION__')
      expect(writtenContent).toContain('new Function')
    })

    it('should not create config dir if it already exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)

      const plugin = copyPagePlugin() as PluginObject
      plugin.clientConfigFile!(createMockApp() as any)

      expect(fs.mkdirSync).not.toHaveBeenCalled()
    })
  })
})
