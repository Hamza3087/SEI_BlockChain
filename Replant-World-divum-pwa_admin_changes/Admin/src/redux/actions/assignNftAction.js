import {
  ASSIGN_NFT_REQUEST,
  ASSIGN_NFT_SUCCESS,
  ASSIGN_NFT_FAILURE,
  RESET_NFT_ASSIGNMENT_STATE
} from '../constants/actionTypes';
import { showToast } from '../../components/ToastNotification'; // Import toast service
import { ASSIGN_NFT } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';

// Action creators for Nft assignment
export const assignNftRequest = () => ({
  type: ASSIGN_NFT_REQUEST
});

export const assignNftSuccess = (data) => ({
  type: ASSIGN_NFT_SUCCESS,
  payload: data
});

export const assignNftFailure = (error) => ({
  type: ASSIGN_NFT_FAILURE,
  payload: error
});

// Reset action creator
export const resetNftAssignmentState = () => ({
  type: RESET_NFT_ASSIGNMENT_STATE
});

// Thunk action for assigning a nft
export const assignNft = (assignmentData) => async (dispatch) => {
  dispatch(assignNftRequest());

  try {
    const response = await api.put(ASSIGN_NFT, {
      organization_id: assignmentData?.organization_id,
      sponsor_id: assignmentData?.sponsor_id,
      no_of_trees: assignmentData?.no_of_trees,
      min_cost: assignmentData?.min_cost,
      max_cost: assignmentData?.max_cost
    });

    dispatch(assignNftSuccess(response));
    showToast.success(response?.message || 'NFT assigned successfully!');
    setTimeout(() => {
      dispatch({ type: RESET_NFT_ASSIGNMENT_STATE });
    }, 3000);
    return response;
  } catch (error) {
    const errorData = error;
    let errorMessage = 'Failed to assign Nft';
    if (errorData && errorData?.non_field_errors) {
      errorMessage = errorData?.non_field_errors[0];
    } else if (error?.response?.data && error?.response?.data?.message) {
      errorMessage = error?.response?.data?.message;
    } else if (error?.message) {
      errorMessage = error?.message;
    }
    dispatch(assignNftFailure(errorMessage));
    showToast.error(errorMessage);
    setTimeout(() => {
      dispatch({ type: RESET_NFT_ASSIGNMENT_STATE });
    }, 3000);
    throw error;
  }
};
