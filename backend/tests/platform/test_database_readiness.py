import asyncio
from importlib import import_module

import pytest
from pytest import MonkeyPatch
from sqlalchemy.exc import SQLAlchemyError


class StubConnection:
    def __init__(
        self,
        *,
        error: SQLAlchemyError | None = None,
        block: bool = False,
    ) -> None:
        self.error = error
        self.block = block
        self.statements: list[str] = []

    async def __aenter__(self) -> "StubConnection":
        return self

    async def __aexit__(self, *args: object) -> None:
        return None

    async def execute(self, statement: object) -> None:
        self.statements.append(str(statement))
        if self.block:
            await asyncio.Event().wait()
        if self.error is not None:
            raise self.error


class StubEngine:
    def __init__(self, connection: StubConnection) -> None:
        self.connection_instance = connection
        self.disposed = False

    def connect(self) -> StubConnection:
        return self.connection_instance

    async def dispose(self) -> None:
        self.disposed = True


@pytest.mark.asyncio
async def test_readiness_executes_minimal_database_probe(
    monkeypatch: MonkeyPatch,
) -> None:
    readiness = import_module("shudekuai_api.platform.database.readiness")
    engine = StubEngine(StubConnection())
    monkeypatch.setattr(
        readiness, "create_async_engine", lambda *_args, **_kwargs: engine
    )
    probe = readiness.SqlAlchemyReadinessProbe(
        "postgresql+asyncpg://app:secret@localhost/shudekuai"
    )

    assert await probe.check() is True
    assert engine.connection_instance.statements == ["SELECT 1"]
    await probe.close()
    assert engine.disposed is True


@pytest.mark.asyncio
async def test_readiness_maps_database_failure_to_not_ready(
    monkeypatch: MonkeyPatch,
) -> None:
    readiness = import_module("shudekuai_api.platform.database.readiness")
    engine = StubEngine(StubConnection(error=SQLAlchemyError("unavailable")))
    monkeypatch.setattr(
        readiness, "create_async_engine", lambda *_args, **_kwargs: engine
    )
    probe = readiness.SqlAlchemyReadinessProbe(
        "postgresql+asyncpg://app:secret@localhost/shudekuai"
    )

    assert await probe.check() is False


@pytest.mark.asyncio
async def test_readiness_times_out_instead_of_hanging(monkeypatch: MonkeyPatch) -> None:
    readiness = import_module("shudekuai_api.platform.database.readiness")
    engine = StubEngine(StubConnection(block=True))
    monkeypatch.setattr(
        readiness, "create_async_engine", lambda *_args, **_kwargs: engine
    )
    probe = readiness.SqlAlchemyReadinessProbe(
        "postgresql+asyncpg://app:secret@localhost/shudekuai",
        timeout_seconds=0.001,
    )

    assert await probe.check() is False
