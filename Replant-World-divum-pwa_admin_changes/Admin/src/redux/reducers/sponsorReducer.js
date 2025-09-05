import {
  SPONSOR_ERROR,
  SPONSOR_RESET,
  SPONSOR_REQUEST,
  SPONSOR_SUCCESS,
  SET_SELECTED_SPONSOR
} from '../constants/actionTypes';

const initialState = {
  loading: false,
  error: null,
  sponsorList: [],
  selectedSponsor: null
};

const sponsorReducer = (state = initialState, action) => {
  switch (action.type) {
    case SPONSOR_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case SPONSOR_SUCCESS:
      return {
        ...state,
        loading: false,
        sponsorList: action.payload,
        error: null
      };

    case SPONSOR_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case SET_SELECTED_SPONSOR:
      return {
        ...state,
        selectedSponsor: action.payload
      };

    case SPONSOR_RESET:
      return initialState;

    default:
      return state;
  }
};

export default sponsorReducer;
