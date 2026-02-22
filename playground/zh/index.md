---
home: true
title: VuePress 复制页面插件
heroText: vuepress-plugin-copy-page
tagline: 复制页面内容为 Markdown 格式，适用于 LLM
actions:
  - text: 快速开始
    link: /zh/posts/getting-started.html
    type: primary
  - text: 介绍
    link: /zh/docs/introduction.html
    type: secondary
features:
  - title: 轻松复制
    details: 点击按钮复制整个页面的 Markdown 内容
  - title: LLM 友好
    details: 非常适合将内容复制到 ChatGPT、Claude 等 AI 助手
  - title: 智能可见性
    details: 使用包含/排除模式配置哪些页面显示复制按钮
footer: MIT 许可证 | 版权所有 © 2024
---

## 关于此 Playground

这是 **vuepress-plugin-copy-page** 插件的交互式演示站点。可以实时测试不同配置下的插件效果！

## 导航

- **[文章](/zh/posts/)** - 启用复制按钮的博客文章
- **[文档](/zh/docs/)** - 启用复制按钮的文档页面
- **[关于](/zh/about.html)** - 禁用复制按钮的示例页面（已排除）

## 默认配置

```typescript
import { copyPagePlugin } from 'vuepress-plugin-copy-page'

export default {
  plugins: [
    copyPagePlugin({
      includes: ['/posts/', '/docs/', '/zh/posts/', '/zh/docs/'],
      excludes: ['/about/', '/zh/about/'],
    }),
  ],
}
```

## 测试场景

尝试以下测试场景：

1. **所有页面启用**：将 includes 和 excludes 都留空
2. **排除特定页面**：包含所有页面，排除 `/about/`
3. **仅博客**：仅包含 `/posts/`，排除其他所有页面
4. **复杂规则**：包含 `/docs/` 和 `/posts/`，排除 `/docs/drafts/`

在启用页面的右上角查找"复制页面"按钮！
