"""对外稳定且不泄露内部细节的错误响应。"""

from dataclasses import dataclass

from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field


class ErrorResponse(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    code: str
    message: str
    request_id: str = Field(alias="requestId")
    retryable: bool


@dataclass(frozen=True, slots=True)
class ApiError(Exception):
    status_code: int
    code: str
    safe_message: str
    retryable: bool = False


async def api_error_handler(request: Request, error: ApiError) -> JSONResponse:
    body = ErrorResponse(
        code=error.code,
        message=error.safe_message,
        request_id=request.state.request_id,
        retryable=error.retryable,
    )
    return JSONResponse(
        status_code=error.status_code,
        content=body.model_dump(by_alias=True),
    )


async def unhandled_error_handler(request: Request, _error: Exception) -> JSONResponse:
    request_id = getattr(request.state, "request_id", "unavailable")
    body = ErrorResponse(
        code="internal_error",
        message="服务发生内部错误",
        request_id=request_id,
        retryable=False,
    )
    return JSONResponse(
        status_code=500,
        content=body.model_dump(by_alias=True),
        headers={"X-Request-ID": request_id},
    )
