from slowapi import Limiter
from slowapi.util import get_remote_address


# Create the application rate limiter.
#
# The user's IP address is used as the default
# identifier for rate limiting.
limiter = Limiter(
    key_func=get_remote_address,
)