import re

_HIGH_BR_RE = re.compile(
    r'RAW|ᴿᴬᵂ|8K|⁸ᴷ|4K|⁴ᴷ|UHD|ᵁᴴᴰ|3840|60fps|⁶⁰ᶠᵖˢ',
    re.IGNORECASE,
)

_RADIO_RE = re.compile(r'\bradio\b|📻', re.IGNORECASE)

_ADULT_RE = re.compile(
    r'\bXXX\b|\b18\s*\+|\bADULT\b|\bEROTIC\b|\bPORN\b|\bHENTAI\b|\bNSFW\b|\bSEX\s*TV\b',
    re.IGNORECASE,
)


def is_high_bitrate(name: str) -> bool:
    return bool(_HIGH_BR_RE.search(name))


def is_radio(name: str = "", category: str = "") -> bool:
    return bool(_RADIO_RE.search(category) or _RADIO_RE.search(name))


def is_adult_content(name: str = "", category: str = "") -> bool:
    return bool(_ADULT_RE.search(category) or _ADULT_RE.search(name))
