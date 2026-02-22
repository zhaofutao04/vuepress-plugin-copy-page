# 高级用法

了解如何根据你的具体需求配置插件。

## 配置选项

插件接受以下选项：

### includes

- **类型:** `string[]`
- **默认值:** `['/posts/']`

指定哪些页面路径应包含复制按钮。使用路径前缀匹配多个页面。

```typescript
copyPagePlugin({
  includes: ['/blog/', '/docs/'],
})
```

### excludes

- **类型:** `string[]`
- **默认值:** `[]`

指定哪些页面路径应**排除**复制按钮。排除优先于包含。

```typescript
copyPagePlugin({
  excludes: ['/about/', '/privacy/'],
})
```

### position

- **类型:** `'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'`
- **默认值:** `'top-right'`

复制按钮在页面上的位置。

## 示例

### 仅博客配置

仅在博客文章上显示按钮：

```typescript
copyPagePlugin({
  includes: ['/blog/'],
})
```

### 排除特定页面

在除特定页面外的所有页面上显示：

```typescript
copyPagePlugin({
  excludes: ['/home/', '/about/'],
})
```

### 组合配置

在特定部分显示，但排除某些页面：

```typescript
copyPagePlugin({
  includes: ['/docs/', '/blog/'],
  excludes: ['/docs/api/', '/blog/drafts/'],
})
```

## 样式

插件使用 SCSS 进行样式设置。你可以通过以下方式自定义外观：

1. 覆盖 CSS 变量
2. 自定义组件样式
3. 调整按钮位置

### 默认样式

按钮显示为页面右上角的浮动元素，位于主标题之后。

## 技术细节

插件的工作原理：

1. **构建时**：从每个页面文件读取原始 Markdown 源码
2. **构建时**：将源码存储在暴露给客户端的全局对象中
3. **运行时**：Vue 组件读取当前页面的源码
4. **用户操作**：点击按钮将 Markdown 复制到剪贴板

这确保复制的是**确切的原始 Markdown**，保留格式和结构。
