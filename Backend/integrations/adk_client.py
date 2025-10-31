import os
import requests
from typing import Dict, Any

ADK_URL = os.getenv("ADK_AGENT_URL")

def call_adk(query: str, metadata: Dict[str, Any]) -> Dict:
    try:
        response = requests.post(
            ADK_URL,
            json={"query": query, "metadata": metadata},
            timeout=10
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise Exception(f"ADK call failed: {str(e)}")