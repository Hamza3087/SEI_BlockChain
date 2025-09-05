// pub use crate::msg::{InstantiateMsg, QueryMsg};
use cosmwasm_std::Empty;
pub use cw721_base::{
    entry::{execute as _execute, query as _query, instantiate as _instantiate},
    ContractError, Cw721Contract, InstantiateMsg, ExecuteMsg, Extension,
    MinterResponse,
};
use cw721_base::msg::QueryMsg as Cw721QueryMsg;
use cw2;
use msg::ExtensionMsg;
use types::{Cw721Multi, TypeT};

pub mod msg;
pub mod multi;
pub mod types;

// version info for migration info
const CONTRACT_NAME: &str = "cw721-multi";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg(not(feature = "library"))]
pub mod entry {
    use super::*;
    use cosmwasm_std::{
        entry_point, Binary, Deps, DepsMut, Env, MessageInfo, Response,
        StdResult,
    };

    #[entry_point]
    pub fn instantiate(
        deps: DepsMut,
        env: Env,
        info: MessageInfo,
        msg: InstantiateMsg,
    ) -> Result<Response, ContractError> {
        cw2::set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

        let res = Cw721Multi::default().instantiate(deps, env, info, msg)?;

        Ok(res
            .add_attribute("contract_name", CONTRACT_NAME)
            .add_attribute("contract_version", CONTRACT_VERSION))
    }

    #[entry_point]
    pub fn execute(
        deps: DepsMut,
        env: Env,
        info: MessageInfo,
        msg: ExecuteMsg<Extension, ExtensionMsg<TypeT>>,
    ) -> Result<Response, cw721_base::ContractError> {
        let contract = Cw721Multi::default();
        match msg {
            ExecuteMsg::Extension { msg } => match msg {
                ExtensionMsg::MultiMint { owner, messages } => {
                    multi::mint(contract, deps, info, owner, messages)
                }
                ExtensionMsg::MultiTransfer { recipient, token_ids } => {
                    multi::transfer(contract, deps, env, info, recipient, token_ids)
                }
            },
            _ => contract.execute(deps, env, info, msg),
        }
    }

    #[entry_point]
    pub fn query(deps: Deps, env: Env, msg: Cw721QueryMsg<Empty>) -> StdResult<Binary> {
        _query(deps, env, msg.into())
    }
}