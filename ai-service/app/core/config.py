from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AlumniConnect AI Service"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Server settings
    AI_SERVICE_HOST: str = "0.0.0.0"
    AI_SERVICE_PORT: int = 8000
    AI_SERVICE_LOG_LEVEL: str = "info"

    # Security
    INTERNAL_API_SECRET_KEY: str = "dev_internal_shared_secret_between_backend_and_ai_service_32b"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4000",
    ]

    # Optional Integrations
    REDIS_URL: str = "redis://localhost:6379/0"
    GITHUB_PERSONAL_ACCESS_TOKEN: str = ""
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
