# 介绍

## 什么是 vuepress-plugin-copy-page？

vuepress-plugin-copy-page 是一个 VuePress 2 插件，它会在你的文档页面上添加一个"复制页面"按钮，允许用户复制当前页面的**原始 Markdown 源码**。

## 为什么要使用这个插件？

### 非常适合 AI 交互

当使用 ChatGPT、Claude 或 GitHub Copilot 等 AI 助手时，你经常需要分享文档内容。这个插件可以轻松复制准确的 Markdown 源码，保留：

- 标题和格式
- 带语法的代码块
- 列表和表格
- 链接和图片

### 保持内容完整性

与复制渲染后的 HTML 不同，这个插件提供原始 Markdown 源码。这意味着：

- 没有 HTML 杂质
- 干净、可读的 Markdown
- 易于粘贴到 Markdown 编辑器
- 保留你的内容结构

## 特性

- **选择性页面**：配置哪些页面显示按钮
- **灵活匹配**：使用路径模式进行包含/排除
- **简洁设计**：不干扰的最小浮动按钮
- **零依赖**：轻量且专注
- **VuePress 2 就绪**：为 VuePress 2.x 构建

## 工作原理

1. 构建时，插件读取每个 Markdown 文件
2. 原始源码被存储并暴露给客户端
3. 浮动按钮出现在启用的页面上
4. 点击将 Markdown 源码复制到剪贴板

## 快速开始

```bash
npm install vuepress-plugin-copy-page
```

```typescript
// .vuepress/config.ts
import { copyPagePlugin } from 'vuepress-plugin-copy-page'

export default {
  plugins: [
    copyPagePlugin(),
  ],
}
```

继续阅读 [配置](configuration.html) 获取详细的设置说明。
