import {
  SPECIES_LISTING_USER_ID_REQUEST,
  SPECIES_LISTING_USER_ID_SUCCESS,
  SPECIES_LISTING_USER_ID_ERROR
} from '../constants/actionTypes';
import { DROPDOWN_LISTING } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';

// Action to fetch species listing by user ID
export const fetchSpeciesListingByUserId = (userId) => async (dispatch) => {
  try {
    dispatch({ type: SPECIES_LISTING_USER_ID_REQUEST });

    const response = await api.get(
      `${DROPDOWN_LISTING.SPECIES_LISTING_USER_ID}?user_id=${userId}`
    );

    dispatch({
      type: SPECIES_LISTING_USER_ID_SUCCESS,
      payload: response
    });

    return response;
  } catch (error) {
    const errorMessage =
      error.response?.message ||
      error.message ||
      'Failed to fetch species details';
    dispatch({
      type: SPECIES_LISTING_USER_ID_ERROR,
      payload: errorMessage
    });
    return Promise.reject(errorMessage);
  }
};
