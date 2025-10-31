# TruthGuard Extension

Chrome extension for detecting false news and verifying facts on any webpage.

## Features

- ✅ **Full Page Scan** - Analyze entire article
- ✅ **Region Selection** - Select specific area with visual rectangle
- ✅ **Download Reports** - Save results as Markdown files
- ✅ **Demo Mode** - Works without backend (for testing)

## Quick Start

### 1. Build

```bash
npm install
npm run build
```

### 2. Load Extension

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

### 3. Use

- Click extension icon
- Choose "Scan Full Page" or "Select Region"
- Download report as Markdown

## API Integration

Currently in **demo mode**. When backend is ready:

**Endpoints:**

- Send to: `http://localhost:5000/api/extension`
- Receive from: `http://localhost:5000/api/agent`

**Request Format:**

```json
{
  "mode": "full_page" | "selection",
  "text": "content to verify",
  "url": "https://example.com",
  "title": "Page Title"
}
```

**Expected Response:**

```json
{
  "status": "success",
  "verdict": "true" | "false" | "mixed",
  "confidence": 0.95,
  "summary": "Verification summary"
}
```

## Project Structure

```
Extension/
├── src/
│   ├── popup.jsx           # Main popup UI
│   ├── content.js          # Page scraping & selection
│   ├── background.js       # API handler
│   └── components/
│       └── Popup.jsx       # React component
├── public/
│   ├── manifest.json       # Extension config
│   └── icons/
│       └── icon.svg        # Single SVG icon
└── dist/                   # Build output
```

## Development

```bash
npm run build    # Build extension
npm run dev      # Watch mode (requires reload in browser)
```

## License

MIT
