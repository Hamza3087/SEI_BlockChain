import {
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,
  RESET_LOGOUT
} from '../constants/actionTypes';
import { AUTH } from '../../apiConstants/constant';
import { showToast } from '../../components/ToastNotification';
import api from '../../apiConstants/axiosConfig';

export const logout = () => {
  return async (dispatch) => {
    dispatch({ type: LOGOUT_REQUEST });

    try {
      // Make the logout API call
      const response = await api.post(AUTH.LOGOUT);

      // Check for success status code (204)
      if (response.status === 204 || response?.status === 200) {
        dispatch({
          type: LOGOUT_SUCCESS
        });

        // Show success message with a display duration of 5000ms
        showToast.success('Logged out successfully!', { duration: 5000 });

        // Clear any auth data from localStorage or sessionStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Add any other auth-related items that need to be cleared

        // Reset logout state after a delay
        setTimeout(() => {
          dispatch({ type: RESET_LOGOUT });
        }, 5000);

        return response;
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      dispatch({
        type: LOGOUT_FAILURE,
        payload: error.response
          ? error.response
          : { message: 'Logout failed. Please try again.' }
      });

      showToast.error(error?.message || 'Logout failed. Please try again.');

      // Reset logout state after a delay
      setTimeout(() => {
        dispatch({ type: RESET_LOGOUT });
      }, 5000);

      throw error;
    }
  };
};

export const resetLogout = () => ({
  type: RESET_LOGOUT
});
