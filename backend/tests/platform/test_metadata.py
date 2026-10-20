from shudekuai_api.platform.database.metadata import metadata


def test_metadata_has_deterministic_constraint_names() -> None:
    convention = metadata.naming_convention

    assert convention["pk"] == "pk_%(table_name)s"
    assert convention["fk"] == (
        "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s"
    )
