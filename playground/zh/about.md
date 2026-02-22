---
title: 关于
---

# 关于此页面

此页面已配置为**排除**复制按钮。

## 配置

在 playground 配置中，此页面被排除：

```typescript
copyPagePlugin({
  includes: ['/posts/', '/docs/', '/zh/posts/', '/zh/docs/'],
  excludes: ['/about/', '/zh/about/'],  // 此页面被排除
})
```

## 这意味着什么

- "复制页面"按钮**不会**出现在此页面上
- 这演示了如何选择性排除特定页面
- 适用于复制没有意义的页面（如这个关于页面）

## 测试

要验证排除是否有效：
1. 访问 [快速开始](posts/getting-started.html) 页面 - 按钮应该出现
2. 访问此 [关于](about.html) 页面 - 按钮不应该出现

## 插件

vuepress-plugin-copy-page 是一个用于将页面内容复制为 Markdown 的 VuePress 2 插件。它特别适用于：
- 与 AI 助手分享文档
- 内容归档
- 系统间内容迁移

更多信息请访问 [GitHub 仓库](https://github.com/zhaofutao04/vuepress-plugin-copy-page)。
