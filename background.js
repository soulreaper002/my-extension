// Holiday Reminder Background Script
console.log('Holiday Reminder: Background script loaded');

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Holiday Reminder installed:', details.reason);
  
  if (details.reason === 'install') {
    // Set default country to US
    chrome.storage.sync.set({
      selectedCountry: 'US'
    });
    
    console.log('Holiday Reminder: Default settings saved');
  }
});

// Handle tab updates - check if user visits timesheet.com
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only act when page is completely loaded
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if it's timesheet.com
    if (tab.url.includes('timesheet.com')) {
      console.log('Holiday Reminder: User visited timesheet.com');
      
      // Optional: Show browser notification
      try {
        await chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon-48.png', // Make sure this exists
          title: '🗓️ Holiday Reminder',
          message: 'Checking for holidays this week...',
          priority: 1
        });
        
        // Clear notification after 3 seconds
        setTimeout(() => {
          chrome.notifications.clear('holiday-notification');
        }, 3000);
        
      } catch (error) {
        console.log('Notification permission not granted or icon missing');
      }
      
      // The content script will handle showing the banner
      // We could also inject the content script here if needed
    }
  }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getHolidays':
      // Content script can request holidays through background
      fetchHolidays(request.country, request.year)
        .then(holidays => sendResponse({ holidays }))
        .catch(error => sendResponse({ error: error.message }));
      return true; // Keep message channel open
      
    case 'logHolidayView':
      console.log('Holiday banner shown:', request.data);
      sendResponse({ logged: true });
      break;
      
    case 'saveSettings':
      chrome.storage.sync.set(request.settings, () => {
        sendResponse({ saved: true });
      });
      return true;
      
    case 'getSettings':
      chrome.storage.sync.get(request.keys || null, (result) => {
        sendResponse(result);
      });
      return true;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Fetch holidays function (can be used by content script)
async function fetchHolidays(country, year) {
  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching holidays:', error);
    throw error;
  }
}

// Periodic cleanup of old storage entries (optional)
chrome.alarms?.create?.('cleanupStorage', { periodInMinutes: 60 * 24 }); // Daily

chrome.alarms?.onAlarm?.addListener((alarm) => {
  if (alarm.name === 'cleanupStorage') {
    cleanupOldStorageEntries();
  }
});

async function cleanupOldStorageEntries() {
  try {
    const items = await chrome.storage.local.get(null);
    const today = new Date().toDateString();
    
    // Remove old "holiday_shown_" entries
    const keysToRemove = [];
    Object.keys(items).forEach(key => {
      if (key.startsWith('holiday_shown_') && !key.includes(today)) {
        keysToRemove.push(key);
      }
    });
    
    if (keysToRemove.length > 0) {
      await chrome.storage.local.remove(keysToRemove);
      console.log(`Cleaned up ${keysToRemove.length} old storage entries`);
    }
  } catch (error) {
    console.error('Error cleaning up storage:', error);
  }
}