import {
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_ERROR,
  RESET_PASSWORD_CLEAR
} from '../constants/actionTypes';

// Initial state for password reset
const initialState = {
  loading: false,
  resetLink: null,
  error: null,
  success: false
};

// Password reset reducer
const passwordResetReducer = (state = initialState, action) => {
  switch (action.type) {
    case RESET_PASSWORD_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        success: false
      };

    case RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        resetLink: action.payload.reset_link,
        error: null,
        success: true
      };

    case RESET_PASSWORD_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false
      };

    case RESET_PASSWORD_CLEAR:
      return initialState;

    default:
      return state;
  }
};

export default passwordResetReducer;
