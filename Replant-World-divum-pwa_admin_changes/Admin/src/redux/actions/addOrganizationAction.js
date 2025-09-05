import {
  ADD_ORG_REQUEST,
  ADD_ORG_SUCCESS,
  ADD_ORG_FAILURE,
  RESET_ORG_STATE,
  UPDATE_ORG_REQUEST,
  UPDATE_ORG_SUCCESS,
  UPDATE_ORG_FAILURE,
  RESET_UPDATE_ORG_STATE
} from '../constants/actionTypes';
import { LISTING } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';

export const addOrganisation = (orgData) => {
  return async (dispatch) => {
    dispatch({ type: ADD_ORG_REQUEST });

    try {
      const response = await api.post(
        `${LISTING.ORGANIZATION_LISTING}`,
        orgData
      );

      dispatch({
        type: ADD_ORG_SUCCESS,
        payload: response
      });
      // Reset state after 3 seconds
      setTimeout(() => {
        dispatch({ type: RESET_ORG_STATE });
      }, 3000);

      return response;
    } catch (error) {
      dispatch({
        type: ADD_ORG_FAILURE,
        payload: error.response
          ? error.response
          : { message: 'Failed to add organisation' }
      });
      // Reset error state after 3 seconds
      setTimeout(() => {
        dispatch({ type: RESET_ORG_STATE });
      }, 3000);

      throw error;
    }
  };
};

// Add a separate reset action
export const resetOrgState = () => ({
  type: RESET_ORG_STATE
});

// Update organization action
export const updateOrganisation = (orgId, orgData) => {
  return async (dispatch) => {
    dispatch({ type: UPDATE_ORG_REQUEST });

    try {
      const response = await api.put(
        `${LISTING.EDIT_ORGANIZATION}/${orgId}`,
        orgData
      );

      dispatch({
        type: UPDATE_ORG_SUCCESS,
        payload: response
      });
      // Reset state after 3 seconds
      setTimeout(() => {
        dispatch({ type: RESET_UPDATE_ORG_STATE });
      }, 3000);

      return response;
    } catch (error) {
      dispatch({
        type: UPDATE_ORG_FAILURE,
        payload: error.response
          ? error.response
          : { message: 'Failed to update organisation' }
      });
      // Reset error state after 3 seconds
      setTimeout(() => {
        dispatch({ type: RESET_UPDATE_ORG_STATE });
      }, 3000);

      throw error;
    }
  };
};

// Reset update organization state action
export const resetUpdateOrgState = () => ({
  type: RESET_UPDATE_ORG_STATE
});
