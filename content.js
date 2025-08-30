// Holiday Reminder Content Script - India Only
console.log('🇮🇳 Holiday Reminder: Content script loaded on timesheet.com');

// Show holiday notification immediately when page loads
let hasShownToday = false;

// Create and show holiday notification
async function showHolidayNotification() {
  console.log('🔄 Checking for Indian holidays...');
  
  // Prevent showing multiple times per session
  if (hasShownToday) {
    console.log('Already shown today, skipping...');
    return;
  }
  
  try {
    // Get today's date key for storage
    const today = new Date().toDateString();
    const storageKey = `holiday_shown_${today}`;
    
    // Check if we've already shown today
    const result = await chrome.storage.local.get([storageKey]);
    if (result[storageKey]) {
      console.log('Holiday notification already shown today');
      return;
    }
    
    // Get holidays for this week (India only)
    const holidays = await getIndianWeekHolidays();
    console.log('Found holidays:', holidays);
    
    if (holidays.length > 0) {
      createHolidayBanner(holidays);
      
      // Mark as shown for today
      await chrome.storage.local.set({ [storageKey]: true });
      hasShownToday = true;
    } else {
      console.log('No holidays this week');
      // Still show a small notification that we checked
      createNoHolidaysBanner();
    }
    
  } catch (error) {
    console.error('Error showing holiday notification:', error);
    // Show error banner
    createErrorBanner();
  }
}

// Fetch holidays for current week (India only)
async function getIndianWeekHolidays() {
  console.log('🔄 Getting Indian holidays...');
  
  try {
    const year = new Date().getFullYear();
    
    // Start with reliable fallback data
    let allHolidays = getIndianHolidaysFallback(year);
    console.log('✅ Fallback data loaded:', allHolidays.length, 'holidays');
    
    // Try to enhance with API data (but don't depend on it)
    try {
      console.log('🌐 Attempting API enhancement...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/IN`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const text = await response.text();
        if (text && text.trim() && text !== 'null' && !text.includes('error')) {
          const apiHolidays = JSON.parse(text);
          if (Array.isArray(apiHolidays) && apiHolidays.length > 0) {
            allHolidays = apiHolidays;
            console.log('✅ API enhancement successful:', apiHolidays.length, 'holidays');
          }
        }
      }
    } catch (apiError) {
      console.log('⚠️ API enhancement failed, using fallback:', apiError.message);
    }
    
    // Filter for current week
    const { weekStart, weekEnd } = getCurrentWeekDates();
    const weekHolidays = allHolidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate >= weekStart && holidayDate <= weekEnd;
    });
    
    console.log('Week holidays:', weekHolidays);
    return weekHolidays;
    
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return [];
  }
}

// Get current week date range
function getCurrentWeekDates() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  // Start of week (Monday)
  const weekStart = new Date(today);
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  weekStart.setDate(today.getDate() - daysToMonday);
  weekStart.setHours(0, 0, 0, 0);
  
  // End of week (Sunday)  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  console.log('Week range:', weekStart.toDateString(), 'to', weekEnd.toDateString());
  return { weekStart, weekEnd };
}

// Create holiday banner on the page
function createHolidayBanner(holidays) {
  console.log('🎉 Creating holiday banner with', holidays.length, 'holidays');
  
  // Remove existing banner if any
  removeExistingBanner();
  
  // Add styles if not already added
  addBannerStyles();
  
  // Create banner element
  const banner = document.createElement('div');
  banner.id = 'holiday-reminder-banner';
  banner.className = 'holiday-banner';
  
  // Create banner content
  const holidaysList = holidays.map(holiday => {
    const date = new Date(holiday.date);
    const dayName = date.toLocaleDateString('en-IN', { weekday: 'long' });
    const dateStr = date.toLocaleDateString('en-IN', { 
      month: 'long', 
      day: 'numeric' 
    });
    
    return `
      <div class="holiday-item">
        <div class="holiday-name">${holiday.name || holiday.localName}</div>
        <div class="holiday-date">${dayName}, ${dateStr}</div>
      </div>
    `;
  }).join('');
  
  banner.innerHTML = `
    <div class="banner-header">
      <div class="banner-title">
        <span class="flag">🇮🇳</span>
        <div>
          <h3>Holiday Alert!</h3>
          <p>${holidays.length} holiday${holidays.length > 1 ? 's' : ''} this week</p>
        </div>
      </div>
      <button class="close-btn" id="close-holiday-banner">×</button>
    </div>
    <div class="holidays-list">${holidaysList}</div>
    <div class="banner-footer">
      <small>🗓️ Holiday Reminder Extension</small>
    </div>
  `;
  
  // Add banner to page
  document.body.appendChild(banner);
  
  // Add event listeners
  setupBannerEvents(banner);
  
  console.log('✅ Holiday banner created successfully');
}

