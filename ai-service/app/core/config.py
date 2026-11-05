import os
from typing import List
from dotenv import load_dotenv

# Load local environment variables from .env file
load_dotenv(override=True)


class Settings:
    PROJECT_NAME: str = "AlumniConnect AI Intelligence Subsystem"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Server Settings
    AI_SERVICE_HOST: str = os.getenv("AI_SERVICE_HOST", "0.0.0.0")
    AI_SERVICE_PORT: int = int(os.getenv("AI_SERVICE_PORT", "8000"))
    AI_SERVICE_LOG_LEVEL: str = os.getenv("AI_SERVICE_LOG_LEVEL", "info")

    # Internal Security Secret (Must match NestJS backend)
    INTERNAL_API_SECRET_KEY: str = os.getenv(
        "INTERNAL_API_SECRET_KEY",
        "dev_internal_shared_secret_between_backend_and_ai_service_32b",
    )

    # CORS
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:4000",
        ).split(",")
        if origin.strip()
    ]

    # External APIs & AI Model Credentials
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GITHUB_PERSONAL_ACCESS_TOKEN: str = os.getenv("GITHUB_PERSONAL_ACCESS_TOKEN", "")
    SEMGREP_APP_TOKEN: str = os.getenv("SEMGREP_APP_TOKEN", "")
    SONARQUBE_TOKEN: str = os.getenv("SONARQUBE_TOKEN", "")
    SONARQUBE_HOST_URL: str = os.getenv("SONARQUBE_HOST_URL", "https://sonarcloud.io")

    # Storage & Cache
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    MODEL_CACHE_DIR: str = os.getenv("MODEL_CACHE_DIR", "./app/models/weights")


settings = Settings()
