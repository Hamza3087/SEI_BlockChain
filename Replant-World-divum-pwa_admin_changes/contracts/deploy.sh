#!/bin/bash
# run from root (replant) directory

source .env

code_id=$(seid tx wasm store artifacts/cw721_multi.wasm \
    -y --from=$KEYNAME --chain-id=sei-chain --gas=10000000 --fees=10000000usei --broadcast-mode=block \
    | grep -A 1 "code_id" \
    | sed -n 's/.*value: "//p' \
    | sed -n 's/"//p')

echo "code_id: $code_id"

# instantiate contract

contract_address=$(seid tx wasm instantiate $code_id "{\"name\":\"ReplantWorld\",\"symbol\":\"RW\",\"minter\":\"$KEYNAME\"}" \
    --admin $KEYNAME --from=$KEYNAME --chain-id=sei-chain --label="sei721multi" \
    --gas=10000000 --fees=10000000usei --broadcast-mode=block -y \
    | grep -A 1 "_contract_address" \
    | sed -n 's/.*value: //p' \
    | sed -n "1p" \
)

echo "contract_address: $contract_address"

# seid tx wasm instantiate $code_id "{\"name\":\"ReplantWorld\",\"symbol\":\"RW\",\"minter\":\"$KEYNAME\"}" \
#     --admin $KEYNAME --from=$KEYNAME --chain-id=sei-chain --label="sei721" \
#     --gas=10000000 --fees=10000000usei --broadcast-mode=block -y
