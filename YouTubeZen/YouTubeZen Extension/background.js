/*
 * YouTube Zen - Background Script
 * Handles communication between iOS app and content scripts
 */

(function() {
  'use strict';

  console.log('🎬 [Background] YouTube Zen background script starting...');

  // Browser API compatibility
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
  console.log('🔧 [Background] Browser API type:', typeof browserAPI);
  console.log('🔧 [Background] Has runtime:', !!browserAPI.runtime);
  console.log('🔧 [Background] Has sendNativeMessage:', !!(browserAPI.runtime && browserAPI.runtime.sendNativeMessage));

  // Default settings
  const DEFAULT_SETTINGS = {
    shorts: true,
    recommendations: true,
    comments: true,
    homepage: true,
    ads: true
  };

  console.log('⚙️ [Background] Default settings:', DEFAULT_SETTINGS);

  // Listen for messages from content scripts
  browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📨 [Background] Received message:', message);

    if (message.command === 'getSettingsFromAppGroup') {
      console.log('📖 [Background] Getting settings from App Group...');
      getSettingsFromAppGroup().then(settings => {
        console.log('✅ [Background] Sending settings:', settings);
        sendResponse({ settings: settings });
      }).catch(error => {
        console.error('❌ [Background] Error:', error);
        sendResponse({ settings: DEFAULT_SETTINGS });
      });
      return true;
    }

    console.warn('⚠️ [Background] Unknown command:', message.command);
  });

  console.log('✅ [Background] Message listener registered');

  // Read settings from App Group via SafariWebExtensionHandler
  async function getSettingsFromAppGroup() {
    console.log('🔍 [Background] Reading from App Group...');

    // Try to call the native handler to read from App Group file
    try {
      console.log('📞 [Background] Calling browser.runtime.sendMessage to native handler...');

      // Send empty message to trigger SafariWebExtensionHandler.beginRequest
      const response = await new Promise((resolve, reject) => {
        // For Safari, we need to send a message that gets routed to the native handler
        // This is done via browser.runtime.sendNativeMessage or by triggering the handler
        if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendNativeMessage) {
          browser.runtime.sendNativeMessage('', {}).then(resolve).catch(reject);
        } else {
          // Fallback - the handler might be called automatically on extension events
          resolve(null);
        }
      });

      console.log('📬 [Background] Response from native handler:', response);

      if (response && response.settings) {
        console.log('✅ [Background] Got settings from App Group file:', response.settings);
        // Update browser storage with these settings
        await browserAPI.storage.local.set({ zenSettings: response.settings });
        return response.settings;
      }
    } catch (error) {
      console.error('❌ [Background] Native handler error:', error);
    }

    // Fallback to browser storage
    console.log('🔄 [Background] Falling back to browser storage...');
    try {
      const result = await browserAPI.storage.local.get('zenSettings');
      if (result.zenSettings) {
        console.log('✅ [Background] Found settings in storage:', result.zenSettings);
        return result.zenSettings;
      }
    } catch (error) {
      console.error('❌ [Background] Storage error:', error);
    }

    console.log('⚙️ [Background] Returning defaults');
    return DEFAULT_SETTINGS;
  }

  // Periodically sync settings from App Group to browser storage
  console.log('⏰ [Background] Setting up periodic sync (every 3 seconds)...');
  setInterval(async () => {
    console.log('🔄 [Background] Periodic sync check...');
    try {
      const settings = await getSettingsFromAppGroup();
      console.log('📊 [Background] Current settings:', settings);
    } catch (error) {
      console.error('❌ [Background] Periodic sync error:', error);
    }
  }, 3000);

  console.log('🎉 [Background] YouTube Zen background script loaded!');
})();
