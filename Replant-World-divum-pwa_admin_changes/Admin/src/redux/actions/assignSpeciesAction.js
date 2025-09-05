import {
  ASSIGN_SPECIES_REQUEST,
  ASSIGN_SPECIES_SUCCESS,
  ASSIGN_SPECIES_FAILURE,
  RESET_SPECIES_ASSIGNMENT_STATE
} from '../constants/actionTypes';
import { showToast } from '../../components/ToastNotification'; // Import toast service
import { ASSIGN_SPECIES } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';

// Action creators for species assignment
export const assignSpeciesRequest = () => ({
  type: ASSIGN_SPECIES_REQUEST
});

export const assignSpeciesSuccess = (data) => ({
  type: ASSIGN_SPECIES_SUCCESS,
  payload: data
});

export const assignSpeciesFailure = (error) => ({
  type: ASSIGN_SPECIES_FAILURE,
  payload: error
});

// Reset action creator
export const resetSpeciesAssignmentState = () => ({
  type: RESET_SPECIES_ASSIGNMENT_STATE
});

// Thunk action for assigning a species
export const assignSpecies = (assignmentData) => async (dispatch) => {
  dispatch(assignSpeciesRequest());

  try {
    const response = await api.put(ASSIGN_SPECIES, {
      organization_id: assignmentData.organization_id,
      species_id: assignmentData.species_id,
      country_id: assignmentData.country_id,
      planting_cost: assignmentData.planting_cost,
      is_native: assignmentData.is_native
    });

    dispatch(assignSpeciesSuccess(response));
    showToast.success(response?.message || 'Species assigned successfully!');
    setTimeout(() => {
      dispatch({ type: RESET_SPECIES_ASSIGNMENT_STATE });
    }, 3000);
    return response;
  } catch (error) {
    dispatch(
      assignSpeciesFailure(
        error.response || error.message || error?.response?.message
      )
    );
    showToast.error(
      error.response ||
        error?.response?.message ||
        error?.message ||
        'Failed to assign species'
    );
    setTimeout(() => {
      dispatch({ type: RESET_SPECIES_ASSIGNMENT_STATE });
    }, 3000);
    throw error;
  }
};
