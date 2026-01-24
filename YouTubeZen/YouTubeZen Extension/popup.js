/*
 * YouTube Zen - Popup Script
 * Manages user preferences for hiding specific YouTube elements
 */

(function() {
  'use strict';

  // Default settings - all enabled by default
  const DEFAULT_SETTINGS = {
    shorts: true,
    recommendations: true,
    comments: true,
    homepage: true,
    ads: true,
    appbanner: true
  };

  // Setting IDs mapped to their toggle elements
  const SETTING_IDS = ['shorts', 'recommendations', 'comments', 'homepage', 'ads', 'appbanner'];

  // Browser API compatibility (Chrome/Safari)
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

  // Create and append save indicator
  function createSaveIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'save-indicator';
    indicator.textContent = 'Saved';
    document.body.appendChild(indicator);
    return indicator;
  }

  // Show save indicator briefly
  function showSaveIndicator(indicator) {
    indicator.classList.add('show');
    setTimeout(() => {
      indicator.classList.remove('show');
    }, 1500);
  }

  // Load settings from storage
  async function loadSettings() {
    console.log('📖 [Popup] loadSettings() called');
    try {
      const result = await browserAPI.storage.local.get('zenSettings');
      console.log('📬 [Popup] Storage result:', result);
      const settings = result.zenSettings || DEFAULT_SETTINGS;
      console.log('✅ [Popup] Returning settings:', settings);
      return settings;
    } catch (error) {
      console.error('❌ [Popup] Error loading settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  // Save settings to storage
  async function saveSettings(settings) {
    console.log('💾 [Popup] saveSettings() called with:', settings);
    try {
      await browserAPI.storage.local.set({ zenSettings: settings });
      console.log('✅ [Popup] Settings saved successfully');
      return true;
    } catch (error) {
      console.error('❌ [Popup] Error saving settings:', error);
      return false;
    }
  }

  // Update toggle UI based on settings
  function updateToggles(settings) {
    SETTING_IDS.forEach(id => {
      const toggle = document.getElementById(`toggle-${id}`);
      const card = document.querySelector(`[data-setting="${id}"]`);

      if (toggle && card) {
        toggle.checked = settings[id];
        card.classList.toggle('disabled', !settings[id]);
      }
    });
  }

  // Handle toggle change
  async function handleToggleChange(id, checked, saveIndicator) {
    // Update card visual state
    const card = document.querySelector(`[data-setting="${id}"]`);
    if (card) {
      card.classList.toggle('disabled', !checked);
    }

    // Load current settings, update, and save
    const settings = await loadSettings();
    settings[id] = checked;

    const saved = await saveSettings(settings);
    if (saved) {
      showSaveIndicator(saveIndicator);
    }
  }

  // Handle refresh button click
  function handleRefresh() {
    const btn = document.getElementById('refresh-btn');
    btn.classList.add('refreshing');

    // Send message to content script to refresh
    browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com')) {
        browserAPI.tabs.reload(tabs[0].id);
      }
    });

    // Remove refreshing state after animation
    setTimeout(() => {
      btn.classList.remove('refreshing');
    }, 800);
  }

  // Make entire card clickable to toggle
  function setupCardClick(card, toggle) {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking directly on toggle
      if (e.target.closest('.toggle')) return;
      toggle.checked = !toggle.checked;
      toggle.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  // Initialize popup
  async function init() {
    console.log('🚀 [Popup] YouTube Zen popup initializing...');
    console.log('🔧 [Popup] Browser API type:', typeof browserAPI);
    console.log('📦 [Popup] Has storage API:', !!(browserAPI && browserAPI.storage));

    // Create save indicator
    const saveIndicator = createSaveIndicator();
    console.log('✅ [Popup] Save indicator created');

    // Load and apply settings
    console.log('📖 [Popup] Loading settings...');
    const settings = await loadSettings();
    console.log('✅ [Popup] Settings loaded:', settings);

    updateToggles(settings);
    console.log('✅ [Popup] Toggles updated');

    // Set up toggle event listeners
    SETTING_IDS.forEach(id => {
      const toggle = document.getElementById(`toggle-${id}`);
      const card = document.querySelector(`[data-setting="${id}"]`);

      if (toggle) {
        toggle.addEventListener('change', (e) => {
          console.log(`🔄 [Popup] Toggle changed: ${id} = ${e.target.checked}`);
          handleToggleChange(id, e.target.checked, saveIndicator);
        });
      }

      if (card && toggle) {
        setupCardClick(card, toggle);
      }
    });

    console.log('✅ [Popup] Event listeners set up');

    // Set up refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        console.log('🔄 [Popup] Refresh button clicked');
        handleRefresh();
      });
    }

    console.log('🎉 [Popup] Popup initialization complete!');
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    console.log('⏳ [Popup] Waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', init);
  } else {
    console.log('✅ [Popup] DOM already loaded, initializing now...');
    init();
  }
})();
