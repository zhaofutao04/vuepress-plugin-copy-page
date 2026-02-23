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