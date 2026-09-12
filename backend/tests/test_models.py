from datetime import date

import pytest
from pydantic import ValidationError

from app.models import StoreWeatherRequest


def test_valid_31_day_range_is_allowed():

    payload = StoreWeatherRequest(
        latitude=22.5726,
        longitude=88.3639,
        start_date=date(2025, 1, 1),
        end_date=date(2025, 1, 31),
    )

    assert payload.latitude == 22.5726


def test_more_than_31_days_is_rejected():

    with pytest.raises(ValidationError):

        StoreWeatherRequest(
            latitude=0,
            longitude=0,
            start_date=date(2025, 1, 1),
            end_date=date(2025, 2, 1),
        )


def test_start_after_end_is_rejected():

    with pytest.raises(ValidationError):

        StoreWeatherRequest(
            latitude=0,
            longitude=0,
            start_date=date(2025, 2, 1),
            end_date=date(2025, 1, 1),
        )


def test_invalid_latitude_is_rejected():

    with pytest.raises(ValidationError):

        StoreWeatherRequest(
            latitude=100,
            longitude=0,
            start_date=date(2025, 1, 1),
            end_date=date(2025, 1, 2),
        )