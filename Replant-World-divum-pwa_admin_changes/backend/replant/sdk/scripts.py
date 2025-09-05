import bech32
from cosmpy.aerial.client import LedgerClient, NetworkConfig
from cosmpy.aerial.contract import LedgerContract, Wallet


def get_sei_client(chain_id: str, rpc: str) -> LedgerClient:
    """Get LedgerClient with default SEI chain settings.

    Args:
        chain_id: chain id (e.g. "pacific-1", "atlantic-2")
        rpc: rpc URL (must be prefixe with "grpc" or "rpc" or "rest")

    Example:
    ```
        ledger_client = get_sei_client("atlantic-2", "rest+https://rest.atlantic-2.seinetwork.io/")
    ```
    """
    return LedgerClient(NetworkConfig(chain_id, 0.1, "usei", "usei", rpc))


def deploy_nft_contract(
    client: LedgerClient, sender: Wallet, path: str
) -> LedgerContract:
    """Deploy NFT contract.

    Example:
    ```
        from cosmpy.aerial.wallet import LocalWallet, PrivateKey
        ledger_client = get_sei_client("atlantic-2", "rest+https://rest.atlantic-2.seinetwork.io/")

        pk = PrivateKey('TIK39G39Ttbm78ayAD9PRK3THDKcQHU6ZpVgIEEEsUM=')
        w = LocalWallet(pk, "sei")

        contract = deploy_nft_contract(ledger_client, w, "artifacts/cw721_multi.wasm")
    ```
    """
    contract = LedgerContract(path, client)
    contract.deploy(
        {
            "name": "Replant World",
            "symbol": "RPLNT",
            "minter": str(sender.address()),
        },
        sender,
        "cw721_multi",
        10000000,
        1000000,
        sender.address(),
    )

    return contract


def validate_sei_address(address: str) -> None:
    """Validate SEI address.

    Raises:
        ValueError: if address is invalid
    """

    prefix, data_base5 = bech32.bech32_decode(address)

    if data_base5 is None:
        raise ValueError("Unable to parse address.")

    if prefix != "sei":
        raise ValueError("Address must start with 'sei' prefix.")

    data_base8 = bech32.convertbits(data_base5, 5, 8, False)

    if data_base8 is None or len(data_base8) != 20 and len(data_base8) != 32:
        raise ValueError(
            "Decoded address must be 20 bytes long (account) or 32 bytes long (contract)."
        )
