"""数据库连接生命周期与就绪检查。"""

from asyncio import timeout
from typing import Protocol

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine


class ReadinessProbe(Protocol):
    async def check(self) -> bool: ...

    async def close(self) -> None: ...


class SqlAlchemyReadinessProbe:
    def __init__(self, database_url: str, *, timeout_seconds: float = 2.0) -> None:
        if timeout_seconds <= 0:
            raise ValueError("就绪检查超时必须大于 0")
        self._timeout_seconds = timeout_seconds
        self._engine: AsyncEngine = create_async_engine(
            database_url,
            pool_pre_ping=True,
        )

    async def check(self) -> bool:
        try:
            async with timeout(self._timeout_seconds):
                async with self._engine.connect() as connection:
                    await connection.execute(text("SELECT 1"))
        except (TimeoutError, SQLAlchemyError):
            return False
        return True

    async def close(self) -> None:
        await self._engine.dispose()
