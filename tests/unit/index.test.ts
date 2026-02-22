import { describe, it, expect } from 'vitest'
import type { PluginObject } from 'vuepress'

describe('copyPagePlugin', () => {
  describe('plugin factory function', () => {
    it('should create plugin with default name', async () => {
      const { copyPagePlugin } = await import('../../src/index.js')
      const plugin = copyPagePlugin() as PluginObject
      expect(plugin.name).toBe('vuepress-plugin-copy-page')
    })

    it('should create plugin with custom options', async () => {
      const { copyPagePlugin } = await import('../../src/index.js')
      const plugin = copyPagePlugin({
        includes: ['/guide/', '/api/'],
        excludes: ['/draft/'],
        position: 'top-left',
      }) as PluginObject
      expect(plugin.name).toBe('vuepress-plugin-copy-page')
      expect(plugin.extendsPage).toBeDefined()
      expect(plugin.clientConfigFile).toBeDefined()
    })

    it('should have extendsPage hook', async () => {
      const { copyPagePlugin } = await import('../../src/index.js')
      const plugin = copyPagePlugin() as PluginObject
      expect(typeof plugin.extendsPage).toBe('function')
    })

    it('should have clientConfigFile hook', async () => {
      const { copyPagePlugin } = await import('../../src/index.js')
      const plugin = copyPagePlugin() as PluginObject
      expect(typeof plugin.clientConfigFile).toBe('function')
    })
  })

  describe('CopyPageOptions type', () => {
    it('should accept all optional properties', async () => {
      const { copyPagePlugin } = await import('../../src/index.js')

      // All options provided
      const plugin1 = copyPagePlugin({
        includes: ['/posts/'],
        excludes: ['/draft/'],
        position: 'top-right',
      }) as PluginObject
      expect(plugin1.name).toBe('vuepress-plugin-copy-page')

      // No options
      const plugin2 = copyPagePlugin({}) as PluginObject
      expect(plugin2.name).toBe('vuepress-plugin-copy-page')

      // Partial options
      const plugin3 = copyPagePlugin({ includes: ['/docs/'] }) as PluginObject
      expect(plugin3.name).toBe('vuepress-plugin-copy-page')
    })

    it('should accept all position values', async () => {
      const { copyPagePlugin } = await import('../../src/index.js')

      const positions: Array<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'> = [
        'top-right',
        'top-left',
        'bottom-right',
        'bottom-left',
      ]

      for (const position of positions) {
        const plugin = copyPagePlugin({ position }) as PluginObject
        expect(plugin.name).toBe('vuepress-plugin-copy-page')
      }
    })
  })

  describe('plugin hooks', () => {
    it('extendsPage should be defined', async () => {
      const { copyPagePlugin } = await import('../../src/index.js')
      const plugin = copyPagePlugin() as PluginObject

      // Should have extendsPage hook defined
      expect(plugin.extendsPage).toBeDefined()
      expect(typeof plugin.extendsPage).toBe('function')
    })
  })
})
