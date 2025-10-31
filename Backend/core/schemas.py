from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Evidence(BaseModel):
    title: Optional[str] = None
    snippet: Optional[str] = None
    url: Optional[str] = None

class Result(BaseModel):
    status: str
    verdict: str
    confidence: float = Field(ge=0.0, le=1.0)
    evidence: List[Evidence] = []

class RequestModel(BaseModel):
    text: str
    user: Dict[str, Any] = {}
    channel: str
    links: List[str] = []