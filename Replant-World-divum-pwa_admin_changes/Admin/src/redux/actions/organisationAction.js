import {
  ORGANIZATION_ERROR,
  ORGANIZATION_REQUEST,
  ORGANIZATION_SUCCESS,
  SET_SELECTED_ORGANIZATION,
  ORGANIZATION_RESET
} from '../constants/actionTypes';
import { DROPDOWN_LISTING } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';

export const setSelectedOrg = (org) => ({
  type: SET_SELECTED_ORGANIZATION,
  payload: org
});

export const resetOrg = () => ({
  type: ORGANIZATION_RESET
});

export const fetchOrganizationData = () => async (dispatch) => {
  try {
    dispatch({ type: ORGANIZATION_REQUEST });

    const response = await api.get(`${DROPDOWN_LISTING.ORGANIZATION}`);

    const formattedData = response?.map((item) => ({
      id: item.id,
      name: item.name,
      displayName: `${item.name}`
    }));

    dispatch({
      type: ORGANIZATION_SUCCESS,
      payload: formattedData
    });

    return formattedData;
  } catch (error) {
    const errorMessage =
      error.response?.message ||
      error.message ||
      'Failed to fetch Organization data';
    dispatch({
      type: ORGANIZATION_ERROR,
      payload: errorMessage
    });
    return Promise.reject(errorMessage);
  }
};

// Action to handle selection of an Organization
export const handleOrgSelection = (org) => (dispatch) => {
  dispatch(setSelectedOrg(org));
  return org;
};
