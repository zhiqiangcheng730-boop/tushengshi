"""验证架构 Profile 结构和值，并确认声明路径存在。"""

import json
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    schema = json.loads((root / "architecture-profile.schema.json").read_text())
    profile = yaml.safe_load((root / "architecture-profile.yaml").read_text())
    Draft202012Validator.check_schema(schema)
    errors = sorted(
        Draft202012Validator(schema).iter_errors(profile),
        key=lambda error: list(error.absolute_path),
    )
    messages = [error.message for error in errors]

    declared_paths = profile.get("paths", {})
    for name, raw_path in declared_paths.items():
        resolved = (root / raw_path).resolve()
        if not resolved.exists():
            messages.append(f"paths.{name} 指向不存在的路径：{raw_path}")

    if messages:
        for message in messages:
            print(message)
        return 1
    print("架构 Profile 检查通过")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
