from core.schemas import RequestModel, Result, Evidence
from integrations.adk_client import call_adk

def verify(req: RequestModel) -> Result:
    try:
        adk_response = call_adk(req.text, {"channel": req.channel, "user": req.user})
        evidence = [Evidence(**e) for e in adk_response.get("evidence", [])[:3]]
        
        return Result(
            status="ok",
            verdict=adk_response.get("verdict", "unverified"),
            confidence=float(adk_response.get("confidence", 0.5)),
            evidence=evidence
        )
    except Exception as e:
        return Result(
            status="error",
            verdict="unverified",
            confidence=0.0,
            evidence=[]
        )