from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from fastapi.responses import JSONResponse

from app.dependencies import (
    get_open_meteo_client,
    get_storage_service,
)
from app.models import (
    StoreWeatherRequest,
    StoreWeatherResponse,
    WeatherFileListResponse,
)
from app.services.open_meteo import (
    OpenMeteoClient,
    OpenMeteoError,
)
from app.services.storage import (
    FileNotFoundInStorage,
    S3StorageService,
    StorageError,
    build_weather_filename,
)


router = APIRouter()


@router.get("/health")
def health():
    return {
        "status": "ok",
    }


@router.post(
    "/store-weather-data",
    response_model=StoreWeatherResponse,
)
async def store_weather_data(
    payload: StoreWeatherRequest,
    weather_client: OpenMeteoClient = Depends(
        get_open_meteo_client
    ),
    storage_service: S3StorageService = Depends(
        get_storage_service
    ),
):
    try:
        raw_json = (
            await weather_client
            .fetch_historical_daily(payload)
        )

        file_name = build_weather_filename(
            latitude=payload.latitude,
            longitude=payload.longitude,
            start_date=payload.start_date.isoformat(),
            end_date=payload.end_date.isoformat(),
        )

        storage_service.store_raw_json(
            file_name,
            raw_json,
        )

        return StoreWeatherResponse(
            file=file_name
        )

    except OpenMeteoError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    except StorageError as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc


@router.get(
    "/list-weather-files",
    response_model=WeatherFileListResponse,
)
def list_weather_files(
    storage_service: S3StorageService = Depends(
        get_storage_service
    ),
):
    try:
        return {
            "files":
                storage_service.list_weather_files()
        }

    except StorageError as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc


@router.get(
    "/weather-file-content/{file_name:path}"
)
def weather_file_content(
    file_name: str,
    storage_service: S3StorageService = Depends(
        get_storage_service
    ),
):
    try:
        return storage_service.get_json(
            file_name
        )

    except FileNotFoundInStorage:
        return JSONResponse(
            status_code=404,
            content={
                "status": "error",
                "message": "not found",
            },
        )

    except StorageError as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc