import {
  ADD_SPONSOR_REQUEST,
  ADD_SPONSOR_SUCCESS,
  ADD_SPONSOR_FAILURE,
  RESET_SPONSOR_STATE
} from '../constants/actionTypes';
import { ADD_SPONSORS } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';

export const addSponsor = (sponsorData) => {
  return async (dispatch) => {
    dispatch({ type: ADD_SPONSOR_REQUEST });

    try {
      const response = await api.post(`${ADD_SPONSORS}`, sponsorData);

      dispatch({
        type: ADD_SPONSOR_SUCCESS,
        payload: response
      });

      setTimeout(() => {
        dispatch({ type: RESET_SPONSOR_STATE });
      }, 3000);
      return response;
    } catch (error) {
      let customErrorMsg = 'Failed to add sponsor';
      if (error) {
        const data = error;
        if (data?.non_field_errors) {
          customErrorMsg = data?.non_field_errors[0];
        } else if (data?.contact_person_email) {
          customErrorMsg = data?.contact_person_email[0];
        } else if (data?.nft_ordered) {
          customErrorMsg = data?.nft_ordered[0];
        } else if (data?.nft_ordered_usd) {
          customErrorMsg = data?.nft_ordered_usd[0];
        } else if (data?.wallet_address) {
          customErrorMsg = data?.wallet_address[0];
        }
      } else if (error?.message) {
        customErrorMsg = error?.message;
      }
      dispatch({
        type: ADD_SPONSOR_FAILURE,
        payload: { message: customErrorMsg }
      });
      setTimeout(() => {
        dispatch({ type: RESET_SPONSOR_STATE });
      }, 3000);

      throw error;
    }
  };
};

// Add a separate reset action
export const resetSponsorState = () => ({
  type: RESET_SPONSOR_STATE
});
