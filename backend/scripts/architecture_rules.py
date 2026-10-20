"""可测试的 Python 架构依赖规则。"""

import ast
from pathlib import Path

DOMAIN_FORBIDDEN_PREFIXES = (
    "fastapi",
    "pydantic",
    "pydantic_settings",
    "sqlalchemy",
    "shudekuai_api.platform",
)


def imported_modules(source: str, *, filename: str) -> list[str]:
    tree = ast.parse(source, filename=filename)
    modules: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            modules.extend(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module is not None:
            modules.append(node.module)
    return modules


def _is_domain_file(path: Path) -> bool:
    parts = path.parts
    return "modules" in parts and "domain" in parts


def _python_violations(root: Path, path: Path) -> list[str]:
    relative = path.relative_to(root)
    try:
        modules = imported_modules(
            path.read_text(encoding="utf-8"), filename=str(relative)
        )
    except SyntaxError as error:
        return [f"{relative}: Python 语法无效：{error.msg}"]

    violations: list[str] = []
    if "shudekuai_contracts" in relative.parts:
        violations.extend(
            f"{relative}: 共享契约不得依赖 API 实现：{module}"
            for module in modules
            if module == "shudekuai_api" or module.startswith("shudekuai_api.")
        )
    if _is_domain_file(relative):
        violations.extend(
            f"{relative}: domain 不得依赖框架或平台：{module}"
            for module in modules
            if any(
                module == prefix or module.startswith(f"{prefix}.")
                for prefix in DOMAIN_FORBIDDEN_PREFIXES
            )
        )
    return violations


def find_architecture_violations(root: Path) -> list[str]:
    violations = [
        f"{agents_file.relative_to(root)}: 禁止嵌套 AGENTS.md 覆盖治理规则"
        for agents_file in root.rglob("AGENTS.md")
        if agents_file != root / "AGENTS.md"
    ]
    source_root = root / "src"
    if source_root.exists():
        for path in source_root.rglob("*.py"):
            violations.extend(_python_violations(root, path))
    return sorted(violations)
