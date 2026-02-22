# Configuration

Learn how to configure the vuepress-plugin-copy-page plugin for your VuePress site.

## Installation

First, install the plugin:

```bash
npm install vuepress-plugin-copy-page
```

## Step 1: Plugin Configuration

Add the plugin to your VuePress config file:

```typescript
// .vuepress/config.ts
import { copyPagePlugin } from 'vuepress-plugin-copy-page'

export default {
  plugins: [
    copyPagePlugin({
      includes: ['/docs/', '/guide/'],
      excludes: ['/docs/drafts/'],
    }),
  ],
}
```

## Step 2: Client Configuration

Register the client component:

```typescript
// .vuepress/client.ts
import { defineClientConfig } from 'vuepress/client'
import CopyPageWidget from 'vuepress-plugin-copy-page/client'

export default defineClientConfig({
  rootComponents: [CopyPageWidget],
})
```

## Configuration Options

### includes

Specify which page paths should include the copy button.

```typescript
{
  includes: ['/blog/', '/docs/']  // Only blog and docs pages
}
```

### excludes

Specify which page paths should exclude the copy button.

```typescript
{
  excludes: ['/about/', '/home/']  // All pages except about and home
}
```

### Combined Usage

You can use both options together:

```typescript
{
  includes: ['/docs/', '/blog/'],
  excludes: ['/docs/drafts/', '/blog/private/']
}
```

## Default Behavior

When no options are provided, the copy button appears on pages matching the default includes:

```typescript
copyPagePlugin()  // Default: includes ['/posts/']
```

## Examples

### Documentation Site

```typescript
copyPagePlugin({
  includes: ['/docs/'],
})
```

### Blog with Private Posts

```typescript
copyPagePlugin({
  includes: ['/blog/'],
  excludes: ['/blog/drafts/', '/blog/private/'],
})
```

### Full Site Excluding Pages

```typescript
copyPagePlugin({
  excludes: ['/about/', '/contact/', '/legal/'],
})
```

## Notes

- Path matching uses prefix matching (e.g., `/docs/` matches `/docs/guide` and `/docs/api/reference`)
- Exclusions take priority over inclusions
- Paths should start with `/` and include trailing `/` for directories
- Index pages (paths ending with `/`) are automatically excluded
