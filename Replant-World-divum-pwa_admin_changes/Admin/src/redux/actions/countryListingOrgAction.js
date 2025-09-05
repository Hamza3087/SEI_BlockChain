import {
  COUNTRY_LISTING_ORG_ID_REQUEST,
  COUNTRY_LISTING_ORG_ID_SUCCESS,
  COUNTRY_LISTING_ORG_ID_ERROR
} from '../constants/actionTypes';
import { DROPDOWN_LISTING } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';

// Action to fetch country listing by ID
export const fetchCountryListing = (orgId) => async (dispatch) => {
  try {
    dispatch({ type: COUNTRY_LISTING_ORG_ID_REQUEST });

    const response = await api.get(
      `${DROPDOWN_LISTING.COUNTRY_LIST_ORG_ID}?organization_id=${orgId}`
    );

    dispatch({
      type: COUNTRY_LISTING_ORG_ID_SUCCESS,
      payload: response
    });

    return response;
  } catch (error) {
    const errorMessage =
      error.response?.message ||
      error.message ||
      'Failed to fetch organization details';
    dispatch({
      type: COUNTRY_LISTING_ORG_ID_ERROR,
      payload: errorMessage
    });
    return Promise.reject(errorMessage);
  }
};
