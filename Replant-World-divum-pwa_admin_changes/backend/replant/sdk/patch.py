from google.protobuf import json_format
from google.protobuf.json_format import _Parser  # type: ignore


def ParseDictPatched(
    js_dict,
    message,
    ignore_unknown_fields=False,
    descriptor_pool=None,
    max_recursion_depth=100,
):
    """
    It's a patched version of google.protobuf.json_format.ParseDict.
    We have to drop the evmError field from the response because it's not defined in the descriptor.
    Also handle gas_estimate field compatibility issues.
    """
    parser = _Parser(ignore_unknown_fields, descriptor_pool, max_recursion_depth)
    if "result" in js_dict and "evmError" in js_dict["result"]:
        js_dict["result"].pop("evmError")

    # Handle gas_estimate field compatibility issue
    if "gas_info" in js_dict and "gas_estimate" in js_dict["gas_info"]:
        # Convert gas_estimate to gasUsed for compatibility
        gas_estimate = js_dict["gas_info"].pop("gas_estimate")
        if "gasUsed" not in js_dict["gas_info"]:
            js_dict["gas_info"]["gasUsed"] = str(gas_estimate)
        if "gasWanted" not in js_dict["gas_info"]:
            js_dict["gas_info"]["gasWanted"] = str(int(gas_estimate) * 2)  # Set gasWanted to 2x gasUsed as safety margin

    # Ensure gasWanted is never 0 if gasUsed exists
    if "gas_info" in js_dict:
        gas_info = js_dict["gas_info"]
        if "gasUsed" in gas_info and ("gasWanted" not in gas_info or gas_info.get("gasWanted") == "0"):
            gas_used = int(gas_info["gasUsed"])
            gas_info["gasWanted"] = str(max(gas_used * 2, 200000))  # Minimum 200k gas

    parser.ConvertMessage(js_dict, message, "")
    return message


def patch_ParseDict() -> None:
    json_format.ParseDict = ParseDictPatched
