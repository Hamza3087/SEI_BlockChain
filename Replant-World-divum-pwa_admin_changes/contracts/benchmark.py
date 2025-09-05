

print("#!/bin/bash")
print("source .env")
print("PAYLOAD='{\"extension\":{\"msg\":{\"multi_mint\":{\"owner\":\"sei1plzv3m26n68hrdgzehum4m3l5ejed4tng6xf5x\",\"messages\":[", end="")

for i in range(0, 100):
    print("{\"token_id\":\"123asd123asdf123tret" + str(i) + "\"}", end="")
    if i != 99:
        print(",", end="")

print("]}}}}'")
print()

print("seid tx wasm execute sei1p4lqunauqgstt6ydszx59y3pg2tkaxlnujl9m5ldz7nqcrn6tjzqfmdz4y \"$PAYLOAD\" \\")
print("    --from $KEYNAME --fees=10000000usei --gas 10000000 --chain-id=sei-chain --broadcast-mode=block")