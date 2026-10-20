"""OpenAPI 契约的确定性构建与序列化。"""

import json
from hashlib import sha256
from typing import Any

from shudekuai_api.app import create_app
from shudekuai_api.platform.config import Settings


class ContractReadinessProbe:
    async def check(self) -> bool:
        return True

    async def close(self) -> None:
        return None


def build_openapi_document() -> dict[str, Any]:
    settings = Settings(
        database_url=(
            "postgresql+asyncpg://contract:local-contract-secret@localhost/contract"
        ),
        environment="test",
        release_id="contract",
        contract_id="shudekuai-api-v1",
    )
    app = create_app(settings=settings, readiness_probe=ContractReadinessProbe())
    return app.openapi()


def render_openapi(document: dict[str, Any]) -> str:
    return json.dumps(document, ensure_ascii=False, indent=2, sort_keys=True) + "\n"


def openapi_digest(rendered: str) -> str:
    return sha256(rendered.encode()).hexdigest()
