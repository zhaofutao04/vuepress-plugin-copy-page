import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { copyPagePlugin } from '../../src/index.js'

export default {
  bundler: viteBundler(),

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
    copyPagePlugin({
      includes: ['/posts/', '/docs/', '/zh/posts/', '/zh/docs/'],
      excludes: ['/about.html', '/zh/about.html'],
    }),
  ],
}
