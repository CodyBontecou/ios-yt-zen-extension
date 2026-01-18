/*
 * Settings Sync Helper
 * This script runs to sync settings from App Group to browser storage
 */

(function() {
  'use strict';

  console.log('🔄 [Sync] Settings sync helper loaded');

  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

  // Listen for messages from SafariWebExtensionHandler
  if (browserAPI && browserAPI.runtime && browserAPI.runtime.onMessage) {
    browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('📨 [Sync] Received message:', message);

      if (message.command === 'syncSettings' && message.settings) {
        console.log('💾 [Sync] Syncing settings to storage:', message.settings);

        browserAPI.storage.local.set({ zenSettings: message.settings }).then(() => {
          console.log('✅ [Sync] Settings synced successfully');
          sendResponse({ status: 'ok' });
        }).catch(error => {
          console.error('❌ [Sync] Error syncing settings:', error);
          sendResponse({ error: error.message });
        });

        return true; // Keep channel open for async response
      }
    });
  }

  console.log('✅ [Sync] Sync helper ready');
})();
