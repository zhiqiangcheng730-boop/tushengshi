from pathlib import Path

from scripts.architecture_rules import find_architecture_violations


def test_contract_package_cannot_import_api_implementation(tmp_path: Path) -> None:
    forbidden = tmp_path / "src" / "shudekuai_contracts" / "bad.py"
    forbidden.parent.mkdir(parents=True)
    forbidden.write_text("from shudekuai_api.app import create_app\n", encoding="utf-8")

    violations = find_architecture_violations(tmp_path)

    assert any("共享契约不得依赖 API 实现" in item for item in violations)


def test_domain_cannot_import_framework_or_platform(tmp_path: Path) -> None:
    domain_file = (
        tmp_path
        / "src"
        / "shudekuai_api"
        / "modules"
        / "orders"
        / "domain"
        / "order.py"
    )
    domain_file.parent.mkdir(parents=True)
    domain_file.write_text(
        "from sqlalchemy.orm import Mapped\n"
        "from shudekuai_api.platform.config import Settings\n",
        encoding="utf-8",
    )

    violations = find_architecture_violations(tmp_path)

    assert sum("domain 不得依赖" in item for item in violations) == 2


def test_clean_inward_dependency_has_no_violation(tmp_path: Path) -> None:
    domain_file = (
        tmp_path
        / "src"
        / "shudekuai_api"
        / "modules"
        / "orders"
        / "domain"
        / "order.py"
    )
    domain_file.parent.mkdir(parents=True)
    domain_file.write_text("from dataclasses import dataclass\n", encoding="utf-8")

    assert find_architecture_violations(tmp_path) == []


def test_nested_agent_instruction_is_rejected(tmp_path: Path) -> None:
    nested_agents = tmp_path / "src" / "AGENTS.md"
    nested_agents.parent.mkdir(parents=True)
    nested_agents.write_text("shadow rules", encoding="utf-8")

    violations = find_architecture_violations(tmp_path)

    assert any("禁止嵌套 AGENTS.md" in item for item in violations)
