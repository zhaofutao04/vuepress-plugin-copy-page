# Introduction

## What is vuepress-plugin-copy-page?

vuepress-plugin-copy-page is a VuePress 2 plugin that adds a "Copy Page" button to your documentation pages, allowing users to copy the **original Markdown source** of the current page.

## Why Use This Plugin?

### Perfect for AI Interactions

When working with AI assistants like ChatGPT, Claude, or GitHub Copilot, you often want to share documentation content. This plugin makes it easy to copy the exact Markdown source, preserving:

- Headers and formatting
- Code blocks with syntax
- Lists and tables
- Links and images

### Maintains Content Integrity

Unlike copying rendered HTML, this plugin provides the original Markdown source. This means:

- No HTML artifacts
- Clean, readable Markdown
- Easy to paste into Markdown editors
- Preserves your content structure

## Features

- **Selective Pages**: Configure which pages show the button
- **Flexible Matching**: Use path patterns for includes/excludes
- **Clean Design**: Minimal floating button that doesn't interfere
- **Zero Dependencies**: Lightweight and focused
- **VuePress 2 Ready**: Built for VuePress 2.x

## How It Works

1. During build, the plugin reads each Markdown file
2. The original source is stored and exposed to the client
3. A floating button appears on enabled pages
4. Clicking copies the Markdown source to the clipboard

## Quick Start

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

Continue to [Configuration](configuration.html) for detailed setup instructions.
