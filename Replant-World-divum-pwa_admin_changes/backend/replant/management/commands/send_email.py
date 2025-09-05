import djclick as click

from replant.integrations import sendgrid


@click.command()
@click.option(
    "--to",
    type=str,
    help="Email receiver",
)
@click.option(
    "--template",
    type=str,
    default="example",
    help="Email template name",
)
def send_email(to: str, template: str):
    sendgrid.send_email(to=to, template_name=template, subject="Test email")
