import httpx

from app.config import Settings
from app.models import StoreWeatherRequest


DAILY_VARIABLES = [
    "temperature_2m_max",
    "temperature_2m_min",
    "apparent_temperature_max",
    "apparent_temperature_min",
]


class OpenMeteoError(RuntimeError):
    pass


class OpenMeteoClient:
    def __init__(self, settings: Settings):
        self.base_url = settings.open_meteo_base_url
        self.timeout = settings.request_timeout_seconds

    async def fetch_historical_daily(
        self,
        payload: StoreWeatherRequest,
    ) -> str:

        params = {
            "latitude": payload.latitude,
            "longitude": payload.longitude,
            "start_date": payload.start_date.isoformat(),
            "end_date": payload.end_date.isoformat(),
            "daily": ",".join(DAILY_VARIABLES),
            "timezone": "UTC",
        }

        try:
            async with httpx.AsyncClient(
                timeout=self.timeout
            ) as client:

                response = await client.get(
                    self.base_url,
                    params=params,
                )

                response.raise_for_status()

                # Check that Open-Meteo really returned JSON.
                response.json()

                # Keep original response text so the complete
                # raw JSON is stored in cloud storage.
                return response.text

        except httpx.HTTPStatusError as exc:
            raise OpenMeteoError(
                f"Open-Meteo returned HTTP "
                f"{exc.response.status_code}"
            ) from exc

        except (httpx.RequestError, ValueError) as exc:
            raise OpenMeteoError(
                "Unable to retrieve valid JSON from Open-Meteo"
            ) from exc