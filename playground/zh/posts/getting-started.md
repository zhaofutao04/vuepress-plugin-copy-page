# 快速开始

本指南将帮助你快速上手 vuepress-plugin-copy-page 插件。

## 安装

使用 npm、yarn 或 pnpm 安装插件：

::: code-group
```bash [npm]
npm install vuepress-plugin-copy-page
```

```bash [yarn]
yarn add vuepress-plugin-copy-page
```

```bash [pnpm]
pnpm add vuepress-plugin-copy-page
```
:::

## 基本用法

将插件添加到你的 VuePress 配置中：

```typescript
// .vuepress/config.ts
import { copyPagePlugin } from 'vuepress-plugin-copy-page'

export default {
  plugins: [
    copyPagePlugin(),
  ],
}
```

添加客户端配置：

```typescript
// .vuepress/client.ts
import { defineClientConfig } from 'vuepress/client'
import CopyPageWidget from 'vuepress-plugin-copy-page/client'

export default defineClientConfig({
  rootComponents: [CopyPageWidget],
})
```

## 工作原理

该插件会在你的 VuePress 网站的每个页面上添加一个浮动的"复制页面"按钮。点击后，它会将当前页面的**原始 Markdown 源码**复制到剪贴板。

这在以下情况下特别有用：
- 与 ChatGPT 或 Claude 等 AI 助手分享页面内容
- 保存内容以供离线阅读
- 在不同工具之间传输内容

## 下一步

- 阅读 [高级用法](advanced-usage.html) 指南了解配置选项
- 查看 [API 参考](api-reference.html) 获取详细文档
