from importlib import import_module
from types import ModuleType
from uuid import uuid4

import pytest
from pydantic import TypeAdapter, ValidationError


def _commands_module() -> ModuleType:
    return import_module("shudekuai_contracts.commands")


def test_command_context_accepts_explicit_versions() -> None:
    commands = _commands_module()

    context = commands.CommandContext(
        actor_id=uuid4(),
        store_id=uuid4(),
        idempotency_key=uuid4(),
        expected_order_version=3,
        expected_batch_version=7,
    )

    assert context.expected_order_version == 3
    assert context.expected_batch_version == 7


@pytest.mark.parametrize("field", ["expected_order_version", "expected_batch_version"])
def test_command_context_rejects_negative_versions(field: str) -> None:
    commands = _commands_module()
    payload = {
        "actor_id": uuid4(),
        "store_id": uuid4(),
        "idempotency_key": uuid4(),
        field: -1,
    }

    with pytest.raises(ValidationError):
        commands.CommandContext.model_validate(payload)


@pytest.mark.parametrize("invalid_money", [1.5, "100", True])
def test_money_rejects_non_integer_representations(invalid_money: object) -> None:
    commands = _commands_module()
    adapter = TypeAdapter(commands.NullableMoneyFen)

    with pytest.raises(ValidationError):
        adapter.validate_python(invalid_money)


def test_money_accepts_non_negative_integer_or_null() -> None:
    commands = _commands_module()
    adapter = TypeAdapter(commands.NullableMoneyFen)

    assert adapter.validate_python(6720) == 6720
    assert adapter.validate_python(None) is None


@pytest.mark.parametrize(
    "payload",
    [
        {"source": "automatic", "auto_count": 84, "manual_count": 84},
        {"source": "automatic", "manual_count": 84},
        {"source": "manual", "auto_count": 84},
        {"source": "manual"},
    ],
)
def test_count_source_rejects_ambiguous_or_missing_quantity(
    payload: dict[str, object],
) -> None:
    commands = _commands_module()

    with pytest.raises(ValidationError):
        commands.CountSourceInput.model_validate(payload)


def test_count_source_accepts_exactly_one_matching_quantity() -> None:
    commands = _commands_module()

    automatic = commands.CountSourceInput(source="automatic", auto_count=84)
    manual = commands.CountSourceInput(source="manual", manual_count=76)

    assert automatic.auto_count == 84
    assert manual.manual_count == 76
