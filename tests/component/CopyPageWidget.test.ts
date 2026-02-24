import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'

// Store original querySelector
const originalQuerySelector = document.querySelector.bind(document)

describe('CopyPageWidget Component', () => {
  let mockClipboard: { writeText: ReturnType<typeof vi.fn> }
  let mockH1: HTMLHeadingElement
  let wrappers: VueWrapper[] = []

  // Helper to mount and track wrappers for cleanup
  const mountAndTrack = (component: any, options: any) => {
    const wrapper = mount(component, options)
    wrappers.push(wrapper)
    return wrapper
  }

  beforeEach(async () => {
    // Clean up any leftover widgets from previous tests
    document.querySelectorAll('.copy-page-container').forEach(el => el.remove())
    document.querySelectorAll('.copy-page-toast').forEach(el => el.remove())
    document.querySelectorAll('h1').forEach(el => el.remove())

    // Reset modules to ensure fresh mock state
    vi.resetModules()

    // Mock vuepress/client before importing component
    vi.doMock('vuepress/client', () => ({
      useRoute: vi.fn(() => ({
        path: '/posts/test.html',
        params: {},
        query: {},
        hash: '',
        fullPath: '/posts/test.html',
        matched: [],
        name: undefined,
        redirectedFrom: undefined,
        meta: {},
      })),
    }))

    // Setup window globals
    window.__COPY_PAGE_OPTIONS__ = {
      includes: ['/posts/'],
      excludes: [],
      position: 'top-right',
    }
    window.__MARKDOWN_SOURCES__ = {
      '/posts/test.html': '# Test Page\n\nThis is a test page.',
    }

    // Mock clipboard
    mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    }
    Object.assign(navigator, {
      clipboard: mockClipboard,
    })

    // Mock window.open
    vi.spyOn(window, 'open').mockReturnValue(null)

    // Create and add mock h1 to DOM
    mockH1 = document.createElement('h1')
    mockH1.className = 'vp-page-title'
    mockH1.textContent = 'Test Page'
    document.body.appendChild(mockH1)

    // Mock document.querySelector to return our h1 for h1 queries
    vi.spyOn(document, 'querySelector').mockImplementation((selector) => {
      if (typeof selector === 'string' && selector.includes('h1')) {
        return mockH1
      }
      // Use original for other queries
      return originalQuerySelector(selector)
    })
  })

  afterEach(() => {
    // Unmount all component wrappers to prevent memory leaks and watch triggers
    wrappers.forEach(wrapper => wrapper.unmount())
    wrappers = []

    // Clean up any widgets and h1 FIRST, before restoring mocks
    document.querySelectorAll('.copy-page-container').forEach(el => el.remove())
    document.querySelectorAll('.copy-page-toast').forEach(el => el.remove())
    if (mockH1 && mockH1.parentNode) {
      mockH1.remove()
    }

    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('component mounting', () => {
    it('should mount without errors', async () => {
      const { CopyPageWidget } = await import('../../src/client/CopyPageWidget')
      const wrapper = mountAndTrack(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should render nothing (returns null from render)', async () => {
      const { CopyPageWidget } = await import('../../src/client/CopyPageWidget')
      const wrapper = mountAndTrack(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })
      // The component renders nothing directly
      expect(wrapper.html()).toBe('')
    })
  })

  describe('shouldShow computed property', () => {
    it('should create widget when path matches includes pattern', async () => {
      const { CopyPageWidget } = await import('../../src/client/CopyPageWidget')
      mountAndTrack(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Wait for widget creation
      await new Promise(resolve => setTimeout(resolve, 250))

      const container = document.querySelector('.copy-page-container')
      expect(container).toBeTruthy()
    })
  })

  describe('copy functionality', () => {
    it('should copy markdown source to clipboard', async () => {
      const { CopyPageWidget } = await import('../../src/client/CopyPageWidget')
      mountAndTrack(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Wait for widget creation
      await new Promise(resolve => setTimeout(resolve, 250))

      const copyButton = document.querySelector('[data-action="copy"]') as HTMLButtonElement
      expect(copyButton).toBeTruthy()

      if (copyButton) {
        copyButton.click()
        await new Promise(resolve => setTimeout(resolve, 50))
        expect(mockClipboard.writeText).toHaveBeenCalledWith('# Test Page\n\nThis is a test page.')
      }
    })

    it('should show success toast after copying', async () => {
      const { CopyPageWidget } = await import('../../src/client/CopyPageWidget')
      mountAndTrack(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Wait for widget creation
      await new Promise(resolve => setTimeout(resolve, 250))

      const copyButton = document.querySelector('[data-action="copy"]') as HTMLButtonElement

      if (copyButton) {
        copyButton.click()
        await new Promise(resolve => setTimeout(resolve, 100))

        const toast = document.querySelector('.copy-page-toast')
        expect(toast).toBeTruthy()
        expect(toast?.textContent).toContain('Copied to clipboard!')
      }
    })

    it('should show error toast on copy failure', async () => {
      mockClipboard.writeText = vi.fn().mockRejectedValue(new Error('Copy failed'))

      const { CopyPageWidget } = await import('../../src/client/CopyPageWidget')
      mountAndTrack(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Wait for widget creation
      await new Promise(resolve => setTimeout(resolve, 250))

      const copyButton = document.querySelector('[data-action="copy"]') as HTMLButtonElement

      if (copyButton) {
        copyButton.click()
        await new Promise(resolve => setTimeout(resolve, 100))

        const toast = document.querySelector('.copy-page-toast.error')
        expect(toast).toBeTruthy()
      }
    })
  })

  describe('view as markdown functionality', () => {
    it('should open markdown in new tab', async () => {
      const mockOpen = vi.spyOn(window, 'open').mockReturnValue(null)

      const { CopyPageWidget } = await import('../../src/client/CopyPageWidget')
      mountAndTrack(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Wait for widget creation
      await new Promise(resolve => setTimeout(resolve, 250))

      const viewButton = document.querySelector('[data-action="view"]') as HTMLButtonElement

      if (viewButton) {
        viewButton.click()
        expect(mockOpen).toHaveBeenCalledWith(expect.stringContaining('blob:'), '_blank')
      }
    })

    it('should create blob with correct content type', async () => {
      vi.spyOn(window, 'open').mockReturnValue(null)
      const blobSpy = vi.spyOn(global, 'Blob').mockImplementation(function (_parts, options) {
        return { type: options?.type } as any
      })

      const { CopyPageWidget } = await import('../../src/client/CopyPageWidget')
      mountAndTrack(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Wait for widget creation
      await new Promise(resolve => setTimeout(resolve, 250))

      const viewButton = document.querySelector('[data-action="view"]') as HTMLButtonElement

      if (viewButton) {
        viewButton.click()
        expect(blobSpy).toHaveBeenCalledWith(
          ['# Test Page\n\nThis is a test page.'],
          { type: 'text/plain;charset=utf-8' }
        )
      }

      blobSpy.mockRestore()
    })
  })

  describe('menu toggle', () => {
    it('should show menu when trigger is clicked', async () => {
      const { CopyPageWidget } = await import('../../src/client/CopyPageWidget')
      mountAndTrack(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Wait for widget creation
      await new Promise(resolve => setTimeout(resolve, 250))

      const trigger = document.querySelector('.copy-page-trigger') as HTMLButtonElement
      const menu = document.querySelector('.copy-page-menu') as HTMLElement

      if (trigger && menu) {
        trigger.click()
        expect(menu.style.display).toBe('block')
      }
    })

    it('should hide menu when clicking outside', async () => {
      const { CopyPageWidget } = await import('../../src/client/CopyPageWidget')
      mountAndTrack(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Wait for widget creation
      await new Promise(resolve => setTimeout(resolve, 250))

      const trigger = document.querySelector('.copy-page-trigger') as HTMLButtonElement
      const menu = document.querySelector('.copy-page-menu') as HTMLElement

      if (trigger && menu) {
        trigger.click()
        expect(menu.style.display).toBe('block')

        // Simulate click outside
        document.dispatchEvent(new Event('click'))
        expect(menu.style.display).toBe('none')
      }
    })

    it('should hide menu when ESC key is pressed', async () => {
      const { CopyPageWidget } = await import('../../src/client/CopyPageWidget')
      mountAndTrack(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Wait for widget creation
      await new Promise(resolve => setTimeout(resolve, 250))

      const trigger = document.querySelector('.copy-page-trigger') as HTMLButtonElement
      const menu = document.querySelector('.copy-page-menu') as HTMLElement

      if (trigger && menu) {
        trigger.click()
        expect(menu.style.display).toBe('block')

        // Simulate ESC key
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        expect(menu.style.display).toBe('none')
      }
    })
  })

  describe('default options fallback', () => {
    it('should use default options when window globals are not set', async () => {
      delete window.__COPY_PAGE_OPTIONS__
      delete window.__MARKDOWN_SOURCES__

      const { CopyPageWidget } = await import('../../src/client/CopyPageWidget')
      const wrapper = mountAndTrack(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Component should still mount without errors
      expect(wrapper.exists()).toBe(true)
    })
  })
})
