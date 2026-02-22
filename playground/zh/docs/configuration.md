# 配置

了解如何为你的 VuePress 网站配置 vuepress-plugin-copy-page 插件。

## 安装

首先，安装插件：

```bash
npm install vuepress-plugin-copy-page
```

## 步骤 1：插件配置

将插件添加到你的 VuePress 配置文件：

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

## 步骤 2：客户端配置

注册客户端组件：

```typescript
// .vuepress/client.ts
import { defineClientConfig } from 'vuepress/client'
import CopyPageWidget from 'vuepress-plugin-copy-page/client'

export default defineClientConfig({
  rootComponents: [CopyPageWidget],
})
```

## 配置选项

### includes

指定哪些页面路径应包含复制按钮。

```typescript
{
  includes: ['/blog/', '/docs/']  // 仅博客和文档页面
}
```

### excludes

指定哪些页面路径应排除复制按钮。

```typescript
{
  excludes: ['/about/', '/home/']  // 除关于和首页外的所有页面
}
```

### 组合使用

你可以同时使用这两个选项：

```typescript
{
  includes: ['/docs/', '/blog/'],
  excludes: ['/docs/drafts/', '/blog/private/']
}
```

## 默认行为

当没有提供选项时，复制按钮会出现在匹配默认包含的页面上：

```typescript
copyPagePlugin()  // 默认：includes ['/posts/']
```

## 示例

### 文档网站

```typescript
copyPagePlugin({
  includes: ['/docs/'],
})
```

### 带私有文章的博客

```typescript
copyPagePlugin({
  includes: ['/blog/'],
  excludes: ['/blog/drafts/', '/blog/private/'],
})
```

### 全站排除特定页面

```typescript
copyPagePlugin({
  excludes: ['/about/', '/contact/', '/legal/'],
})
```

## 注意事项

- 路径匹配使用前缀匹配（例如，`/docs/` 匹配 `/docs/guide` 和 `/docs/api/reference`）
- 排除优先于包含
- 路径应以 `/` 开头，目录应包含尾部 `/`
- 索引页面（以 `/` 结尾的路径）会自动排除
