import {
  USER_RESET_LINK_REQUEST,
  USER_RESET_LINK_SUCCESS,
  USER_RESET_LINK_ERROR,
  USER_RESET_LINK_RESET
} from '../constants/actionTypes';

const initialState = {
  loading: false,
  resetLink: null,
  error: null,
  success: false
};

const userResetLinkReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_RESET_LINK_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        success: false
      };
    case USER_RESET_LINK_SUCCESS:
      return {
        ...state,
        loading: false,
        resetLink: action.payload,
        error: null,
        success: true
      };
    case USER_RESET_LINK_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false
      };
    case USER_RESET_LINK_RESET:
      return initialState;
    default:
      return state;
  }
};

export default userResetLinkReducer;
