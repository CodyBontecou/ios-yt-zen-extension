/*
 * YouTube Zen - Content Script
 * Handles dynamic content hiding for YouTube's SPA architecture
 * with user-configurable settings
 */

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
    ads: true
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
    ],
    recommendations: [
      'ytd-watch-next-secondary-results-renderer',
      '#secondary #secondary-inner',
      'ytm-watch-next-secondary-results-renderer',
    ],
    comments: [
      'ytd-comments',
      '#comments',
      'ytm-comment-section-renderer',
    ],
    homepage: [], // Handled via CSS only due to complexity
    ads: [] // Handled via CSS only
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

  // Load settings from storage
  async function loadSettings() {
    try {
      const result = await browserAPI.storage.local.get('zenSettings');
      return result.zenSettings || DEFAULT_SETTINGS;
    } catch (error) {
      console.error('YouTube Zen: Error loading settings:', error);
      return DEFAULT_SETTINGS;
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

  // Process and hide matching elements based on current settings
  function hideMatchingElements() {
    // Process each category
    Object.keys(SELECTORS).forEach(category => {
      if (!currentSettings[category]) return;

      SELECTORS[category].forEach(selector => {
        document.querySelectorAll(selector).forEach(hideElement);
      });
    });

    // Special handling for Shorts links (hide parent video renderers)
    if (currentSettings.shorts) {
      document.querySelectorAll(SHORTS_LINK_SELECTOR).forEach(el => {
        const videoRenderer = el.closest(VIDEO_RENDERER_PARENTS.join(', '));
        if (videoRenderer) {
          hideElement(videoRenderer);
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

  // Listen for settings changes from popup
  function setupStorageListener() {
    browserAPI.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes.zenSettings) {
        const newSettings = changes.zenSettings.newValue || DEFAULT_SETTINGS;
        currentSettings = newSettings;
        applySettingsClasses(newSettings);

        // Handle video player expansion
        if (newSettings.recommendations) {
          expandVideoPlayer();
        } else {
          resetVideoPlayer();
        }

        // Re-run hiding with new settings
        hideMatchingElements();
      }
    });
  }

  // Initialize
  async function init() {
    // Load settings
    currentSettings = await loadSettings();

    // Apply CSS classes for CSS-based hiding
    applySettingsClasses(currentSettings);

    // Initial hide with JS backup
    hideMatchingElements();

    // Set up observer for dynamic content
    setupObserver();

    // Set up navigation listener
    setupNavigationListener();

    // Listen for settings changes
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

  // Start initialization
  init();
})();
