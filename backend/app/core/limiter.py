"""P1: Shared slowapi Limiter instance.
Import this module in any router that needs per-endpoint rate limits.
key_func uses the authenticated user ID when available, falling back to IP.
"""
import os
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request


def _get_user_or_ip(request: Request) -> str:
    """Rate-limit by user ID when authenticated, otherwise by remote IP."""
    # The JWT dependency stores the current user on request.state after auth.
    user = getattr(request.state, "current_user_id", None)
    if user:
        return str(user)
    return get_remote_address(request)


# P1: Disable rate-limiting during automated testing
is_testing = os.getenv("TESTING", "false").lower() == "true"
print(f"DEBUG: Rate Limiter is_testing={is_testing}")

# If testing, we use a high limit or disable it entirely.
# Some versions of slowapi might not respect 'enabled' as expected in all contexts.
limit_value = "1000/minute" if is_testing else "200/minute"

limiter = Limiter(
    key_func=_get_user_or_ip, 
    default_limits=[limit_value],
    enabled=not is_testing
)
