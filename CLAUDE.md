# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

vuepress-plugin-copy-page is a VuePress 2 plugin that adds a "Copy Page" button to documentation pages, allowing users to copy page content as Markdown for use with LLMs.

## Build Commands

```bash
# Build (TypeScript compilation + copy styles)
npm run build

# The build process:
# 1. Compiles TypeScript from src/ to lib/
# 2. Copies src/styles/ to lib/styles/
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

### Client-side (Runtime)
- `src/client/CopyPageWidget.ts` - Vue component that:
  - Checks if current page matches `includes`/`excludes` patterns
  - Creates a floating button with dropdown menu after the h1 element
  - Supports multiple h1 selectors for different VuePress themes
  - Copies Markdown source to clipboard via `navigator.clipboard.writeText()`

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

## Missing Files Note

`src/client/index.ts` is missing from source but the compiled `lib/client/index.js` exists. This file should export the client config:

```ts
import { defineClientConfig } from '@vuepress/client'
import { CopyPageWidget } from './CopyPageWidget.js'

export { CopyPageWidget }
export default defineClientConfig({
  rootComponents: [CopyPageWidget],
})
```

## Workflow Issues

The GitHub Actions workflow references scripts that don't exist:
- `npm run lint` - not defined in package.json
- `npm test` - not defined in package.json

These steps will fail unless the scripts are added or the workflow is updated.
