import { vi } from 'vitest'

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
})

// Mock window properties
declare global {
  interface Window {
    __MARKDOWN_SOURCES__?: Record<string, string>
    __COPY_PAGE_OPTIONS__?: {
      includes: string[]
      excludes: string[]
      position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    }
  }
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock URL.createObjectURL and URL.revokeObjectURL for jsdom
global.URL = {
  ...global.URL,
  createObjectURL: vi.fn(() => 'blob:mock-url'),
  revokeObjectURL: vi.fn(),
} as any
