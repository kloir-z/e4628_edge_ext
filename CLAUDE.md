# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a simple Chrome/Edge extension that enhances the user interface of the 勤之助 (Kinnosuke) website at https://www.e4628.jp/. The extension processes table cells with `onmousemove` attributes and extracts meaningful content from popup HTML strings.

## Architecture

The extension consists of two main files:

- **manifest.json**: Chrome Extension Manifest V3 configuration
- **content.js**: Content script that runs on the target website

### Content Script Logic

The main functionality in `content.js`:
1. Finds all `<td>` elements with `onmousemove` attributes
2. Extracts HTML content from the `showPopup()` function calls
3. Decodes HTML entities and parses the content
4. Extracts text from the second row's first cell of embedded table structures
5. Replaces the original cell content with the extracted text

## Development

### Loading the Extension
1. Open Chrome/Edge extension management page (`chrome://extensions/` or `edge://extensions/`)
2. Enable "Developer mode"
3. Click "Load unpacked" and select this directory

### Testing Changes
- Make changes to `content.js` or `manifest.json`
- Go to the extensions page and click the refresh button for this extension
- Reload the target website to see changes

### Target Website
The extension only runs on pages matching `https://www.e4628.jp/*` as specified in the manifest.

## File Structure
```
custom_edge_ext/
├── manifest.json    # Extension configuration
└── content.js       # Main content script logic
```