# integrations/adk_client.py
import os
import time
import logging
from typing import Dict, Any, Optional
import requests

log = logging.getLogger("adk")

ADK_BASE = os.getenv("ADK_BASE", "https://truthguardagent.onrender.com")
APP_NAME = os.getenv("ADK_APP_NAME", "news_info_verification_v2")
# Default to 300s (5 minutes); override with ADK_TIMEOUT_SEC if needed
HTTP_TIMEOUT = float(os.getenv("ADK_TIMEOUT_SEC", "300"))

# in-memory session cache: user_id -> (session_id, ts)
_session_cache: Dict[str, tuple[str, float]] = {}
SESSION_TTL_SEC = 6 * 60 * 60

class ADKError(Exception):
    pass

def _create_session(user_id: str) -> str:
    t0 = time.time()
    url = f"{ADK_BASE}/apps/{APP_NAME}/users/{user_id}/sessions"
    r = requests.post(url, data="", timeout=HTTP_TIMEOUT)
    r.raise_for_status()
    sid = r.json().get("id")
    if not sid:
        raise ADKError("session id missing")
    dt = time.time() - t0
    log.info("ADK session created user=%s sid=%s dt=%.2fs", user_id, sid, dt)
    return sid

def _get_or_create_session(user_id: str) -> str:
    now = time.time()
    rec = _session_cache.get(user_id)
    if rec and (now - rec[1] < SESSION_TTL_SEC):
        return rec[0]
    sid = _create_session(user_id)
    _session_cache[user_id] = (sid, now)
    return sid

def _run(session_id: str, user_id: str, text: str) -> Dict[str, Any]:
    t0 = time.time()
    url = f"{ADK_BASE}/run"
    payload = {
        "app_name": APP_NAME,
        "user_id": user_id,
        "session_id": session_id,
        "new_message": {"parts": [{"text": text}], "role": "user"},
    }
    r = requests.post(url, json=payload, timeout=HTTP_TIMEOUT)
    r.raise_for_status()
    dt = time.time() - t0
    log.info("ADK run ok user=%s sid=%s dt=%.2fs", user_id, session_id, dt)
    return r.json()

def call_adk(query: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
    user = metadata.get("user") or {}
    user_id: Optional[str] = user.get("wa_from") or user.get("id") or "anonymous"

    try:
        sid = _get_or_create_session(user_id)
        data = _run(sid, user_id, query)
    except requests.Timeout:
        log.error("ADK timeout user=%s", user_id)
        raise ADKError("timeout")
    except requests.RequestException as e:
        body = getattr(e.response, "text", "")
        log.error("ADK http_error user=%s err=%s body=%s", user_id, e, (body or "")[:300])
        raise ADKError("http_error")
    except Exception as e:
        log.error("ADK error user=%s err=%s", user_id, e)
        raise ADKError("unexpected")

    # Minimal: expect top-level list of logs
    logs = data if isinstance(data, list) else []
    if not logs:
        log.error("ADK no logs found user=%s data=%s", user_id, str(data)[:500])
        raise ADKError("missing logs in response")

    try:
        final_text = logs[-1]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError) as e:
        log.error("ADK missing final text user=%s err=%s last_log=%s", user_id, e, str(logs[-1])[:500])
        raise ADKError("missing final text in response")

    verdict = "verified" if "legitimate" in (final_text or "").lower() or "verdict: true" in (final_text or "").lower() else "unverified"
    confidence = 1.0 if "confidence: 1.0" in (final_text or "").lower() else 0.5

    return {"verdict": verdict, "confidence": confidence, "evidence": [], "raw_final": final_text}

def warmup():
    try:
        _create_session("warmup-user")
    except Exception:
        pass
