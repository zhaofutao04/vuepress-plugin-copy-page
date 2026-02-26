import { defineComponent, ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vuepress/client'
import type { ClientOptions, CopyPageI18n, CopyMeta } from '../types.js'
import { builtinI18n, DEFAULT_URL_PREFIX } from '../types.js'

declare global {
  interface Window {
    __MARKDOWN_SOURCES__?: Record<string, string>
    __COPY_PAGE_OPTIONS__?: ClientOptions
  }
}

const defaultOptions: ClientOptions = {
  includes: ['/posts/'],
  excludes: [],
}

// Delay before creating widget after navigation, to wait for page content rendering
const WIDGET_CREATION_DELAY_MS = 300

// SVG Icons as strings (constant, safe for innerHTML)
const copyIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`

const checkIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`

const markdownIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="22" height="18" rx="2"></rect><path d="M5 17V7l3.5 4L12 7v10"></path><path d="M19 7l-5 5 5 5"></path></svg>`

/** H1 selectors that cover multiple VuePress themes */
const H1_SELECTOR = '.vp-page-title h1, main h1, .vp-page-content h1, article h1'

export const CopyPageWidget = defineComponent({
  name: 'CopyPageWidget',

  setup() {
    const route = useRoute()
    const mounted = ref(false)
    const pagePath = ref('')
    const pageTitle = ref('')
    const currentLang = ref('en-US')
    let widgetEl: HTMLElement | null = null
    let cleanupFns: Array<() => void> = []
    let createWidgetTimer: ReturnType<typeof setTimeout> | null = null

    const updateLang = () => {
      if (typeof document !== 'undefined') {
        currentLang.value = document.documentElement.lang || 'en-US'
      }
    }

    const options = computed(() => {
      if (typeof window !== 'undefined') {
        return window.__COPY_PAGE_OPTIONS__ || defaultOptions
      }
      return defaultOptions
    })

    const markdownSource = computed(() => {
      if (typeof window !== 'undefined' && window.__MARKDOWN_SOURCES__) {
        return window.__MARKDOWN_SOURCES__[pagePath.value] || ''
      }
      return ''
    })

    const shouldShow = computed(() => {
      if (!mounted.value || !pagePath.value) return false
      const path = pagePath.value

      for (const exclude of options.value.excludes) {
        if (path.startsWith(exclude)) return false
      }

      for (const include of options.value.includes) {
        if (path.startsWith(include) && !path.endsWith('/')) return true
      }

      return false
    })

    /**
     * Get translated string for a given key.
     * Priority: user i18n > builtin i18n > default English
     */
    const t = (key: keyof CopyPageI18n): string => {
      const locale = currentLang.value || 'en-US'
      const userI18n = options.value.i18n?.[locale]
      const fallback = builtinI18n['en-US']!
      const builtin = builtinI18n[locale] ?? fallback

      return userI18n?.[key] || builtin[key] || fallback[key] || ''
    }

    const getPageTitle = (): string => {
      if (pageTitle.value) return pageTitle.value
      const h1 = document.querySelector(H1_SELECTOR) as HTMLHeadingElement
      return h1?.textContent?.trim() || ''
    }

    const buildCopyMeta = (): CopyMeta => {
      const urlPrefix = options.value.urlPrefix || DEFAULT_URL_PREFIX
      const path = pagePath.value
      return {
        path,
        url: `${urlPrefix}${path}`,
        title: getPageTitle(),
        timestamp: new Date().toISOString(),
      }
    }

    const applyTemplate = (content: string, meta: CopyMeta): string => {
      const template = options.value.copyTemplate

      if (template && typeof template === 'function') {
        return (template as (content: string, meta: CopyMeta) => string)(content, meta)
      }

      switch (template) {
        case 'withUrl':
          return `Source: ${meta.url}\n\n${content}`
        case 'withTimestamp':
          return `Copied at: ${meta.timestamp}\n\n${content}`
        case 'full':
          return `# ${meta.title}\n\nSource: ${meta.url}\nCopied at: ${meta.timestamp}\n\n---\n\n${content}`
        default:
          return content
      }
    }

    const showToast = (message: string, isError = false) => {
      const existingToast = document.querySelector('.copy-page-toast')
      if (existingToast) existingToast.remove()

      const toast = document.createElement('div')
      toast.className = `copy-page-toast ${isError ? 'error' : ''}`
      toast.textContent = message
      document.body.appendChild(toast)

      requestAnimationFrame(() => toast.classList.add('show'))

      setTimeout(() => {
        toast.classList.remove('show')
        setTimeout(() => toast.remove(), 300)
      }, 2000)
    }

    const copyAsMarkdown = async () => {
      try {
        let content = ''

        if (markdownSource.value) {
          content = markdownSource.value
        } else {
          const contentEl =
            document.querySelector('.theme-default-content') ||
            document.querySelector('.vp-doc') ||
            document.querySelector('article')
          if (contentEl) {
            content = contentEl.textContent?.trim() || ''
          }
        }

        if (content) {
          const meta = buildCopyMeta()
          content = applyTemplate(content, meta)
        }

        await navigator.clipboard.writeText(content)
        showToast(t('copiedToClipboard'))
        updateButtonState(true)
        setTimeout(() => updateButtonState(false), 2000)
      } catch (err) {
        console.error('Copy failed:', err)
        showToast(t('copyFailed'), true)
      }
    }

    const viewAsMarkdown = () => {
      if (markdownSource.value) {
        let content = markdownSource.value
        const meta = buildCopyMeta()
        content = applyTemplate(content, meta)

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
        setTimeout(() => URL.revokeObjectURL(url), 5000)
      }
    }

    const updateButtonState = (copied: boolean) => {
      if (!widgetEl) return
      const trigger = widgetEl.querySelector('.copy-page-trigger')
      const icon = widgetEl.querySelector('.copy-page-icon')
      const label = widgetEl.querySelector('.copy-page-label')

      if (copied) {
        trigger?.classList.add('copied')
        if (icon) icon.innerHTML = checkIconSvg
        if (label) label.textContent = t('copied')
      } else {
        trigger?.classList.remove('copied')
        if (icon) icon.innerHTML = copyIconSvg
        if (label) label.textContent = t('copyPage')
      }
    }

    /**
     * Remove all event listeners registered by the widget, clear pending timers,
     * and remove the widget DOM element.
     */
    const cleanupWidget = () => {
      if (createWidgetTimer) {
        clearTimeout(createWidgetTimer)
        createWidgetTimer = null
      }
      cleanupFns.forEach((fn) => fn())
      cleanupFns = []
      widgetEl?.remove()
      widgetEl = null
    }

    /**
     * Helper to add an event listener and track it for cleanup.
     */
    const addTrackedListener = <K extends keyof HTMLElementEventMap>(
      target: EventTarget,
      event: K,
      handler: (e: HTMLElementEventMap[K]) => void
    ) => {
      target.addEventListener(event, handler as EventListener)
      cleanupFns.push(() => target.removeEventListener(event, handler as EventListener))
    }

    /**
     * Build the widget DOM safely using DOM APIs to avoid XSS from i18n strings.
     * SVG icons are hardcoded constants and safe for innerHTML.
     */
    const createWidget = () => {
      if (!shouldShow.value) return null

      const h1 = document.querySelector(H1_SELECTOR) as HTMLHeadingElement
      if (!h1) return null

      pageTitle.value = h1.textContent?.trim() || ''

      // Clean up any existing widget before creating a new one
      cleanupWidget()

      // Build DOM tree safely - use textContent for all user-controlled strings
      const container = document.createElement('div')
      container.className = 'copy-page-container'

      const widget = document.createElement('div')
      widget.className = 'copy-page-widget'

      // Trigger button
      const trigger = document.createElement('button')
      trigger.className = 'copy-page-trigger'
      trigger.title = 'Copy page options'

      const triggerIcon = document.createElement('span')
      triggerIcon.className = 'copy-page-icon'
      triggerIcon.innerHTML = copyIconSvg

      const triggerLabel = document.createElement('span')
      triggerLabel.className = 'copy-page-label'
      triggerLabel.textContent = t('copyPage')

      trigger.appendChild(triggerIcon)
      trigger.appendChild(triggerLabel)

      // Dropdown menu
      const menu = document.createElement('div')
      menu.className = 'copy-page-menu'
      menu.style.display = 'none'

      // Copy menu item
      const copyItem = document.createElement('button')
      copyItem.className = 'copy-page-menu-item'
      copyItem.dataset.action = 'copy'

      const copyItemIcon = document.createElement('span')
      copyItemIcon.className = 'menu-item-icon'
      copyItemIcon.innerHTML = copyIconSvg

      const copyItemText = document.createElement('span')
      copyItemText.className = 'menu-item-text'

      const copyItemTitle = document.createElement('span')
      copyItemTitle.className = 'menu-item-title'
      copyItemTitle.textContent = t('copyPage')

      const copyItemDesc = document.createElement('span')
      copyItemDesc.className = 'menu-item-desc'
      copyItemDesc.textContent = t('copyAsMarkdown')

      copyItemText.appendChild(copyItemTitle)
      copyItemText.appendChild(copyItemDesc)
      copyItem.appendChild(copyItemIcon)
      copyItem.appendChild(copyItemText)

      // View menu item
      const viewItem = document.createElement('button')
      viewItem.className = 'copy-page-menu-item'
      viewItem.dataset.action = 'view'

      const viewItemIcon = document.createElement('span')
      viewItemIcon.className = 'menu-item-icon'
      viewItemIcon.innerHTML = markdownIconSvg

      const viewItemText = document.createElement('span')
      viewItemText.className = 'menu-item-text'

      const viewItemTitle = document.createElement('span')
      viewItemTitle.className = 'menu-item-title'
      viewItemTitle.textContent = t('viewAsMarkdown')

      const viewItemDesc = document.createElement('span')
      viewItemDesc.className = 'menu-item-desc'
      viewItemDesc.textContent = t('viewAsMarkdownDesc')

      viewItemText.appendChild(viewItemTitle)
      viewItemText.appendChild(viewItemDesc)
      viewItem.appendChild(viewItemIcon)
      viewItem.appendChild(viewItemText)

      // Assemble DOM tree
      menu.appendChild(copyItem)
      menu.appendChild(viewItem)
      widget.appendChild(trigger)
      widget.appendChild(menu)
      container.appendChild(widget)

      h1.after(container)
      widgetEl = container

      // Setup event listeners with automatic cleanup tracking
      addTrackedListener(trigger, 'click', (e: Event) => {
        e.stopPropagation()
        const isVisible = menu.style.display !== 'none'
        menu.style.display = isVisible ? 'none' : 'block'
      })

      addTrackedListener(copyItem, 'click', () => {
        menu.style.display = 'none'
        copyAsMarkdown().catch((err) => console.error('Copy page error:', err))
      })

      addTrackedListener(viewItem, 'click', () => {
        menu.style.display = 'none'
        viewAsMarkdown()
      })

      // Global listeners for closing menu - also tracked for cleanup
      addTrackedListener(document as unknown as HTMLElement, 'click', () => {
        menu.style.display = 'none'
      })

      addTrackedListener(document as unknown as HTMLElement, 'keydown', (e: Event) => {
        if ((e as KeyboardEvent).key === 'Escape') {
          menu.style.display = 'none'
        }
      })

      return container
    }

    /**
     * Schedule widget creation with a delay to wait for page content to render.
     */
    const scheduleCreateWidget = () => {
      if (createWidgetTimer) clearTimeout(createWidgetTimer)
      createWidgetTimer = setTimeout(() => {
        createWidgetTimer = null
        createWidget()
      }, WIDGET_CREATION_DELAY_MS)
    }

    // Track route changes and update pagePath + language.
    // Using watch with immediate:true for reliable SPA navigation detection,
    // equivalent to watchEffect but without dependency-tracking side effects.
    watch(
      () => route?.path,
      (newPath) => {
        if (!newPath) return
        pagePath.value = newPath
        updateLang()
      },
      { immediate: true }
    )

    // Single watcher for widget lifecycle.
    // Triggers when shouldShow or pagePath changes (covers route navigation,
    // mount state change, and option changes).
    watch(
      [shouldShow, pagePath],
      ([show]) => {
        cleanupWidget()
        if (show) {
          nextTick(() => scheduleCreateWidget())
        }
      },
      { flush: 'post' }
    )

    onMounted(() => {
      mounted.value = true
    })

    onUnmounted(() => {
      cleanupWidget()
    })

    return () => null // Render nothing, widget is inserted via DOM
  },
})

export default CopyPageWidget
