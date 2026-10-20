from importlib import import_module
from pathlib import Path
from types import ModuleType
from uuid import uuid4

import pytest
from pydantic import ValidationError


def _recognition_module() -> ModuleType:
    return import_module("shudekuai_contracts.recognition")


def _valid_result() -> dict[str, object]:
    return {
        "schema_version": "1",
        "engine": "qwen_mlx",
        "model_revision": "weights-v1",
        "prompt_version": "count-endpoints-v1",
        "coordinate_space": "canonical_normalized",
        "instances": [{"id": "p1", "x": 0.25, "y": 0.4, "bbox": None}],
        "quality": {"status": "review", "reasons": []},
        "timings_ms": {"preprocess": 1, "inference": 2, "parse": 3},
        "raw_output_ref": "diagnostics/result-1.json",
    }


@pytest.mark.parametrize("coordinate", [-0.01, 1.01])
def test_point_rejects_coordinates_outside_canonical_space(
    coordinate: float,
) -> None:
    recognition = _recognition_module()

    with pytest.raises(ValidationError):
        recognition.RecognitionPoint(id="p1", x=coordinate, y=0.5)


@pytest.mark.parametrize("coordinate", ["0.5", True])
def test_point_rejects_coerced_coordinates(coordinate: object) -> None:
    recognition = _recognition_module()

    with pytest.raises(ValidationError):
        recognition.RecognitionPoint(id="p1", x=coordinate, y=0.5)


def test_bounding_box_rejects_reversed_edges() -> None:
    recognition = _recognition_module()

    with pytest.raises(ValidationError):
        recognition.BoundingBox(x1=0.8, y1=0.2, x2=0.3, y2=0.9)


def test_bounding_box_accepts_ordered_normalized_edges() -> None:
    recognition = _recognition_module()

    box = recognition.BoundingBox(x1=0.1, y1=0.2, x2=0.8, y2=0.9)

    assert box.x1 < box.x2
    assert box.y1 < box.y2


def test_recognition_request_requires_positive_canonical_dimensions() -> None:
    recognition = _recognition_module()

    with pytest.raises(ValidationError):
        recognition.RecognitionRequest(
            request_id=uuid4(),
            image_path=Path("/private/canonical.jpg"),
            canonical_width=0,
            canonical_height=1920,
            deadline_ms=90_000,
            engine_config_version="qwen-v1",
        )


def test_review_result_requires_localizable_instances() -> None:
    recognition = _recognition_module()
    payload = _valid_result()
    payload["instances"] = []

    with pytest.raises(ValidationError):
        recognition.RecognitionResult.model_validate(payload)


def test_result_rejects_total_only_or_unknown_fields() -> None:
    recognition = _recognition_module()
    payload = _valid_result()
    payload["total_count"] = 1

    with pytest.raises(ValidationError):
        recognition.RecognitionResult.model_validate(payload)


def test_rejected_result_may_explain_failure_without_instances() -> None:
    recognition = _recognition_module()
    payload = _valid_result()
    payload["instances"] = []
    payload["quality"] = {"status": "rejected", "reasons": ["invalid_output"]}

    result = recognition.RecognitionResult.model_validate(payload)

    assert result.quality.reasons == ("invalid_output",)


def test_rejected_result_requires_a_reason() -> None:
    recognition = _recognition_module()
    payload = _valid_result()
    payload["instances"] = []
    payload["quality"] = {"status": "rejected", "reasons": []}

    with pytest.raises(ValidationError):
        recognition.RecognitionResult.model_validate(payload)
