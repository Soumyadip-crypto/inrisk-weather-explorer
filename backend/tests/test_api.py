import json
import os

os.environ.setdefault(
    "GCS_BUCKET_NAME",
    "test-bucket",
)

from fastapi.testclient import TestClient

from app.dependencies import (
    get_open_meteo_client,
    get_storage_service,
)
from app.main import app
from app.services.storage import (
    FileNotFoundInStorage,
)


SAMPLE_DATA = {
    "latitude": 22.57,
    "longitude": 88.36,
    "daily_units": {
        "time": "iso8601",
        "temperature_2m_max": "°C",
        "temperature_2m_min": "°C",
        "apparent_temperature_max": "°C",
        "apparent_temperature_min": "°C",
    },
    "daily": {
        "time": [
            "2025-01-01",
        ],
        "temperature_2m_max": [
            28.1,
        ],
        "temperature_2m_min": [
            17.2,
        ],
        "apparent_temperature_max": [
            29.0,
        ],
        "apparent_temperature_min": [
            16.8,
        ],
    },
}


class FakeWeatherClient:

    async def fetch_historical_daily(
        self,
        payload,
    ):
        return json.dumps(SAMPLE_DATA)


class FakeStorage:

    def __init__(self):
        self.saved = {}

    def store_raw_json(
        self,
        file_name,
        raw_json,
    ):
        self.saved[file_name] = raw_json

    def list_weather_files(self):
        return [
            {
                "name": "weather_demo.json",
                "size": 123,
                "created_at":
                    "2025-01-01T00:00:00+00:00",
            }
        ]

    def get_json(self, file_name):

        if file_name == "missing.json":
            raise FileNotFoundInStorage(
                "not found"
            )

        return SAMPLE_DATA


fake_storage = FakeStorage()


app.dependency_overrides[
    get_open_meteo_client
] = lambda: FakeWeatherClient()


app.dependency_overrides[
    get_storage_service
] = lambda: fake_storage


client = TestClient(app)


def test_store_weather_data_success():

    response = client.post(
        "/store-weather-data",
        json={
            "latitude": 22.5726,
            "longitude": 88.3639,
            "start_date": "2025-01-01",
            "end_date": "2025-01-10",
        },
    )

    assert response.status_code == 200

    body = response.json()

    assert body["status"] == "ok"

    assert body["file"].startswith(
        "weather_22.5726_88.3639_"
        "2025-01-01_2025-01-10_"
    )


def test_invalid_latitude_returns_400():

    response = client.post(
        "/store-weather-data",
        json={
            "latitude": 120,
            "longitude": 0,
            "start_date": "2025-01-01",
            "end_date": "2025-01-02",
        },
    )

    assert response.status_code == 400

    assert (
        response.json()["status"]
        == "error"
    )


def test_list_weather_files():

    response = client.get(
        "/list-weather-files"
    )

    assert response.status_code == 200

    assert (
        response.json()["files"][0]["name"]
        == "weather_demo.json"
    )


def test_missing_file_returns_required_404():

    response = client.get(
        "/weather-file-content/missing.json"
    )

    assert response.status_code == 404

    assert response.json() == {
        "status": "error",
        "message": "not found",
    }