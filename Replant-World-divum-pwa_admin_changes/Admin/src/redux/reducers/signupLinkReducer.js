import {
  SIGNUP_LINK_REQUEST,
  SIGNUP_LINK_SUCCESS,
  SIGNUP_LINK_ERROR,
  SIGNUP_LINK_RESET
} from '../constants/actionTypes';

const initialState = {
  loading: false,
  signupLink: null,
  error: null,
  success: false
};

const signupLinkReducer = (state = initialState, action) => {
  switch (action.type) {
    case SIGNUP_LINK_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        success: false
      };
    case SIGNUP_LINK_SUCCESS:
      return {
        ...state,
        loading: false,
        signupLink: action.payload,
        error: null,
        success: true
      };
    case SIGNUP_LINK_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false
      };
    case SIGNUP_LINK_RESET:
      return initialState;
    default:
      return state;
  }
};

export default signupLinkReducer;
