use cosmwasm_schema::{cw_serde, schemars::JsonSchema, serde::{de::DeserializeOwned, Serialize}};
use cosmwasm_std::CustomMsg;
use std::fmt::Debug;

#[cw_serde]
pub struct MintMsg<T> {
    /// Unique ID of the NFT
    pub token_id: String,
    /// Universal resource identifier for this NFT
    /// Should point to a JSON file that conforms to the ERC721
    /// Metadata JSON Schema
    pub token_uri: Option<String>,

    pub extension: Option<T>
}

#[cw_serde]
pub enum ExtensionMsg<T> {
    MultiMint {
        owner: String,
        messages: Vec<MintMsg<T>>,
    },
    MultiTransfer {
        recipient: String,
        token_ids: Vec<String>,
    },
}

impl<T: Serialize + DeserializeOwned + Clone + JsonSchema + PartialEq + Debug> CustomMsg for ExtensionMsg<T> {}
