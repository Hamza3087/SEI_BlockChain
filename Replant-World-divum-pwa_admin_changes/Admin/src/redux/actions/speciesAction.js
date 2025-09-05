import {
  SPECIES_ERROR,
  SPECIES_REQUEST,
  SPECIES_RESET,
  SPECIES_SUCCESS,
  SET_SELECTED_SPECIES
} from '../constants/actionTypes';
import { DROPDOWN_LISTING } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';

export const setSelectedSpecies = (species) => ({
  type: SET_SELECTED_SPECIES,
  payload: species
});

export const resetSpecies = () => ({
  type: SPECIES_RESET
});

export const fetchSpeciesData = () => async (dispatch) => {
  try {
    dispatch({ type: SPECIES_REQUEST });

    const response = await api.get(`${DROPDOWN_LISTING.SPECIES}`);

    const formattedData = response?.map((item) => ({
      id: item.id,
      common_name: item.common_name,
      botanical_name: item.botanical_name,
      displayName: `${item.common_name} (${item.botanical_name})`
    }));

    dispatch({
      type: SPECIES_SUCCESS,
      payload: formattedData
    });

    return formattedData;
  } catch (error) {
    const errorMessage =
      error.response?.message ||
      error.message ||
      'Failed to fetch Species data';
    dispatch({
      type: SPECIES_ERROR,
      payload: errorMessage
    });
    return Promise.reject(errorMessage);
  }
};

// Action to handle selection of an Species
export const handleSpeciesSelection = (species) => (dispatch) => {
  dispatch(setSelectedSpecies(species));
  return species;
};
