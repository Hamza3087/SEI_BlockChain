import {
  RESET_PASSWORD_SUBMIT_REQUEST,
  RESET_PASSWORD_SUBMIT_SUCCESS,
  RESET_PASSWORD_SUBMIT_ERROR,
  RESET_PASSWORD_SUBMIT_CLEAR
} from '../constants/actionTypes';
import { showToast } from '../../components/ToastNotification';
import { AUTH } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';

// Action creator for reset password submit request
export const resetPasswordSubmitRequest = () => ({
  type: RESET_PASSWORD_SUBMIT_REQUEST
});

// Action creator for reset password submit success
export const resetPasswordSubmitSuccess = (data) => ({
  type: RESET_PASSWORD_SUBMIT_SUCCESS,
  payload: data
});

// Action creator for reset password submit error
export const resetPasswordSubmitError = (error) => ({
  type: RESET_PASSWORD_SUBMIT_ERROR,
  payload: error
});

// Action creator to clear reset password submit state
export const clearResetPasswordSubmitState = () => ({
  type: RESET_PASSWORD_SUBMIT_CLEAR
});

/**
 * Action to submit new password for reset
 * @param {string} password - The new password
 * @param {string} token - The reset token
 * @param {string} uid - The user ID
 * @returns {Function} - Thunk function
 */
export const submitPasswordReset =
  (password, token, uid) => async (dispatch) => {
    dispatch(resetPasswordSubmitRequest());

    try {
      const payload = {
        password,
        token,
        uid
      };

      const response = await api.post(AUTH.CHANGE_PASSWORD, payload);

      // Success response can be either 200 or 204 (No Content)
      dispatch(resetPasswordSubmitSuccess(response.data || {}));
      showToast.success('Password reset successfully');

      // Clear the state after some time
      setTimeout(() => {
        dispatch(clearResetPasswordSubmitState());
      }, 3000);

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to reset password';

      dispatch(resetPasswordSubmitError(errorMessage));
      showToast.error(errorMessage);

      // Clear the error state after some time
      setTimeout(() => {
        dispatch(clearResetPasswordSubmitState());
      }, 3000);

      return Promise.reject(errorMessage);
    }
  };
