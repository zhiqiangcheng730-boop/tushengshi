"""生成唯一 OpenAPI 工件及其摘要。"""

from pathlib import Path

from scripts.openapi_contract import (
    build_openapi_document,
    openapi_digest,
    render_openapi,
)


def main() -> int:
    contract_dir = Path(__file__).resolve().parents[2] / "contracts"
    contract_dir.mkdir(exist_ok=True)
    rendered = render_openapi(build_openapi_document())
    (contract_dir / "openapi.json").write_text(rendered, encoding="utf-8")
    (contract_dir / "openapi.sha256").write_text(
        f"{openapi_digest(rendered)}  openapi.json\n",
        encoding="utf-8",
    )
    print("已生成 contracts/openapi.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
