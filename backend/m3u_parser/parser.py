"""
Parser M3U/M3U8 : extrait name, logo, group-title, URL de chaque entrée.
"""
import re
import requests
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class M3UEntry:
    name: str
    url: str
    logo: str = ""
    group: str = ""
    language: str = ""
    tvg_id: str = ""


def parse_m3u_text(text: str) -> List[M3UEntry]:
    entries = []
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith("#EXTINF"):
            entry = _parse_extinf(line)
            # Next non-empty line is the URL
            i += 1
            while i < len(lines) and not lines[i].strip():
                i += 1
            if i < len(lines):
                url = lines[i].strip()
                if url and not url.startswith("#"):
                    entry.url = url
                    entries.append(entry)
        i += 1
    return entries


def _parse_extinf(line: str) -> M3UEntry:
    entry = M3UEntry(name="", url="")

    # Extract name (after last comma)
    name_match = re.search(r',(.+)$', line)
    if name_match:
        entry.name = name_match.group(1).strip()

    # Extract attributes
    attrs = {
        "tvg-logo": "logo",
        "group-title": "group",
        "tvg-language": "language",
        "tvg-id": "tvg_id",
    }
    for attr, field_name in attrs.items():
        pattern = rf'{attr}="([^"]*)"'
        match = re.search(pattern, line, re.IGNORECASE)
        if match:
            setattr(entry, field_name, match.group(1).strip())

    return entry


def parse_m3u_from_url(url: str, timeout: int = 30) -> List[M3UEntry]:
    resp = requests.get(url, timeout=timeout, headers={"User-Agent": "FasoTV/1.0"})
    resp.raise_for_status()
    return parse_m3u_text(resp.text)


def parse_m3u_from_file(file_obj) -> List[M3UEntry]:
    text = file_obj.read()
    if isinstance(text, bytes):
        text = text.decode("utf-8", errors="replace")
    return parse_m3u_text(text)
