use cosmwasm_std::{DepsMut, Env, MessageInfo, Response};
use cw721_base::{ContractError, state::TokenInfo};
use crate::{msg::MintMsg, types::{TypeT, Cw721Multi}};
use cw_ownable;


pub fn mint(
    contract: Cw721Multi,
    deps: DepsMut,
    info: MessageInfo,
    owner: String,
    messages: Vec<MintMsg<TypeT>>,
) -> Result<Response, ContractError> {
    cw_ownable::assert_owner(deps.storage, &info.sender)?;

    let mut response = Response::default()
        .add_attribute("action", "multi_mint")
        .add_attribute("minter", info.sender)
        .add_attribute("owner", &owner);

    for msg in messages {

        // create the token
        let token = TokenInfo {
            owner: deps.api.addr_validate(&owner)?,
            approvals: vec![],
            token_uri: msg.token_uri,
            extension: msg.extension,
        };

        contract.tokens
        .update(deps.storage, &msg.token_id, |old| match old {
            Some(_) => Err(ContractError::Claimed {}),
            None => Ok(token),
        })?;

        contract.increment_tokens(deps.storage)?;

        response = response.add_attribute("token_id", msg.token_id);
    }
    Ok(response)

}

pub fn transfer(
    contract: Cw721Multi,
    mut deps: DepsMut,
    env: Env,
    info: MessageInfo,
    recipient: String,
    token_ids: Vec<String>,
) -> Result<Response, ContractError> {
    let mut response = Response::new()
        .add_attribute("action", "multi_transfer_nft")
        .add_attribute("sender", &info.sender)
        .add_attribute("recipient", &recipient);

    for token_id in token_ids {
        contract._transfer_nft(deps.branch(), &env, &info, &recipient, &token_id)?;

        response = response.add_attribute("token_id", token_id);
    }

    Ok(response)
}