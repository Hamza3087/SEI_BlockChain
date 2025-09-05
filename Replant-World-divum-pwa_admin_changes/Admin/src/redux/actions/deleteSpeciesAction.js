import {
  DELETE_SPECIES_REQUEST,
  DELETE_SPECIES_SUCCESS,
  DELETE_SPECIES_FAILURE,
  RESET_DELETE_SPECIES
} from '../constants/actionTypes';
import { DELETE_SPECIES } from '../../apiConstants/constant';
import { showToast } from '../../components/ToastNotification'; // Import toast service
import api from '../../apiConstants/axiosConfig';

export const deleteSpecies = (speciesId) => {
  return async (dispatch) => {
    dispatch({ type: DELETE_SPECIES_REQUEST });

    try {
      const response = await api.post(`${DELETE_SPECIES}`, {
        species_id: speciesId
      });

      dispatch({
        type: DELETE_SPECIES_SUCCESS,
        payload: response
      });
      showToast.success(response?.message || 'Species deleted successfully!');
      setTimeout(() => {
        dispatch({ type: RESET_DELETE_SPECIES });
      }, 3000);
      return response;
    } catch (error) {
      dispatch({
        type: DELETE_SPECIES_FAILURE,
        payload: error.response
          ? error.response
          : { message: 'Failed to delete species' }
      });
      showToast.error(error?.message || 'Failed to delete species');
      setTimeout(() => {
        dispatch({ type: RESET_DELETE_SPECIES });
      }, 3000);

      throw error;
    }
  };
};

export const resetDeleteSpecies = () => ({
  type: RESET_DELETE_SPECIES
});
