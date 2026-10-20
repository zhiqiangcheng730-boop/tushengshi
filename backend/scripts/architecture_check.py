"""执行后端架构守卫。"""

from pathlib import Path

from scripts.architecture_rules import find_architecture_violations


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    violations = find_architecture_violations(root)
    if violations:
        for violation in violations:
            print(violation)
        return 1
    print("架构边界检查通过")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
