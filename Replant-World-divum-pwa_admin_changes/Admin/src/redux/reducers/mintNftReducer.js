import {
  MINT_NFT_REQUEST,
  MINT_NFT_SUCCESS,
  MINT_NFT_FAILURE,
  RESET_MINT_NFT
} from '../constants/actionTypes';

const initialState = {
  mintLoading: false,
  mintError: null,
  mintSuccess: false,
  mintedTreeIds: null
};

const mintNftReducer = (state = initialState, action) => {
  switch (action.type) {
    case MINT_NFT_REQUEST:
      return {
        ...state,
        mintLoading: true,
        mintError: null,
        mintSuccess: false,
        mintedTreeIds: null
      };

    case MINT_NFT_SUCCESS:
      return {
        ...state,
        mintLoading: false,
        mintSuccess: true,
        mintError: null,
        mintedTreeIds:
          action.payload.content.tree_ids || action.payload.tree_ids
      };

    case MINT_NFT_FAILURE:
      return {
        ...state,
        mintLoading: false,
        mintError: action.payload,
        mintSuccess: false,
        mintedTreeIds: null
      };

    case RESET_MINT_NFT:
      return {
        ...state
      };
    default:
      return state;
  }
};

export default mintNftReducer;
