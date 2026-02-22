import { defineClientConfig } from 'vuepress/client'
import { CopyPageWidget } from '../../src/client/CopyPageWidget.js'
import ConfigPanel from './components/ConfigPanel.js'

export { CopyPageWidget }
export default defineClientConfig({
  rootComponents: [CopyPageWidget, ConfigPanel],
})
