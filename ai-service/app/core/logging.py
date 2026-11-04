import logging
import sys
from app.core.config import settings


def setup_logging():
    log_level = getattr(logging, settings.AI_SERVICE_LOG_LEVEL.upper(), logging.INFO)

    logging.basicConfig(
        level=log_level,
        format="%(asctime)s [%(levelname)s] [%(name)s]: %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )

    # Suppress verbose third-party logging
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)

    logger = logging.getLogger("ai_service")
    logger.info(f"Logging initialized with level {settings.AI_SERVICE_LOG_LEVEL}")
    return logger
