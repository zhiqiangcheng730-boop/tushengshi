"""验证已提交 OpenAPI 工件与当前应用零漂移。"""

from pathlib import Path

from scripts.openapi_contract import (
    build_openapi_document,
    openapi_digest,
    render_openapi,
)


def main() -> int:
    contract_dir = Path(__file__).resolve().parents[2] / "contracts"
    openapi_path = contract_dir / "openapi.json"
    digest_path = contract_dir / "openapi.sha256"
    if not openapi_path.exists() or not digest_path.exists():
        print("缺少 OpenAPI 工件，请运行 uv run python -m scripts.export_openapi")
        return 1

    expected = render_openapi(build_openapi_document())
    expected_digest = f"{openapi_digest(expected)}  openapi.json\n"
    messages: list[str] = []
    if openapi_path.read_text(encoding="utf-8") != expected:
        messages.append("contracts/openapi.json 与当前应用不一致")
    if digest_path.read_text(encoding="utf-8") != expected_digest:
        messages.append("contracts/openapi.sha256 与当前契约不一致")
    if messages:
        for message in messages:
            print(message)
        return 1
    print("OpenAPI 零漂移检查通过")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
