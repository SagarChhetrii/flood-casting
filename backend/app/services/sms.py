import base64
import json
import logging
import os
from urllib.parse import urlencode
from urllib.request import Request, urlopen

logger = logging.getLogger(__name__)


def send_sms(phone_number: str, message: str) -> str:
    """Deliver an SMS through Twilio when configured, otherwise log a local delivery."""
    sid = os.getenv("TWILIO_ACCOUNT_SID")
    token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_FROM_NUMBER")

    if not sid or not token or not from_number:
        logger.info("SMS (console mode) to %s: %s", phone_number, message)
        return "logged"

    body = urlencode({"To": phone_number, "From": from_number, "Body": message}).encode()
    auth = base64.b64encode(f"{sid}:{token}".encode()).decode()
    request = Request(
        f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json",
        data=body,
        headers={"Authorization": f"Basic {auth}"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=10) as response:
            if response.status >= 300:
                raise RuntimeError(f"Twilio returned HTTP {response.status}")
            json.load(response)
        return "sent"
    except Exception:
        logger.exception("SMS delivery failed for %s", phone_number)
        raise
