import {
  DASHBOARD_REQUEST,
  DASHBOARD_SUCCESS,
  DASHBOARD_ERROR,
  SET_ACTIVE_TAB,
  STATISTICS_REQUEST,
  STATISTICS_SUCCESS,
  STATISTICS_ERROR,
  STATISTICS_RESET,
  NFT_HISTORY_REQUEST,
  NFT_HISTORY_SUCCESS,
  NFT_HISTORY_ERROR,
  NFT_HISTORY_RESET
} from '../constants/actionTypes';

const initialState = {
  loading: false,
  error: null,
  dashboardData: {},
  statistics: null,
  activeTab: 'tree', // Default active tab
  nftHistory: {
    loading: false,
    error: null,
    count: 0,
    next: null,
    previous: null,
    data: []
  }
};

const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case DASHBOARD_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case DASHBOARD_SUCCESS:
      return {
        ...state,
        loading: false,
        dashboardData: action.payload,
        error: null
      };

    case DASHBOARD_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action.payload
      };

    // NFT History actions
    case NFT_HISTORY_REQUEST:
      return {
        ...state,
        nftHistory: {
          ...state.nftHistory,
          loading: true,
          error: null
        }
      };

    case NFT_HISTORY_SUCCESS:
      return {
        ...state,
        nftHistory: {
          loading: false,
          error: null,
          count: action.payload.count || 0,
          next: action.payload.next,
          previous: action.payload.previous,
          data: action.payload.data || []
        }
      };

    case NFT_HISTORY_ERROR:
      return {
        ...state,
        nftHistory: {
          ...state.nftHistory,
          loading: false,
          error: action.payload
        }
      };

    case NFT_HISTORY_RESET:
      return {
        ...state,
        nftHistory: {
          loading: false,
          error: null,
          count: 0,
          next: null,
          previous: null,
          data: []
        }
      };

    default:
      return state;
  }
};

export const statisticsReducer = (state = initialState, action) => {
  switch (action.type) {
    case STATISTICS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case STATISTICS_SUCCESS:
      return {
        ...state,
        loading: false,
        statistics: action.payload,
        error: null
      };

    case STATISTICS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case STATISTICS_RESET:
      return initialState;

    default:
      return state;
  }
};

export { dashboardReducer };
