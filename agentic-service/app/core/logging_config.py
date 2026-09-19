import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    stream=sys.stdout,   # Render/uvicorn dono stdout ko capture karte hain
)

logger = logging.getLogger("agentic_service")