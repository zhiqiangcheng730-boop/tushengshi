from scripts.secret_rules import secret_kinds


def test_detects_private_key_and_provider_tokens() -> None:
    candidates = (
        "-----BEGIN "
        + "PRIVATE KEY-----\n"
        + "ghp_"
        + "abcdefghijklmnopqrstuvwxyz1234567890\n"
        + "sk-"
        + "abcdefghijklmnopqrstuvwxyz123456"
    )

    assert secret_kinds(candidates) == [
        "GitHub 访问令牌",
        "OpenAI API 密钥",
        "私钥",
    ]


def test_allows_documented_local_placeholders() -> None:
    placeholders = "postgresql+asyncpg://app:replace-for-local-only@localhost/shudekuai"

    assert secret_kinds(placeholders) == []
