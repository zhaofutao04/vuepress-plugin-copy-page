import { defineComponent, ref, computed, onMounted, h } from 'vue'

declare global {
  interface Window {
    __MARKDOWN_SOURCES__?: Record<string, string>
    __COPY_PAGE_OPTIONS__?: {
      includes: string[]
      excludes: string[]
      urlPrefix?: string
      copyTemplate?: string
    }
  }
}

interface ConfigState {
  includes: string[]
  excludes: string[]
  urlPrefix: string
  copyTemplate: 'default' | 'withUrl' | 'withTimestamp' | 'full'
}

const DEFAULT_URL_PREFIX = 'https://vuepress-plugin-copy-page.zhaofutao.cn'

export const ConfigPanel = defineComponent({
  name: 'ConfigPanel',
  setup() {
    const isOpen = ref(false)
    const currentPagePath = ref('')

    const config = ref<ConfigState>({
      includes: ['/posts/', '/docs/'],
      excludes: ['/about/'],
      urlPrefix: DEFAULT_URL_PREFIX,
      copyTemplate: 'withUrl'
    })

    const tempIncludes = ref('')
    const tempExcludes = ref('')

    // Load saved config from localStorage
    const loadConfig = () => {
      const saved = localStorage.getItem('copyPageConfig')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          config.value = { ...config.value, ...parsed }
        } catch (e) {
          console.error('Failed to parse saved config:', e)
        }
      }
      // Update temp values
      tempIncludes.value = config.value.includes.join('\n')
      tempExcludes.value = config.value.excludes.join('\n')
    }

    // Save config to localStorage and update global
    const saveConfig = () => {
      const newConfig: ConfigState = {
        includes: tempIncludes.value.split('\n').filter(p => p.trim()),
        excludes: tempExcludes.value.split('\n').filter(p => p.trim()),
        urlPrefix: config.value.urlPrefix || DEFAULT_URL_PREFIX,
        copyTemplate: config.value.copyTemplate
      }

      config.value = newConfig
      localStorage.setItem('copyPageConfig', JSON.stringify(newConfig))

      // Update global options (preserve other options)
      if (typeof window !== 'undefined') {
        window.__COPY_PAGE_OPTIONS__ = {
          ...window.__COPY_PAGE_OPTIONS__,
          includes: newConfig.includes,
          excludes: newConfig.excludes,
          urlPrefix: newConfig.urlPrefix,
          copyTemplate: newConfig.copyTemplate
        }
      }

      // Trigger page reload to apply changes
      window.location.reload()
    }

    const resetConfig = () => {
      const defaultConfig: ConfigState = {
        includes: ['/posts/', '/docs/'],
        excludes: ['/about/'],
        urlPrefix: DEFAULT_URL_PREFIX,
        copyTemplate: 'withUrl'
      }
      config.value = defaultConfig
      tempIncludes.value = defaultConfig.includes.join('\n')
      tempExcludes.value = defaultConfig.excludes.join('\n')
      localStorage.removeItem('copyPageConfig')
    }

    const checkPageMatch = (path: string, patterns: string[]) => {
      return patterns.some(pattern => path.startsWith(pattern))
    }

    const willShowButton = computed(() => {
      const path = currentPagePath.value
      if (checkPageMatch(path, config.value.excludes)) return false
      if (checkPageMatch(path, config.value.includes)) return true
      return false
    })

    onMounted(() => {
      currentPagePath.value = window.location.pathname
      loadConfig()
    })

    return () => h('div', { class: 'config-panel' }, [
      // Toggle Button
      h('button', {
        class: 'config-panel-toggle',
        onClick: () => { isOpen.value = !isOpen.value },
        title: 'Configuration Panel'
      }, [
        h('span', { class: 'config-icon' }, '⚙️'),
        h('span', { class: 'config-label' }, 'Config')
      ]),

      // Panel
      isOpen.value ? h('div', { class: 'config-panel-drawer' }, [
        h('div', { class: 'config-panel-header' }, [
          h('h3', {}, 'Plugin Configuration'),
          h('button', {
            class: 'config-close',
            onClick: () => { isOpen.value = false }
          }, '×')
        ]),

        h('div', { class: 'config-panel-content' }, [
          // Current Page Info
          h('div', { class: 'config-info' }, [
            h('strong', {}, 'Current Page:'),
            h('code', {}, currentPagePath.value),
            h('div', {
              class: willShowButton.value ? 'status-enabled' : 'status-disabled'
            }, willShowButton.value ? '✓ Button Enabled' : '✗ Button Disabled')
          ]),

          // Copy Template
          h('div', { class: 'config-group' }, [
            h('label', {}, 'Copy Template:'),
            h('select', {
              value: config.value.copyTemplate,
              onChange: (e: Event) => {
                config.value.copyTemplate = (e.target as HTMLSelectElement).value as ConfigState['copyTemplate']
              }
            }, [
              h('option', { value: 'default' }, 'Default - Just the markdown content'),
              h('option', { value: 'withUrl' }, 'With URL - Prepend source URL'),
              h('option', { value: 'withTimestamp' }, 'With Timestamp - Prepend copy time'),
              h('option', { value: 'full' }, 'Full - Include title, URL, and timestamp')
            ]),
            h('small', {}, 'Format of copied content')
          ]),

          // URL Prefix
          h('div', { class: 'config-group' }, [
            h('label', {}, 'URL Prefix:'),
            h('input', {
              type: 'text',
              value: config.value.urlPrefix,
              onInput: (e: Event) => {
                config.value.urlPrefix = (e.target as HTMLInputElement).value
              },
              placeholder: DEFAULT_URL_PREFIX
            }),
            h('small', {}, 'URL prefix for generating full URLs in copied content')
          ]),

          // Includes
          h('div', { class: 'config-group' }, [
            h('label', {}, 'Include Paths (one per line):'),
            h('textarea', {
              value: tempIncludes.value,
              onInput: (e: Event) => {
                tempIncludes.value = (e.target as HTMLTextAreaElement).value
              },
              placeholder: '/posts/\n/docs/',
              rows: 4
            }),
            h('small', {}, 'Pages matching these paths will show the button')
          ]),

          // Excludes
          h('div', { class: 'config-group' }, [
            h('label', {}, 'Exclude Paths (one per line):'),
            h('textarea', {
              value: tempExcludes.value,
              onInput: (e: Event) => {
                tempExcludes.value = (e.target as HTMLTextAreaElement).value
              },
              placeholder: '/about/\n/home/',
              rows: 4
            }),
            h('small', {}, 'Pages matching these paths will NOT show the button')
          ]),

          // Buttons
          h('div', { class: 'config-actions' }, [
            h('button', {
              class: 'btn-reset',
              onClick: resetConfig
            }, 'Reset'),
            h('button', {
              class: 'btn-apply',
              onClick: saveConfig
            }, 'Apply & Reload')
          ]),

          // Help
          h('div', { class: 'config-help' }, [
            h('h4', {}, 'How it works:'),
            h('ul', {}, [
              h('li', {}, 'Enter path prefixes (e.g., /posts/ matches all posts)'),
              h('li', {}, 'Exclusions take priority over inclusions'),
              h('li', {}, 'Changes take effect after page reload'),
              h('li', {}, 'Config is saved in localStorage')
            ])
          ])
        ])
      ]) : null
    ])
  }
})

export default ConfigPanel
