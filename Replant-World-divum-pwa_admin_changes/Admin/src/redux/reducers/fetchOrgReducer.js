import {
  ORGANIZATION_DETAILS_REQUEST,
  ORGANIZATION_DETAILS_SUCCESS,
  ORGANIZATION_DETAILS_ERROR
} from '../constants/actionTypes';

const initialState = {
  // Add organization details state
  organizationDetails: null,
  loadingDetails: false,
  errorDetails: null
};

export default function orgDetailsReducer(state = initialState, action) {
  switch (action.type) {
    // Add cases for organization details
    case ORGANIZATION_DETAILS_REQUEST:
      return {
        ...state,
        loadingDetails: true,
        errorDetails: null
      };
    case ORGANIZATION_DETAILS_SUCCESS:
      return {
        ...state,
        organizationDetails: action.payload,
        loadingDetails: false
      };
    case ORGANIZATION_DETAILS_ERROR:
      return {
        ...state,
        errorDetails: action.payload,
        loadingDetails: false
      };
    default:
      return state;
  }
}
