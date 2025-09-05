import {
  RESET_PASSWORD_SUBMIT_REQUEST,
  RESET_PASSWORD_SUBMIT_SUCCESS,
  RESET_PASSWORD_SUBMIT_ERROR,
  RESET_PASSWORD_SUBMIT_CLEAR
} from '../constants/actionTypes';

// Initial state for password reset submission
const initialState = {
  loading: false,
  success: false,
  error: null
};

// Password reset submission reducer
const resetPasswordReducer = (state = initialState, action) => {
  switch (action.type) {
    case RESET_PASSWORD_SUBMIT_REQUEST:
      return {
        ...state,
        loading: true,
        success: false,
        error: null
      };

    case RESET_PASSWORD_SUBMIT_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        error: null
      };

    case RESET_PASSWORD_SUBMIT_ERROR:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload
      };

    case RESET_PASSWORD_SUBMIT_CLEAR:
      return initialState;

    default:
      return state;
  }
};

export default resetPasswordReducer;
