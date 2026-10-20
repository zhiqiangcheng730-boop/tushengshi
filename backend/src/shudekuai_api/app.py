"""FastAPI 应用组合根。"""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, Request, Response
from starlette.middleware.base import RequestResponseEndpoint

from shudekuai_api.platform.config import Settings, load_settings
from shudekuai_api.platform.database import ReadinessProbe, SqlAlchemyReadinessProbe
from shudekuai_api.platform.http.errors import (
    ApiError,
    api_error_handler,
    unhandled_error_handler,
)
from shudekuai_api.platform.http.health import router as platform_router


def create_app(
    *,
    settings: Settings | None = None,
    readiness_probe: ReadinessProbe | None = None,
) -> FastAPI:
    resolved_settings = settings or load_settings()
    resolved_probe = readiness_probe or SqlAlchemyReadinessProbe(
        resolved_settings.database_url.get_secret_value()
    )

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        yield
        await app.state.readiness_probe.close()

    app = FastAPI(
        title="数得快 API",
        version="1.0.0",
        lifespan=lifespan,
        docs_url=None if resolved_settings.environment == "production" else "/docs",
        redoc_url=None if resolved_settings.environment == "production" else "/redoc",
        openapi_url=(
            None if resolved_settings.environment == "production" else "/openapi.json"
        ),
    )
    app.state.settings = resolved_settings
    app.state.readiness_probe = resolved_probe

    @app.middleware("http")
    async def attach_request_id(
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        request_id = str(uuid4())
        request.state.request_id = request_id
        response: Response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

    app.add_exception_handler(ApiError, api_error_handler)  # type: ignore[arg-type]
    app.add_exception_handler(
        Exception,
        unhandled_error_handler,
    )
    app.include_router(platform_router)
    return app
