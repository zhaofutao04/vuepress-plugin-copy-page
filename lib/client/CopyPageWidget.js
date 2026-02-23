import { defineComponent, ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { builtinI18n, DEFAULT_URL_PREFIX } from '../types.js';
const defaultOptions = {
    includes: ['/posts/'],
    excludes: [],
    position: 'top-right',
    styleMode: 'simple',
};
// SVG Icons as strings - cleaner, more modern icons
const copyIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
const checkIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
const markdownIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="22" height="18" rx="2"></rect><path d="M5 17V7l3.5 4L12 7v10"></path><path d="M19 7l-5 5 5 5"></path></svg>`;
export const CopyPageWidget = defineComponent({
    name: 'CopyPageWidget',
    setup() {
        const route = useRoute();
        const mounted = ref(false);
        const pagePath = ref('');
        const pageTitle = ref('');
        let widgetEl = null;
        const options = computed(() => {
            if (typeof window !== 'undefined') {
                return window.__COPY_PAGE_OPTIONS__ || defaultOptions;
            }
            return defaultOptions;
        });
        const markdownSource = computed(() => {
            if (typeof window !== 'undefined' && window.__MARKDOWN_SOURCES__) {
                return window.__MARKDOWN_SOURCES__[pagePath.value] || '';
            }
            return '';
        });
        const shouldShow = computed(() => {
            if (!mounted.value || !pagePath.value)
                return false;
            const path = pagePath.value;
            for (const exclude of options.value.excludes) {
                if (path.startsWith(exclude))
                    return false;
            }
            for (const include of options.value.includes) {
                if (path.startsWith(include) && !path.endsWith('/'))
                    return true;
            }
            return false;
        });
        /**
         * Get translated string for a given key
         * Priority: user i18n > builtin i18n > default English
         */
        const t = (key) => {
            const locale = document.documentElement.lang || 'en-US';
            // User's i18n overrides builtin
            const userI18n = options.value.i18n?.[locale];
            const fallback = builtinI18n['en-US'];
            const builtin = builtinI18n[locale] ?? fallback;
            return userI18n?.[key] || builtin[key] || fallback[key] || '';
        };
        /**
         * Get page title from DOM or fallback
         */
        const getPageTitle = () => {
            if (pageTitle.value)
                return pageTitle.value;
            const h1 = document.querySelector('.vp-page-title h1, main h1, .vp-page-content h1, article h1');
            return h1?.textContent?.trim() || '';
        };
        /**
         * Build copy metadata for templates
         */
        const buildCopyMeta = () => {
            const urlPrefix = options.value.urlPrefix || DEFAULT_URL_PREFIX;
            const path = pagePath.value;
            return {
                path,
                url: `${urlPrefix}${path}`,
                title: getPageTitle(),
                timestamp: new Date().toISOString(),
            };
        };
        /**
         * Apply copy template to content
         */
        const applyTemplate = (content, meta) => {
            const template = options.value.copyTemplate;
            if (typeof template === 'function') {
                return template(content, meta);
            }
            switch (template) {
                case 'withUrl':
                    return `Source: ${meta.url}\n\n${content}`;
                case 'withTimestamp':
                    return `Copied at: ${meta.timestamp}\n\n${content}`;
                case 'full':
                    return `# ${meta.title}\n\nSource: ${meta.url}\nCopied at: ${meta.timestamp}\n\n---\n\n${content}`;
                default:
                    return content;
            }
        };
        const showToast = (message, isError = false) => {
            const existingToast = document.querySelector('.copy-page-toast');
            if (existingToast)
                existingToast.remove();
            const toast = document.createElement('div');
            toast.className = `copy-page-toast ${isError ? 'error' : ''}`;
            toast.textContent = message;
            document.body.appendChild(toast);
            requestAnimationFrame(() => toast.classList.add('show'));
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        };
        const copyAsMarkdown = async () => {
            try {
                let content = '';
                if (markdownSource.value) {
                    content = markdownSource.value;
                }
                else {
                    const contentEl = document.querySelector('.theme-default-content') ||
                        document.querySelector('.vp-doc') ||
                        document.querySelector('article');
                    if (contentEl) {
                        content = contentEl.textContent?.trim() || '';
                    }
                }
                // Apply template if content exists
                if (content) {
                    const meta = buildCopyMeta();
                    content = applyTemplate(content, meta);
                }
                await navigator.clipboard.writeText(content);
                showToast(t('copiedToClipboard'));
                updateButtonState(true);
                setTimeout(() => updateButtonState(false), 2000);
            }
            catch (err) {
                console.error('Copy failed:', err);
                showToast(t('copyFailed'), true);
            }
        };
        const viewAsMarkdown = () => {
            if (markdownSource.value) {
                let content = markdownSource.value;
                const meta = buildCopyMeta();
                content = applyTemplate(content, meta);
                const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            }
        };
        const updateButtonState = (copied) => {
            if (!widgetEl)
                return;
            const trigger = widgetEl.querySelector('.copy-page-trigger');
            const icon = widgetEl.querySelector('.copy-page-icon');
            const label = widgetEl.querySelector('.copy-page-label');
            if (copied) {
                trigger?.classList.add('copied');
                if (icon)
                    icon.innerHTML = checkIconSvg;
                if (label)
                    label.textContent = t('copied');
            }
            else {
                trigger?.classList.remove('copied');
                if (icon)
                    icon.innerHTML = copyIconSvg;
                if (label)
                    label.textContent = t('copyPage');
            }
        };
        const createWidget = () => {
            // Find h1 title (support multiple themes)
            const h1 = document.querySelector('.vp-page-title h1, main h1, .vp-page-content h1, article h1');
            if (!h1)
                return null;
            // Update page title from h1
            pageTitle.value = h1.textContent?.trim() || '';
            // Remove existing widget
            const existing = document.querySelector('.copy-page-container');
            if (existing)
                existing.remove();
            // Create container
            const container = document.createElement('div');
            container.className = 'copy-page-container';
            // Get style mode class
            const styleModeClass = options.value.styleMode === 'rich' ? 'rich' : '';
            // Get translated strings
            const copyPageText = t('copyPage');
            const copyAsMarkdownText = t('copyAsMarkdown');
            const viewAsMarkdownText = t('viewAsMarkdown');
            const viewAsMarkdownDescText = t('viewAsMarkdownDesc');
            // Create widget HTML
            container.innerHTML = `
        <div class="copy-page-widget ${styleModeClass}">
          <button class="copy-page-trigger" title="Copy page options">
            <span class="copy-page-icon">${copyIconSvg}</span>
            <span class="copy-page-label">${copyPageText}</span>
          </button>
          <div class="copy-page-menu" style="display: none;">
            <button class="copy-page-menu-item" data-action="copy">
              <span class="menu-item-icon">${copyIconSvg}</span>
              <span class="menu-item-text">
                <span class="menu-item-title">${copyPageText}</span>
                <span class="menu-item-desc">${copyAsMarkdownText}</span>
              </span>
            </button>
            <button class="copy-page-menu-item" data-action="view">
              <span class="menu-item-icon">${markdownIconSvg}</span>
              <span class="menu-item-text">
                <span class="menu-item-title">${viewAsMarkdownText}</span>
                <span class="menu-item-desc">${viewAsMarkdownDescText}</span>
              </span>
            </button>
          </div>
        </div>
      `;
            // Insert after h1
            h1.after(container);
            widgetEl = container;
            // Setup event listeners
            const trigger = container.querySelector('.copy-page-trigger');
            const menu = container.querySelector('.copy-page-menu');
            trigger?.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = menu.style.display !== 'none';
                menu.style.display = isVisible ? 'none' : 'block';
            });
            container.querySelector('[data-action="copy"]')?.addEventListener('click', async () => {
                menu.style.display = 'none';
                try {
                    await copyAsMarkdown();
                }
                catch (err) {
                    console.error('Copy page error:', err);
                }
            });
            container.querySelector('[data-action="view"]')?.addEventListener('click', () => {
                menu.style.display = 'none';
                viewAsMarkdown();
            });
            // Click outside to close
            document.addEventListener('click', () => {
                menu.style.display = 'none';
            });
            // ESC to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    menu.style.display = 'none';
                }
            });
            return container;
        };
        const updatePagePath = () => {
            pagePath.value = window.location.pathname;
        };
        // Watch for route changes (handles Vue Router navigation)
        watch(() => route.path, async (newPath) => {
            pagePath.value = newPath;
            // Remove existing widget first
            widgetEl?.remove();
            widgetEl = null;
            if (shouldShow.value) {
                // Wait for DOM to update after navigation
                await nextTick();
                // Use longer delay for Vue Router navigation to ensure DOM is ready
                setTimeout(() => createWidget(), 300);
            }
        });
        // Also watch shouldShow to react to path changes
        watch(shouldShow, async (show) => {
            if (show && mounted.value) {
                await nextTick();
                setTimeout(() => createWidget(), 300);
            }
            else {
                widgetEl?.remove();
                widgetEl = null;
            }
        });
        onMounted(() => {
            mounted.value = true;
            updatePagePath();
            if (shouldShow.value) {
                // Wait for DOM to be ready
                setTimeout(() => {
                    createWidget();
                }, 200);
            }
        });
        onUnmounted(() => {
            widgetEl?.remove();
        });
        return () => null; // Render nothing, widget is inserted via DOM
    },
});
export default CopyPageWidget;
