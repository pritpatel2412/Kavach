"""Guardian alerts. MVP = Telegram bot. Without a token it only logs (safe for tests/demo)."""
import logging

import httpx

log = logging.getLogger("kavach.alerts")


async def send_guardian_alert(token: str, chat_id: str, level: int, stages: list[str], excerpt: str,
                              elder_name: str = "your family member",
                              timeline_url: str = "",
                              action_url: str = "") -> bool:
    text = (f"Kavach alert (level {level}): a suspicious call is in progress for {elder_name}.\n"
            f"Stages heard: {', '.join(stages) or 'n/a'}.\nExcerpt: {excerpt[:160]}\n"
            f"Please call them now. Cyber helpline: 1930.")
    if timeline_url:
        text += f"\nTimeline: {timeline_url}"
    if action_url:
        text += f"\n🚨 Action & Intercom: {action_url}"
    if not token or not chat_id:
        log.info("[alert not sent: no Telegram config] %s", text)
        return False
    try:
        async with httpx.AsyncClient(timeout=8.0) as c:
            r = await c.post(f"https://api.telegram.org/bot{token}/sendMessage",
                             json={"chat_id": chat_id, "text": text})
        return r.status_code == 200
    except Exception as e:  # never let an alert failure break the call flow
        log.warning("telegram alert failed: %s", e)
        return False


async def send_offline_alert(token: str, chat_id: str, elder_name: str = "your family member",
                             last_seen_s: float = 90.0) -> bool:
    text = (f"⚠️ Kavach Device Offline Alert: Kavach listening device for {elder_name} has stopped responding.\n"
            f"No heartbeat received for {int(last_seen_s)} seconds while armed.\n"
            f"Please check the elder's device to ensure it is plugged in and Kavach is running.")
    if not token or not chat_id:
        log.info("[offline alert not sent: no Telegram config] %s", text)
        return False
    try:
        async with httpx.AsyncClient(timeout=8.0) as c:
            r = await c.post(f"https://api.telegram.org/bot{token}/sendMessage",
                             json={"chat_id": chat_id, "text": text})
        return r.status_code == 200
    except Exception as e:
        log.warning("telegram offline alert failed: %s", e)
        return False
