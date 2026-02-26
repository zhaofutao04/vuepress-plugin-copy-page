# vuepress-plugin-copy-page

[English](#english) | [中文](#中文)

---

> A VuePress 2 plugin that adds a "Copy Page" button to documentation pages, allowing users to copy page content as original Markdown format. Perfect for sharing documentation with LLMs like ChatGPT, Claude, and other AI tools.

> 一个 VuePress 2 插件，在文档页面上添加"复制页面"按钮，允许用户以原始 Markdown 格式复制页面内容。非常适合与 ChatGPT、Claude 等 AI 工具分享文档。

[![npm version](https://img.shields.io/npm/v/vuepress-plugin-copy-page?label=npm&color=blue)](https://www.npmjs.com/package/vuepress-plugin-copy-page)
[![GitHub tag](https://img.shields.io/github/v/tag/zhaofutao04/vuepress-plugin-copy-page?label=tag&color=green)](https://github.com/zhaofutao04/vuepress-plugin-copy-page/tags)
[![Publish Status](https://img.shields.io/github/actions/workflow/status/zhaofutao04/vuepress-plugin-copy-page/npm-publish.yml?label=publish)](https://github.com/zhaofutao04/vuepress-plugin-copy-page/actions/workflows/npm-publish.yml)
[![license](https://img.shields.io/npm/l/vuepress-plugin-copy-page)](LICENSE)
[![downloads](https://img.shields.io/npm/dm/vuepress-plugin-copy-page)](https://www.npmjs.com/package/vuepress-plugin-copy-page)
---

## English {#english}

### Features

- **Copy as Markdown** - Copy the original Markdown source of any page to clipboard
- **View as Markdown** - Open the page content as plain text in a new tab
- **Floating widget** - Non-intrusive dropdown menu positioned near the page title
- **Smart visibility** - Show the button only on specific paths using include/exclude patterns
- **Dark mode support** - Automatically adapts to your theme's color scheme
- **Built-in source extraction** - No additional plugins or configuration needed
- **Multiple h1 selector support** - Works with different VuePress themes
- **Toast notifications** - Visual feedback when copying succeeds or fails
- **Custom copy templates** - Add URLs, timestamps, or custom formatting to copied content
- **Internationalization** - Built-in support for English and Chinese

### Installation

```bash
# npm
npm install vuepress-plugin-copy-page

# yarn
yarn add vuepress-plugin-copy-page

# pnpm
pnpm add vuepress-plugin-copy-page

# bun
bun add vuepress-plugin-copy-page
```

### Quick Start

#### 1. Register the plugin

```ts
// .vuepress/config.ts
import { defineUserConfig } from 'vuepress'
import { copyPagePlugin } from 'vuepress-plugin-copy-page'

export default defineUserConfig({
  plugins: [
    copyPagePlugin({
      includes: ['/posts/', '/docs/']
    })
  ]
})
```

#### 2. Import the styles

```ts
// .vuepress/client.ts
import { defineClientConfig } from 'vuepress/client'
import 'vuepress-plugin-copy-page/styles/index.scss'

export default defineClientConfig({})
```

### Configuration

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `includes` | `string[]` | `['/posts/']` | Path prefixes where the copy button should appear |
| `excludes` | `string[]` | `[]` | Path prefixes where the copy button should NOT appear |
| `urlPrefix` | `string` | `'https://vuepress-plugin-copy-page.zhaofutao.cn'` | URL prefix for generating full URLs in copied content |
| `copyTemplate` | `'default' \| 'withUrl' \| 'withTimestamp' \| 'full' \| function` | `'default'` | Template to format copied content |
| `i18n` | `Record<string, CopyPageI18n>` | Built-in en-US/zh-CN | Internationalization strings by locale |

#### Copy Templates

The `copyTemplate` option controls how copied content is formatted:

| Template | Output Format |
|----------|---------------|
| `'default'` | Just the markdown content |
| `'withUrl'` | Prepend source URL |
| `'withTimestamp'` | Prepend copy timestamp |
| `'full'` | Include title, URL, and timestamp |
| Custom function | `(content: string, meta: CopyMeta) => string` |

Example with custom template:

```ts
copyPagePlugin({
  copyTemplate: (content, meta) => {
    return `# ${meta.title}\n\nSource: ${meta.url}\n\n${content}`
  }
})
```

The `meta` object contains:
- `path`: Page path (e.g., `/posts/my-article/`)
- `url`: Full URL with prefix (e.g., `https://vuepress-plugin-copy-page.zhaofutao.cn/posts/my-article/`)
- `title`: Page title
- `timestamp`: ISO timestamp when copy occurred

#### Internationalization

The plugin has built-in i18n support for `en-US` and `zh-CN`. No configuration needed - it automatically detects the page locale.

To add or override translations:

```ts
copyPagePlugin({
  i18n: {
    // Override built-in locale
    'en-US': {
      copyPage: 'Copy',
      copied: 'Done!',
      copyFailed: 'Failed',
      copiedToClipboard: 'Copied!',
      copyAsMarkdown: 'Copy as Markdown',
      viewAsMarkdown: 'View Markdown',
      viewAsMarkdownDesc: 'Open page content in a new tab'
    },
    // Add new locale
    'ja-JP': {
      copyPage: 'ページをコピー',
      copied: 'コピーしました!',
      copyFailed: 'コピー失敗',
      copiedToClipboard: 'クリップボードにコピーしました!',
      copyAsMarkdown: 'Markdownとしてコピー',
      viewAsMarkdown: 'Markdownを表示',
      viewAsMarkdownDesc: '新しいタブでページコンテンツを開く'
    }
  }
})
```

#### Example

```ts
copyPagePlugin({
  includes: ['/posts/', '/docs/', '/guide/'],
  excludes: ['/about/', '/drafts/'],
  copyTemplate: 'withUrl'
  // urlPrefix is optional - defaults to https://vuepress-plugin-copy-page.zhaofutao.cn
  // i18n is optional - en-US and zh-CN are built-in
})
```

### Browser Support

- **Clipboard API** (`navigator.clipboard`) - Required
- Chrome 66+, Firefox 63+, Safari 13.1+
- Requires HTTPS or localhost

### Compatibility

- **VuePress:** >=2.0.0-rc.0
- **Vue:** ^3.0.0

---

## 中文 {#中文}

### 功能特性

- **复制为 Markdown** - 将任何页面的原始 Markdown 源码复制到剪贴板
- **查看为 Markdown** - 在新标签页中以纯文本格式打开页面内容
- **浮动组件** - 靠近页面标题的非侵入式下拉菜单
- **智能可见性** - 使用包含/排除模式仅在特定路径显示按钮
- **深色模式支持** - 自动适应你的主题配色方案
- **内置源码提取** - 无需额外插件或配置
- **多种 h1 选择器支持** - 适用于不同的 VuePress 主题
- **Toast 通知** - 复制成功或失败时的视觉反馈
- **自定义复制模板** - 在复制内容中添加 URL、时间戳或自定义格式
- **国际化支持** - 内置中英文支持

### 安装

```bash
# npm
npm install vuepress-plugin-copy-page

# yarn
yarn add vuepress-plugin-copy-page

# pnpm
pnpm add vuepress-plugin-copy-page

# bun
bun add vuepress-plugin-copy-page
```

### 快速开始

#### 1. 注册插件

```ts
// .vuepress/config.ts
import { defineUserConfig } from 'vuepress'
import { copyPagePlugin } from 'vuepress-plugin-copy-page'

export default defineUserConfig({
  plugins: [
    copyPagePlugin({
      includes: ['/posts/', '/docs/']
    })
  ]
})
```

#### 2. 导入样式

```ts
// .vuepress/client.ts
import { defineClientConfig } from 'vuepress/client'
import 'vuepress-plugin-copy-page/styles/index.scss'

export default defineClientConfig({})
```

### 配置

#### 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `includes` | `string[]` | `['/posts/']` | 复制按钮应出现的路径前缀 |
| `excludes` | `string[]` | `[]` | 复制按钮不应出现的路径前缀 |
| `urlPrefix` | `string` | `'https://vuepress-plugin-copy-page.zhaofutao.cn'` | 生成完整 URL 时的前缀 |
| `copyTemplate` | `'default' \| 'withUrl' \| 'withTimestamp' \| 'full' \| function` | `'default'` | 复制内容格式模板 |
| `i18n` | `Record<string, CopyPageI18n>` | 内置 en-US/zh-CN | 按语言配置国际化文本 |

#### 复制模板

`copyTemplate` 选项控制复制内容的格式：

| 模板 | 输出格式 |
|------|----------|
| `'default'` | 仅 Markdown 内容 |
| `'withUrl'` | 在开头添加来源 URL |
| `'withTimestamp'` | 在开头添加复制时间戳 |
| `'full'` | 包含标题、URL 和时间戳 |
| 自定义函数 | `(content: string, meta: CopyMeta) => string` |

自定义模板示例：

```ts
copyPagePlugin({
  copyTemplate: (content, meta) => {
    return `# ${meta.title}\n\n来源: ${meta.url}\n\n${content}`
  }
})
```

`meta` 对象包含：
- `path`: 页面路径（如 `/posts/my-article/`）
- `url`: 带前缀的完整 URL（如 `https://vuepress-plugin-copy-page.zhaofutao.cn/posts/my-article/`）
- `title`: 页面标题
- `timestamp`: 复制时的 ISO 时间戳

#### 国际化

插件已内置 `en-US` 和 `zh-CN` 的国际化支持，无需配置即可自动识别页面语言。

如需自定义或添加其他语言：

```ts
copyPagePlugin({
  i18n: {
    // 覆盖内置语言
    'zh-CN': {
      copyPage: '复制',
      copied: '完成!',
      copyFailed: '失败',
      copiedToClipboard: '已复制!',
      copyAsMarkdown: '复制为 Markdown',
      viewAsMarkdown: '查看 Markdown',
      viewAsMarkdownDesc: '在新标签页中打开页面内容'
    },
    // 添加新语言
    'ja-JP': {
      copyPage: 'ページをコピー',
      copied: 'コピーしました!',
      copyFailed: 'コピー失敗',
      copiedToClipboard: 'クリップボードにコピーしました!',
      copyAsMarkdown: 'Markdownとしてコピー',
      viewAsMarkdown: 'Markdownを表示',
      viewAsMarkdownDesc: '新しいタブでページコンテンツを開く'
    }
  }
})
```

#### 示例

```ts
copyPagePlugin({
  includes: ['/posts/', '/docs/', '/guide/'],
  excludes: ['/about/', '/drafts/'],
  copyTemplate: 'withUrl'
  // urlPrefix 可选 - 默认为 https://vuepress-plugin-copy-page.zhaofutao.cn
  // i18n 可选 - 已内置 en-US 和 zh-CN
})
```

### 浏览器支持

- **剪贴板 API** (`navigator.clipboard`) - 必需
- Chrome 66+, Firefox 63+, Safari 13.1+
- 需要 HTTPS 或 localhost

### 兼容性

- **VuePress:** >=2.0.0-rc.0
- **Vue:** ^3.0.0

---

## API Reference | API 参考

### Type Definitions | 类型定义

```typescript
interface CopyPageI18n {
  copyPage: string
  copied: string
  copyFailed: string
  copiedToClipboard: string
  copyAsMarkdown: string
  viewAsMarkdown: string
  viewAsMarkdownDesc: string
}

interface CopyMeta {
  path: string
  url: string
  title: string
  timestamp: string
}

type CopyTemplate =
  | 'default'
  | 'withUrl'
  | 'withTimestamp'
  | 'full'
  | ((content: string, meta: CopyMeta) => string)

interface CopyPageOptions {
  /**
   * Page path patterns where the copy button should appear
   * 复制按钮应出现的页面路径模式
   * @default ['/posts/']
   */
  includes?: string[]

  /**
   * Page path patterns where the copy button should NOT appear
   * 复制按钮不应出现的页面路径模式
   * @default []
   */
  excludes?: string[]

  /**
   * URL prefix to prepend to page paths
   * 页面路径的 URL 前缀
   * @default 'https://vuepress-plugin-copy-page.zhaofutao.cn'
   */
  urlPrefix?: string

  /**
   * Template to use when copying page content
   * 复制页面内容时使用的模板
   * @default 'default'
   */
  copyTemplate?: CopyTemplate

  /**
   * Internationalization configuration
   * 国际化配置
   */
  i18n?: Record<string, CopyPageI18n>
}
```

---

## Changelog | 更新日志

### v1.3.0
- **BREAKING**: Remove `position` option | 移除 `position` 配置选项
- **BREAKING**: Remove `styleMode` option, use rich style as default | 移除 `styleMode` 选项，使用 rich 样式作为默认样式
- Fix memory leak: global event listeners now properly cleaned up on route change | 修复内存泄漏：路由切换时正确清理全局事件监听器
- Fix XSS risk: use safe DOM APIs (textContent) instead of innerHTML for i18n strings | 修复 XSS 风险：使用安全的 DOM API 替代 innerHTML 注入用户文本
- Fix race condition: merge triple widget-creation triggers into unified lifecycle | 修复竞态条件：合并三重 widget 创建触发器为统一的生命周期管理
- Fix CI tag pattern to support future major versions (v2+) | 修复 CI 标签模式以支持未来的主版本号
- Fix Prettier formatting issues | 修复代码格式化问题
- Fix style import path in documentation | 修复文档中的样式导入路径
- Improve test coverage from 79% to 94% | 测试覆盖率从 79% 提升到 94%

### v1.2.0
- Add `urlPrefix` option with default value `https://vuepress-plugin-copy-page.zhaofutao.cn` | 添加 `urlPrefix` 选项，默认值为 `https://vuepress-plugin-copy-page.zhaofutao.cn`
- Add `copyTemplate` option with presets and custom function support | 添加 `copyTemplate` 选项，支持预设模板和自定义函数
- Add `i18n` option with built-in en-US and zh-CN support | 添加 `i18n` 选项，内置中英文支持

### v1.1.5
- Enhanced button styles: bolder titles, lighter descriptions | 优化按钮样式：标题加粗，描述文字变淡
- Improved icon design with cleaner strokes | 优化图标设计，线条更清晰

### v1.0.2
- Fix h1 selector to support multiple VuePress themes | 修复 h1 选择器以支持多种 VuePress 主题
- Fix async event handler for copy operations | 修复复制操作的异步事件处理

### v1.0.1
- Initial stable release | 初始稳定版本
- Basic copy and view functionality | 基本复制和查看功能

---

## License | 许可证

[MIT](LICENSE)

## Author | 作者

老Z

## Links | 链接

- GitHub: [zhaofutao04/vuepress-plugin-copy-page](https://github.com/zhaofutao04/vuepress-plugin-copy-page)
- Issues: [GitHub Issues](https://github.com/zhaofutao04/vuepress-plugin-copy-page/issues)
- npm: [vuepress-plugin-copy-page](https://www.npmjs.com/package/vuepress-plugin-copy-page)
