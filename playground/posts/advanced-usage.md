# Advanced Usage

Learn how to configure the plugin for your specific needs.

## Configuration Options

The plugin accepts the following options:

### includes

- **Type:** `string[]`
- **Default:** `['/posts/']`

Specify which page paths should include the copy button. Use path prefixes to match multiple pages.

```typescript
copyPagePlugin({
  includes: ['/blog/', '/docs/'],
})
```

### excludes

- **Type:** `string[]`
- **Default:** `[]`

Specify which page paths should **exclude** the copy button. Exclusions take priority over inclusions.

```typescript
copyPagePlugin({
  excludes: ['/about/', '/privacy/'],
})
```

### position

- **Type:** `'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'`
- **Default:** `'top-right'`

Position of the copy button on the page.

## Examples

### Blog-Only Configuration

Only show the button on blog posts:

```typescript
copyPagePlugin({
  includes: ['/blog/'],
})
```

### Exclude Specific Pages

Show on all pages except certain ones:

```typescript
copyPagePlugin({
  excludes: ['/home/', '/about/'],
})
```

### Combined Configuration

Show on specific sections but exclude certain pages:

```typescript
copyPagePlugin({
  includes: ['/docs/', '/blog/'],
  excludes: ['/docs/api/', '/blog/drafts/'],
})
```

## Styling

The plugin uses SCSS for styling. You can customize the appearance by:

1. Overriding CSS variables
2. Customizing the component styles
3. Adjusting the button position

### Default Styling

The button appears as a floating element in the top-right corner of the page, positioned after the main heading.

## Technical Details

The plugin works by:

1. **Build time**: Reading the original Markdown source from each page file
2. **Build time**: Storing sources in a global object exposed to the client
3. **Runtime**: The Vue component reads the source for the current page
4. **User action**: Clicking the button copies the Markdown to clipboard

This ensures that the **exact original Markdown** is copied, preserving formatting and structure.
