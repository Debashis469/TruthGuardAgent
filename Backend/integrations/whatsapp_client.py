import os, requests, logging

ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
PHONE_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
GRAPH_BASE = "https://graph.facebook.com/v24.0"  # align with subscription

log = logging.getLogger(__name__)

def send_text(to: str, text: str) -> None:
    url = f"{GRAPH_BASE}/{PHONE_ID}/messages"
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to,  # E.164 without '+'
        "type": "text",
        "text": {"body": text, "preview_url": False},
    }
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=15)
        if resp.status_code >= 300:
            log.error("whatsapp send failed code=%s body=%s", resp.status_code, resp.text[:400])
    except requests.RequestException as e:
        log.error("whatsapp send exception err=%s", e)
