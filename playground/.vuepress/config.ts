import { googleAnalyticsPlugin } from '@vuepress/plugin-google-analytics'
import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { copyPagePlugin } from '../../src/index.js'

export default {
  bundler: viteBundler(),

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
  ],

  // 多语言配置 / i18n configuration
  locales: {
    '/': {
      lang: 'en-US',
      title: 'VuePress Copy Page Plugin',
      description: 'A VuePress plugin to copy page content as Markdown for LLMs',
    },
    '/zh/': {
      lang: 'zh-CN',
      title: 'VuePress 复制页面插件',
      description: '一个 VuePress 插件，将页面内容复制为 Markdown 格式',
    },
  },

  theme: defaultTheme({
    logo: '/logo.svg',
    // 主题多语言配置 / Theme i18n configuration
    locales: {
      '/': {
        selectLanguageName: 'English',
        navbar: [
          { text: 'Home', link: '/' },
          { text: 'Posts', link: '/posts/' },
          { text: 'Docs', link: '/docs/' },
          { text: 'About', link: '/about.html' },
        ],
        sidebar: {
          '/posts/': [
            {
              text: 'Posts',
              children: [
                '/posts/getting-started',
                '/posts/advanced-usage',
                '/posts/api-reference',
              ],
            },
          ],
          '/docs/': [
            {
              text: 'Documentation',
              children: ['/docs/introduction', '/docs/configuration'],
            },
          ],
        },
      },
      '/zh/': {
        selectLanguageName: '简体中文',
        navbar: [
          { text: '首页', link: '/zh/' },
          { text: '文章', link: '/zh/posts/' },
          { text: '文档', link: '/zh/docs/' },
          { text: '关于', link: '/zh/about.html' },
        ],
        sidebar: {
          '/zh/posts/': [
            {
              text: '文章',
              children: [
                '/zh/posts/getting-started',
                '/zh/posts/advanced-usage',
                '/zh/posts/api-reference',
              ],
            },
          ],
          '/zh/docs/': [
            {
              text: '文档',
              children: ['/zh/docs/introduction', '/zh/docs/configuration'],
            },
          ],
        },
      },
    },
  }),

  plugins: [
    googleAnalyticsPlugin({
      id: 'G-RVPHNQWYYF',
    }),

    copyPagePlugin({
      includes: ['/posts/', '/docs/', '/zh/posts/', '/zh/docs/'],
      excludes: ['/about.html', '/zh/about.html'],

      // 样式模式: 'simple' | 'rich'
      styleMode: 'rich',

      // URL 前缀 - 复制时生成完整 URL (默认: https://vuepress-plugin-copy-page.zhaofutao.cn)
      // urlPrefix: 'https://your-site.com',

      // 复制模板: 'default' | 'withUrl' | 'withTimestamp' | 'full' | function
      copyTemplate: 'withUrl',

      // 国际化: 默认已支持 en-US 和 zh-CN
    }),
  ],
}
