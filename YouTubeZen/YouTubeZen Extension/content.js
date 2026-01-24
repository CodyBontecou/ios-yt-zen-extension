/*
 * YouTube Zen - Content Script
 * Handles dynamic content hiding for YouTube's SPA architecture
 * with user-configurable settings
 */

// IMMEDIATE EXECUTION: Remove Smart App Banner meta tag before anything else
// This must run synchronously at document_start to catch the meta tag before Safari processes it
(function() {
  'use strict';

  // Remove Smart App Banner meta tag
  function removeSmartAppBanner() {
    const meta = document.querySelector('meta[name="apple-itunes-app"]');
    if (meta) {
      meta.remove();
      console.log('YouTube Zen: Removed Smart App Banner meta tag');
    }
  }

  // Remove immediately if present
  removeSmartAppBanner();

  // Also observe for dynamically added tags
  const observer = new MutationObserver(() => {
    removeSmartAppBanner();
  });

  // Start observing as soon as possible
  if (document.documentElement) {
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  } else {
    // If documentElement doesn't exist yet, wait for it
    const checkInterval = setInterval(() => {
      if (document.documentElement) {
        clearInterval(checkInterval);
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true
        });
      }
    }, 10);
  }
})();

(function() {
  'use strict';

  // Browser API compatibility (Chrome/Safari)
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

  // Default settings - all enabled by default
  const DEFAULT_SETTINGS = {
    shorts: true,
    recommendations: true,
    comments: true,
    homepage: true,
    ads: true,
    appbanner: true
  };

  // Current settings cache
  let currentSettings = { ...DEFAULT_SETTINGS };

  // CSS class prefix for body
  const CLASS_PREFIX = 'yt-zen-hide-';

  // Selectors organized by category
  const SELECTORS = {
    shorts: [
      'ytd-reel-shelf-renderer',
      'ytd-rich-shelf-renderer[is-shorts]',
      'ytm-reel-shelf-renderer',
      'ytm-shorts-lockup-view-model',
      '.pivot-bar-item-tab.pivot-shorts',
      '.pivot-bar-item-title.pivot-shorts',
      'ytm-pivot-bar-item-renderer[tab-identifier="FEshorts"]',
      'ytm-pivot-bar-item-renderer[aria-label*="Shorts"]',
      'ytm-pivot-bar-item-renderer[aria-label*="shorts"]',
      'ytm-pivot-bar-renderer a[href*="shorts"]',
      'c3-tab-bar-item a[href*="shorts"]',
      'a[aria-label*="Shorts"][role="tab"]',
      'button[aria-label*="Shorts"]',
    ],
    recommendations: [
      'ytd-watch-next-secondary-results-renderer',
      '#secondary #secondary-inner',
      'ytm-watch-next-secondary-results-renderer',
      'ytm-item-section-renderer[section-identifier="related-items"]',
      'ytm-related-chip-cloud-renderer',
    ],
    comments: [
      'ytd-comments',
      '#comments',
      'ytm-comment-section-renderer',
      'yt-video-metadata-carousel-view-model',
      'comments-entry-point-teaser-view-model',
      'yt-comment-teaser-carousel-item-view-model',
      'yt-carousel-title-view-model',
    ],
    homepage: [
      '.pivot-bar-item-tab.pivot-w2w',
      '.pivot-bar-item-title.pivot-w2w',
    ],
    ads: [], // Handled via CSS only
    appbanner: [
      'ytm-promoted-service-drawer-renderer',
      'ytm-mealbar-promo-renderer',
      'ytm-app-promo-renderer',
      'ytm-promoted-video-renderer',
      '.app-banner',
      '.promo-drawer',
      '.mealbar-popup',
      '[role="dialog"][aria-label*="app"]',
      '[role="dialog"][aria-label*="App"]',
      'ytm-single-action-watch-card-renderer',
      'ytm-bottom-sheet-renderer',
      'div[class*="app-banner"]',
      'div[class*="app-promo"]',
      'div[class*="install-banner"]'
    ]
  };

  // Shorts link selectors (need special handling to hide parent)
  const SHORTS_LINK_SELECTOR = 'a[href^="/shorts/"]';
  const VIDEO_RENDERER_PARENTS = [
    'ytd-grid-video-renderer',
    'ytd-video-renderer',
    'ytd-compact-video-renderer',
    'ytd-rich-item-renderer',
    'ytm-compact-video-renderer',
    'ytm-video-with-context-renderer'
  ];

  // Bottom navigation Shorts selectors (need parent hiding)
  const BOTTOM_NAV_SHORTS_SELECTOR = 'a[href*="shorts"]';
  const BOTTOM_NAV_PARENTS = [
    'ytm-pivot-bar-item-renderer',
    'c3-tab-bar-item',
    '[role="tab"]',
    'ytm-pivot-bar-renderer > *'
  ];

  // Load settings from browser storage
  async function loadSettings() {
    try {
      const result = await browserAPI.storage.local.get('zenSettings');
      if (result.zenSettings) {
        return result.zenSettings;
      }
    } catch (error) {
      console.error('YouTube Zen: Error loading settings:', error);
    }

    // Fallback to defaults
    await browserAPI.storage.local.set({ zenSettings: DEFAULT_SETTINGS });
    return DEFAULT_SETTINGS;
  }

  // Save settings to browser storage
  async function saveSettings(settings) {
    try {
      await browserAPI.storage.local.set({ zenSettings: settings });
    } catch (error) {
      console.error('YouTube Zen: Error saving settings:', error);
    }
  }

  // Apply CSS classes to body based on settings
  function applySettingsClasses(settings) {
    const body = document.body || document.documentElement;

    Object.keys(settings).forEach(key => {
      const className = CLASS_PREFIX + key;
      if (settings[key]) {
        body.classList.add(className);
      } else {
        body.classList.remove(className);
      }
    });
  }

  // Hide an element
  function hideElement(el) {
    if (el && el.style.display !== 'none') {
      el.style.setProperty('display', 'none', 'important');
    }
  }

  // Show an element (remove inline hide)
  function showElement(el) {
    if (el && el.style.display === 'none') {
      el.style.removeProperty('display');
    }
  }

  // Check if we're on the homepage
  function isHomePage() {
    const path = window.location.pathname;
    return path === '/' || (path.startsWith('/feed/') && path !== '/feed/subscriptions');
  }

  // Redirect from homepage to subscriptions feed if homepage hiding is enabled
  function redirectToSubscriptions() {
    if (currentSettings.homepage && isHomePage()) {
      const isMobile = window.location.hostname.includes('m.youtube.com');
      const subscriptionsUrl = isMobile ? '/feed/subscriptions' : '/feed/subscriptions';

      // Only redirect if we're actually on the main homepage
      if (window.location.pathname === '/' || window.location.pathname === '') {
        window.location.replace(subscriptionsUrl);
      }
    }
  }

  // Process and hide matching elements based on current settings
  function hideMatchingElements() {
    // Process each category
    Object.keys(SELECTORS).forEach(category => {
      if (!currentSettings[category]) return;

      SELECTORS[category].forEach(selector => {
        document.querySelectorAll(selector).forEach(hideElement);
      });
    });

    // Special handling for app banners - text-based detection
    if (currentSettings.appbanner) {
      // Find elements containing "Open in the YouTube app" or similar text
      const textPatterns = [
        /open in.*app/i,
        /get.*youtube.*app/i,
        /download.*app/i,
        /continue in app/i,
        /view in app/i
      ];

      // Check all divs and common container elements
      document.querySelectorAll('div, aside, section, [role="dialog"], [role="alertdialog"]').forEach(el => {
        const text = el.textContent || '';
        const hasAppText = textPatterns.some(pattern => pattern.test(text));

        if (hasAppText) {
          // Check if this is a small banner/promo (not the whole page)
          const rect = el.getBoundingClientRect();
          if (rect.height < window.innerHeight * 0.5 && rect.width > 0) {
            // Additional check: does it contain app store links?
            const hasAppLink = el.querySelector('a[href*="apps.apple.com"], a[href*="play.google.com"], a[href*="itunes.apple"]');
            if (hasAppLink || el.closest('[class*="banner"], [class*="promo"], [class*="drawer"]')) {
              hideElement(el);
            }
          }
        }
      });
    }

    // Text-based detection for comments
    if (currentSettings.comments) {
      document.querySelectorAll('yt-carousel-title-view-model').forEach(el => {
        const titleText = el.textContent || '';
        if (titleText.includes('Comments') || titleText.includes('comments')) {
          // Hide the entire carousel container
          const carousel = el.closest('yt-video-metadata-carousel-view-model');
          if (carousel) {
            hideElement(carousel);
          }
        }
      });
    }

    // Special handling for Shorts links (hide parent video renderers)
    if (currentSettings.shorts) {
      document.querySelectorAll(SHORTS_LINK_SELECTOR).forEach(el => {
        const videoRenderer = el.closest(VIDEO_RENDERER_PARENTS.join(', '));
        if (videoRenderer) {
          hideElement(videoRenderer);
        }
      });

      // Special handling for bottom navigation Shorts button
      document.querySelectorAll(BOTTOM_NAV_SHORTS_SELECTOR).forEach(el => {
        // Check if this is in the bottom navigation bar
        const navParent = el.closest('ytm-pivot-bar-renderer, c3-tab-bar');
        if (navParent) {
          const navItem = el.closest(BOTTOM_NAV_PARENTS.join(', '));
          if (navItem) {
            hideElement(navItem);
          }
        }
      });

      // Hide ytm-pivot-bar-item-renderer that contains pivot-shorts
      document.querySelectorAll('.pivot-shorts').forEach(el => {
        const pivotItem = el.closest('ytm-pivot-bar-item-renderer');
        if (pivotItem) {
          hideElement(pivotItem);
        }
      });

      // Additional check: Find any pivot bar item with "Shorts" text
      document.querySelectorAll('ytm-pivot-bar-item-renderer').forEach(item => {
        const text = item.textContent || '';
        if (text.trim() === 'Shorts' || text.includes('Shorts')) {
          hideElement(item);
        }
      });
    }

    // Special handling for Home button (hide parent container)
    if (currentSettings.homepage) {
      document.querySelectorAll('.pivot-w2w').forEach(el => {
        const pivotItem = el.closest('ytm-pivot-bar-item-renderer');
        if (pivotItem) {
          hideElement(pivotItem);
        }
      });

      // Additional check: Find any pivot bar item with "Home" text
      document.querySelectorAll('ytm-pivot-bar-item-renderer').forEach(item => {
        const text = item.textContent || '';
        if (text.trim() === 'Home') {
          hideElement(item);
        }
      });
    }
  }

  // Expand video player width when sidebar is hidden
  function expandVideoPlayer() {
    if (!currentSettings.recommendations) return;

    const watchFlexy = document.querySelector('ytd-watch-flexy');
    if (watchFlexy) {
      const primary = watchFlexy.querySelector('#primary');
      if (primary) {
        primary.style.setProperty('max-width', '100%', 'important');
      }
    }
  }

  // Reset video player width
  function resetVideoPlayer() {
    const watchFlexy = document.querySelector('ytd-watch-flexy');
    if (watchFlexy) {
      const primary = watchFlexy.querySelector('#primary');
      if (primary) {
        primary.style.removeProperty('max-width');
      }
    }
  }

  // MutationObserver callback
  function handleMutations(mutations) {
    let shouldProcess = false;

    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        shouldProcess = true;
        break;
      }
    }

    if (shouldProcess) {
      hideMatchingElements();
      if (currentSettings.recommendations) {
        expandVideoPlayer();
      }
    }
  }

  // Set up MutationObserver
  function setupObserver() {
    const observer = new MutationObserver(handleMutations);

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    return observer;
  }

  // Handle YouTube SPA navigation
  function handleNavigation() {
    redirectToSubscriptions();
    hideMatchingElements();
    if (currentSettings.recommendations) {
      expandVideoPlayer();
    }
  }

  // Listen for YouTube's SPA navigation events
  function setupNavigationListener() {
    window.addEventListener('yt-navigate-finish', handleNavigation);
    window.addEventListener('popstate', handleNavigation);

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      setTimeout(handleNavigation, 100);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      setTimeout(handleNavigation, 100);
    };
  }

  // Listen for storage changes
  function setupStorageListener() {
    // Listen for storage changes (from popup or other tabs)
    if (browserAPI.storage && browserAPI.storage.onChanged) {
      browserAPI.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes.zenSettings) {
          const newSettings = changes.zenSettings.newValue || DEFAULT_SETTINGS;

          currentSettings = newSettings;
          applySettingsClasses(newSettings);

          if (newSettings.recommendations) {
            expandVideoPlayer();
          } else {
            resetVideoPlayer();
          }

          hideMatchingElements();
        }
      });
    }
  }

  // Remove iOS Smart App Banner meta tag
  function removeSmartAppBanner() {
    // Remove the meta tag that triggers the iOS Smart App Banner
    const metaTags = document.querySelectorAll('meta[name="apple-itunes-app"]');
    metaTags.forEach(tag => {
      console.log('YouTube Zen: Removing Smart App Banner meta tag');
      tag.remove();
    });

    // Also check for and remove any other app banner meta tags
    const appBannerMetas = document.querySelectorAll('meta[name*="app-id"], meta[name*="app-argument"]');
    appBannerMetas.forEach(tag => tag.remove());
  }

  // Set up observer to remove Smart App Banner meta tags as they're added
  function setupSmartAppBannerRemoval() {
    // Initial removal
    removeSmartAppBanner();

    // Watch for meta tags being added to the head
    const headObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeName === 'META') {
            const name = node.getAttribute('name');
            if (name === 'apple-itunes-app' || name?.includes('app-id') || name?.includes('app-argument')) {
              console.log('YouTube Zen: Blocked Smart App Banner meta tag from being added');
              node.remove();
            }
          }
        }
      }
    });

    // Start observing the head (or document if head doesn't exist yet)
    const targetNode = document.head || document.documentElement;
    headObserver.observe(targetNode, {
      childList: true,
      subtree: true
    });

    return headObserver;
  }

  // Initialize
  async function init() {
    // Load settings
    currentSettings = await loadSettings();

    // Set up Smart App Banner removal (only if enabled)
    if (currentSettings.appbanner) {
      setupSmartAppBannerRemoval();
    }

    // Apply CSS classes for CSS-based hiding
    applySettingsClasses(currentSettings);

    // Redirect to subscriptions if on homepage and homepage hiding is enabled
    redirectToSubscriptions();

    // Initial hide with JS backup
    hideMatchingElements();

    // Set up observer for dynamic content
    setupObserver();

    // Set up navigation listener
    setupNavigationListener();

    // Set up storage listener to detect changes
    setupStorageListener();

    // Run again after DOM is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        applySettingsClasses(currentSettings);
        hideMatchingElements();
        if (currentSettings.recommendations) {
          expandVideoPlayer();
        }
      });
    }

    // Run again after page is fully loaded
    window.addEventListener('load', () => {
      hideMatchingElements();
      if (currentSettings.recommendations) {
        expandVideoPlayer();
      }
    });
  }

  // Remove Smart App Banner immediately (before settings load)
  // This runs synchronously at document_start to catch the meta tag early
  (function removeSmartAppBannerEarly() {
    const metaTags = document.querySelectorAll('meta[name="apple-itunes-app"]');
    if (metaTags.length > 0) {
      console.log('YouTube Zen: Early removal of Smart App Banner');
      metaTags.forEach(tag => tag.remove());
    }
  })();

  // Start initialization
  init();
})();
