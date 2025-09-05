import {
  ADD_SPECIES_REQUEST,
  ADD_SPECIES_SUCCESS,
  ADD_SPECIES_FAILURE,
  RESET_SPECIES_STATE
} from '../constants/actionTypes';
import { LISTING } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';

export const addSpecies = (speciesData) => {
  return async (dispatch) => {
    dispatch({ type: ADD_SPECIES_REQUEST });

    try {
      const response = await api.post(
        `${LISTING.SPECIES_LISTING}`,
        speciesData
      );

      dispatch({
        type: ADD_SPECIES_SUCCESS,
        payload: response
      });

      // Reset state after 3 seconds
      setTimeout(() => {
        dispatch({ type: RESET_SPECIES_STATE });
      }, 3000);
      return response;
    } catch (error) {
      dispatch({
        type: ADD_SPECIES_FAILURE,
        payload: error.response
          ? error.response
          : { message: 'Failed to add species' }
      });
      // Reset error state after 3 seconds
      setTimeout(() => {
        dispatch({ type: RESET_SPECIES_STATE });
      }, 3000);

      throw error;
    }
  };
};

// Add a separate reset action
export const resetSpeciesState = () => ({
  type: RESET_SPECIES_STATE
});
