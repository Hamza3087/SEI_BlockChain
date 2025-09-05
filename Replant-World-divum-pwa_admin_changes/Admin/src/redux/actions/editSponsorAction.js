import {
  UPDATE_SPONSOR_REQUEST,
  UPDATE_SPONSOR_SUCCESS,
  UPDATE_SPONSOR_FAILURE,
  RESET_SPONSOR_UPDATE_STATE
} from '../constants/actionTypes';
import { showToast } from '../../components/ToastNotification';
import { ADD_SPONSORS } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';
import { refreshThePage } from '../../utils/helperFunction';

// Action creators for sponsor update
export const updateSponsorRequest = () => ({
  type: UPDATE_SPONSOR_REQUEST
});

export const updateSponsorSuccess = (data) => ({
  type: UPDATE_SPONSOR_SUCCESS,
  payload: data
});

export const updateSponsorFailure = (error) => ({
  type: UPDATE_SPONSOR_FAILURE,
  payload: error
});

// Reset action creator
export const resetSponsorUpdateState = () => ({
  type: RESET_SPONSOR_UPDATE_STATE
});

// Thunk action for updating a sponsor
export const updateSponsor = (sponsorId, sponsorData) => async (dispatch) => {
  dispatch(updateSponsorRequest());

  try {
    const response = await api.put(`${ADD_SPONSORS}?sponsor_id=${sponsorId}`, {
      name: sponsorData.name,
      type: sponsorData.type,
      wallet_address: sponsorData.wallet_address,
      contact_person_email: sponsorData.contact_person_email,
      nft_ordered: sponsorData.nft_ordered,
      nft_ordered_usd: sponsorData.nft_ordered_usd
    });

    dispatch(updateSponsorSuccess(response));
    showToast.success(response?.message || 'Sponsor updated successfully!');
    refreshThePage();
    setTimeout(() => {
      dispatch({ type: RESET_SPONSOR_UPDATE_STATE });
    }, 3000);
    return response;
  } catch (error) {
    let customErrorMsg = 'Failed to update sponsor';
    if (error) {
      if (error?.non_field_errors) {
        customErrorMsg = error?.non_field_errors[0];
      } else if (error?.contact_person_email) {
        customErrorMsg = error?.contact_person_email[0];
      } else if (error?.nft_ordered) {
        customErrorMsg = error?.nft_ordered[0];
      } else if (error?.nft_ordered_usd) {
        customErrorMsg = error?.nft_ordered_usd[0];
      }
    } else if (error?.message) {
      customErrorMsg = error?.message;
    }
    dispatch(updateSponsorFailure(customErrorMsg));
    showToast.error(customErrorMsg);
    setTimeout(() => {
      dispatch({ type: RESET_SPONSOR_UPDATE_STATE });
    }, 3000);
    throw error;
  }
};
