import asyncio

from app.llm import blend_score, second_opinion
from kavach_detector import level_for


def test_second_opinion_blends_and_rules_win_on_failure():
    async def run():
        async def good(messages, key):
            return '{"scam_probability":0.9,"stages":["S1_authority"],"reason":"authority plus secrecy"}'

        op = await second_opinion(["I am from CBI"], ["CBI"], 40, client=good, provider="groq", api_key="x")
        assert op["scam_probability"] == 0.9
        blended = blend_score(40, op)
        assert 40 < blended <= 65
        assert level_for(blended) >= 1

        async def bad(messages, key):
            raise TimeoutError()

        assert await second_opinion(["x"], [], 40, client=bad, provider="groq", api_key="x") is None
        assert blend_score(40, None) == 40

    asyncio.run(run())


def test_outside_band_and_off_by_default():
    async def run():
        async def should_not_run(*a, **k):
            raise AssertionError("must not be called")

        assert await second_opinion(["x"], [], 10, client=should_not_run, provider="groq", api_key="x") is None
        assert await second_opinion(["x"], [], 40, client=should_not_run, provider="", api_key="x") is None

    asyncio.run(run())
