---
title: About
---

# About This Page

This page is configured to **exclude** the copy button.

## Configuration

In the playground configuration, this page is excluded:

```typescript
copyPagePlugin({
  includes: ['/posts/', '/docs/'],
  excludes: ['/about/'],  // This page is excluded
})
```

## What This Means

- The "Copy Page" button should **not** appear on this page
- This demonstrates how to selectively exclude specific pages
- Useful for pages where copying doesn't make sense (like this about page)

## Testing

To verify the exclusion is working:
1. Visit the [Getting Started](posts/getting-started.html) page - button should appear
2. Visit this [About](about.html) page - button should NOT appear

## The Plugin

vuepress-plugin-copy-page is a VuePress 2 plugin for copying page content as Markdown. It's particularly useful for:
- Sharing documentation with AI assistants
- Content archival
- Content migration between systems

For more information, visit the [GitHub repository](https://github.com/zhaofutao04/vuepress-plugin-copy-page).
