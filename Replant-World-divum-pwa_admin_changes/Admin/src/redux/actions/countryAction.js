import {
  COUNTRY_REQUEST,
  COUNTRY_SUCCESS,
  COUNTRY_ERROR,
  SET_SELECTED_COUNTRY,
  COUNTRY_RESET
} from '../constants/actionTypes';
import { DROPDOWN_LISTING } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';

export const setSelectedCountry = (country) => ({
  type: SET_SELECTED_COUNTRY,
  payload: country
});

export const resetCountry = () => ({
  type: COUNTRY_RESET
});

export const fetchCountriesData = () => async (dispatch) => {
  try {
    dispatch({ type: COUNTRY_REQUEST });

    const response = await api.get(`${DROPDOWN_LISTING.COUNTRIES}`);

    const formattedData = response?.map((item) => ({
      id: item.id,
      name: item.name,
      displayName: `${item.name}`
    }));

    dispatch({
      type: COUNTRY_SUCCESS,
      payload: formattedData
    });

    return formattedData;
  } catch (error) {
    const errorMessage =
      error.response?.message ||
      error.message ||
      'Failed to fetch Country data';
    dispatch({
      type: COUNTRY_ERROR,
      payload: errorMessage
    });
    return Promise.reject(errorMessage);
  }
};

// Action to handle selection of an Country
export const handleCountrySelection = (country) => (dispatch) => {
  dispatch(setSelectedCountry(country));
  return country;
};
