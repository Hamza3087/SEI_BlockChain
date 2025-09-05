import {
  ADD_SPONSOR_REQUEST,
  ADD_SPONSOR_SUCCESS,
  ADD_SPONSOR_FAILURE,
  RESET_SPONSOR_STATE
} from '../constants/actionTypes';

const initialState = {
  loading: false,
  sponsors: [],
  error: null,
  success: false, // Add this flag
  sponsorAdded: false,
  message: null
};

const addSponsorReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_SPONSOR_REQUEST:
      return {
        ...state,
        loading: true,
        success: false, // Add this flag
        error: null,
        sponsorAdded: false
      };

    case ADD_SPONSOR_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true, // Add this flag
        error: null,
        sponsorAdded: true,
        sponsors: [...state.sponsors, action.payload.content],
        message: action.payload.message
      };

    case ADD_SPONSOR_FAILURE:
      return {
        ...state,
        loading: false,
        success: false, // Add this flag
        error: action.payload,
        sponsorAdded: false
      };

    case RESET_SPONSOR_STATE:
      return {
        ...state,
        success: false,
        error: null
      };

    default:
      return state;
  }
};

export default addSponsorReducer;
