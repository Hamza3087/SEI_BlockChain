import {
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,
  RESET_LOGOUT
} from '../constants/actionTypes';

const initialState = {
  loading: false,
  error: null,
  success: false
};

const logoutReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGOUT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        success: false
      };

    case LOGOUT_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        error: null
      };

    case LOGOUT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false
      };

    case RESET_LOGOUT:
      return {
        ...state
      };

    default:
      return state;
  }
};

export default logoutReducer;
