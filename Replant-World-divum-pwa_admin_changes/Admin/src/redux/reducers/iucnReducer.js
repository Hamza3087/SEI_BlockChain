import {
  IUCN_STATUS_REQUEST,
  IUCN_STATUS_SUCCESS,
  IUCN_STATUS_ERROR,
  SET_SELECTED_IUCN_STATUS,
  IUCN_STATUS_RESET
} from '../constants/actionTypes';

// Initial state for IUCN status
const initialState = {
  loading: false,
  error: null,
  iucnStatusList: [],
  selectedStatus: null
};

// IUCN status reducer
const iucnReducer = (state = initialState, action) => {
  switch (action.type) {
    case IUCN_STATUS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case IUCN_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        iucnStatusList: action.payload,
        error: null
      };

    case IUCN_STATUS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case SET_SELECTED_IUCN_STATUS:
      return {
        ...state,
        selectedStatus: action.payload
      };

    case IUCN_STATUS_RESET:
      return initialState;

    default:
      return state;
  }
};

export default iucnReducer;
