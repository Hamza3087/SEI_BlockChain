import {
  SPONSOR_DETAILS_REQUEST,
  SPONSOR_DETAILS_ERROR,
  SPONSOR_DETAILS_SUCCESS
} from '../constants/actionTypes';
import { SPONSOR_DETAILS } from '../../apiConstants/constant';
import api from '../../apiConstants/axiosConfig';
import { getSearchKey } from './treeActions';

export const fetchSponsorDetails =
  (sponsorId, page = 1, limit = 10, searchTerm = '', filters = {}) =>
  async (dispatch) => {
    try {
      dispatch({ type: SPONSOR_DETAILS_REQUEST });
      let sponsorDetailsApi = `${SPONSOR_DETAILS}/${sponsorId}?page=${page}&per_page=${limit}`;
      // Add search parameter if provided
      if (searchTerm && searchTerm.trim() !== '') {
        let searchKey = getSearchKey('');
        sponsorDetailsApi += `${
          sponsorDetailsApi.includes('?') ? '&' : '?'
        }${searchKey}=${encodeURIComponent(searchTerm)}`;
      }
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
          sponsorDetailsApi += `${
            sponsorDetailsApi.includes('?') ? '&' : '?'
          }${apiKey}=${encodeURIComponent(filterValue)}`;
        });
      }

      const response = await api.get(sponsorDetailsApi);
      const sponsorData = response?.content;

      dispatch({
        type: SPONSOR_DETAILS_SUCCESS,
        payload: sponsorData
      });
      return response?.content;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch sponsor details';
      dispatch({
        type: SPONSOR_DETAILS_ERROR,
        payload: errorMessage
      });
      return Promise.reject(errorMessage);
    }
  };
