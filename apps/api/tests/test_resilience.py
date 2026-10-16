import asyncio

from app.alerts import send_guardian_alert
from app.gnani.stt_stream import SttConnection, roll_at_s
from app.interventions import InterventionManager
from app.session import SILENCE_FRAME, gated_audio


class _Close:
    code = 1006
    reason = "test"


class FakeWs:
    def __init__(self, recvs=None):
        self.sent = []
        self._recvs = list(recvs or [])
        self.closed = False
        self._i = 0

    async def send(self, data):
        self.sent.append(data)

    async def recv(self):
        if self._i >= len(self._recvs):
            await asyncio.sleep(0.05)
            raise asyncio.TimeoutError()
        item = self._recvs[self._i]
        self._i += 1
        if isinstance(item, BaseException):
            raise item
        await asyncio.sleep(0)
        return item

    async def close(self):
        self.closed = True


def test_stt_reconnects_on_closed_socket():
    import websockets.exceptions as wex
    from websockets.frames import Close

    n = {"c": 0}

    async def go():
        async def connector():
            n["c"] += 1
            if n["c"] == 1:
                return FakeWs([wex.ConnectionClosedError(Close(1006, "drop"), None)])
            return FakeWs(['{"type":"connected"}',
                           '{"type":"transcript","text":"hi","segment_index":0}'])

        stt = SttConnection({"x-api-key-id": "k", "lang_code": "hi-IN"}, connector=connector)
        await stt.open()
        evs = []
        async for ev in stt.events():
            evs.append(ev)
            if ev.get("type") == "transcript":
                break
        await stt.close()
        assert n["c"] >= 2
        assert evs[-1]["type"] == "transcript"

    asyncio.run(go())


def test_stt_roll_env_overridable(monkeypatch):
    monkeypatch.setenv("STT_ROLL_AT_S", "0.01")
    assert roll_at_s() == 0.01

    async def go():
        n = {"c": 0}

        async def connector():
            n["c"] += 1
            return FakeWs([])

        stt = SttConnection({"x-api-key-id": "k", "lang_code": "hi-IN"}, connector=connector)
        await stt.open()
        stt.started -= 1

        async def collect():
            async for _ in stt.events():
                pass

        task = asyncio.create_task(collect())
        await asyncio.sleep(1.2)
        stt._closing = True
        task.cancel()
        try:
            await task
        except (asyncio.CancelledError, Exception):
            pass
        assert n["c"] >= 2

    asyncio.run(go())


def test_echo_gate_substitutes_silence():
    noisy = b"\xff" * 1024
    assert gated_audio(noisy, True) == SILENCE_FRAME
    assert gated_audio(noisy, False) == noisy
    assert gated_audio(noisy * 2, True) == SILENCE_FRAME * 2


def test_missing_clip_is_text_only(tmp_path):
    m = InterventionManager(tmp_path / "no-clips", "hi-IN")
    p = m.decide(2)
    assert p["clip_url"] is None
    assert p["screen_text"]


def test_telegram_failure_returns_false_never_raises(monkeypatch):
    class BoomClient:
        def __init__(self, *a, **k):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *a):
            return False

        async def post(self, *a, **k):
            raise RuntimeError("network down")

    monkeypatch.setattr("app.alerts.httpx.AsyncClient", BoomClient)

    async def go():
        ok = await send_guardian_alert("tok", "chat", 2, ["S1_authority"], "excerpt")
        assert ok is False

    asyncio.run(go())
