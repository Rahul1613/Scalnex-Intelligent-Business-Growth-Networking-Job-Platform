from typing import Dict, Any, Optional
import requests
from datetime import datetime

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

SUPPORTED = (
    ("instagram.com", "instagram"),
    ("facebook.com", "facebook"),
    ("youtube.com", "youtube"),
    ("youtu.be", "youtube"),
)

def identify_platform(url: str) -> Optional[str]:
    u = (url or "").lower()
    for key, name in SUPPORTED:
        if key in u:
            return name
    return None


def fetch_public_page(url: str, timeout: int = 15) -> Dict[str, Any]:
    platform = identify_platform(url)
    if not platform:
        return {"success": False, "error": "Unsupported platform", "platform": None}
    try:
        resp = requests.get(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
        final_url = resp.url.lower()
        blocked_hosts = ("consent.youtube.com", "facebook.com/login", "instagram.com/accounts/login")
        interstitial = any(h in final_url for h in blocked_hosts)
        is_public = resp.status_code == 200 and (not interstitial)
        return {
            "success": resp.status_code == 200,
            "status": resp.status_code,
            "platform": platform,
            "url": url,
            "is_public": is_public,
            "html": resp.text if is_public else None,
            "fetched_at": datetime.utcnow().isoformat() + "Z",
            "note": ("Consent or login interstitial encountered" if interstitial else None),
        }
    except Exception as e:
        return {"success": False, "error": str(e), "platform": platform, "url": url}
