import djclick as click

from replant import nft


@click.command()
def mint_once():
    nft.mint_scheduled_nfts()
