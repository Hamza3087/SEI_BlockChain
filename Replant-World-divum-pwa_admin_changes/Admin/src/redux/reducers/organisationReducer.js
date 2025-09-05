import {
  ORGANIZATION_ERROR,
  ORGANIZATION_REQUEST,
  ORGANIZATION_SUCCESS,
  SET_SELECTED_ORGANIZATION,
  ORGANIZATION_RESET
} from '../constants/actionTypes';

const initialState = {
  loading: false,
  error: null,
  orgList: [],
  selectedOrg: null
};

const organisationReducer = (state = initialState, action) => {
  switch (action.type) {
    case ORGANIZATION_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case ORGANIZATION_SUCCESS:
      return {
        ...state,
        loading: false,
        orgList: action.payload,
        error: null
      };

    case ORGANIZATION_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case SET_SELECTED_ORGANIZATION:
      return {
        ...state,
        selectedOrg: action.payload
      };

    case ORGANIZATION_RESET:
      return initialState;

    default:
      return state;
  }
};

export default organisationReducer;
