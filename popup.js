// Popup script - runs when the extension popup is opened
document.addEventListener('DOMContentLoaded', async () => {
  // Get current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Display tab info
  const tabInfo = document.getElementById('tabInfo');
  tabInfo.textContent = tab.title || 'Unknown page';
  
  // Highlight text button
  document.getElementById('highlightBtn').addEventListener('click', async () => {
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'highlight' });
      showStatus('Text highlighted!', 'success');
    } catch (error) {
      showStatus('Error: Could not highlight text', 'error');
    }
  });
  
  // Change background color button
  document.getElementById('changeColorBtn').addEventListener('click', async () => {
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'changeBackground' });
      showStatus('Background changed!', 'success');
    } catch (error) {
      showStatus('Error: Could not change background', 'error');
    }
  });
  
  // Get page info button
  document.getElementById('getInfoBtn').addEventListener('click', async () => {
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getInfo' });
      showStatus(`Links: ${response.links}, Images: ${response.images}`, 'success');
    } catch (error) {
      showStatus('Error: Could not get page info', 'error');
    }
  });
});

// Show status messages
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  
  // Clear status after 3 seconds
  setTimeout(() => {
    status.textContent = '';
    status.className = 'status';
  }, 3000);
}