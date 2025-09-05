import {
  SPECIES_ERROR,
  SPECIES_REQUEST,
  SPECIES_RESET,
  SPECIES_SUCCESS,
  SET_SELECTED_SPECIES
} from '../constants/actionTypes';

const initialState = {
  loading: false,
  error: null,
  speciesList: [],
  selectedSpecies: null
};

const speciesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SPECIES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case SPECIES_SUCCESS:
      return {
        ...state,
        loading: false,
        speciesList: action.payload,
        error: null
      };

    case SPECIES_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case SET_SELECTED_SPECIES:
      return {
        ...state,
        selectedSpecies: action.payload
      };

    case SPECIES_RESET:
      return initialState;

    default:
      return state;
  }
};

export default speciesReducer;
