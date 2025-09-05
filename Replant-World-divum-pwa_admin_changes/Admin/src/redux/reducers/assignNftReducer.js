import {
  ASSIGN_NFT_REQUEST,
  ASSIGN_NFT_SUCCESS,
  ASSIGN_NFT_FAILURE,
  RESET_NFT_ASSIGNMENT_STATE
} from '../constants/actionTypes';

const initialState = {
  loading: false,
  success: false,
  error: null,
  lastAssignedNft: null,
  lastAction: null
};

const assignNft = (state = initialState, action) => {
  switch (action.type) {
    // Nft Assignment Cases
    case ASSIGN_NFT_REQUEST:
      return {
        ...state,
        loading: true,
        success: false,
        error: null,
        lastAction: 'assign_pending'
      };

    case ASSIGN_NFT_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        error: null,
        lastAssignedNft: action.payload,
        lastAction: 'assign_success'
      };

    case ASSIGN_NFT_FAILURE:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
        lastAction: 'assign_failure'
      };

    // Reset state
    case RESET_NFT_ASSIGNMENT_STATE:
      return {
        ...initialState
      };

    default:
      return state;
  }
};

export default assignNft;
