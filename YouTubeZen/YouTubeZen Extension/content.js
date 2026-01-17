/*
 * YouTube Zen - Content Script
 * Handles dynamic content hiding for YouTube's SPA architecture
 */

(function() {
  'use strict';

  // Selectors for elements to hide (backup for CSS)
  const SELECTORS_TO_HIDE = [
    // Shorts
    'ytd-reel-shelf-renderer',
    'ytd-rich-shelf-renderer[is-shorts]',
    'ytm-reel-shelf-renderer',
    'ytm-shorts-lockup-view-model',
    'a[href^="/shorts/"]',

    // Recommendations
    'ytd-watch-next-secondary-results-renderer',
    '#secondary #secondary-inner',
    'ytm-watch-next-secondary-results-renderer',

    // Comments
    'ytd-comments',
    '#comments',
    'ytm-comment-section-renderer',

    // Homepage feed (only on home page)
    // Handled separately based on URL
  ];

  // Homepage-specific selectors
  const HOMEPAGE_SELECTORS = [
    'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer',
    'ytd-browse[page-subtype="home"] ytd-rich-item-renderer',
    'ytm-browse[page-subtype="home"] ytm-rich-grid-renderer',
  ];

  // Hide an element
  function hideElement(el) {
    if (el && el.style.display !== 'none') {
      el.style.setProperty('display', 'none', 'important');
    }
  }

  // Check if we're on the homepage
  function isHomePage() {
    const path = window.location.pathname;
    return path === '/' || path === '/feed/subscriptions' === false && path.startsWith('/feed/');
  }

  // Process and hide matching elements
  function hideMatchingElements() {
    // Hide general elements
    SELECTORS_TO_HIDE.forEach(selector => {
      document.querySelectorAll(selector).forEach(hideElement);
    });

    // Hide homepage-specific elements only on homepage
    if (isHomePage()) {
      HOMEPAGE_SELECTORS.forEach(selector => {
        document.querySelectorAll(selector).forEach(hideElement);
      });
    }

    // Hide Shorts links in video grids
    document.querySelectorAll('a[href^="/shorts/"]').forEach(el => {
      // Find parent video renderer and hide it
      const videoRenderer = el.closest(
        'ytd-grid-video-renderer, ytd-video-renderer, ytd-compact-video-renderer, ' +
        'ytd-rich-item-renderer, ytm-compact-video-renderer, ytm-video-with-context-renderer'
      );
      if (videoRenderer) {
        hideElement(videoRenderer);
      }
    });
  }

  // Expand video player width when sidebar is hidden
  function expandVideoPlayer() {
    const watchFlexy = document.querySelector('ytd-watch-flexy');
    if (watchFlexy) {
      const primary = watchFlexy.querySelector('#primary');
      if (primary) {
        primary.style.setProperty('max-width', '100%', 'important');
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
      expandVideoPlayer();
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
    // Run hiding on navigation
    hideMatchingElements();
    expandVideoPlayer();
  }

  // Listen for YouTube's SPA navigation events
  function setupNavigationListener() {
    // YouTube uses yt-navigate-finish for SPA navigation
    window.addEventListener('yt-navigate-finish', handleNavigation);

    // Fallback: listen for popstate
    window.addEventListener('popstate', handleNavigation);

    // Intercept pushState and replaceState
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

  // Initialize
  function init() {
    // Initial hide
    hideMatchingElements();

    // Set up observer for dynamic content
    setupObserver();

    // Set up navigation listener
    setupNavigationListener();

    // Run again after DOM is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        hideMatchingElements();
        expandVideoPlayer();
      });
    }

    // Run again after page is fully loaded (including images, etc.)
    window.addEventListener('load', () => {
      hideMatchingElements();
      expandVideoPlayer();
    });
  }

  // Start
  init();
})();