// Create "no holidays" banner
function createNoHolidaysBanner() {
  removeExistingBanner();
  addBannerStyles();
  
  const banner = document.createElement('div');
  banner.id = 'holiday-reminder-banner';
  banner.className = 'holiday-banner no-holidays-banner';
  
  banner.innerHTML = `
    <div class="banner-header">
      <div class="banner-title">
        <span class="flag">🇮🇳</span>
        <div>
          <h3>No Holidays This Week</h3>
          <p>Perfect time for productivity!</p>
        </div>
      </div>
      <button class="close-btn" id="close-holiday-banner">×</button>
    </div>
    <div class="banner-footer">
      <small>🗓️ Holiday Reminder Extension</small>
    </div>
  `;
  
  document.body.appendChild(banner);
  setupBannerEvents(banner);
  
  // Auto close after 5 seconds
  setTimeout(() => {
    if (banner.parentNode) {
      banner.classList.add('fade-out');
      setTimeout(() => banner.remove(), 300);
    }
  }, 5000);
}

// Create error banner
function createErrorBanner() {
  removeExistingBanner();
  addBannerStyles();
  
  const banner = document.createElement('div');
  banner.id = 'holiday-reminder-banner';
  banner.className = 'holiday-banner error-banner';
  
  banner.innerHTML = `
    <div class="banner-header">
      <div class="banner-title">
        <span class="flag">⚠️</span>
        <div>
          <h3>Could not load holidays</h3>
          <p>Check your internet connection</p>
        </div>
      </div>
      <button class="close-btn" id="close-holiday-banner">×</button>
    </div>
  `;
  
  document.body.appendChild(banner);
  setupBannerEvents(banner);
  
  // Auto close after 3 seconds
  setTimeout(() => {
    if (banner.parentNode) {
      banner.classList.add('fade-out');
      setTimeout(() => banner.remove(), 300);
    }
  }, 3000);
}

// Setup banner event listeners
function setupBannerEvents(banner) {
  const closeBtn = banner.querySelector('#close-holiday-banner');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      banner.classList.add('fade-out');
      setTimeout(() => banner.remove(), 300);
    });
  }
  
  // Auto-close after 15 seconds for holiday banners
  if (!banner.classList.contains('no-holidays-banner') && !banner.classList.contains('error-banner')) {
    setTimeout(() => {
      if (banner.parentNode) {
        banner.classList.add('fade-out');
        setTimeout(() => banner.remove(), 300);
      }
    }, 15000);
  }
}

// Remove existing banner
function removeExistingBanner() {
  const existingBanner = document.getElementById('holiday-reminder-banner');
  if (existingBanner) {
    existingBanner.remove();
  }
}

