import {
  DASHBOARD_REQUEST,
  DASHBOARD_SUCCESS,
  DASHBOARD_ERROR,
  SET_ACTIVE_TAB,
  DASHBOARD_RESET,
  STATISTICS_REQUEST,
  STATISTICS_SUCCESS,
  STATISTICS_ERROR,
  STATISTICS_RESET,
  NFT_HISTORY_REQUEST,
  NFT_HISTORY_SUCCESS,
  NFT_HISTORY_ERROR,
  NFT_HISTORY_RESET
} from '../constants/actionTypes';
import { DASHBOARD } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';

// Action creator to set active tab
export const setActiveTab = (tabType) => ({
  type: SET_ACTIVE_TAB,
  payload: tabType
});

// Reset dashboard state
export const resetDashboard = () => ({
  type: DASHBOARD_RESET
});

// Reset NFT history state
export const resetNFTHistory = () => ({
  type: NFT_HISTORY_RESET
});

// Action creator for dashboard data
export const fetchDashboardData = (type) => async (dispatch) => {
  try {
    dispatch({ type: DASHBOARD_REQUEST });

    // Validate and normalize tab type
    const tabType = ['people', 'tree', 'nft'].includes(type) ? type : 'tree';

    // If the tab type is nft, we'll use the new NFT history API
    if (tabType === 'nft') {
      return dispatch(fetchNFTHistory());
    }

    const response = await api.get(`${DASHBOARD.DASHBOARD}?type=${tabType}`);

    const responseData = {
      ...response.content,
      type: response.data || tabType
    };

    dispatch({
      type: DASHBOARD_SUCCESS,
      payload: responseData
    });

    // Update active tab if different from requested
    if (responseData.type !== tabType) {
      dispatch(setActiveTab(responseData.type));
    }

    return responseData;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Something went wrong';
    dispatch({
      type: DASHBOARD_ERROR,
      payload: errorMessage
    });
    return Promise.reject(errorMessage);
  }
};

// New action creator for NFT history data
export const fetchNFTHistory =
  (page = 1, perPage = 10, search = '') =>
  async (dispatch) => {
    try {
      dispatch({ type: NFT_HISTORY_REQUEST });

      const response = await api.get(
        `${
          DASHBOARD.NFT_HISTORY
        }?page=${page}&per_page=${perPage}&search=${encodeURIComponent(search)}`
      );

      dispatch({
        type: NFT_HISTORY_SUCCESS,
        payload: response.content
      });

      return response.content;
    } catch (error) {
      const errorMessage =
        error.response?.message ||
        error.message ||
        'Failed to fetch NFT history';
      dispatch({
        type: NFT_HISTORY_ERROR,
        payload: errorMessage
      });
      return Promise.reject(errorMessage);
    }
  };

// Combined action for tab change and data fetch
export const handleTabChange = (tabType) => (dispatch) => {
  dispatch(setActiveTab(tabType));
  if (tabType === 'nft') {
    return dispatch(fetchNFTHistory());
  }
  return dispatch(fetchDashboardData(tabType));
};

// Reset statistics state
export const resetStatistics = () => ({
  type: STATISTICS_RESET
});

// Action creator for statistics data
export const fetchStatisticsData = (filterData = null) => async (dispatch) => {
  try {
    dispatch({ type: STATISTICS_REQUEST });

    let endpoint = `${DASHBOARD.STATISTICS}`;
    
    // Add filter parameters if they exist
    if (filterData && Object.keys(filterData).length > 0) {
      const params = new URLSearchParams();
      Object.entries(filterData).forEach(([filterKey, filterValue]) => {
        if (!filterValue && filterValue !== 0) return; // skip if no value
        // Convert Date objects to ISO string or extract id from object
        if (filterValue instanceof Date) {
          filterValue = filterValue.toISOString();
        } else if (typeof filterValue === 'object') {
          filterValue = filterValue.id || '';
        }
        if (!filterValue) return;
        let apiKey = filterKey;
        switch (filterKey) {
          case 'organisation':
            apiKey = 'organisation_id';
            break;
          case 'planter':
            apiKey = 'planted_by';
            break;
          case 'sponsor':
            apiKey = 'sponsor_id';
            break;
          case 'species':
            apiKey = 'species_id';
            break;
          case 'country':
            apiKey = 'country_id';
            break;
          case 'iucn':
            apiKey = 'iucn_id';
            break;
          default:
            break;
        }
        params.append(apiKey, filterValue);
      });
      endpoint += `?${params.toString()}`;
    }

    const response = await api.get(endpoint);

    dispatch({
      type: STATISTICS_SUCCESS,
      payload: response
    });

    return response;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch statistics data';

    dispatch({
      type: STATISTICS_ERROR,
      payload: errorMessage
    });

    return Promise.reject(errorMessage);
  }
};
