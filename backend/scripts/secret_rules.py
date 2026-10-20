"""只匹配高置信凭据格式，避免用普通业务文案猜测 Secret。"""

import re

SECRET_PATTERNS = {
    "云访问密钥": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    "GitHub 访问令牌": re.compile(r"\bgh[opsu]_[A-Za-z0-9]{30,}\b"),
    "OpenAI API 密钥": re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b"),
    "私钥": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
}


def secret_kinds(text: str) -> list[str]:
    return [name for name, pattern in SECRET_PATTERNS.items() if pattern.search(text)]
