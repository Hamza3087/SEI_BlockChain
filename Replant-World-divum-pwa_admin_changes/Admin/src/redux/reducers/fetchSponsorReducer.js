import {
  SPONSOR_DETAILS_ERROR,
  SPONSOR_DETAILS_SUCCESS,
  SPONSOR_DETAILS_REQUEST
} from '../constants/actionTypes';

const initialState = {
  sponsorDetails: null,
  loadingDetails: false,
  totalCount: 0,
  errorDetails: null
};

export default function sponsorDetailsReducer(state = initialState, action) {
  switch (action.type) {
    case SPONSOR_DETAILS_REQUEST:
      return {
        ...state,
        loadingDetails: true,
        errorDetails: null
      };
    case SPONSOR_DETAILS_SUCCESS:
      return {
        ...state,
        sponsorDetails: action.payload || [],
        totalCount: action.count,
        loadingDetails: false
      };
    case SPONSOR_DETAILS_ERROR:
      return {
        ...state,
        errorDetails: action.payload,
        loadingDetails: false
      };
    default:
      return state;
  }
}
