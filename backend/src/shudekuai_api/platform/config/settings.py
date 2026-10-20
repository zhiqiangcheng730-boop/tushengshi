"""严格、仅环境变量驱动的运行时配置。"""

from functools import lru_cache
from typing import Literal, Self

from pydantic import SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import make_url
from sqlalchemy.exc import ArgumentError


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="SHUDEKUAI_",
        extra="forbid",
        frozen=True,
    )

    database_url: SecretStr
    environment: Literal["local", "test", "staging", "production"] = "local"
    release_id: str = "dev"
    contract_id: str = "shudekuai-api-v1"

    @model_validator(mode="after")
    def validate_database_url(self) -> Self:
        raw_url = self.database_url.get_secret_value()
        try:
            parsed = make_url(raw_url)
        except ArgumentError as error:
            raise ValueError("数据库地址格式无效") from error
        if parsed.drivername != "postgresql+asyncpg" or not parsed.database:
            raise ValueError("数据库必须使用 postgresql+asyncpg 且指定数据库名")
        return self


@lru_cache(maxsize=1)
def load_settings() -> Settings:
    return Settings()
