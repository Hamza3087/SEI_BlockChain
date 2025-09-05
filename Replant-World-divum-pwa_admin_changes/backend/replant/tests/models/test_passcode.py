from time_machine import TimeMachineFixture

from replant.models import PlantingOrganization, User


def test_generate_ok(
    planting_organization: PlantingOrganization,
    user: User,
):
    planting_organization.passcodes.generate(by=user)

    passcode = planting_organization.passcodes.first()
    assert passcode is not None
    assert str(passcode.expires_at) == "2024-01-08 00:00:00+00:00"
    assert passcode.created_by == user


def test_get_latest_valid_ok(
    planting_organization: PlantingOrganization,
    user: User,
):
    planting_organization.passcodes.generate(by=user)

    assert planting_organization.passcodes.get_latest_valid() is not None


def test_get_latest_valid_empty(planting_organization: PlantingOrganization):
    assert planting_organization.passcodes.get_latest_valid() is None


def test_get_latest_valid_expired(
    planting_organization: PlantingOrganization,
    user: User,
    time: TimeMachineFixture,
):
    planting_organization.passcodes.generate(by=user)
    time.move_to("2024-01-08 00:00:00+00:00")

    assert planting_organization.passcodes.get_latest_valid() is None
