import json
from datetime import datetime, timezone
from typing import Any

import boto3
from botocore.exceptions import (
    BotoCoreError,
    ClientError,
)

from app.config import Settings


class StorageError(RuntimeError):
    pass


class FileNotFoundInStorage(StorageError):
    pass


def coordinate_for_filename(value: float) -> str:
    return (
        f"{value:.6f}"
        .rstrip("0")
        .rstrip(".")
    )


def build_weather_filename(
    latitude: float,
    longitude: float,
    start_date: str,
    end_date: str,
) -> str:

    timestamp = datetime.now(
        timezone.utc
    ).strftime("%Y%m%dT%H%M%S%fZ")

    latitude_text = coordinate_for_filename(
        latitude
    )

    longitude_text = coordinate_for_filename(
        longitude
    )

    return (
        f"weather_"
        f"{latitude_text}_"
        f"{longitude_text}_"
        f"{start_date}_"
        f"{end_date}_"
        f"{timestamp}.json"
    )


class S3StorageService:
    def __init__(self, settings: Settings):

        if not settings.s3_bucket_name:
            raise StorageError(
                "S3_BUCKET_NAME is not configured"
            )

        self.bucket_name = (
            settings.s3_bucket_name
        )

        client_options = {
            "region_name": settings.aws_region,
        }

        # Local development can use IAM access keys.
        # In production, no keys are required here if
        # the service runs with an IAM role.
        if (
            settings.aws_access_key_id
            and settings.aws_secret_access_key
        ):
            client_options[
                "aws_access_key_id"
            ] = settings.aws_access_key_id

            client_options[
                "aws_secret_access_key"
            ] = settings.aws_secret_access_key

        self.client = boto3.client(
            "s3",
            **client_options,
        )

    def store_raw_json(
        self,
        file_name: str,
        raw_json: str,
    ) -> None:

        try:
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=file_name,
                Body=raw_json.encode("utf-8"),
                ContentType="application/json",
            )

        except (
            ClientError,
            BotoCoreError,
        ) as exc:

            raise StorageError(
                "Unable to store weather data "
                "in Amazon S3"
            ) from exc

    def list_weather_files(
        self,
    ) -> list[dict[str, Any]]:

        try:
            paginator = (
                self.client.get_paginator(
                    "list_objects_v2"
                )
            )

            pages = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix="weather_",
            )

            files = []

            for page in pages:

                for item in page.get(
                    "Contents",
                    [],
                ):
                    last_modified = item.get(
                        "LastModified"
                    )

                    files.append(
                        {
                            "name": item["Key"],
                            "size": int(
                                item.get(
                                    "Size",
                                    0,
                                )
                            ),
                            "created_at": (
                                last_modified
                                .astimezone(
                                    timezone.utc
                                )
                                .isoformat()
                                if last_modified
                                else ""
                            ),
                        }
                    )

            files.sort(
                key=lambda file: (
                    file["created_at"]
                ),
                reverse=True,
            )

            return files

        except (
            ClientError,
            BotoCoreError,
        ) as exc:

            raise StorageError(
                "Unable to list weather files"
            ) from exc

    def get_json(
        self,
        file_name: str,
    ) -> dict[str, Any]:

        if (
            not file_name.startswith(
                "weather_"
            )
            or "/" in file_name
            or "\\" in file_name
            or not file_name.endswith(
                ".json"
            )
        ):
            raise FileNotFoundInStorage(
                "not found"
            )

        try:
            response = self.client.get_object(
                Bucket=self.bucket_name,
                Key=file_name,
            )

            raw_json = (
                response["Body"]
                .read()
                .decode("utf-8")
            )

            return json.loads(raw_json)

        except ClientError as exc:

            error_code = (
                exc.response
                .get("Error", {})
                .get("Code")
            )

            if error_code in {
                "NoSuchKey",
                "404",
                "NotFound",
            }:
                raise FileNotFoundInStorage(
                    "not found"
                ) from exc

            raise StorageError(
                "Unable to read weather file"
            ) from exc

        except json.JSONDecodeError as exc:

            raise StorageError(
                "Stored weather file "
                "contains invalid JSON"
            ) from exc

        except BotoCoreError as exc:

            raise StorageError(
                "Unable to read weather file"
            ) from exc