import {
  DELETE_ORG_SPECIES_SUCCESS,
  DELETE_ORG_SPECIES_FAILURE,
  DELETE_ORG_SPECIES_REQUEST,
  RESET_ORG_DELETE_SPECIES
} from '../constants/actionTypes';
import { DELETE_ORG_SPECIES } from '../../apiConstants/constant';
import { showToast } from '../../components/ToastNotification'; // Import toast service
import api from '../../apiConstants/axiosConfig';
import { refreshThePage } from '../../utils/helperFunction';

export const deleteOrgSpecies = (speciesId, orgId) => {
  return async (dispatch) => {
    dispatch({ type: DELETE_ORG_SPECIES_REQUEST });

    try {
      const response = await api.post(`${DELETE_ORG_SPECIES}`, {
        species_id: speciesId,
        organization_id: orgId
      });

      dispatch({
        type: DELETE_ORG_SPECIES_SUCCESS,
        payload: response
      });
      showToast.success(
        response?.message || 'Organisation Species deleted successfully!'
      );
      refreshThePage();
      setTimeout(() => {
        dispatch({ type: RESET_ORG_DELETE_SPECIES });
      }, 3000);
      return response;
    } catch (error) {
      dispatch({
        type: DELETE_ORG_SPECIES_FAILURE,
        payload: error.response
          ? error.response
          : { message: 'Failed to delete org species' }
      });
      showToast.error(error?.message || 'Failed to delete species');
      setTimeout(() => {
        dispatch({ type: RESET_ORG_DELETE_SPECIES });
      }, 3000);

      throw error;
    }
  };
};

export const resetOrgDeleteSpecies = () => ({
  type: RESET_ORG_DELETE_SPECIES
});
