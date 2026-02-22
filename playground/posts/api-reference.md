# API Reference

Complete reference for the vuepress-plugin-copy-page plugin.

## Plugin Function

### copyPagePlugin(options?)

Creates a new instance of the copy page plugin.

**Parameters:**
- `options` (optional): Configuration object

**Returns:** VuePress plugin object

**Type:**

```typescript
function copyPagePlugin(options?: CopyPageOptions): Plugin
```

## Options Interface

### CopyPageOptions

```typescript
interface CopyPageOptions {
  includes?: string[]
  excludes?: string[]
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}
```

#### includes

- **Type:** `string[]`
- **Default:** `['/posts/']`

Path prefixes where the copy button should appear.

#### excludes

- **Type:** `string[]`
- **Default:** `[]`

Path prefixes where the copy button should NOT appear. Exclusions take priority over inclusions.

#### position

- **Type:** `'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'`
- **Default:** `'top-right'`

Position of the copy button.

## Client Component

### CopyPageWidget

The Vue component that renders the copy button.

**Import:**

```typescript
import CopyPageWidget from 'vuepress-plugin-copy-page/client'
```

**Usage:**

```typescript
import { defineClientConfig } from 'vuepress/client'

export default defineClientConfig({
  rootComponents: [CopyPageWidget],
})
```

## Global Variables

### window.__MARKDOWN_SOURCES__

A record mapping page paths to their original Markdown source content.

**Type:**

```typescript
window.__MARKDOWN_SOURCES__: Record<string, string>
```

### window.__COPY_PAGE_OPTIONS__

The plugin options passed to the client.

**Type:**

```typescript
window.__COPY_PAGE_OPTIONS__: CopyPageOptions
```

## Example Configuration

```typescript
// .vuepress/config.ts
import { copyPagePlugin } from 'vuepress-plugin-copy-page'

export default {
  plugins: [
    copyPagePlugin({
      includes: ['/docs/', '/blog/'],
      excludes: ['/docs/drafts/'],
    }),
  ],
}
```

```typescript
// .vuepress/client.ts
import { defineClientConfig } from 'vuepress/client'
import CopyPageWidget from 'vuepress-plugin-copy-page/client'

export default defineClientConfig({
  rootComponents: [CopyPageWidget],
})
```
