import {
  AUTH_LOGIN_REQUEST,
  AUTH_LOGIN_SUCCESS,
  AUTH_LOGIN_FAILURE,
  AUTH_LOGOUT,
  USER_DETAILS_REQUEST,
  USER_DETAILS_SUCCESS,
  USER_DETAILS_FAILURE
} from '../constants/authTypes';

const initialState = {
  loading: false,
  user: null,
  error: null,
  isAuthenticated: false,
  userDetailsLoading: false,
  userDetailsError: null
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case AUTH_LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case AUTH_LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload,
        isAuthenticated: true,
        error: null
      };
    case AUTH_LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        user: null,
        error: action.payload,
        isAuthenticated: false
      };
    case AUTH_LOGOUT:
      return {
        ...initialState
      };
    case USER_DETAILS_REQUEST:
      return {
        ...state,
        userDetailsLoading: true,
        userDetailsError: null
      };
    case USER_DETAILS_SUCCESS:
      return {
        ...state,
        userDetailsLoading: false,
        user: {
          ...state.user,
          ...action.payload
        },
        userDetailsError: null
      };
    case USER_DETAILS_FAILURE:
      return {
        ...state,
        userDetailsLoading: false,
        userDetailsError: action.payload
      };
    default:
      return state;
  }
};

export default authReducer;
