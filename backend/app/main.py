from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum

from app.api.routes import router
from app.config import get_settings


settings = get_settings()


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description=(
        "Fetch historical weather data, "
        "store raw JSON in Amazon S3, "
        "and visualize stored datasets."
    ),
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=[
        "GET",
        "POST",
        "OPTIONS",
    ],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    errors = []

    for error in exc.errors():
        location = ".".join(
            str(part)
            for part in error.get("loc", [])
            if part != "body"
        )

        errors.append(
            {
                "field": location or "request",
                "message": error.get(
                    "msg",
                    "invalid value",
                ),
            }
        )

    return JSONResponse(
        status_code=400,
        content={
            "status": "error",
            "message": "validation failed",
            "errors": errors,
        },
    )


@app.exception_handler(Exception)
async def unexpected_exception_handler(
    request: Request,
    exc: Exception,
):
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "internal server error",
        },
    )


app.include_router(router)


# AWS Lambda entry point
handler = Mangum(app)