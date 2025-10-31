from flask import Blueprint, request, jsonify, current_app
from core.schemas import RequestModel
from core.service import verify
from integrations.telegram_client import send_message
from integrations.whatsapp_client import send_text
from flask_cors import cross_origin

# Single blueprint that exposes all public endpoints
bp = Blueprint("api", __name__)

@bp.post("/telegram/<token>")
def telegram_webhook(token):
    # Auth: only accept requests that target the bot token path
    if token != current_app.config["TELEGRAM_BOT_TOKEN"]:
        return jsonify({"ok": False, "error": "Unauthorized"}), 403
    # Telegram update payload (message-based only; ignore callbacks/etc.)
    update = request.get_json(force=True)
    message = update.get("message", {})
    chat = message.get("chat", {})
    chat_id = chat.get("id")
    text = message.get("text", "")
    
    # Graceful no-op if it’s not a standard text message
    if not chat_id or not text:
        return jsonify({"ok": True}), 200
    
    # Normalize into the project’s canonical request schema
    req = RequestModel(
        text=text,
        user={"id": str(chat_id)},
        channel="telegram"
    )
    
    # Core verification (blocking call)
    result = verify(req)
    
    # Prepare a user-friendly reply (include top evidence URLs if available)
    reply = f"✅ Verdict: {result.verdict.upper()}\n📊 Confidence: {result.confidence:.0%}"
    if result.evidence:
        reply += f"\n\n🔗 Sources:\n"
        for ev in result.evidence[:2]:
            reply += f"• {ev.url}\n"
    
    # Send the response back to Telegram
    send_message(chat_id, reply)
    return jsonify({"ok": True}), 200

@bp.get("/verify")
def verify_endpoint():
    # Lightweight health/info endpoint for quick checks
    return jsonify({"status": "ok", "message": "Verification endpoint"})

@bp.get("/whatsapp")
def whatsapp_verify():
    # Meta webhook verification handshake (GET)
    mode = request.args.get("hub.mode")
    challenge = request.args.get("hub.challenge")
    token = request.args.get("hub.verify_token")
    # Echo the hub.challenge only if verify token matches your configured secret
    if mode == "subscribe" and token == current_app.config["WHATSAPP_VERIFY_TOKEN"]:
        return challenge, 200
    return "Forbidden", 403

@bp.post("/whatsapp")
def whatsapp_webhook():
    # WhatsApp Cloud API delivery (POST)
    data = request.get_json(force=True, silent=True) or {}
    entry = (data.get("entry") or [{}])[0]
    change = (entry.get("changes") or [{}])[0]
    value = change.get("value") or {}
    messages = value.get("messages") or []
    # No messages (e.g., only statuses) -> acknowledge quickly
    if not messages:
        return jsonify({"ok": True}), 200
    
    # Extract sender and text body
    msg = messages[0]
    from_number = msg.get("from")
    text = (msg.get("text") or {}).get("body") or ""
    if not from_number or not text:
        return jsonify({"ok": True}), 200
    # Normalize into canonical schema
    req = RequestModel(text=text, user={"wa_from": from_number}, channel="whatsapp")
    # Core verification (blocking call)
    result = verify(req)

    # Send a concise reply via WhatsApp Graph API
    reply = f"Verdict: {result.verdict} | Confidence: {result.confidence:.2f}"
    send_text(to=from_number, text=reply)
    return jsonify({"ok": True}), 200

@bp.post("/verify_for_frontend_extension")
@cross_origin(origins=["https://your-frontend.app", "chrome-extension://<id>"])
def verify_for_frontend_extension():
    # Public JSON endpoint for web app and browser extension
    data = request.get_json(force=True, silent=True) or {}
    text = data.get("text") or ""
    links = data.get("links") or []
    user = data.get("user") or {}

    # Minimal validation for required field(s)
    if not text.strip():
        return jsonify({"error": "text is required"}), 400

    # Normalize into your canonical RequestModel; channel helps observability
    req = RequestModel(
        text=text,
        user=user,
        channel=data.get("channel") or "extension",
        links=links
    )
    # Core verification (blocking call)
    result = verify(req)
    # Return pydantic model as dict
    return jsonify(result.dict()), 200