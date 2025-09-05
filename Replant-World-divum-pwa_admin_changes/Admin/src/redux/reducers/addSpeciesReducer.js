import {
  ADD_SPECIES_REQUEST,
  ADD_SPECIES_SUCCESS,
  ADD_SPECIES_FAILURE,
  RESET_SPECIES_STATE
} from '../constants/actionTypes';

const initialState = {
  loading: false,
  species: [],
  error: null,
  success: false, // Add this flag
  lastAddedSpeciesId: null,
  message: null
};

const speciesReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_SPECIES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        success: false // Add this flag
      };

    case ADD_SPECIES_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true, // Set to true on success
        lastAddedSpeciesId: action.payload.content.species_id,
        message: action.payload.message
      };

    case ADD_SPECIES_FAILURE:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload
      };

    case RESET_SPECIES_STATE:
      return {
        ...state,
        success: false,
        error: null
      };

    default:
      return state;
  }
};

export default speciesReducer;
