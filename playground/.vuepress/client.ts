import { defineClientConfig } from 'vuepress/client'
import { CopyPageWidget } from '../../src/client/CopyPageWidget.js'
import '../../src/styles/index.scss'
import ConfigPanel from './components/ConfigPanel.js'
import './styles/index.scss'

export { CopyPageWidget }
export default defineClientConfig({
  rootComponents: [CopyPageWidget, ConfigPanel],
})
