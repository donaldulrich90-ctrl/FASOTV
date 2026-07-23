import re


def parse_category(name: str, pattern: str = "") -> dict:
    """Parse a category name using the provided regex pattern.

    Returns {"raw": name, "prefix": str|None, "label": str}.
    Group 1 = prefix, group 2 = label.  Falls back to raw name when
    the pattern is empty, invalid, or doesn't match.
    """
    if pattern:
        try:
            m = re.match(pattern, name)
            if m:
                groups = m.groups()
                prefix = groups[0] if len(groups) > 0 else None
                label = groups[1].strip() if len(groups) > 1 else name
                return {"raw": name, "prefix": prefix, "label": label}
        except re.error:
            pass
    return {"raw": name, "prefix": None, "label": name}
