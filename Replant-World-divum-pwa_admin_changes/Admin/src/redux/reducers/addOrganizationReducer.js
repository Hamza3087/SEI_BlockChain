import {
  ADD_ORG_REQUEST,
  ADD_ORG_SUCCESS,
  ADD_ORG_FAILURE,
  RESET_ORG_STATE,
  UPDATE_ORG_REQUEST,
  UPDATE_ORG_SUCCESS,
  UPDATE_ORG_FAILURE,
  RESET_UPDATE_ORG_STATE
} from '../constants/actionTypes';

const initialState = {
  loading: false,
  orgs: [],
  error: null,
  success: false, // Add this flag
  orgAdded: false,
  message: null,
  // Update organization state
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
  orgUpdated: false,
  updateMessage: null
};

const addOrgs = (state = initialState, action) => {
  switch (action.type) {
    case ADD_ORG_REQUEST:
      return {
        ...state,
        loading: true,
        success: false,
        error: null,
        orgAdded: false
      };

    case ADD_ORG_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        success: true, // Set to true on success
        orgAdded: true,
        orgs: [...state.orgs, action.payload],
        message: action.payload.message
      };

    case ADD_ORG_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
        orgAdded: false
      };

    case RESET_ORG_STATE:
      return {
        ...state,
        success: false,
        error: null
      };

    // Update organization cases
    case UPDATE_ORG_REQUEST:
      return {
        ...state,
        updateLoading: true,
        updateSuccess: false,
        updateError: null,
        orgUpdated: false
      };

    case UPDATE_ORG_SUCCESS:
      return {
        ...state,
        updateLoading: false,
        updateError: null,
        updateSuccess: true,
        orgUpdated: true,
        updateMessage: action.payload.message
      };

    case UPDATE_ORG_FAILURE:
      return {
        ...state,
        updateLoading: false,
        updateError: action.payload,
        updateSuccess: false,
        orgUpdated: false
      };

    case RESET_UPDATE_ORG_STATE:
      return {
        ...state,
        updateSuccess: false,
        updateError: null
      };

    default:
      return state;
  }
};

export default addOrgs;
