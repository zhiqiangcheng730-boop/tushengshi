"""API 与推理进程共享的稳定契约。"""

from shudekuai_contracts.commands import (
    CommandContext,
    CountSourceInput,
    MoneyFen,
    NullableMoneyFen,
)
from shudekuai_contracts.recognition import (
    BoundingBox,
    RecognitionPoint,
    RecognitionQuality,
    RecognitionRequest,
    RecognitionResult,
    RecognitionTimings,
)

__all__ = [
    "BoundingBox",
    "CommandContext",
    "CountSourceInput",
    "MoneyFen",
    "NullableMoneyFen",
    "RecognitionPoint",
    "RecognitionQuality",
    "RecognitionRequest",
    "RecognitionResult",
    "RecognitionTimings",
]
