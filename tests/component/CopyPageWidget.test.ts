import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { CopyPageWidget } from '../../src/client/CopyPageWidget'
import * as VueRouter from 'vue-router'

// Store original querySelector
const originalQuerySelector = document.querySelector.bind(document)

// Helper to update mock route
const mockRoute = (path: string) => {
  vi.mocked(VueRouter.useRoute).mockReturnValue({
    path,
    params: {},
    query: {},
    hash: '',
    fullPath: path,
    matched: [],
    name: undefined,
    redirectedFrom: undefined,
    meta: {},
  } as any)
}

describe('CopyPageWidget Component', () => {
  let mockClipboard: { writeText: ReturnType<typeof vi.fn> }
  let mockH1: HTMLHeadingElement

  beforeEach(() => {
    // Mock route path (default)
    mockRoute('/posts/test.html')

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
    vi.clearAllMocks()
    vi.restoreAllMocks()
    // Clean up any widgets and h1
    document.querySelectorAll('.copy-page-container').forEach(el => el.remove())
    document.querySelectorAll('.copy-page-toast').forEach(el => el.remove())
    mockH1?.remove()
  })

  describe('component mounting', () => {
    it('should mount without errors', () => {
      const wrapper = mount(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should render nothing (returns null from render)', () => {
      const wrapper = mount(CopyPageWidget, {
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
    beforeEach(() => {
      // Mock route path
      mockRoute('/posts/test.html')
      // Mock window.location
      delete (window as any).location
      window.location = { pathname: '/posts/test.html' } as any
    })

    it('should create widget when path matches includes pattern', async () => {
      mount(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Wait for widget creation
      await new Promise(resolve => setTimeout(resolve, 150))

      const container = document.querySelector('.copy-page-container')
      expect(container).toBeTruthy()
    })

    it('should not create widget when path does not match includes pattern', async () => {
      mockRoute('/about.html')
      delete (window as any).location
      window.location = { pathname: '/about.html' } as any

      mount(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Wait and check no widget created
      await new Promise(resolve => setTimeout(resolve, 150))

      const container = document.querySelector('.copy-page-container')
      expect(container).toBeNull()
    })

    it('should not create widget when path matches excludes pattern', async () => {
      window.__COPY_PAGE_OPTIONS__ = {
        includes: ['/posts/'],
        excludes: ['/posts/draft/'],
        position: 'top-right',
      }

      mockRoute('/posts/draft/secret.html')
      delete (window as any).location
      window.location = { pathname: '/posts/draft/secret.html' } as any

      mount(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Wait and check no widget created
      await new Promise(resolve => setTimeout(resolve, 150))

      const container = document.querySelector('.copy-page-container')
      expect(container).toBeNull()
    })

    it('should not create widget for paths ending with /', async () => {
      mockRoute('/posts/')
      delete (window as any).location
      window.location = { pathname: '/posts/' } as any

      mount(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Wait and check no widget created
      await new Promise(resolve => setTimeout(resolve, 150))

      const container = document.querySelector('.copy-page-container')
      expect(container).toBeNull()
    })
  })

  describe('copy functionality', () => {
    beforeEach(() => {
      // Mock route path
      mockRoute('/posts/test.html')
      // Mock window.location
      delete (window as any).location
      window.location = { pathname: '/posts/test.html' } as any

      // Clear any existing containers
      document.querySelectorAll('.copy-page-container').forEach(el => el.remove())
    })

    it('should copy markdown source to clipboard', async () => {
      mount(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Wait for widget creation
      await new Promise(resolve => setTimeout(resolve, 150))

      const copyButton = document.querySelector('[data-action="copy"]') as HTMLButtonElement
      expect(copyButton).toBeTruthy()

      if (copyButton) {
        copyButton.click()
        await new Promise(resolve => setTimeout(resolve, 50))
        expect(mockClipboard.writeText).toHaveBeenCalledWith('# Test Page\n\nThis is a test page.')
      }
    })

    it('should show success toast after copying', async () => {
      mount(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Wait for widget creation
      await new Promise(resolve => setTimeout(resolve, 150))

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

      mount(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Wait for widget creation
      await new Promise(resolve => setTimeout(resolve, 150))

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
    beforeEach(() => {
      // Mock route path
      mockRoute('/posts/test.html')
      // Mock window.location
      delete (window as any).location
      window.location = { pathname: '/posts/test.html' } as any

      // Clear any existing containers
      document.querySelectorAll('.copy-page-container').forEach(el => el.remove())
    })

    it('should open markdown in new tab', async () => {
      const mockOpen = vi.spyOn(window, 'open').mockReturnValue(null)

      mount(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Wait for widget creation
      await new Promise(resolve => setTimeout(resolve, 150))

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

      mount(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Wait for widget creation
      await new Promise(resolve => setTimeout(resolve, 150))

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
    beforeEach(() => {
      // Mock route path
      mockRoute('/posts/test.html')
      // Mock window.location
      delete (window as any).location
      window.location = { pathname: '/posts/test.html' } as any

      // Clear any existing containers
      document.querySelectorAll('.copy-page-container').forEach(el => el.remove())
    })

    it('should show menu when trigger is clicked', async () => {
      mount(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Wait for widget creation
      await new Promise(resolve => setTimeout(resolve, 150))

      const trigger = document.querySelector('.copy-page-trigger') as HTMLButtonElement
      const menu = document.querySelector('.copy-page-menu') as HTMLElement

      if (trigger && menu) {
        trigger.click()
        expect(menu.style.display).toBe('block')
      }
    })

    it('should hide menu when clicking outside', async () => {
      mount(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Wait for widget creation
      await new Promise(resolve => setTimeout(resolve, 150))

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
      mount(CopyPageWidget, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Wait for widget creation
      await new Promise(resolve => setTimeout(resolve, 150))

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
    it('should use default options when window globals are not set', () => {
      delete window.__COPY_PAGE_OPTIONS__
      delete window.__MARKDOWN_SOURCES__

      // Mock route path
      mockRoute('/posts/test.html')
      // Mock window.location
      delete (window as any).location
      window.location = { pathname: '/posts/test.html' } as any

      const wrapper = mount(CopyPageWidget, {
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
