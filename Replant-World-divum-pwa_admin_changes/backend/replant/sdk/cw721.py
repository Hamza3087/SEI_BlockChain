from typing import NotRequired, TypedDict
import json
import time
import requests

from cosmpy.aerial.client import LedgerClient, SubmittedTx, Wallet, prepare_and_broadcast_basic_transaction
from cosmpy.aerial.contract import LedgerContract
from cosmpy.aerial.contract.cosmwasm import create_cosmwasm_instantiate_msg
from cosmpy.aerial.tx import Transaction
from cosmpy.crypto.address import Address

from replant.sdk.patch import patch_ParseDict

patch_ParseDict()


class MintInfo(TypedDict):
    """Minted NFT metadata"""

    token_id: str
    token_uri: NotRequired[str]


def extract_contract_address_from_tx_response(tx_hash: str, rpc_url: str) -> str:
    """
    Extract contract address from transaction response using direct HTTP requests
    to bypass cosmpy parsing issues.
    
    Args:
        tx_hash: Transaction hash
        rpc_url: RPC URL for querying
        
    Returns:
        Contract address as string
    """
    max_attempts = 10
    attempt = 0
    
    # Extract base URL from RPC URL
    if rpc_url.startswith('rest+'):
        base_url = rpc_url[5:]  # Remove 'rest+' prefix
    else:
        base_url = rpc_url
    
    while attempt < max_attempts:
        try:
            # Query the transaction directly via HTTP
            url = f"{base_url}/cosmos/tx/v1beta1/txs/{tx_hash}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                tx_data = response.json()
                
                # Check if transaction was successful
                if tx_data.get('tx_response', {}).get('code') == 0:
                    # Parse the raw log to extract contract address
                    raw_log = tx_data.get('tx_response', {}).get('raw_log', '')
                    
                    if raw_log:
                        try:
                            logs = json.loads(raw_log)
                            
                            for log in logs:
                                for event in log.get('events', []):
                                    if event.get('type') == 'instantiate':
                                        for attr in event.get('attributes', []):
                                            if attr.get('key') == '_contract_address':
                                                contract_address = attr.get('value')
                                                if contract_address:
                                                    print(f"Found contract address: {contract_address}")
                                                    return contract_address
                                    
                                    # Also check wasm events
                                    elif event.get('type') == 'wasm':
                                        for attr in event.get('attributes', []):
                                            if attr.get('key') == '_contract_address':
                                                contract_address = attr.get('value')
                                                if contract_address:
                                                    print(f"Found contract address: {contract_address}")
                                                    return contract_address
                        except json.JSONDecodeError:
                            print(f"Attempt {attempt + 1}: Could not parse raw_log JSON")
                    
                    # Also check events array directly
                    events = tx_data.get('tx_response', {}).get('events', [])
                    for event in events:
                        if event.get('type') == 'instantiate':
                            for attr in event.get('attributes', []):
                                if attr.get('key') == '_contract_address':
                                    contract_address = attr.get('value')
                                    if contract_address:
                                        print(f"Found contract address: {contract_address}")
                                        return contract_address
                
                print(f"Attempt {attempt + 1}: Transaction found but contract address not yet available")
            else:
                print(f"Attempt {attempt + 1}: Transaction not found yet (status: {response.status_code})")
            
            time.sleep(2)  # Wait 2 seconds before retrying
            attempt += 1
            
        except Exception as e:
            print(f"Attempt {attempt + 1}: Error querying transaction: {e}")
            time.sleep(2)
            attempt += 1
    
    raise RuntimeError(f"Could not extract contract address from transaction {tx_hash} after {max_attempts} attempts")


class CW721Client:
    """CW721-multi client"""

    def __init__(self, client: LedgerClient, address: str | Address):
        if not isinstance(address, Address):
            address = Address(str(address).strip())

        self.contract = LedgerContract(path=None, client=client, address=address)
        self.client = client

    @staticmethod
    def instantate(
        client: LedgerClient,
        sender: Wallet,
        code_id: int,
        name: str,
        symbol: str,
        minter: str,
        label: str = "Replant World",
    ) -> "CW721Client":
        """
        Args:
            client: Ledger client
            sender: Wallet to instantiate the contract
            code_id: CW721-multi code ID
            name: NFT collection name
            symbol: NFT collection symbol
            minter: Minter address
            label: Label for the contract to display in explorer
        """        
        # Create the instantiate message directly
        instantiate_msg = create_cosmwasm_instantiate_msg(
            code_id,
            {"name": name, "symbol": symbol, "minter": minter},
            label,
            sender.address(),
            admin_address=sender.address(),
            funds=None,
        )
        
        # Build transaction
        tx = Transaction()
        tx.add_message(instantiate_msg)
        
        try:
            # Submit transaction without waiting for completion
            submitted_tx = prepare_and_broadcast_basic_transaction(
                client, tx, sender, gas_limit=300000
            )
            
            print(f"Transaction submitted successfully. TX Hash: {submitted_tx.tx_hash}")
            print("Waiting for transaction to be processed and extracting contract address...")
            
            # Extract the real contract address from the transaction using direct HTTP
            import env
            contract_address = extract_contract_address_from_tx_response(submitted_tx.tx_hash, env.SEI_RPC)
            
            print(f"Contract instantiated successfully!")
            print(f"Contract Address: {contract_address}")
            
            return CW721Client(client, contract_address)
            
        except Exception as e:
            print("Error instantiating CW721 contract:", e)
            raise

    def multi_mint(
        self, admin: Wallet, owner: str, tokens: list[MintInfo]
    ) -> SubmittedTx:
        """
        Args:
            admin: admin account
            owner: Address to mint to
            tokens: list of NFTs to mint
        """
        from cosmpy.aerial.tx import Transaction

        # Use a fixed gas limit to avoid gas estimation issues
        gas_limit = 300000 * len(tokens)  # 300k gas per token

        return self.contract.execute(
            {
                "extension": {
                    "msg": {"multi_mint": {"owner": owner, "messages": tokens}}
                }
            },
            admin,
            gas_limit=gas_limit,
        )

    def multi_transfer(
        self, sender: Wallet, recipient: str, tokens: list[str]
    ) -> SubmittedTx:
        """
        Args:
            sender: sender account
            recipient: Address to transfer to
            tokens: list of NFTs to transfer
        """
        return self.contract.execute(
            {
                "extension": {
                    "msg": {
                        "multi_transfer": {"recipient": recipient, "token_ids": tokens}
                    }
                }
            },
            sender,
        )