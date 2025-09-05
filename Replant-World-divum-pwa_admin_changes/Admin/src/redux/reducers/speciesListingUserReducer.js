import {
  SPECIES_LISTING_USER_ID_REQUEST,
  SPECIES_LISTING_USER_ID_SUCCESS,
  SPECIES_LISTING_USER_ID_ERROR
} from '../constants/actionTypes';

const initialState = {
  // Add species listing state
  speciesListingDetails: null,
  loadingDetails: false,
  errorDetails: null
};

export default function speciesListingReducerByUserId(
  state = initialState,
  action
) {
  switch (action.type) {
    // Add cases for species details
    case SPECIES_LISTING_USER_ID_REQUEST:
      return {
        ...state,
        loadingDetails: true,
        errorDetails: null
      };
    case SPECIES_LISTING_USER_ID_SUCCESS:
      return {
        ...state,
        speciesListingDetails: action.payload,
        loadingDetails: false
      };
    case SPECIES_LISTING_USER_ID_ERROR:
      return {
        ...state,
        errorDetails: action.payload,
        loadingDetails: false
      };
    default:
      return state;
  }
}
