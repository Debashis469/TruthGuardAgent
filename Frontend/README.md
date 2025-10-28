# TruthGuard React Frontend

## Objectives
- Showcase the TruthGuard mission, architecture, and integrations described across Backend and Extension docs.
- Provide an interactive workspace for testing verification flows via web UI.
- Offer a unified entry point to engage with the extension, WhatsApp, and Telegram experiences.

## Key Pages

### Landing Page
- Hero section summarizing cross-platform verification (extension, messaging bots, backend).
- Highlights of architecture pillars: multi-platform ingestion, ADK agent verification, unified response delivery.
- Links to installation guides for the browser extension and messaging channels.
- Timeline or roadmap that mirrors Backend/Extension documentation milestones.

### Try the Apps Hub
- Tabs/cards for "Web Extension", "WhatsApp", and "Telegram" that reference setup instructions from their respective docs.
- Embedded walkthrough videos or animations demonstrating verification flows.

### Interactive Verification Console
- Chat-like interface where users paste text snippets or full articles.
- Input panel accepts `title`, `url`, and `content`, mirroring backend `POST /extension` payload expectations.
- Result pane renders verdict badges, confidence indicators, and evidence (matching ADK response schema).
- History sidebar listing recent verifications with quick reload.

## Data Flow
1. User submits text via the verification console.
2. Frontend POSTs payload `{ text, url, title, mode }` to `https://<backend-host>/extension`.
3. Backend (Flask) delegates to the ADK agent and returns structured verification results.
4. Frontend maps response to UI components (verdict banner, evidence list, metadata).
5. Optional: store session history in local storage for UX continuity.

## Component Overview
- `AppShell`: global layout, navigation between Landing and Try the Apps views.
- `VerificationConsole`: handles form state, validation, and API interactions.
- `ResultPanel`: present verdict, confidence, evidence, and agent metadata.
- `HistoryDrawer`: persists previous queries/results client-side.
- `DocsLinks`: dynamic links to Backend/Extension README sections for quick reference.

## API Contract Alignment
- Mirrors backend documentation in `Backend/README.md` for payload shape and response structure.
- Implements exponential backoff and user notifications on network or agent failures.
- Adds optional auth headers or tokens as soon as backend supports them.

## UI/UX Considerations
- Responsive design to support desktop and tablet users.
- Provide skeleton loaders while awaiting backend responses.
- Allow users to download or share verification reports.
- Tooltip guidance linking verification action to extension and messaging experiences.

## Tech Stack & Libraries
- React + Vite or Next.js for rapid development.
- State management (React Query or Zustand) for asynchronous API calls and caching.
- Component library (e.g., Chakra UI, MUI) for consistent styling.
- Charting or visualization (e.g., Recharts) to present confidence scores.
- Internationalization package to prepare for multi-language support.

## Testing Strategy
- Unit tests for form validation, API hooks, and result mapping.
- Integration tests with mocked backend responses to ensure UI resilience.
- End-to-end tests simulating user verification flows (Playwright/Cypress).

## Deployment Notes
- Host on a static site platform (Netlify, Vercel) or alongside the Flask backend via reverse proxy.
- Configure environment variables for backend URL and feature flags.
- Ensure HTTPS to align with secure webhook requirements across the project.

## Future Enhancements
- Live collaboration mode where multiple users can review a report together.
- Dashboard summarizing verification trends and agent performance metrics.
- Unified login to sync history with extension and messaging apps.
