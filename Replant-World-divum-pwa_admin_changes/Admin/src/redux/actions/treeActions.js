// treeActions.js
import {
  FETCH_TREES_REQUEST,
  FETCH_TREES_SUCCESS,
  FETCH_TREES_FAILURE,
  NFT_HISTORY_SUCCESS,
  NFT_HISTORY_REQUEST,
  NFT_HISTORY_ERROR,
  SET_SEARCH_TERM,
  CLEAR_SEARCH
} from '../constants/actionTypes';
import { LISTING, DASHBOARD } from '../../apiConstants/constant'; // assuming your constants file is named apiConstants.js
import api from '../../apiConstants/axiosConfig';

// Action to set search term
export const setSearchTerm = (searchTerm) => ({
  type: SET_SEARCH_TERM,
  payload: searchTerm
});

// Action to clear search
export const clearSearch = () => ({
  type: CLEAR_SEARCH
});

// Helper function to get the correct search key based on type
export const getSearchKey = (type) => {
  switch (type) {
    case 'species':
      return 'species_name';
    case 'users':
      return 'username';
    case 'search':
    case 'NFT History':
      return 'search';
    case 'sponsor':
      return 'sponsor_name';
    case 'organisation':
    default:
      return 'organisation_name';
  }
};

// Action to fetch trees
export const fetchDataByType =
  (type, page = 1, limit = 10, searchTerm = '', filters = {}, isReport = false) =>
  async (dispatch, getState) => {
    // Convert type to lower case to enforce lower-case for pending, approved, rejected, to_mint, organisation, sponsor etc.
    const lowerType = type.toLowerCase();
    // Check if we're already loading to prevent duplicate calls

    try {
      if (lowerType === 'nft history') {
        // const { loading } = getState().nftHistory;
        // if (loading) return;
        dispatch({ type: NFT_HISTORY_REQUEST });
      } else {
        const { loading } = getState().tree;
        if (loading) return;
        dispatch({ type: FETCH_TREES_REQUEST });
      }
      let endpoint;
      switch (lowerType) {
        case 'species':
          endpoint = `${LISTING.SPECIES_LISTING}?page=${page}&per_page=${limit}`;
          break;
        case 'organisation':
        case 'organisations':
          endpoint = `${LISTING.ORGANIZATION_LISTING}?page=${page}&per_page=${limit}`;
          break;
        case 'users':
          endpoint = `${LISTING.USERS_LISTING}?page=${page}&per_page=${limit}`;
          break;
        case 'sponsor':
        case 'sponsors':
          endpoint = `${LISTING.SPONSOR_LISTING}?page=${page}&per_page=${limit}`;
          break;
        case 'nft history':
          endpoint = `${DASHBOARD.NFT_HISTORY}?page=${page}&per_page=${limit}`;
          break;
        default:
          endpoint = `${LISTING.TREES_LISTING}?page=${page}&per_page=${limit}`;
          // Only add type parameter for specific cases
          if (
            ['approved', 'rejected', 'pending', 'to_mint'].includes(lowerType)
          ) {
            endpoint += `&type=${lowerType}`;
          }
        // No type parameter added for 'trees' or 'all'
      }
      // Add search parameter if provided
      if (searchTerm && searchTerm.trim() !== '') {
        const searchKey = getSearchKey(type);
        endpoint += `${
          endpoint.includes('?') ? '&' : '?'
        }${searchKey}=${encodeURIComponent(searchTerm)}`;
      }
      // Append filter parameters if provided
      if (filters && Object.keys(filters).length > 0) {
        Object.entries(filters).forEach(([filterKey, filterValue]) => {
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
            // For nft history filters:
            case 'nft_sponsor_type':
              apiKey = 'sponsor_type';
              break;
            case 'nft_org_id':
              apiKey = 'org_id';
              break;
            case 'nft_minting_state':
              apiKey = 'minting_state';
              break;
            default:
              break;
          }
          endpoint += `${
            endpoint.includes('?') ? '&' : '?'
          }${apiKey}=${encodeURIComponent(filterValue)}`;
        });
      }

      // Add report parameter if this is a report request
      if (isReport) {
        endpoint += `${
          endpoint.includes('?') ? '&' : '?'
        }report=1`;
      }

      // For report requests, we need to get blob response
      if (isReport) {
        const response = await api.get(endpoint, {
          responseType: 'blob'
        });
        return response; // Return the blob response directly for download
      }

      const response = await api.get(endpoint);

      if (lowerType === 'nft history') {
        try {
          dispatch({
            type: NFT_HISTORY_SUCCESS,
            payload: response.content
          });
          return response.content;
        } catch (error) {
          dispatch({
            type: NFT_HISTORY_ERROR,
            payload: error.response?.data?.message || error.message
          });
        }
      } else {
        // For species, we need to get dashboard summary separately since it's not included in species API
        let dashboardSummary = response?.content?.dashboard_summary;
        
        if (lowerType === 'species' && !dashboardSummary) {
          try {
            // Fetch dashboard summary separately for species with applied filters
            let summaryEndpoint = `${LISTING.TREES_LISTING}?page=1&per_page=10`;
            
            // Add filter parameters if provided
            if (filters && Object.keys(filters).length > 0) {
              Object.entries(filters).forEach(([filterKey, filterValue]) => {
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
                summaryEndpoint += `&${apiKey}=${encodeURIComponent(filterValue)}`;
              });
            }
            
            const summaryResponse = await api.get(summaryEndpoint);
            dashboardSummary = summaryResponse?.content?.dashboard_summary;
          } catch (summaryError) {
            console.error('Failed to fetch dashboard summary for species:', summaryError);
          }
        }

        dispatch({
          type: FETCH_TREES_SUCCESS,
          payload: response?.content.data, // Access the nested data array
          count: response?.content.count, // Pass the count separately
          mint_info: response?.content?.mint_info,
          last_minted_at: response?.content?.last_minted_at,
          dashboard_summary: dashboardSummary,
          append: lowerType === 'pending' && page > 1 // Only append for "Pending" and subsequent pages
        });
        return response.data;
      }
    } catch (error) {
      dispatch({
        type: FETCH_TREES_FAILURE,
        payload: error.response?.data?.message || error.message
      });
      throw error; // Re-throw the error if you need to handle it in the component
    }
  };

// Search action - combines setSearchTerm and fetchDataByType
export const searchData = (searchTerm, type, page = 1, limit = 10, filter) => {
  return (dispatch) => {
    if (searchTerm && searchTerm.trim() !== '') {
      dispatch(setSearchTerm(searchTerm));
      return dispatch(fetchDataByType(type, page, limit, searchTerm, filter));
    } else {
      // If search term is empty, clear search
      return dispatch(clearSearchData(type, page, limit, filter));
    }
  };
};

// Clear search action - combines clearSearch and fetchDataByType
export const clearSearchData = (type, page = 1, limit = 10, filter) => {
  return (dispatch) => {
    dispatch(clearSearch());
    return dispatch(fetchDataByType(type, page, limit, '', filter));
  };
};
