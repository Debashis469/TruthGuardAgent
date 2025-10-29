import os
import requests

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
BASE_URL = f"https://api.telegram.org/bot{TOKEN}"

def send_message(chat_id: int, text: str) -> None:
    requests.post(
        f"{BASE_URL}/sendMessage",
        json={
            "chat_id": chat_id,
            "text": text,
            "disable_web_page_preview": True
        },
        timeout=8
    )

def set_webhook(url: str) -> dict:
    response = requests.post(
        f"{BASE_URL}/setWebhook",
        json={"url": url},
        timeout=10
    )
    return response.json()