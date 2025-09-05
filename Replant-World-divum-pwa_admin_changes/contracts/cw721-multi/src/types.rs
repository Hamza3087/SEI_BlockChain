use cosmwasm_std::Empty;
use cw721_base::{Cw721Contract, Extension}; // Add the missing import for Extension
use crate::msg::ExtensionMsg;

pub type TypeT = Empty;
pub type Cw721Multi<'a> = Cw721Contract<'a, Extension, Empty, ExtensionMsg<TypeT>, TypeT>;