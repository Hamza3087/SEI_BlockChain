# run from backend dir: "python -m examples.cw721"

import sys

sys.path.append("..")  # Adds higher directory to python modules path.

from cosmpy.aerial.wallet import LocalWallet  # noqa: E402

import env  # noqa: E402
from replant.sdk import CW721Client, get_sei_client  # noqa: E402

client = get_sei_client(env.SEI_CHAIN_ID, env.SEI_RPC)

cw721 = CW721Client(client, env.SEI_NFT_ADDRESS)

admin = LocalWallet.from_mnemonic(env.SEI_ADMIN_MNEMONIC, "sei")

# mint some nfts to admin address
cw721.multi_mint(
    admin,
    str(admin.address()),
    [
        {"token_id": "test-1"},
        {"token_id": "test-2", "token_uri": "https://example.com/2"},
    ],
)

# transfer some nfts
cw721.multi_transfer(admin, str(admin.address()), ["test-1", "test-2"])
