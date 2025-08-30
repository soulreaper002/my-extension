// Holiday Reminder Popup Script - India Only
document.addEventListener('DOMContentLoaded', async () => {
  const weekDates = document.getElementById('weekDates');
  const holidaysContainer = document.getElementById('holidaysContainer');
  const refreshBtn = document.getElementById('refreshBtn');
  const testBtn = document.getElementById('testBtn');
  
  // Initialize
  await loadHolidays();
  
  // Event listeners
  refreshBtn.addEventListener('click', loadHolidays);
  testBtn.addEventListener('click', testBanner);
  
  async function loadHolidays() {
    try {
      holidaysContainer.innerHTML = '<div class="loading">🔄 Loading Indian holidays...</div>';
      
      const { weekStart, weekEnd } = getCurrentWeekDates();
      
      // Update week display
      weekDates.textContent = `Week: ${weekStart.toLocaleDateString('en-IN')} - ${weekEnd.toLocaleDateString('en-IN')}`;
      
      // Use fallback data first, then try API enhancement
      const year = new Date().getFullYear();
      let holidays = getIndianHolidaysFallback(year);
      
      try {
        // Try to enhance with API data
        console.log('Trying to fetch from API...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/IN`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
          const text = await response.text();
          if (text && text.trim() && text !== 'null') {
            const apiHolidays = JSON.parse(text);
            if (Array.isArray(apiHolidays) && apiHolidays.length > 0) {
              holidays = apiHolidays;
              console.log('✅ API data loaded successfully');
            }
          }
        }
      } catch (apiError) {
        console.log('API failed, using fallback data:', apiError.message);
        // holidays already set to fallback data above
      }
      
      // Filter holidays for current week
      const weekHolidays = holidays.filter(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate >= weekStart && holidayDate <= weekEnd;
      });
      
      displayHolidays(weekHolidays);
      
    } catch (error) {
      console.error('Error loading holidays:', error);
      holidaysContainer.innerHTML = `
        <div class="error">
          ❌ Error loading holidays. Using offline data.
        </div>
      `;
      
      // Show fallback holidays
      const year = new Date().getFullYear();
      const fallbackHolidays = getIndianHolidaysFallback(year);
      const { weekStart, weekEnd } = getCurrentWeekDates();
      const weekHolidays = fallbackHolidays.filter(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate >= weekStart && holidayDate <= weekEnd;
      });
      
      setTimeout(() => displayHolidays(weekHolidays), 1000);
    }
  }
  
  function getCurrentWeekDates() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate start of week (Monday)
    const weekStart = new Date(today);
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    weekStart.setDate(today.getDate() - daysToMonday);
    weekStart.setHours(0, 0, 0, 0);
    
    // Calculate end of week (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    return { weekStart, weekEnd };
  }
  
  function displayHolidays(holidays) {
    if (holidays.length === 0) {
      holidaysContainer.innerHTML = `
        <div class="no-holidays">
          🎉 No national holidays this week!<br>
          <small>Perfect time for productivity 💼</small>
        </div>
      `;
      return;
    }
    
    const holidaysHtml = holidays.map(holiday => {
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
    
    holidaysContainer.innerHTML = holidaysHtml;
  }
  
  // Test banner function
  async function testBanner() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, { action: 'testBanner' });
    } catch (error) {
      console.error('Could not send test message:', error);
      alert('Please visit timesheet.com first to test the banner');
    }
  }
  
// Helper function to fetch and parse local JSON files within the extension
async function fetchLocalHolidays(filePath) {
  try {
    // Construct the full URL to the local file within the extension
    const url = chrome.runtime.getURL(filePath);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error loading holidays from ${filePath}:`, error);
    return []; // Return an empty array to prevent further errors
  }
}

/**
 * Fetches Indian holidays from local JSON files (fixed and floating).
 * It then formats the dates by prepending the provided year.
 *
 * @param {number} year The year for which to retrieve the holidays.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of holiday objects.
 */
async function getIndianHolidaysFallback(year) {
  const fixedHolidays = await fetchLocalHolidays('holidays/fixed.json');
  const floatingHolidays = await fetchLocalHolidays('holidays/floating.json');

  // Combine both lists
  const allHolidays = [...fixedHolidays, ...floatingHolidays];

  // Format the dates by prepending the year, matching your original function's output format
  const formattedHolidays = allHolidays.map(holiday => ({
    date: `${year}-${holiday.date}`,
    name: holiday.name,
    localName: holiday.localName
  }));

  // You might want to sort these holidays by date if the consuming function expects them sorted.
  formattedHolidays.sort((a, b) => new Date(a.date) - new Date(b.date));

  return formattedHolidays;
}
});
