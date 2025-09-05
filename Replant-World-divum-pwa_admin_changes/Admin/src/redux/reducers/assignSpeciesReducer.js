import {
  ASSIGN_SPECIES_REQUEST,
  ASSIGN_SPECIES_SUCCESS,
  ASSIGN_SPECIES_FAILURE,
  RESET_SPECIES_ASSIGNMENT_STATE
} from '../constants/actionTypes';

const initialState = {
  loading: false,
  success: false,
  error: null,
  lastAssignedSpecies: null,
  lastAction: null
};

const assignSpecies = (state = initialState, action) => {
  switch (action.type) {
    // Species Assignment Cases
    case ASSIGN_SPECIES_REQUEST:
      return {
        ...state,
        loading: true,
        success: false,
        error: null,
        lastAction: 'assign_pending'
      };

    case ASSIGN_SPECIES_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        error: null,
        lastAssignedSpecies: action.payload,
        lastAction: 'assign_success'
      };

    case ASSIGN_SPECIES_FAILURE:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
        lastAction: 'assign_failure'
      };

    // Reset state
    case RESET_SPECIES_ASSIGNMENT_STATE:
      return {
        ...initialState
      };

    default:
      return state;
  }
};

export default assignSpecies;
