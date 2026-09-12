from datetime import date

from pydantic import BaseModel, Field, model_validator


class StoreWeatherRequest(BaseModel):
    latitude: float = Field(
        ...,
        ge=-90,
        le=90,
    )

    longitude: float = Field(
        ...,
        ge=-180,
        le=180,
    )

    start_date: date
    end_date: date

    @model_validator(mode="after")
    def validate_date_range(self):
        if self.start_date > self.end_date:
            raise ValueError(
                "start_date must be less than or equal to end_date"
            )

        inclusive_days = (
            self.end_date - self.start_date
        ).days + 1

        if inclusive_days > 31:
            raise ValueError(
                "date range must be 31 days or fewer"
            )

        return self


class StoreWeatherResponse(BaseModel):
    status: str = "ok"
    file: str


class WeatherFileMeta(BaseModel):
    name: str
    size: int
    created_at: str


class WeatherFileListResponse(BaseModel):
    files: list[WeatherFileMeta]