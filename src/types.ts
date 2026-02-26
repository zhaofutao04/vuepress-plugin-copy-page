/**
 * Internationalization strings for the copy page widget
 */
export interface CopyPageI18n {
  /** Main button label - "Copy page" */
  copyPage: string
  /** Success state label - "Copied!" */
  copied: string
  /** Error state label - "Copy failed" */
  copyFailed: string
  /** Toast message on success - "Copied to clipboard!" */
  copiedToClipboard: string
  /** Menu item description for copy action */
  copyAsMarkdown: string
  /** Menu item title for view action */
  viewAsMarkdown: string
  /** Menu item description for view action */
  viewAsMarkdownDesc: string
}

/**
 * Metadata passed to custom copy template functions
 */
export interface CopyMeta {
  /** Page path (e.g., /posts/my-article/) */
  path: string
  /** Full URL including prefix (e.g., https://example.com/posts/my-article/) */
  url: string
  /** Page title extracted from frontmatter or heading */
  title: string
  /** ISO timestamp when copy occurred */
  timestamp: string
}

/**
 * Copy template type - can be a preset name or custom function
 */
export type CopyTemplate =
  | 'default'
  | 'withUrl'
  | 'withTimestamp'
  | 'full'
  | ((content: string, meta: CopyMeta) => string)

/**
 * Plugin options for vuepress-plugin-copy-page
 */
export interface CopyPageOptions {
  /**
   * Page path patterns where the copy button should appear
   * @default ['/posts/']
   */
  includes?: string[]

  /**
   * Page path patterns where the copy button should NOT appear
   * @default []
   */
  excludes?: string[]

  /**
   * URL prefix to prepend to page paths when generating full URLs
   * Example: "https://example.com"
   */
  urlPrefix?: string

  /**
   * Template to use when copying page content
   * - default: Just the markdown content
   * - withUrl: Prepend source URL
   * - withTimestamp: Prepend copy timestamp
   * - full: Include title, URL, and timestamp
   * - function: Custom template function
   * @default 'default'
   */
  copyTemplate?: CopyTemplate

  /**
   * Internationalization configuration
   * Key is locale code (e.g., 'en-US', 'zh-CN'), value is translation strings
   */
  i18n?: Record<string, CopyPageI18n>
}

/**
 * Default i18n strings (English)
 */
export const defaultI18n: CopyPageI18n = {
  copyPage: 'Copy page',
  copied: 'Copied!',
  copyFailed: 'Copy failed',
  copiedToClipboard: 'Copied to clipboard!',
  copyAsMarkdown: 'Copy page as Markdown for LLMs',
  viewAsMarkdown: 'View Markdown',
  viewAsMarkdownDesc: 'Open page content in a new tab',
}

/**
 * Default URL prefix for generating full URLs
 */
export const DEFAULT_URL_PREFIX = 'https://vuepress-plugin-copy-page.zhaofutao.cn'

/**
 * Built-in i18n support for common locales
 */
export const builtinI18n: Record<string, CopyPageI18n> = {
  'en-US': defaultI18n,
  'zh-CN': {
    copyPage: '复制页面',
    copied: '已复制!',
    copyFailed: '复制失败',
    copiedToClipboard: '已复制到剪贴板!',
    copyAsMarkdown: '复制页面为 Markdown 格式',
    viewAsMarkdown: '查看 Markdown',
    viewAsMarkdownDesc: '在新标签页中打开页面内容',
  },
}

/**
 * Options passed to the client-side widget
 * (subset of CopyPageOptions that are needed at runtime)
 */
export interface ClientOptions {
  includes: string[]
  excludes: string[]
  urlPrefix?: string
  copyTemplate?: CopyTemplate
  i18n?: Record<string, CopyPageI18n>
}
