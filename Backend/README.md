# Flask Multi-Platform Verification Backend

## Overview
- Serves browser extension and React frontend verification requests.
- Ingests messages from WhatsApp Business API and Telegram Bot API webhooks.
- Orchestrates verification logic by invoking the Google ADK agent.
- Routes structured results back to web clients or messaging channels.

## Architecture

| Component | Responsibility |
|-----------|----------------|
| API Endpoints | Receive verification requests and user context from the extension and frontend. |
| WhatsApp Integration | Webhook endpoint for inbound WhatsApp messages via the Business API. |
| Telegram Integration | Webhook endpoint for Telegram bot updates. |
| ADK Agent Client | Invokes the ADK agent with incoming queries and handles responses. |
| Response Dispatcher | Normalizes and returns verification results to HTTP clients or messaging agents. |

### Data Flow
1. Client (extension, frontend, WhatsApp, Telegram) submits a fact-check query.
2. Flask endpoint validates input and forwards the request to the ADK agent client.
3. ADK agent returns verification metadata and verdict.
4. Response dispatcher formats the result and delivers it back to the originating channel.
5. Logging and error handlers record transaction outcomes for observability.

## API Surface

### Generic Verification Endpoint
```python
@app.route('/verify', methods=['POST'])
def verify():
    """Accept JSON payloads like {"query": str, "user": {...}} and return verification results."""
    # 1. Validate request and extract user context.
    # 2. Call the ADK agent client with the query payload.
    # 3. Respond with structured verification output (status, verdict, evidence).
```

### WhatsApp Webhook
```python
@app.route('/whatsapp', methods=['POST'])
def whatsapp_webhook():
    """Process WhatsApp Business API webhooks and reply using the WhatsApp send-message endpoint."""
    # 1. Parse inbound WhatsApp message payload.
    # 2. Reuse verify() logic to obtain the fact-check result.
    # 3. Send the formatted response back through the WhatsApp API.
```

### Telegram Webhook
```python
@app.route('/telegram/<token>', methods=['POST'])
def telegram_webhook(token):
    """Handle Telegram bot updates delivered via webhook."""
    # 1. Validate bot token and parse incoming message/update.
    # 2. Delegate to verify() for the ADK agent call.
    # 3. Post the reply using the Telegram Bot API.
```

### Browser Extension and Frontend Endpoint
```python
@app.route('/extension', methods=['POST'])
def extension_handler():
    """Serve extension and React frontend verification requests with CORS support."""
    # 1. Authenticate/authorize client requests if required.
    # 2. Forward the query to the ADK agent client.
    # 3. Return JSON response with verification details.
```

## ADK Agent Integration
- Interact with the ADK agent through a dedicated client module (HTTP-based by default).
- Implement retry and timeout policies to handle transient agent outages.
- Capture agent latency metrics to inform scaling decisions.

### Example Client Stub
```python
import requests

ADK_AGENT_URL = "https://adk-agent.example.com/verify"


def call_adk_agent(query: str, metadata: dict | None = None) -> dict:
    payload = {"query": query, "metadata": metadata or {}}
    response = requests.post(ADK_AGENT_URL, json=payload, timeout=10)
    response.raise_for_status()
    return response.json()
```

## Messaging Integrations
- **Telegram**: Register the bot, expose a public HTTPS endpoint, and set the webhook to the Flask route. Libraries like `python-telegram-bot` can simplify parsing and response formatting.
- **WhatsApp**: Configure the WhatsApp Business API webhook to the Flask endpoint, validate signatures, and send replies using the Business API after verification.
- Normalize message content to a common schema before invoking the ADK agent client.

## Response Strategy
- Return consistent JSON with fields such as `status`, `verdict`, `confidence`, and `evidence`.
- Provide user-friendly fallback messages when the ADK agent is unreachable.
- Support media or link attachments when messaging platforms allow it.

## Suggested Dependencies
- `Flask` for request routing and middleware.
- `flask-cors` for browser-based clients.
- `requests` for outbound HTTP calls to the ADK agent and messaging APIs.
- `python-telegram-bot` for Telegram convenience utilities.
- WhatsApp Business API SDK or raw HTTP helpers for WhatsApp integration.
- Structured logging (e.g., `structlog`) and environment variable management (`python-dotenv`).

## Deployment Notes
- Host behind HTTPS (required for WhatsApp and Telegram webhooks).
- Use worker processes (e.g., Gunicorn with gevent) or task queues for long-running verifications.
- Externalize configuration through environment variables or a secrets manager.
- Monitor webhook delivery health and ensure idempotent processing to avoid duplicate responses.

## Additional Resources
- Integrating Telegram bot with Flask: https://www.reddit.com/r/flask/comments/1lykzqo/integrating_telegram_bot_with_flask/
- Automate Messages Using WhatsApp Business API and Flask: https://www.pragnakalp.com/automate-messages-using-whatsapp-business-api-flask-part-1/
- Building a Telegram Chatbot with Flask: https://github.com/AliAbdelaal/telegram-bot-tutorial
