# Chrome Radio Extension

This is a simple Chrome extension that lets you play online radio stations from a popup window.

## Files

- `manifest.json` — Chrome extension manifest
- `popup.html` — popup UI
- `popup.css` — styling
- `popup.js` — station click logic and audio control

## How to load it in Chrome

1. Open Chrome.
2. Go to `chrome://extensions`.
3. Turn on `Developer mode`.
4. Click `Load unpacked`.
5. Select this project folder.
6. Click the extension icon in the toolbar and test it.

## Notes

- Replace the sample URLs in `popup.html` with real radio stream URLs if needed.
- Some radio streams may not work depending on CORS, licensing, or availability.
- This is a beginner-friendly starter project.

## Future improvements

- add custom station management
- save favorites in `chrome.storage`
- add volume control
- add search/filter
- add a settings page
