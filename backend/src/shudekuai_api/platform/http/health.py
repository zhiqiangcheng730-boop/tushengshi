"""编排器和诊断使用的平台端点。"""

from typing import Annotated

from fastapi import APIRouter, Request
from pydantic import BaseModel, ConfigDict, Field

from shudekuai_api.platform.config import Settings
from shudekuai_api.platform.database import ReadinessProbe
from shudekuai_api.platform.http.errors import ApiError, ErrorResponse

router = APIRouter(tags=["platform"])


class StatusResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: str


class VersionResponse(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    service: str
    release: str
    contract_id: str = Field(alias="contractId")


@router.get("/livez", response_model=StatusResponse, operation_id="getLiveness")
async def get_liveness() -> StatusResponse:
    return StatusResponse(status="ok")


@router.get(
    "/readyz",
    response_model=StatusResponse,
    responses={503: {"model": ErrorResponse}},
    operation_id="getReadiness",
)
async def get_readiness(request: Request) -> StatusResponse:
    probe: ReadinessProbe = request.app.state.readiness_probe
    if not await probe.check():
        raise ApiError(
            status_code=503,
            code="service_not_ready",
            safe_message="服务暂未就绪",
            retryable=True,
        )
    return StatusResponse(status="ready")


@router.get("/version", response_model=VersionResponse, operation_id="getVersion")
async def get_version(request: Request) -> VersionResponse:
    settings: Annotated[Settings, "application settings"] = request.app.state.settings
    return VersionResponse(
        service="shudekuai-api",
        release=settings.release_id,
        contract_id=settings.contract_id,
    )
