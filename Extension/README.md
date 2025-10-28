# TruthGuard Web Extension

## Purpose
- Allow readers to verify claims while browsing any article.
- Send selected text or full-page context to the Flask backend for analysis.
- Display verification results with clear verdicts, evidence, and confidence.

## Core User Flows

### Quick Snippet Verification
1. User selects a portion of text on a web page.
2. Extension context menu or floating action button offers "Verify Fact".
3. Extension packages payload `{ text, url, userMetadata }` and calls the backend `/extension` endpoint.
4. Backend triggers the ADK agent flow and returns structured verification data.
5. Extension renders a popup with status (true/false/mixed), supporting evidence, and links.

### Full Page Verification
1. User opens the extension popup and clicks "Verify Entire Page".
2. Extension captures article URL, document title, and readable text (via `document.body`, `Readability`, or similar parsing).
3. Sends payload `{ fullText, url, title }` to the backend.
4. Displays progress indicator while backend processes the request.
5. Shows comprehensive verification report once the response arrives.

## Data Contract with Backend
- **Endpoint**: `POST https://<backend-host>/extension`
- **Headers**: `Content-Type: application/json`; include auth token if available.
- **Payload Fields**:
  - `mode`: `"snippet"` or `"full_page"`.
  - `text`: selected text or full article text.
  - `url`: current page URL.
  - `title`: optional page title.
  - `user`: optional user/session metadata.
- **Response Expectation**:
  ```json
  {
    "status": "success",
    "verdict": "true|false|mixed|unverified",
    "confidence": 0.0,
    "summary": "Concise finding",
    "evidence": [
      { "source": "https://...", "excerpt": "..." }
    ],
    "meta": { "processedAt": "2025-10-28T00:00:00Z" }
  }
  ```
- Handle error responses with fallback messaging (network failures, agent timeouts).

## UX Considerations
- Keep popup minimal: verdict badge, confidence meter, expandable evidence list.
- Provide "Re-run" and "Report Issue" shortcuts.
- Persist last results per URL in local storage for quick recall.
- Respect privacy: prompt user before sending large payloads; show data usage notice.

## Technical Notes
- Use Manifest V3 (service worker background script) for modern browsers.
- Content script listens for selection changes and injects contextual UI.
- Background script handles API calls and authentication tokens.
- Apply debouncing to avoid multiple API calls when selection changes rapidly.
- Integrate with `chrome.contextMenus` to offer right-click verification.

## Testing Checklist
- Verify snippet selection across major sites (news, blogs, PDFs where possible).
- Test full-page capture on paywalled or dynamically rendered pages.
- Confirm URL always accompanies text payload.
- Validate graceful handling of backend errors and offline mode.

## Future Enhancements
- Inline highlighting of verified segments on the page.
- Integration with history dashboard synchronized via the user account.
- Internationalization of UI labels and verdict messages.
