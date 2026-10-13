"""Loads stage dictionaries (YAML) and pre-normalises phrases."""
from pathlib import Path
import yaml

from .normalise import normalise

DEFAULT_PATH = Path(__file__).parent / "dictionaries" / "default.yaml"


def load_dictionary(path: str | Path | None = None) -> dict[str, list[str]]:
    p = Path(path) if path else DEFAULT_PATH
    raw = yaml.safe_load(p.read_text(encoding="utf-8"))
    out: dict[str, list[str]] = {}
    for stage, phrases in raw.items():
        seen, cleaned = set(), []
        for ph in phrases:
            n = normalise(str(ph))
            if n and n not in seen:
                seen.add(n)
                cleaned.append(n)
        out[stage] = cleaned
    return out
