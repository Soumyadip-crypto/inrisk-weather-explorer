from functools import lru_cache

from app.config import get_settings
from app.services.open_meteo import (
    OpenMeteoClient,
)
from app.services.storage import (
    S3StorageService,
)


@lru_cache
def get_open_meteo_client() -> OpenMeteoClient:
    return OpenMeteoClient(
        get_settings()
    )


@lru_cache
def get_storage_service() -> S3StorageService:
    return S3StorageService(
        get_settings()
    )