import {
  UPDATE_SPONSOR_REQUEST,
  UPDATE_SPONSOR_SUCCESS,
  UPDATE_SPONSOR_FAILURE,
  RESET_SPONSOR_UPDATE_STATE
} from '../constants/actionTypes';

const initialState = {
  loading: false,
  success: false,
  error: null,
  updatedSponsor: null,
  lastAction: null
};

const updateSponsor = (state = initialState, action) => {
  switch (action.type) {
    // Sponsor Update Cases
    case UPDATE_SPONSOR_REQUEST:
      return {
        ...state,
        loading: true,
        success: false,
        error: null,
        lastAction: 'update_pending'
      };

    case UPDATE_SPONSOR_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        error: null,
        updatedSponsor: action.payload,
        lastAction: 'update_success'
      };

    case UPDATE_SPONSOR_FAILURE:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
        lastAction: 'update_failure'
      };

    // Reset state
    case RESET_SPONSOR_UPDATE_STATE:
      return {
        ...initialState
      };

    default:
      return state;
  }
};

export default updateSponsor;
