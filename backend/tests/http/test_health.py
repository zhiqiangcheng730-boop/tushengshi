from importlib import import_module
from typing import cast
from uuid import UUID

from fastapi import FastAPI
from fastapi.testclient import TestClient


class StubReadinessProbe:
    def __init__(self, ready: bool) -> None:
        self.ready = ready
        self.closed = False

    async def check(self) -> bool:
        return self.ready

    async def close(self) -> None:
        self.closed = True


def _client(*, ready: bool = True) -> TestClient:
    settings_module = import_module("shudekuai_api.platform.config.settings")
    app_module = import_module("shudekuai_api.app")
    settings = settings_module.Settings(
        database_url="postgresql+asyncpg://app:secret@localhost/shudekuai",
        release_id="test-release",
        contract_id="shudekuai-api-v1",
    )
    app = app_module.create_app(
        settings=settings,
        readiness_probe=StubReadinessProbe(ready),
    )
    return TestClient(app)


def test_liveness_returns_status_and_request_id() -> None:
    with _client() as client:
        response = client.get("/livez")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    UUID(response.headers["X-Request-ID"])


def test_readiness_reports_database_availability() -> None:
    with _client(ready=True) as client:
        response = client.get("/readyz")

    assert response.status_code == 200
    assert response.json() == {"status": "ready"}


def test_readiness_failure_uses_stable_safe_error_shape() -> None:
    with _client(ready=False) as client:
        response = client.get("/readyz")

    body = response.json()
    assert response.status_code == 503
    assert body == {
        "code": "service_not_ready",
        "message": "服务暂未就绪",
        "requestId": response.headers["X-Request-ID"],
        "retryable": True,
    }
    UUID(body["requestId"])
    assert "secret" not in response.text


def test_version_exposes_release_and_contract_but_not_configuration() -> None:
    with _client() as client:
        response = client.get("/version")

    assert response.status_code == 200
    assert response.json() == {
        "service": "shudekuai-api",
        "release": "test-release",
        "contractId": "shudekuai-api-v1",
    }
    assert "database" not in response.text.lower()


def test_unhandled_error_is_mapped_without_internal_details() -> None:
    client = _client()
    app = cast("FastAPI", client.app)

    @app.get("/explode")
    async def explode() -> None:
        raise RuntimeError("sensitive-internal-detail")

    with TestClient(app, raise_server_exceptions=False) as safe_client:
        response = safe_client.get("/explode")

    assert response.status_code == 500
    assert response.json() == {
        "code": "internal_error",
        "message": "服务发生内部错误",
        "requestId": response.headers["X-Request-ID"],
        "retryable": False,
    }
    assert "sensitive-internal-detail" not in response.text


def test_production_disables_interactive_api_documentation() -> None:
    settings_module = import_module("shudekuai_api.platform.config.settings")
    app_module = import_module("shudekuai_api.app")
    settings = settings_module.Settings(
        database_url="postgresql+asyncpg://app:secret@localhost/shudekuai",
        environment="production",
    )

    app = app_module.create_app(
        settings=settings,
        readiness_probe=StubReadinessProbe(True),
    )

    assert app.docs_url is None
    assert app.redoc_url is None
    assert app.openapi_url is None
