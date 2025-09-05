import {
  ORGANIZATION_DETAILS_REQUEST,
  ORGANIZATION_DETAILS_SUCCESS,
  ORGANIZATION_DETAILS_ERROR
} from '../constants/actionTypes';
import { LISTING } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';

// Action to fetch organization details by ID
export const fetchOrganizationDetails = (orgId) => async (dispatch) => {
  try {
    dispatch({ type: ORGANIZATION_DETAILS_REQUEST });

    const response = await api.get(`${LISTING.ORGANIZATION_LISTING}/${orgId}`);

    dispatch({
      type: ORGANIZATION_DETAILS_SUCCESS,
      payload: response
    });

    return response;
  } catch (error) {
    const errorMessage =
      error.response?.message ||
      error.message ||
      'Failed to fetch organization details';
    dispatch({
      type: ORGANIZATION_DETAILS_ERROR,
      payload: errorMessage
    });
    return Promise.reject(errorMessage);
  }
};
