import {
  SPONSOR_ERROR,
  SPONSOR_RESET,
  SPONSOR_REQUEST,
  SPONSOR_SUCCESS,
  SET_SELECTED_SPONSOR
} from '../constants/actionTypes';
import { DROPDOWN_LISTING } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';

export const setSelectedSponsor = (sponsor) => ({
  type: SET_SELECTED_SPONSOR,
  payload: sponsor
});

export const resetSponsor = () => ({
  type: SPONSOR_RESET
});

export const fetchSponsorData = () => async (dispatch) => {
  try {
    dispatch({ type: SPONSOR_REQUEST });

    const response = await api.get(`${DROPDOWN_LISTING.SPONSOR}`);

    const formattedData = response?.map((item) => ({
      id: item.id,
      name: item.name,
      displayName: `${item.name}`
    }));

    dispatch({
      type: SPONSOR_SUCCESS,
      payload: formattedData
    });

    return formattedData;
  } catch (error) {
    const errorMessage =
      error.response?.message ||
      error.message ||
      'Failed to fetch Sponsor data';
    dispatch({
      type: SPONSOR_ERROR,
      payload: errorMessage
    });
    return Promise.reject(errorMessage);
  }
};

// Action to handle selection of an Sponsor
export const handleSponsorSelection = (sponsor) => (dispatch) => {
  dispatch(setSelectedSponsor(sponsor));
  return sponsor;
};
