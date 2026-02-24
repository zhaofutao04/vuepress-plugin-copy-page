# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

vuepress-plugin-copy-page is a VuePress 2 plugin that adds a "Copy Page" button to documentation pages, allowing users to copy page content as Markdown for use with LLMs.

## Development Commands

```bash
# Build (TypeScript compilation + copy styles)
pnpm run build

# Linting
pnpm run lint          # Check for linting errors
pnpm run lint:fix      # Auto-fix linting errors

# Formatting
pnpm run format        # Format code with Prettier
pnpm run format:check  # Check formatting without making changes

# Testing
pnpm run test          # Run tests once
pnpm run test:watch    # Run tests in watch mode
pnpm run test:coverage # Run tests with coverage report

# Playground (for manual testing)
pnpm run playground:dev     # Start playground dev server
pnpm run playground:build   # Build playground
```

## Publishing

Publishing is automated via GitHub Actions when a version tag (v1.*.*) is pushed:

```bash
# Create and push a version tag to trigger publishing
git tag v1.0.3
git push origin v1.0.3
```

The workflow requires `NPM_TOKEN` secret to be configured in GitHub repository settings. The token must have automation/2FA bypass permissions.

### Release Process
1. Update version in `package.json`
2. Commit: `git commit -m "chore: bump version to x.x.x"`
3. Create tag: `git tag vx.x.x`
4. Push: `git push origin main --tags`
5. GitHub Actions will automatically publish to npm

### Pre-release Versions
For RC/alpha/beta versions:
```bash
# Update package.json to "version": "1.2.2-rc.1"
git commit -am "chore: bump version to 1.2.2-rc.1"
git tag v1.2.2-rc.1
git push origin main --tags
```

## Architecture

The plugin has two main parts:

### Server-side (Build Time)
- `src/index.ts` - Main plugin entry point
  - `extendsPage`: Reads original Markdown source from each page's file
  - `clientConfigFile`: Generates a temp JS file with `window.__MARKDOWN_SOURCES__` and `window.__COPY_PAGE_OPTIONS__`

### Type Definitions
- `src/types.ts` - Centralized type definitions including:
  - `CopyPageI18n` - Internationalization strings interface
  - `CopyMeta` - Metadata for copy template functions (path, url, title, timestamp)
  - `CopyTemplate` - Template type (preset names or custom function)
  - `CopyPageOptions` - Full plugin options interface
  - `ClientOptions` - Runtime options subset
  - `builtinI18n` - Built-in i18n for en-US and zh-CN
  - `DEFAULT_URL_PREFIX` - Default URL prefix (`https://vuepress-plugin-copy-page.zhaofutao.cn`)

### Client-side (Runtime)
- `src/client/index.ts` - Client config entry, registers `CopyPageWidget` as root component
- `src/client/CopyPageWidget.ts` - Vue component that:
  - Checks if current page matches `includes`/`excludes` patterns
  - Creates a floating button with dropdown menu after the h1 element
  - Supports multiple h1 selectors for different VuePress themes
  - Copies Markdown source to clipboard via `navigator.clipboard.writeText()`
  - Applies copy templates (default, withUrl, withTimestamp, full, or custom function)
  - Uses i18n translations based on page locale (builtin en-US/zh-CN + user overrides)

### Key Data Flow
1. Build: Plugin reads `.md` files → stores in `markdownSources` Record
2. Build: Plugin generates temp JS file with sources as `window.__MARKDOWN_SOURCES__`
3. Runtime: Vue component reads from `window.__MARKDOWN_SOURCES__[pagePath]`
4. User clicks copy → Markdown content written to clipboard

## Exports

```json
{
  ".": "./lib/index.js",           // Plugin factory function
  "./client": "./lib/client/index.js",  // Vue client config with rootComponents
  "./styles/*": "./lib/styles/*"    // SCSS styles
}
```

## Testing

Tests are located in `tests/` directory:
- `tests/unit/` - Unit tests for plugin logic and pattern matching
- `tests/component/` - Component tests for Vue widgets
- `tests/setup.ts` - Test environment setup (jsdom, Vue test utils)

## Configuration Options

Key configuration options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `includes` | `string[]` | `['/posts/']` | Path prefixes where button appears |
| `excludes` | `string[]` | `[]` | Path prefixes where button does NOT appear |
| `styleMode` | `'simple' \| 'rich'` | `'simple'` | Button visual style |
| `urlPrefix` | `string` | `'https://vuepress-plugin-copy-page.zhaofutao.cn'` | URL prefix for generating full URLs |
| `copyTemplate` | `'default' \| 'withUrl' \| 'withTimestamp' \| 'full' \| function` | `'default'` | Copy content format template |
| `i18n` | `Record<string, CopyPageI18n>` | Built-in en-US/zh-CN | Internationalization strings |

### Copy Templates

The `copyTemplate` option controls how copied content is formatted:
- `default` - Just the markdown content
- `withUrl` - Prepend source URL
- `withTimestamp` - Prepend copy timestamp
- `full` - Include title, URL, and timestamp
- Custom function - `(content: string, meta: CopyMeta) => string`

### URL Prefix

When `urlPrefix` is not configured, the default `https://vuepress-plugin-copy-page.zhaofutao.cn` is used as fallback. This ensures copied content always has a valid URL reference.

## Known Issues & Solutions

### SPA Navigation Bug
**Problem:** Copy page button doesn't appear when navigating from homepage via SPA navigation, but works after page refresh.

**Solution:** Use `watchEffect` instead of `watch` for route tracking:
```typescript
// src/client/CopyPageWidget.ts
watchEffect(async () => {
  const currentPath = route?.path
  if (!currentPath) return
  pagePath.value = currentPath
  // ... create widget logic
})
```

### Route Null Safety
**Problem:** `TypeError: Cannot read properties of undefined (reading 'path')`

**Solution:** Use optional chaining when accessing route:
```typescript
const currentPath = route?.path
pagePath.value = route?.path || window.location.pathname
```

### TypeScript Type Narrowing
**Problem:** `TS2349: This expression is not callable. Type never has no call signatures.`

**Solution:** Add explicit type check and assertion for optional function types:
```typescript
if (template && typeof template === 'function') {
  return (template as (content: string, meta: CopyMeta) => string)(content, meta)
}
```

## Deployment

### Cloudflare Pages
The playground is deployed on Cloudflare Pages. After pushing changes:

1. Cloudflare will auto-deploy from GitHub
2. If changes don't appear, purge cache:
   - Dashboard → Caching → Configuration → Purge Everything
   - Or use custom purge: `https://vuepress-plugin-copy-page.zhaofutao.cn/assets/*`

### Verifying Production Deployment
Check if the latest code is deployed by examining the JS:
```javascript
// In browser console - check for watchEffect fix
fetch('/assets/app-xxx.js').then(r => r.text()).then(c => console.log(c.includes('watchEffect')))
```

## Playground Features

### Version Display
The playground displays the package version in the navbar, dynamically read from `package.json`:
```typescript
// playground/.vuepress/config.ts
import { readFileSync } from 'fs'
const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf-8'))

export default {
  define: {
    __VERSION__: JSON.stringify(pkg.version),
  },
  theme: defaultTheme({
    locales: {
      '/': {
        navbar: [
          // ...
          { text: `v${pkg.version}`, link: 'https://www.npmjs.com/package/vuepress-plugin-copy-page' },
        ],
      },
    },
  }),
}
```