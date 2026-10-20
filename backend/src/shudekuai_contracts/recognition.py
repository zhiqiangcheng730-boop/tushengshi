"""与具体识别引擎解耦的请求和结果契约。"""

from pathlib import Path
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator

NormalizedCoordinate = Annotated[float, Field(strict=True, ge=0.0, le=1.0)]
NonNegativeMilliseconds = Annotated[int, Field(strict=True, ge=0)]
NonEmptyString = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class RecognitionContract(BaseModel):
    """识别契约统一采用不可变、拒绝未知字段的输入模型。"""

    model_config = ConfigDict(extra="forbid", frozen=True)


class BoundingBox(RecognitionContract):
    x1: NormalizedCoordinate
    y1: NormalizedCoordinate
    x2: NormalizedCoordinate
    y2: NormalizedCoordinate

    @model_validator(mode="after")
    def validate_edge_order(self) -> "BoundingBox":
        if self.x1 >= self.x2 or self.y1 >= self.y2:
            raise ValueError("边界框必须满足 x1 < x2 且 y1 < y2")
        return self


class RecognitionPoint(RecognitionContract):
    id: NonEmptyString
    x: NormalizedCoordinate
    y: NormalizedCoordinate
    bbox: BoundingBox | None = None


class RecognitionRequest(RecognitionContract):
    request_id: UUID
    image_path: Path
    canonical_width: Annotated[int, Field(strict=True, gt=0)]
    canonical_height: Annotated[int, Field(strict=True, gt=0)]
    deadline_ms: Annotated[int, Field(strict=True, gt=0)]
    engine_config_version: NonEmptyString


class RecognitionQuality(RecognitionContract):
    status: Literal["review", "rejected"]
    reasons: tuple[NonEmptyString, ...]


class RecognitionTimings(RecognitionContract):
    preprocess: NonNegativeMilliseconds
    inference: NonNegativeMilliseconds
    parse: NonNegativeMilliseconds


class RecognitionResult(RecognitionContract):
    schema_version: Literal["1"]
    engine: NonEmptyString
    model_revision: NonEmptyString
    prompt_version: NonEmptyString
    coordinate_space: Literal["canonical_normalized"]
    instances: tuple[RecognitionPoint, ...]
    quality: RecognitionQuality
    timings_ms: RecognitionTimings
    raw_output_ref: NonEmptyString | None = None

    @model_validator(mode="after")
    def validate_review_has_instances(self) -> "RecognitionResult":
        if self.quality.status == "review" and not self.instances:
            raise ValueError("可复核结果必须包含可定位实例")
        if self.quality.status == "rejected" and not self.quality.reasons:
            raise ValueError("拒绝结果必须说明原因")
        return self
