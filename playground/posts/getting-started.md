# Getting Started

This guide will help you get started with the vuepress-plugin-copy-page plugin.

## Installation

Install the plugin using npm, yarn, or pnpm:

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

## Basic Usage

Add the plugin to your VuePress configuration:

```typescript
// .vuepress/config.ts
import { copyPagePlugin } from 'vuepress-plugin-copy-page'

export default {
  plugins: [
    copyPagePlugin(),
  ],
}
```

Add the client configuration:

```typescript
// .vuepress/client.ts
import { defineClientConfig } from 'vuepress/client'
import CopyPageWidget from 'vuepress-plugin-copy-page/client'

export default defineClientConfig({
  rootComponents: [CopyPageWidget],
})
```

## How It Works

The plugin adds a floating "Copy Page" button to each page of your VuePress site. When clicked, it copies the **original Markdown source** of the current page to your clipboard.

This is particularly useful when you want to:
- Share page content with AI assistants like ChatGPT or Claude
- Save content for offline reading
- Transfer content between different tools

## Next Steps

- Read the [Advanced Usage](advanced-usage.html) guide to learn about configuration options
- Check the [API Reference](api-reference.html) for detailed documentation
