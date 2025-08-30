// Content script - runs on web pages
console.log('My Extension content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'highlight':
      highlightText();
      sendResponse({ success: true });
      break;
      
    case 'changeBackground':
      changeBackground();
      sendResponse({ success: true });
      break;
      
    case 'getInfo':
      const info = getPageInfo();
      sendResponse(info);
      break;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
  
  return true; // Keep message channel open for async response
});

// Highlight all paragraph text
function highlightText() {
  const paragraphs = document.querySelectorAll('p');
  paragraphs.forEach(p => {
    if (!p.dataset.highlighted) {
      p.style.backgroundColor = '#ffff99';
      p.style.padding = '2px';
      p.dataset.highlighted = 'true';
    } else {
      p.style.backgroundColor = '';
      p.style.padding = '';
      delete p.dataset.highlighted;
    }
  });
}

// Change page background color
function changeBackground() {
  const body = document.body;
  const currentColor = body.style.backgroundColor;
  
  if (currentColor === 'rgb(240, 248, 255)' || currentColor === 'aliceblue') {
    body.style.backgroundColor = '';
  } else {
    body.style.backgroundColor = 'aliceblue';
  }
}

// Get page information
function getPageInfo() {
  const links = document.querySelectorAll('a').length;
  const images = document.querySelectorAll('img').length;
  const title = document.title;
  
  return {
    links: links,
    images: images,
    title: title
  };
}

// Add a floating button to the page
function addFloatingButton() {
  const button = document.createElement('button');
  button.textContent = '🔥';
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: none;
    background: #4285f4;
    color: white;
    font-size: 20px;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    transition: transform 0.2s;
  `;
  
  button.addEventListener('click', () => {
    alert('Hello from the extension!');
  });
  
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
  });
  
  document.body.appendChild(button);
}

// Add floating button when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addFloatingButton);
} else {
  addFloatingButton();
}