import * as types from '../constants/authTypes';
import { AUTH } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';

export const login = (credentials) => async (dispatch) => {
  dispatch({ type: types.AUTH_LOGIN_REQUEST });
  try {
    const response = await api.post(AUTH.LOGIN, credentials);
    dispatch({ type: types.AUTH_LOGIN_SUCCESS, payload: response });

    return response;
  } catch (error) {
    const errorMessage = error.response || error.message || 'Login failed';
    dispatch({ type: types.AUTH_LOGIN_FAILURE, payload: errorMessage });
    throw error;
  }
};

export const logout = () => (dispatch) => {
  // Remove token from localStorage
  localStorage.removeItem('accessToken');

  // Dispatch logout action
  dispatch({ type: types.AUTH_LOGOUT });
};

export const getUserDetails = () => async (dispatch) => {
  dispatch({ type: types.USER_DETAILS_REQUEST });
  try {
    const response = await api.get(AUTH.ADMIN_DETAILS);
    dispatch({
      type: types.USER_DETAILS_SUCCESS,
      payload: response
    });
    return response;
  } catch (error) {
    const errorMessage =
      error.response || error.message || 'Failed to fetch user details';
    dispatch({
      type: types.USER_DETAILS_FAILURE,
      payload: errorMessage
    });
    throw error;
  }
};
