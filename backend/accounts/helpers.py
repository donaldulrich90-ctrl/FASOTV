import time


def adult_allowed(request) -> bool:
    """Return True if the current request can see adult content."""
    u = request.user
    if not u.is_authenticated or not u.adult_enabled:
        return False
    until = request.session.get("adult_unlocked_until")
    return bool(until and until > time.time())
