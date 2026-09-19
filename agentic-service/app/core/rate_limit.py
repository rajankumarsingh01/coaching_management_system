from slowapi import Limiter
from slowapi.util import get_remote_address

# get_remote_address — request ke IP se limit track karta hai. Tumhare
# case mein saare requests Node backend se aate hain (same IP), isliye
# yeh effectively "poore service ka ek shared limit" ban jaata hai —
# jo OpenRouter free-tier quota ko protect karne ke liye hi chahiye.
limiter = Limiter(key_func=get_remote_address)