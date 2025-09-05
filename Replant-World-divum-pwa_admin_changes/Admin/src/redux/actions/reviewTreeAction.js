import {
  APPROVE_TREE_REQUEST,
  APPROVE_TREE_SUCCESS,
  APPROVE_TREE_FAILURE,
  REJECT_TREE_REQUEST,
  REJECT_TREE_SUCCESS,
  REJECT_TREE_FAILURE,
  RESET_TREE_REVIEW_STATE
} from '../constants/actionTypes';
import { showToast } from '../../components/ToastNotification'; // Import toast service
import { TREE_REVIEW } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';
import { refreshThePage } from '../../utils/helperFunction';

// Action creators for tree approval
export const approveTreeRequest = () => ({
  type: APPROVE_TREE_REQUEST
});

export const approveTreeSuccess = (data) => ({
  type: APPROVE_TREE_SUCCESS,
  payload: data
});

export const approveTreeFailure = (error) => ({
  type: APPROVE_TREE_FAILURE,
  payload: error
});

// Action creators for tree rejection
export const rejectTreeRequest = () => ({
  type: REJECT_TREE_REQUEST
});

export const rejectTreeSuccess = (data) => ({
  type: REJECT_TREE_SUCCESS,
  payload: data
});

export const rejectTreeFailure = (error) => ({
  type: REJECT_TREE_FAILURE,
  payload: error
});

// Reset action creator
export const resetTreeReviewState = () => ({
  type: RESET_TREE_REVIEW_STATE
});

// Thunk action for approving a tree
export const approveTree = (treeId, comments, speciesId) => async (dispatch) => {
  dispatch(approveTreeRequest());

  try {
    const response = await api.put(TREE_REVIEW, {
      status: 'approve',
      tree_id: treeId,
      comments: comments,
      species_id: speciesId
    });

    dispatch(approveTreeSuccess(response.data));
    showToast.success(response?.message || 'Tree approved successfully!');
    setTimeout(() => {
      dispatch({ type: RESET_TREE_REVIEW_STATE });
    }, 3000);
    refreshThePage();
    return response.data;
  } catch (error) {
    dispatch(approveTreeFailure(error.response?.data || error.message));
    showToast.error(error?.message || 'Failed to approve tree');
    setTimeout(() => {
      dispatch({ type: RESET_TREE_REVIEW_STATE });
    }, 3000);
    throw error;
  }
};

// Thunk action for rejecting a tree
export const rejectTree = (treeId, comments, speciesId) => async (dispatch) => {
  dispatch(rejectTreeRequest());

  try {
    const response = await api.put(TREE_REVIEW, {
      status: 'reject',
      tree_id: treeId,
      comments: comments,
      species_id: speciesId
    });

    dispatch(rejectTreeSuccess(response.data));
    showToast.success(response?.message || 'Tree rejected successfully!');
    setTimeout(() => {
      dispatch({ type: RESET_TREE_REVIEW_STATE });
    }, 3000);
    refreshThePage();
    return response.data;
  } catch (error) {
    dispatch(rejectTreeFailure(error.response?.data || error.message));
    showToast.error(error?.message || 'Failed to reject tree');
    setTimeout(() => {
      dispatch({ type: RESET_TREE_REVIEW_STATE });
    }, 3000);
    throw error;
  }
};
