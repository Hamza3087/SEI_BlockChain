import {
  SIGNUP_LINK_REQUEST,
  SIGNUP_LINK_SUCCESS,
  SIGNUP_LINK_ERROR,
  SIGNUP_LINK_RESET
} from '../constants/actionTypes';
import { showToast } from '../../components/ToastNotification';
import { AUTH } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';

export const signupLinkRequest = () => ({
  type: SIGNUP_LINK_REQUEST
});

export const signupLinkSuccess = (data) => ({
  type: SIGNUP_LINK_SUCCESS,
  payload: data
});

export const signupLinkError = (error) => ({
  type: SIGNUP_LINK_ERROR,
  payload: error
});

export const clearSignupLinkState = () => ({
  type: SIGNUP_LINK_RESET
});

/**
 * Action to generate a signup link for an organization.
 * @param {number} organisationId - The organization's ID.
 * @returns {Function} - Thunk function.
 */
export const generateSignupLink = (organisationId) => async (dispatch) => {
  dispatch(signupLinkRequest());
  try {
    const response = await api.get(`${AUTH.SIGNUP_LINK}/${organisationId}`);
    dispatch(signupLinkSuccess(response));
    showToast.success(
      response.message || 'Signup link generated successfully',
      { autoClose: 3000 }
    );
    setTimeout(() => {
      dispatch(clearSignupLinkState());
    }, 3000);
    return response;
  } catch (error) {
    const errorMessage =
      error?.detail || error?.message || 'Failed to generate signup link';
    dispatch(signupLinkError(errorMessage));
    showToast.error(errorMessage, { autoClose: 3000 });
    setTimeout(() => {
      dispatch(clearSignupLinkState());
    }, 3000);
    return Promise.reject(errorMessage);
  }
};
