"""跨业务写命令必须携带的并发与幂等上下文。"""

from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

type NonNegativeInt = Annotated[int, Field(strict=True, ge=0)]
type MoneyFen = NonNegativeInt
type NullableMoneyFen = MoneyFen | None


class CommandContext(BaseModel):
    """由认证边界创建、传入应用用例的写命令上下文。"""

    model_config = ConfigDict(extra="forbid", frozen=True)

    actor_id: UUID
    store_id: UUID
    idempotency_key: UUID
    expected_order_version: NonNegativeInt | None = None
    expected_batch_version: NonNegativeInt | None = None


class CountSourceInput(BaseModel):
    """数量来源与对应数量，防止自动值和人工值含义混淆。"""

    model_config = ConfigDict(extra="forbid", frozen=True)

    source: Literal["automatic", "manual"]
    auto_count: NonNegativeInt | None = None
    manual_count: NonNegativeInt | None = None

    @model_validator(mode="after")
    def validate_matching_source(self) -> "CountSourceInput":
        automatic_is_valid = (
            self.source == "automatic"
            and self.auto_count is not None
            and self.manual_count is None
        )
        manual_is_valid = (
            self.source == "manual"
            and self.manual_count is not None
            and self.auto_count is None
        )
        if not (automatic_is_valid or manual_is_valid):
            raise ValueError("数量来源必须与唯一数量字段一致")
        return self
