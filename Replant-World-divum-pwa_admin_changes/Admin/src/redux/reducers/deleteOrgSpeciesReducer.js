import {
  DELETE_ORG_SPECIES_SUCCESS,
  DELETE_ORG_SPECIES_FAILURE,
  DELETE_ORG_SPECIES_REQUEST,
  RESET_ORG_DELETE_SPECIES
} from '../constants/actionTypes';

const initialState = {
  deleteLoading: false,
  deleteError: null,
  deleteSuccess: false,
  deletedOrgSpeciesId: null
};

const deleteOrgSpeciesReducer = (state = initialState, action) => {
  switch (action.type) {
    case DELETE_ORG_SPECIES_REQUEST:
      return {
        ...state,
        deleteLoading: true,
        deleteError: null,
        deleteSuccess: false,
        deletedOrgSpeciesId: null
      };

    case DELETE_ORG_SPECIES_SUCCESS:
      return {
        ...state,
        deleteLoading: false,
        deleteSuccess: true,
        deleteError: null,
        deletedOrgSpeciesId: action.payload.content.species_id
      };

    case DELETE_ORG_SPECIES_FAILURE:
      return {
        ...state,
        deleteLoading: false,
        deleteError: action.payload,
        deleteSuccess: false,
        deletedOrgSpeciesId: null
      };

    case RESET_ORG_DELETE_SPECIES:
      return {
        ...state
      };
    default:
      return state;
  }
};

export default deleteOrgSpeciesReducer;
