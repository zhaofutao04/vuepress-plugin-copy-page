import { defineClientConfig } from 'vuepress/client'
import { CopyPageWidget } from '../../src/client/CopyPageWidget.js'
import '../../src/styles/index.scss'
import ConfigPanel from './components/ConfigPanel.js'
import './styles/index.scss'

const DEFAULT_URL_PREFIX = 'https://vuepress-plugin-copy-page.zhaofutao.cn'

// Initialize default options (normally done by the plugin's generated config)
if (typeof window !== 'undefined' && !window.__COPY_PAGE_OPTIONS__) {
  window.__COPY_PAGE_OPTIONS__ = {
    includes: ['/posts/', '/docs/', '/zh/posts/', '/zh/docs/'],
    excludes: ['/about.html', '/zh/about.html'],
    position: 'top-right',
    styleMode: 'rich',
    urlPrefix: DEFAULT_URL_PREFIX,
    copyTemplate: 'withUrl',
  }
}

export { CopyPageWidget }
export default defineClientConfig({
  rootComponents: [CopyPageWidget, ConfigPanel],
})
