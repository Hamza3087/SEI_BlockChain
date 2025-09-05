import djclick as click

import env
from replant import nft


@click.command()
def instantiate_nft_contract():
    client: nft.CW721Client = nft.CW721Client.instantate(
        client=nft.client,
        code_id=env.NFT_MULTI_CODE_ID,
        minter=nft.admin.address(),
        name="Replant World",
        label="Replant World",
        sender=nft.admin,
        symbol="RPLNT",
    )
    print(client.contract.address)
