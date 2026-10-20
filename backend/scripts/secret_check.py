"""扫描后端和共享契约中的高置信 Secret。"""

import subprocess
from pathlib import Path
from shutil import which

from scripts.secret_rules import secret_kinds

SKIPPED_SUFFIXES = {".gif", ".ico", ".jpeg", ".jpg", ".png", ".webp", ".whl"}


def candidate_paths(repository_root: Path) -> list[Path]:
    git_path = which("git")
    if git_path is None:
        raise RuntimeError("未找到 git，无法确定待扫描文件")
    output = subprocess.run(  # noqa: S603 -- executable is resolved by shutil.which
        [
            git_path,
            "ls-files",
            "--cached",
            "--others",
            "--exclude-standard",
            "-z",
        ],
        cwd=repository_root,
        check=True,
        capture_output=True,
        text=True,
    ).stdout
    return [
        repository_root / relative
        for relative in output.split("\0")
        if relative
        and relative.startswith(("backend/", "contracts/"))
        and Path(relative).suffix.lower() not in SKIPPED_SUFFIXES
    ]


def main() -> int:
    repository_root = Path(__file__).resolve().parents[2]
    findings: list[str] = []
    for path in candidate_paths(repository_root):
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        findings.extend(
            f"{path.relative_to(repository_root)}: {kind}"
            for kind in secret_kinds(text)
        )
    if findings:
        for finding in findings:
            print(finding)
        return 1
    print("Secret 检查通过")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
