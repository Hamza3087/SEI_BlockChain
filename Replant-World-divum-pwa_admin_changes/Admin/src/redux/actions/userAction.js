import {
  USER_ERROR,
  USER_REQUEST,
  USER_SUCCESS,
  USER_RESET,
  SET_SELECTED_USER
} from '../constants/actionTypes';
import { DROPDOWN_LISTING } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';

// Action creator to set selected user status
export const setSelectedUser = (user) => ({
  type: SET_SELECTED_USER,
  payload: user
});

// Reset user state
export const resetUser = () => ({
  type: USER_RESET
});

// Action creator for fetching User status data
export const fetchUserData = () => async (dispatch) => {
  try {
    dispatch({ type: USER_REQUEST });

    const response = await api.get(`${DROPDOWN_LISTING.USERS}`);

    // Format the data to display as "Name (ID)" in the dropdown
    const formattedData = response?.map((item) => ({
      id: item.id,
      name: item.name
    }));

    dispatch({
      type: USER_SUCCESS,
      payload: formattedData
    });

    return formattedData;
  } catch (error) {
    const errorMessage =
      error.response?.message ||
      error.message ||
      'Failed to fetch user status data';
    dispatch({
      type: USER_ERROR,
      payload: errorMessage
    });
    return Promise.reject(errorMessage);
  }
};

// Action to handle selection of an user status
export const handleUserSelection = (user) => (dispatch) => {
  dispatch(setSelectedUser(user));
  return user;
};
