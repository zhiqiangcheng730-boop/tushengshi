.PHONY: architecture-check dependency-check format format-check license-check lint openapi-check package-check profile-check secret-check test typecheck verify

format:
	uv run ruff format .

format-check:
	uv run ruff format --check .

lint:
	uv run ruff check .

typecheck:
	uv run mypy

profile-check:
	uv run python -m scripts.profile_check

architecture-check:
	uv run lint-imports && uv run python -m scripts.architecture_check

test:
	uv run pytest --cov --cov-branch --cov-report=term-missing

openapi-check:
	uv run python -m scripts.openapi_check

dependency-check:
	uv run pip-audit

license-check:
	uv run pip-licenses

secret-check:
	uv run python -m scripts.secret_check

package-check:
	uv build --wheel --out-dir dist

verify:
	uv sync --frozen --all-groups
	$(MAKE) format-check
	$(MAKE) lint
	$(MAKE) typecheck
	$(MAKE) profile-check
	$(MAKE) architecture-check
	$(MAKE) test
	$(MAKE) openapi-check
	$(MAKE) dependency-check
	$(MAKE) license-check
	$(MAKE) secret-check
	$(MAKE) package-check
