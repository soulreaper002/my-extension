# my-extension
My first browser extension

## Project Structure
my-extension/
├── manifest.json       # Extension configuration
├── popup.html         # Popup interface
├── popup.js           # Popup functionality
├── content.js         # Content script (runs on web pages)
├── background.js      # Background/service worker
├── icons/            # Extension icons (you need to add these)
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
└── README.md         # This file
```

## Installation Instructions

### For Chrome:
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the folder containing your extension files
5. The extension should appear in your extensions list

### For Edge:
1. Open Edge and navigate to `edge://extensions/`
2. Enable "Developer mode" (toggle in bottom-left)
3. Click "Load unpacked"
4. Select the folder containing your extension files
5. The extension should appear in your extensions list

## Required Icons

You need to create icon files in the `icons/` folder:
- `icon-16.png` (16x16 pixels)
- `icon-32.png` (32x32 pixels)  
- `icon-48.png` (48x48 pixels)
- `icon-128.png` (128x128 pixels)

You can create simple colored squares or use online icon generators.

## How It Works

1. **Popup**: Click the extension icon to open the popup with buttons
2. **Highlight Text**: Toggles yellow highlighting on all paragraphs
3. **Change Background**: Changes the page background color
4. **Get Page Info**: Shows count of links and images
5. **Floating Button**: Appears on every page, click for a greeting

## Customization

- Edit `manifest.json` to change extension name, permissions, etc.
- Modify `popup.html` and `popup.js` to change the popup interface
- Update `content.js` to add new page interactions
- Customize `background.js` for background tasks and storage

## Testing

1. Install the extension
2. Visit any website
3. Click the extension icon to open popup
4. Try the different buttons
5. Look for the floating button on the page
6. Check browser console for debug messages

## Next Steps

- Add more sophisticated UI components
- Implement data persistence with chrome.storage
- Add keyboard shortcuts
- Create options page for settings
- Add more content script functionality
- Implement cross-page communication

## Permissions Used

- `activeTab`: Access to current active tab
- `storage`: Save extension settings
- `contextMenus`: Right-click menu items (implicit)

## Browser Compatibility

- Chrome (Manifest V3)
- Edge (Manifest V3)
- Other Chromium-based browsers