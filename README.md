
# Fox-Block Ad Blocker

A basic, privacy-friendly ad blocker browser extension for Chrome, Edge, and Firefox. Blocks banner ads, popups, video ads, and tracking scripts using both network and DOM-based techniques.

## Features
- Blocks banner ads, popups, video ads, and trackers
- Uses both network request blocking and CSS/DOM hiding
- Minimal but effective default blocklist (EasyList-inspired)
- User options for enabling/disabling, custom domains, and custom CSS selectors
- Badge icon shows number of blocked ads per page
- Lightweight and fast

## Installation

### Chrome/Edge (Unpacked)
1. Go to `chrome://extensions` or `edge://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `Fox-Block` folder

### Firefox (Temporary)
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select any file in the `Fox-Block` folder (e.g., `manifest.json`)

## Packaging for Distribution

### Chrome/Edge
1. Go to `chrome://extensions` or `edge://extensions`
2. Click "Pack extension", select your `Fox-Block` folder
3. Upload the `.crx` and `.pem` files to the Chrome Web Store or Edge Add-ons

### Firefox
1. Zip the contents of `Fox-Block` (not the folder itself)
2. Submit the zip to https://addons.mozilla.org/developers/ for signing and distribution

## File Structure
```
Fox-Block/
├── manifest.json
├── service_worker.js
├── content.js
├── options.html
├── options.js
├── options.css
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## Note
Needs improvement. Fox-block can do wrong things on websites.


## Credits
- Default blocklist and selectors inspired by [EasyList](https://easylist.to/)
- m2_zm
---

**zmBlock** is open source and privacy-respecting. No data is collected or sent anywhere.
