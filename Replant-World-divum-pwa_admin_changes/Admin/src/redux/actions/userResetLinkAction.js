import {
  USER_RESET_LINK_REQUEST,
  USER_RESET_LINK_SUCCESS,
  USER_RESET_LINK_ERROR,
  USER_RESET_LINK_RESET
} from '../constants/actionTypes';
import { showToast } from '../../components/ToastNotification';
import { AUTH } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';

export const resetLinkRequest = () => ({
  type: USER_RESET_LINK_REQUEST
});

export const resetLinkSuccess = (data) => ({
  type: USER_RESET_LINK_SUCCESS,
  payload: data
});

export const resetLinkError = (error) => ({
  type: USER_RESET_LINK_ERROR,
  payload: error
});

export const clearResetLinkState = () => ({
  type: USER_RESET_LINK_RESET
});

/**
 * Action to generate a user password reset link.
 * @param {number} userId - The user's ID.
 * @returns {Function} - Thunk function.
 */
export const generateUserResetLink = (userId) => async (dispatch) => {
  dispatch(resetLinkRequest());
  try {
    const response = await api.get(`${AUTH.RESET_PASSWORD_LINK}/${userId}`);
    dispatch(resetLinkSuccess(response));
    showToast.success(
      response.message || 'Password Reset link generated successfully',
      { autoClose: 3000 }
    );
    setTimeout(() => {
      dispatch(clearResetLinkState());
    }, 3000);
    return response;
  } catch (error) {
    const errorMessage = error?.message || 'Failed to generate reset link';
    dispatch(resetLinkError(errorMessage));
    showToast.error(errorMessage, { autoClose: 3000 });
    setTimeout(() => {
      dispatch(clearResetLinkState());
    }, 3000);
    return Promise.reject(errorMessage);
  }
};