// Add CSS styles for banner
function addBannerStyles() {
  if (!document.getElementById('holiday-reminder-styles')) {
    const style = document.createElement('style');
    style.id = 'holiday-reminder-styles';
    style.textContent = `
      .holiday-banner {
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        width: 320px !important;
        background: linear-gradient(135deg, #FF9933 0%, #138808 50%, #FFFFFF 100%) !important;
        color: #333 !important;
        padding: 0 !important;
        border-radius: 12px !important;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3) !important;
        z-index: 999999 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        animation: slideInRight 0.5s ease-out !important;
        overflow: hidden !important;
      }
      
      .holiday-banner.fade-out {
        animation: fadeOutRight 0.3s ease-in !important;
      }
      
      .banner-header {
        display: flex !important;
        justify-content: space-between !important;
        align-items: flex-start !important;
        padding: 15px !important;
        background: rgba(255,255,255,0.95) !important;
        border-bottom: 1px solid rgba(0,0,0,0.1) !important;
      }
      
      .banner-title {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
      }
      
      .banner-title h3 {
        margin: 0 !important;
        font-size: 16px !important;
        font-weight: 600 !important;
        color: #333 !important;
      }
      
      .banner-title p {
        margin: 2px 0 0 0 !important;
        font-size: 12px !important;
        color: #666 !important;
      }
      
      .flag {
        font-size: 20px !important;
      }
      
      .close-btn {
        background: rgba(0,0,0,0.1) !important;
        border: none !important;
        color: #333 !important;
        width: 24px !important;
        height: 24px !important;
        border-radius: 50% !important;
        cursor: pointer !important;
        font-size: 16px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: background 0.3s !important;
      }
      
      .close-btn:hover {
        background: rgba(0,0,0,0.2) !important;
      }
      
      .holidays-list {
        padding: 15px !important;
        background: rgba(255,255,255,0.9) !important;
      }
      
      .holiday-item {
        background: linear-gradient(135deg, #ff9933, #ff6b35) !important;
        color: white !important;
        padding: 10px !important;
        margin: 8px 0 !important;
        border-radius: 6px !important;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1) !important;
      }
      
      .holiday-name {
        font-weight: 600 !important;
        font-size: 14px !important;
        margin: 0 !important;
      }
      
      .holiday-date {
        font-size: 11px !important;
        opacity: 0.9 !important;
        margin: 3px 0 0 0 !important;
      }
      
      .banner-footer {
        padding: 10px 15px !important;
        background: rgba(255,255,255,0.8) !important;
        text-align: center !important;
        border-top: 1px solid rgba(0,0,0,0.1) !important;
      }
      
      .banner-footer small {
        color: #666 !important;
        font-size: 10px !important;
      }
      
      .no-holidays-banner .banner-header {
        background: rgba(240,248,255,0.95) !important;
      }
      
      .error-banner {
        background: linear-gradient(135deg, #f44336, #d32f2f) !important;
        color: white !important;
      }
      
      .error-banner .banner-header {
        background: rgba(255,255,255,0.95) !important;
      }
      
      @keyframes slideInRight {
        from { 
          transform: translateX(100%) !important; 
          opacity: 0 !important; 
        }
        to { 
          transform: translateX(0) !important; 
          opacity: 1 !important; 
        }
      }
      
      @keyframes fadeOutRight {
        from { 
          transform: translateX(0) !important; 
          opacity: 1 !important; 
        }
        to { 
          transform: translateX(100%) !important; 
          opacity: 0 !important; 
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Fallback Indian holidays data for 2025
function getIndianHolidaysFallback(year) {
  return [
    { date: `${year}-01-01`, name: "New Year's Day" },
    { date: `${year}-01-14`, name: "Makar Sankranti" },
    { date: `${year}-01-26`, name: "Republic Day" },
    { date: `${year}-03-13`, name: "Holi" },
    { date: `${year}-03-14`, name: "Holi (Second Day)" },
    { date: `${year}-03-31`, name: "Ram Navami" },
    { date: `${year}-04-14`, name: "Dr. Ambedkar Jayanti" },
    { date: `${year}-04-18`, name: "Good Friday" },
    { date: `${year}-05-01`, name: "Labour Day" },
    { date: `${year}-05-12`, name: "Buddha Purnima" },
    { date: `${year}-08-15`, name: "Independence Day" },
    { date: `${year}-08-16`, name: "Janmashtami" },
    { date: `${year}-09-07`, name: "Ganesh Chaturthi" },
    { date: `${year}-10-02`, name: "Gandhi Jayanti" },
    { date: `${year}-10-12`, name: "Dussehra" },
    { date: `${year}-11-01`, name: "Diwali" },
    { date: `${year}-11-15`, name: "Guru Nanak Jayanti" },
    { date: `${year}-12-25`, name: "Christmas Day" }
  ];
}

// Listen for messages from popup (for testing)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'testBanner') {
    console.log('🧪 Test banner requested');
    // Force show banner with test data
    const testHolidays = [
      { date: new Date().toISOString().split('T')[0], name: "Test Holiday" }
    ];
    createHolidayBanner(testHolidays);
    sendResponse({ success: true });
  }
});

// Initialize when page loads
console.log('🔄 Page state:', document.readyState);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, showing holidays in 2 seconds...');
    setTimeout(showHolidayNotification, 2000);
  });
} else {
  console.log('📄 Page already loaded, showing holidays in 1 second...');
  setTimeout(showHolidayNotification, 1000);
}

// Also trigger on URL changes (for SPAs)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('🔄 URL changed, checking holidays again...');
    setTimeout(showHolidayNotification, 3000);
  }
}).observe(document, { subtree: true, childList: true });