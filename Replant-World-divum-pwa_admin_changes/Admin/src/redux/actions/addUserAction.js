import {
  ADD_USER_REQUEST,
  ADD_USER_SUCCESS,
  ADD_USER_FAILURE,
  RESET_USER_STATE
} from '../constants/actionTypes';
import { LISTING } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';

export const addUsers = (userData) => {
  return async (dispatch) => {
    dispatch({ type: ADD_USER_REQUEST });

    try {
      const response = await api.post(`${LISTING.USERS_LISTING}`, userData);

      dispatch({
        type: ADD_USER_SUCCESS,
        payload: response
      });

      setTimeout(() => {
        dispatch({ type: RESET_USER_STATE });
      }, 3000);
      return response;
    } catch (error) {
      dispatch({
        type: ADD_USER_FAILURE,
        payload: error.response
          ? error.response
          : { message: 'Failed to add user' }
      });
      setTimeout(() => {
        dispatch({ type: RESET_USER_STATE });
      }, 3000);

      throw error;
    }
  };
};

// Add a separate reset action
export const resetUserState = () => ({
  type: RESET_USER_STATE
});
