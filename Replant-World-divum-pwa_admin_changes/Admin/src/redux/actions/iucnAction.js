import {
  IUCN_STATUS_REQUEST,
  IUCN_STATUS_SUCCESS,
  IUCN_STATUS_ERROR,
  SET_SELECTED_IUCN_STATUS,
  IUCN_STATUS_RESET
} from '../constants/actionTypes';
import { DROPDOWN_LISTING } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';

// Action creator to set selected IUCN status
export const setSelectedIucnStatus = (status) => ({
  type: SET_SELECTED_IUCN_STATUS,
  payload: status
});

// Reset IUCN status state
export const resetIucnStatus = () => ({
  type: IUCN_STATUS_RESET
});

// Action creator for fetching IUCN status data
export const fetchIucnStatusData = () => async (dispatch) => {
  try {
    dispatch({ type: IUCN_STATUS_REQUEST });

    const response = await api.get(`${DROPDOWN_LISTING.IUCN_STATUS}`);

    // Format the data to display as "Name (ID)" in the dropdown
    const formattedData = response?.map((item) => ({
      id: item.id,
      name: item.name,
      count: item.count,
      displayName: `${item.name} (${item.id})`
    }));

    dispatch({
      type: IUCN_STATUS_SUCCESS,
      payload: formattedData
    });

    return formattedData;
  } catch (error) {
    const errorMessage =
      error.response?.message ||
      error.message ||
      'Failed to fetch IUCN status data';
    dispatch({
      type: IUCN_STATUS_ERROR,
      payload: errorMessage
    });
    return Promise.reject(errorMessage);
  }
};

// Action to handle selection of an IUCN status
export const handleIucnStatusSelection = (status) => (dispatch) => {
  dispatch(setSelectedIucnStatus(status));
  return status;
};
