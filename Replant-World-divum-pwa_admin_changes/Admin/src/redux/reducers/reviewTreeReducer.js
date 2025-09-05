import {
  APPROVE_TREE_REQUEST,
  APPROVE_TREE_SUCCESS,
  APPROVE_TREE_FAILURE,
  REJECT_TREE_REQUEST,
  REJECT_TREE_SUCCESS,
  REJECT_TREE_FAILURE,
  RESET_TREE_REVIEW_STATE
} from '../constants/actionTypes';

const initialState = {
  loading: false,
  success: false,
  error: null,
  lastReviewedTree: null,
  lastAction: null
};

const treeReviewReducer = (state = initialState, action) => {
  switch (action.type) {
    // Tree Approval Cases
    case APPROVE_TREE_REQUEST:
      return {
        ...state,
        loading: true,
        success: false,
        error: null,
        lastAction: 'approve_pending'
      };

    case APPROVE_TREE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        error: null,
        lastReviewedTree: action.payload,
        lastAction: 'approve_success'
      };

    case APPROVE_TREE_FAILURE:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
        lastAction: 'approve_failure'
      };

    // Tree Rejection Cases
    case REJECT_TREE_REQUEST:
      return {
        ...state,
        loading: true,
        success: false,
        error: null,
        lastAction: 'reject_pending'
      };

    case REJECT_TREE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        error: null,
        lastReviewedTree: action.payload,
        lastAction: 'reject_success'
      };

    case REJECT_TREE_FAILURE:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
        lastAction: 'reject_failure'
      };

    // Reset state
    case RESET_TREE_REVIEW_STATE:
      return {
        ...state,
        success: false,
        error: null,
        lastAction: null,
        message: null
      };

    default:
      return state;
  }
};

export default treeReviewReducer;
