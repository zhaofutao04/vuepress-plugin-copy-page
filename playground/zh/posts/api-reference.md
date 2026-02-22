# API 参考

vuepress-plugin-copy-page 插件的完整参考。

## 插件函数

### copyPagePlugin(options?)

创建复制页面插件的新实例。

**参数：**
- `options`（可选）：配置对象

**返回值：** VuePress 插件对象

**类型：**

```typescript
function copyPagePlugin(options?: CopyPageOptions): Plugin
```

## 选项接口

### CopyPageOptions

```typescript
interface CopyPageOptions {
  includes?: string[]
  excludes?: string[]
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}
```

#### includes

- **类型：** `string[]`
- **默认值：** `['/posts/']`

复制按钮应出现的路径前缀。

#### excludes

- **类型：** `string[]`
- **默认值：** `[]`

复制按钮不应出现的路径前缀。排除优先于包含。

#### position

- **类型：** `'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'`
- **默认值：** `'top-right'`

复制按钮的位置。

## 客户端组件

### CopyPageWidget

渲染复制按钮的 Vue 组件。

**导入：**

```typescript
import CopyPageWidget from 'vuepress-plugin-copy-page/client'
```

**用法：**

```typescript
import { defineClientConfig } from 'vuepress/client'

export default defineClientConfig({
  rootComponents: [CopyPageWidget],
})
```

## 全局变量

### window.__MARKDOWN_SOURCES__

将页面路径映射到其原始 Markdown 源内容的记录。

**类型：**

```typescript
window.__MARKDOWN_SOURCES__: Record<string, string>
```

### window.__COPY_PAGE_OPTIONS__

传递给客户端的插件选项。

**类型：**

```typescript
window.__COPY_PAGE_OPTIONS__: CopyPageOptions
```

## 配置示例

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
