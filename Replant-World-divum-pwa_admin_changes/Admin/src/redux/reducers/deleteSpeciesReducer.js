import {
  DELETE_SPECIES_REQUEST,
  DELETE_SPECIES_SUCCESS,
  DELETE_SPECIES_FAILURE,
  RESET_DELETE_SPECIES
} from '../constants/actionTypes';

const initialState = {
  deleteLoading: false,
  deleteError: null,
  deleteSuccess: false,
  deletedSpeciesId: null
};

const deleteSpeciesReducer = (state = initialState, action) => {
  switch (action.type) {
    case DELETE_SPECIES_REQUEST:
      return {
        ...state,
        deleteLoading: true,
        deleteError: null,
        deleteSuccess: false,
        deletedSpeciesId: null
      };

    case DELETE_SPECIES_SUCCESS:
      return {
        ...state,
        deleteLoading: false,
        deleteSuccess: true,
        deleteError: null,
        deletedSpeciesId: action.payload.content.species_id
      };

    case DELETE_SPECIES_FAILURE:
      return {
        ...state,
        deleteLoading: false,
        deleteError: action.payload,
        deleteSuccess: false,
        deletedSpeciesId: null
      };

    case RESET_DELETE_SPECIES:
      return {
        ...state
      };
    default:
      return state;
  }
};

export default deleteSpeciesReducer;
