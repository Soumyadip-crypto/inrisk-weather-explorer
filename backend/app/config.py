from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "InRisk Weather Explorer API"

    aws_region: str = "ap-south-1"
    s3_bucket_name: str = ""

    aws_access_key_id: str | None = None
    aws_secret_access_key: str | None = None

    cors_origins: str = "http://localhost:5173"

    open_meteo_base_url: str = (
        "https://archive-api.open-meteo.com/v1/archive"
    )

    request_timeout_seconds: float = 20.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()