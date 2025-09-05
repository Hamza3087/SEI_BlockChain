import {
  ADD_USER_REQUEST,
  ADD_USER_SUCCESS,
  ADD_USER_FAILURE,
  RESET_USER_STATE
} from '../constants/actionTypes';

const initialState = {
  loading: false,
  users: [],
  error: null,
  success: false, // Add this flag
  userAdded: false,
  message: null
};

const addUsers = (state = initialState, action) => {
  switch (action.type) {
    case ADD_USER_REQUEST:
      return {
        ...state,
        loading: true,
        success: false,
        error: null,
        userAdded: false
      };

    case ADD_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        userAdded: true,
        success: true, // Set to true on success
        users: [...state.users, action.payload],
        message: action.payload.message
      };

    case ADD_USER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
        userAdded: false
      };

    case RESET_USER_STATE:
      return {
        ...state,
        success: false,
        error: null
      };

    default:
      return state;
  }
};

export default addUsers;
