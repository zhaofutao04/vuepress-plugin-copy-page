---
home: true
title: VuePress Copy Page Plugin
heroText: vuepress-plugin-copy-page
tagline: Copy page content as Markdown for LLMs
actions:
  - text: Getting Started
    link: /posts/getting-started.html
    type: primary
  - text: Introduction
    link: /docs/introduction.html
    type: secondary
features:
  - title: Easy Copy
    details: Click the button to copy the entire page content as Markdown
  - title: LLM Friendly
    details: Perfect for copying content to ChatGPT, Claude, or other AI assistants
  - title: Smart Visibility
    details: Configure which pages show the copy button using include/exclude patterns
footer: MIT Licensed | Copyright © 2024
---

## About This Playground

This is an interactive demo site for the **vuepress-plugin-copy-page** plugin. Test the plugin with different configurations in real-time!

## Navigation

- **[Posts](/posts/)** - Blog-style articles with the copy button enabled
- **[Docs](/docs/)** - Documentation pages with the copy button enabled
- **[About](/about.html)** - Example page with the copy button disabled (excluded)

## Default Configuration

```typescript
import { copyPagePlugin } from 'vuepress-plugin-copy-page'

export default {
  plugins: [
    copyPagePlugin({
      includes: ['/posts/', '/docs/'],
      excludes: ['/about/'],
    }),
  ],
}
```

## Testing Scenarios

Try these testing scenarios:

1. **Enable on all pages**: Leave includes empty, excludes empty
2. **Exclude specific pages**: Include all, exclude `/about/`
3. **Blog only**: Include `/posts/`, exclude everything else
4. **Complex rules**: Include `/docs/` and `/posts/`, exclude `/docs/drafts/`

Look for the "Copy Page" button in the top-right corner of enabled pages!
