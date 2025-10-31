# TruthGuard Agent Platform

TruthGuard delivers multi-channel fact verification powered by a central ADK agent. The platform connects a Flask backend, a browser extension, a React frontend, and ingestion points for WhatsApp and Telegram to provide rapid fact checks wherever users encounter information.

## Platform Architecture
- **ADK Agent**: Core verification intelligence that analyzes incoming claims and returns verdicts with evidence.
- **Flask Backend** (`Backend/README.md`): REST API layer that unifies inputs from the extension, frontend, and messaging bots while orchestrating ADK agent calls.
- **Web Extension** (`Extension/README.md`): Allows readers to verify selected snippets or full pages directly from the browser.
- **React Frontend** (`Frontend/README.md`): Landing site and interactive console for submitting content and exploring verification results.
- **Messaging Integrations**: WhatsApp Business API and Telegram Bot API endpoints managed through the backend.

### Request Lifecycle
1. User submits text or article context from the extension, frontend console, WhatsApp, or Telegram.
2. Flask backend normalizes the payload and calls the ADK agent for verification.
3. ADK agent responds with verdicts, confidence, and supporting evidence.
4. Backend returns structured results to the originating client for presentation.

## Repositories & Documentation
- `Adk-agent/README.md`: Notes on configuring and integrating the ADK agent service.
- `Backend/README.md`: Backend API design, endpoints, and integration tips.
- `Extension/README.md`: Browser extension workflows and payload contracts.
- `Frontend/README.md`: React frontend structure and UX guidelines.

## Development Quick Start
1. Review component-specific READMEs for setup instructions.
2. Configure environment variables to point frontend/extension clients at the Flask backend.
3. Implement ADK agent connectivity and test with sample verification requests.
4. Extend messaging webhooks (WhatsApp/Telegram) once HTTPS and tokens are available.

## Roadmap Highlights
- Shared authentication and session history across web, extension, and messaging channels.
- Analytics dashboard summarizing verification volume and outcomes.
- Expanded language support and localization across all touchpoints.
