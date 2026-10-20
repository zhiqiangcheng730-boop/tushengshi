from scripts.openapi_contract import build_openapi_document, render_openapi


def test_openapi_contains_platform_endpoints_and_safe_error_schema() -> None:
    document = build_openapi_document()

    assert set(document["paths"]) == {"/livez", "/readyz", "/version"}
    assert "ErrorResponse" in document["components"]["schemas"]
    assert "local-contract-secret" not in render_openapi(document)


def test_openapi_rendering_is_deterministic() -> None:
    document = build_openapi_document()

    assert render_openapi(document) == render_openapi(document)
    assert render_openapi(document).endswith("\n")
