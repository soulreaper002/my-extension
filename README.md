In-Holiday

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

- Chrome (Manifest V3)
- Edge (Manifest V3)
- Other Chromium-based browsers


- You can change Url where you want pop up by adding the URL in manifest.json file
