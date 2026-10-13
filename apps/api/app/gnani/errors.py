class GnaniError(Exception):
    def __init__(self, status: int, body: str, hint: str = ""):
        self.status, self.body, self.hint = status, body, hint
        super().__init__(f"Gnani API error {status}: {body[:300]} {hint}")


def hint_for(status: int) -> str:
    return {
        400: "Bad request: check parameters/voice name.",
        401: "Check GNANI_API_KEY (header X-API-Key-ID).",
        403: "Forbidden: invalid key OR credits exhausted. Check the dashboard balance.",
        429: "Rate limited: back off and retry.",
        500: "Server error: retry with backoff.",
        503: "Service unavailable: retry with backoff.",
    }.get(status, "")
