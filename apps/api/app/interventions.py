"""Chooses which pre-rendered warning to play, never repeating a level inside the cooldown (FR-13)."""
from __future__ import annotations

import time
from pathlib import Path

import yaml

from .config import ROOT


def load_warnings() -> dict:
    return yaml.safe_load((ROOT / "assets" / "warnings.yaml").read_text(encoding="utf-8"))


class InterventionManager:
    def __init__(self, clips_dir: Path, lang: str, profile: str = "default", cooldown_s: float = 45.0,
                 clock=time.monotonic, elder_name: str = "आप", guardian_name: str = "Kavach", gender: str = "m"):
        self.clips_dir, self.lang, self.profile = clips_dir, lang, profile
        self.cooldown_s, self._clock = cooldown_s, clock
        self.elder_name, self.guardian_name, self.gender = elder_name, guardian_name, gender
        self._last_level = 0
        self._last_time = -1e9
        self._warnings = load_warnings()

    def _copy(self, level: int) -> dict:
        by_lang = self._warnings.get(self.lang) or self._warnings["en-IN"]
        raw = by_lang[level]
        from .clips import format_clip_text
        return {
            "screen_text": raw["screen_text"],
            "clip_text": format_clip_text(raw, elder_name=self.elder_name, guardian_name=self.guardian_name, gender=self.gender),
        }

    def clip_url(self, level: int) -> str | None:
        for prof in (self.profile, "default"):
            p = self.clips_dir / prof / f"{self.lang}_L{level}.wav"
            if p.exists():
                return f"/clips/{prof}/{self.lang}_L{level}.wav"
        return None

    def decide(self, level: int) -> dict | None:
        """Return an intervene payload, or None if nothing should play now."""
        if level < 1:
            return None
        now = self._clock()
        if level <= self._last_level and now - self._last_time < self.cooldown_s:
            return None
        if level < self._last_level:
            return None
        self._last_level, self._last_time = level, now
        copy = self._copy(level)
        return {"type": "intervene", "level": level, "clip_url": self.clip_url(level),
                "screen_text": copy["screen_text"], "clip_text": copy["clip_text"]}
