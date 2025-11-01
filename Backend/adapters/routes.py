from flask import Blueprint, request, jsonify, current_app
from core.schemas import RequestModel
from core.service import verify
from integrations.telegram_client import send_message
from integrations.whatsapp_client import send_text

bp = Blueprint("api", __name__)

@bp.post("/telegram/<token>")
def telegram_webhook(token):
    if token != current_app.config["TELEGRAM_BOT_TOKEN"]:
        return jsonify({"ok": False, "error": "Unauthorized"}), 403

    update = request.get_json(force=True)
    message = update.get("message", {})
    chat = message.get("chat", {})
    chat_id = chat.get("id")
    text = message.get("text", "")

    if not chat_id or not text:
        return jsonify({"ok": True}), 200

    current_app.logger.info("telegram inbound chat_id=%s text=%s", chat_id, text[:120])

    req = RequestModel(text=text, user={"id": str(chat_id)}, channel="telegram")

    try:
        result = verify(req)

        parts = []
        raw = getattr(result, "raw_final", None) or (getattr(result, "extra", {}) or {}).get("raw_final")
        if raw:
            parts.append(raw.strip()[:3500])

        if result.evidence:
            parts.append("")
            parts.append("🔗 Sources:")
            for ev in result.evidence[:3]:
                url = getattr(ev, "url", None)
                if url:
                    parts.append(f"• {url}")

        # Fallback if no raw or evidence
        if not parts:
            parts.append("No response content was produced.")

        reply = "\n".join(parts)

    except Exception as e:
        current_app.logger.error("verify/telegram error chat_id=%s err=%s", chat_id, str(e))
        reply = f"❌ Error: {str(e)}"

    try:
        send_message(chat_id, reply)
    except Exception as e:
        current_app.logger.error("telegram send error chat_id=%s err=%s", chat_id, str(e))

    return jsonify({"ok": True}), 200



@bp.get("/verify")
def verify_endpoint():
    return jsonify({"status": "ok", "message": "Verification endpoint"})


@bp.get("/whatsapp")
def whatsapp_verify():
    mode = request.args.get("hub.mode")
    challenge = request.args.get("hub.challenge")
    token = request.args.get("hub.verify_token")

    if mode == "subscribe" and token == current_app.config["WHATSAPP_VERIFY_TOKEN"]:
        return challenge, 200
    return "Forbidden", 403


@bp.post("/whatsapp")
def whatsapp_webhook():
    data = request.get_json(force=True, silent=True) or {}
    entry = (data.get("entry") or [{}])[0]
    change = (entry.get("changes") or [{}])[0]
    value = change.get("value") or {}
    messages = value.get("messages") or []

    if not messages:
        return jsonify({"ok": True}), 200

    # Minimal: ignore delivery/read status callbacks
    if value.get("statuses"):
        return jsonify({"ok": True}), 200

    msg = messages[0]

    # Minimal: ignore echoes of our own outbound messages
    phone_id = str(value.get("metadata", {}).get("phone_number_id", ""))
    if msg.get("from") == phone_id:
        return jsonify({"ok": True}), 200

    from_number = msg.get("from")
    text = (msg.get("text") or {}).get("body") or ""
    if not from_number or not text:
        return jsonify({"ok": True}), 200

    current_app.logger.info("whatsapp inbound from=%s text=%s", from_number, text[:120])

    req = RequestModel(text=text, user={"wa_from": from_number}, channel="whatsapp")

    try:
        result = verify(req)

        parts = []
        raw = getattr(result, "raw_final", None) or (getattr(result, "extra", {}) or {}).get("raw_final")
        if raw:
            parts.append(raw.strip()[:3500])

        if result.evidence:
            parts.append("")
            parts.append("Sources:")
            for ev in result.evidence[:3]:
                url = getattr(ev, "url", None)
                if url:
                    parts.append(f"- {url}")

        reply = "\n".join(parts) if parts else "No response content was produced."

    except Exception as e:
        current_app.logger.error("verify/whatsapp error from=%s err=%s", from_number, str(e))
        reply = f"Error: {str(e)}"

    try:
        send_text(to=from_number, text=reply)
    except Exception as e:
        current_app.logger.error("whatsapp send error to=%s err=%s", from_number, str(e))

    return jsonify({"ok": True}), 200



@bp.post("/verify_for_frontend_extension_app")
def verify_for_frontend_extension_app():
    data = request.get_json(force=True, silent=True) or {}
    text = data.get("text") or ""
    links = data.get("links") or []
    user = data.get("user") or {}

    if not text.strip():
        return jsonify({"error": "text is required"}), 400

    req = RequestModel(
        text=text,
        user=user,
        channel=data.get("channel") or "extension",
        links=links,
    )

    try:
        result = verify(req)

        # Build Telegram/WhatsApp-like message
        parts = []
        raw = getattr(result, "raw_final", None) or (getattr(result, "extra", {}) or {}).get("raw_final")
        if raw:
            parts.append(raw.strip()[:3500])

        if result.evidence:
            parts.append("")
            parts.append("Sources:")
            for ev in result.evidence[:3]:
                url = getattr(ev, "url", None)
                if url:
                    parts.append(f"- {url}")

        formatted = "\n".join(parts).strip() or "No response content was produced."

        # Return both: formatted text for simple clients, full result for advanced clients
        return jsonify({
            "status": "ok",
            "formatted_response": formatted,
            "result": result.dict(),
        }), 200

    except Exception as e:
        current_app.logger.error("verify/extension error user=%s err=%s", user, str(e))
        return jsonify({"status": "error", "error": str(e)}), 500
