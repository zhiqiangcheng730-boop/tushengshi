from importlib import import_module
from typing import Any, cast

import pytest
from pydantic import ValidationError
from pytest import MonkeyPatch


def _settings_type() -> type[Any]:
    settings_type = import_module("shudekuai_api.platform.config.settings").Settings
    return cast("type[Any]", settings_type)


def test_settings_accept_async_postgresql_url() -> None:
    settings_type = _settings_type()

    settings = settings_type(
        database_url="postgresql+asyncpg://app:secret@localhost/shudekuai"
    )

    assert settings.database_url.get_secret_value().endswith("/shudekuai")


@pytest.mark.parametrize(
    "database_url",
    [
        "postgresql://app:secret@localhost/shudekuai",
        "sqlite+aiosqlite:///local.db",
        "postgresql+asyncpg://app:secret@localhost",
        "not-a-database-url",
    ],
)
def test_settings_rejects_unsupported_or_incomplete_database_url(
    database_url: str,
) -> None:
    settings_type = _settings_type()

    with pytest.raises(ValidationError):
        settings_type(database_url=database_url)


def test_secret_is_not_exposed_by_repr_or_serialization() -> None:
    settings_type = _settings_type()
    secret = "never-print-this"
    settings = settings_type(
        database_url=f"postgresql+asyncpg://app:{secret}@localhost/shudekuai"
    )

    assert secret not in repr(settings)
    assert secret not in str(settings.model_dump())


def test_load_settings_reads_prefixed_environment(monkeypatch: MonkeyPatch) -> None:
    settings_module = import_module("shudekuai_api.platform.config.settings")
    settings_module.load_settings.cache_clear()
    monkeypatch.setenv(
        "SHUDEKUAI_DATABASE_URL",
        "postgresql+asyncpg://app:environment-only@localhost/shudekuai",
    )

    settings = settings_module.load_settings()

    assert settings.environment == "local"
    settings_module.load_settings.cache_clear()
