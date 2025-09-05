import {
  USER_ERROR,
  USER_REQUEST,
  USER_SUCCESS,
  USER_RESET,
  SET_SELECTED_USER
} from '../constants/actionTypes';

// Initial state for user status
const initialState = {
  loading: false,
  error: null,
  userList: [],
  selectedUser: null
};

// user reducer
const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case USER_SUCCESS:
      return {
        ...state,
        loading: false,
        userList: action.payload,
        error: null
      };

    case USER_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case SET_SELECTED_USER:
      return {
        ...state,
        selectedUser: action.payload
      };

    case USER_RESET:
      return initialState;

    default:
      return state;
  }
};

export default userReducer;
