import pytest

from .scripts import validate_sei_address


def test_validate_sei_address():
    validate_sei_address("sei1f8ey877q8x84972dhhcd4jddrk46pxn7wua7yl")
    validate_sei_address(
        "sei13hxtue98v4vzs25r8j5l0n3wukj6h05k73syguy8gs49jexhx2hqxslrx6"
    )


def test_validate_sei_address_invalid_format():
    with pytest.raises(ValueError, match="Unable to parse address."):
        validate_sei_address("sei1f8ey877q8x84972dhhcd4jddrk46pxn7wua7ym")


def test_validate_sei_address_wrong_prefix():
    with pytest.raises(ValueError, match="Address must start with 'sei' prefix."):
        validate_sei_address("cosmos1f8ey877q8x84972dhhcd4jddrk46pxn7rsvgz7")


def test_validate_sei_address_wrong_lenght():
    with pytest.raises(
        ValueError,
        match=r"Decoded address must be 20 bytes long \(account\) or 32 bytes long \(contract\).",
    ):
        validate_sei_address("sei1f893czjz")
