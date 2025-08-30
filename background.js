// Background script (service worker) - runs in the background
console.log('My Extension background script loaded');

// Extension installation/startup
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      extensionEnabled: true,
      highlightColor: '#ffff99'
    });
    
    // Show welcome notification (optional)
    console.log('Welcome to My Extension!');
  }
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getData':
      // Get data from storage
      chrome.storage.sync.get(['extensionEnabled'], (result) => {
        sendResponse({ enabled: result.extensionEnabled || true });
      });
      return true; // Keep message channel open
      
    case 'saveData':
      // Save data to storage
      chrome.storage.sync.set(request.data, () => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'logInfo':
      console.log('Info from content script:', request.info);
      sendResponse({ received: true });
      break;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Page loaded:', tab.url);
    
    // You can perform actions when pages load
    // For example, inject CSS or notify content scripts
  }
});

// Handle extension icon clicks (when no popup is defined)
chrome.action.onClicked.addListener((tab) => {
  // This won't run if popup.html is defined in manifest
  console.log('Extension icon clicked');
});

// Context menu (right-click) functionality
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'myExtensionAction',
    title: 'Process with My Extension',
    contexts: ['selection', 'page']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'myExtensionAction') {
    // Send message to content script
    chrome.tabs.sendMessage(tab.id, {
      action: 'processSelection',
      selectedText: info.selectionText
    });
  }
});