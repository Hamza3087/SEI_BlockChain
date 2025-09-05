import {
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_ERROR,
  RESET_PASSWORD_CLEAR
} from '../constants/actionTypes';
import { showToast } from '../../components/ToastNotification';
import { AUTH } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';

// Action creator for reset password request state
export const resetPasswordRequest = () => ({
  type: RESET_PASSWORD_REQUEST
});

// Action creator for reset password success
export const resetPasswordSuccess = (data) => ({
  type: RESET_PASSWORD_SUCCESS,
  payload: data
});

// Action creator for reset password error
export const resetPasswordError = (error) => ({
  type: RESET_PASSWORD_ERROR,
  payload: error
});

// Action creator to clear reset password state
export const clearResetPasswordState = () => ({
  type: RESET_PASSWORD_CLEAR
});

/**
 * Action to generate password reset link for a user
 * @param {number} userId - The ID of the user
 * @returns {Function} - Thunk function
 */
export const generatePasswordResetLink = (userId) => async (dispatch) => {
  dispatch(resetPasswordRequest());

  try {
    const response = await api.get(`${AUTH.RESET_PASSWORD_LINK}/${userId}`);

    dispatch(resetPasswordSuccess(response.content));
    showToast.success(
      response.message || 'Password reset link generated successfully'
    );

    // Clear the state after some time
    setTimeout(() => {
      dispatch(clearResetPasswordState());
    }, 3000);

    return response.content;
  } catch (error) {
    const errorMessage =
      error.response?.message || 'Failed to generate password reset link';

    dispatch(resetPasswordError(errorMessage));
    showToast.error(errorMessage);

    // Clear the error state after some time
    setTimeout(() => {
      dispatch(clearResetPasswordState());
    }, 3000);

    return Promise.reject(errorMessage);
  }
};
