import {
  COUNTRY_LISTING_ORG_ID_REQUEST,
  COUNTRY_LISTING_ORG_ID_SUCCESS,
  COUNTRY_LISTING_ORG_ID_ERROR
} from '../constants/actionTypes';

const initialState = {
  // Add country listing state
  countryListingDetails: null,
  loadingDetails: false,
  errorDetails: null
};

export default function countryListingReducer(state = initialState, action) {
  switch (action.type) {
    // Add cases for organization details
    case COUNTRY_LISTING_ORG_ID_REQUEST:
      return {
        ...state,
        loadingDetails: true,
        errorDetails: null
      };
    case COUNTRY_LISTING_ORG_ID_SUCCESS:
      return {
        ...state,
        countryListingDetails: action.payload,
        loadingDetails: false
      };
    case COUNTRY_LISTING_ORG_ID_ERROR:
      return {
        ...state,
        errorDetails: action.payload,
        loadingDetails: false
      };
    default:
      return state;
  }
}
