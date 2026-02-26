# vuepress-plugin-copy-page

[English](./README.md) | **中文**

> 一个 VuePress 2 插件，在文档页面上添加"复制页面"按钮，允许用户以原始 Markdown 格式复制页面内容。非常适合与 ChatGPT、Claude 等 AI 工具分享文档。

[![npm version](https://img.shields.io/npm/v/vuepress-plugin-copy-page?label=npm&color=blue)](https://www.npmjs.com/package/vuepress-plugin-copy-page)
[![GitHub tag](https://img.shields.io/github/v/tag/zhaofutao04/vuepress-plugin-copy-page?label=tag&color=green)](https://github.com/zhaofutao04/vuepress-plugin-copy-page/tags)
[![Publish Status](https://img.shields.io/github/actions/workflow/status/zhaofutao04/vuepress-plugin-copy-page/npm-publish.yml?label=publish)](https://github.com/zhaofutao04/vuepress-plugin-copy-page/actions/workflows/npm-publish.yml)
[![license](https://img.shields.io/npm/l/vuepress-plugin-copy-page)](LICENSE)
[![downloads](https://img.shields.io/npm/dm/vuepress-plugin-copy-page)](https://www.npmjs.com/package/vuepress-plugin-copy-page)

## 功能特性

- 复制或查看页面的原始 Markdown 内容
- 页面标题旁的浮动下拉组件
- 通过路径前缀控制按钮显示/隐藏
- 深色模式支持
- 自定义复制模板（URL、时间戳或自定义函数）
- 内置国际化（en-US、zh-CN）

## 安装

```bash
npm install vuepress-plugin-copy-page
# 或: pnpm add / yarn add / bun add
```

## 快速开始

```ts
// .vuepress/config.ts
import { defineUserConfig } from 'vuepress'
import { copyPagePlugin } from 'vuepress-plugin-copy-page'

export default defineUserConfig({
  plugins: [
    copyPagePlugin({
      includes: ['/posts/', '/docs/'],
      excludes: ['/about/'],
      copyTemplate: 'withUrl'
    })
  ]
})
```

```ts
// .vuepress/client.ts
import { defineClientConfig } from 'vuepress/client'
import 'vuepress-plugin-copy-page/styles/index.scss'

export default defineClientConfig({})
```

## 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `includes` | `string[]` | `['/posts/']` | 显示按钮的路径前缀 |
| `excludes` | `string[]` | `[]` | 不显示按钮的路径前缀 |
| `urlPrefix` | `string` | `'https://vuepress-plugin-copy-page.zhaofutao.cn'` | 复制内容中的 URL 前缀 |
| `copyTemplate` | `'default' \| 'withUrl' \| 'withTimestamp' \| 'full' \| function` | `'default'` | 复制内容格式模板 |
| `i18n` | `Record<string, CopyPageI18n>` | 内置 en-US/zh-CN | 按语言配置国际化文本 |

## 复制模板

| 模板 | 描述 |
|------|------|
| `'default'` | 仅 Markdown 内容 |
| `'withUrl'` | 在开头添加来源 URL |
| `'withTimestamp'` | 在开头添加复制时间戳 |
| `'full'` | 标题 + URL + 时间戳 |
| `(content, meta) => string` | 自定义函数 |

`meta` 对象：`{ path, url, title, timestamp }`

## 国际化

内置 `en-US` 和 `zh-CN`，自动识别页面语言。添加其他语言：

```ts
copyPagePlugin({
  i18n: {
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

## 兼容性

- **VuePress** >=2.0.0-rc.0 | **Vue** ^3.0.0
- **浏览器**: Chrome 66+, Firefox 63+, Safari 13.1+（需要 HTTPS 或 localhost）

## 更新日志

### v1.3.0
- **破坏性变更**: 移除 `position` 和 `styleMode` 配置选项
- 修复事件监听器内存泄漏
- 修复 XSS 风险：使用 textContent 替代 innerHTML
- 修复路由切换时的竞态条件
- 测试覆盖率提升到 94%

### v1.2.0
- 添加 URL 前缀、复制模板、国际化选项

### v1.1.5
- 优化按钮样式

### v1.0.2
- 修复多主题 h1 选择器

### v1.0.1
- 初始版本

## 许可证

[MIT](LICENSE)

## 链接

- [GitHub](https://github.com/zhaofutao04/vuepress-plugin-copy-page) | [Issues](https://github.com/zhaofutao04/vuepress-plugin-copy-page/issues) | [npm](https://www.npmjs.com/package/vuepress-plugin-copy-page)
