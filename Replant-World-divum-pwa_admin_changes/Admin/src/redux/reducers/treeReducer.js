// treeReducer.js
import {
  FETCH_TREES_REQUEST,
  FETCH_TREES_SUCCESS,
  FETCH_TREES_FAILURE,
  SET_SEARCH_TERM,
  CLEAR_SEARCH
} from '../constants/actionTypes';

const initialState = {
  loading: false,
  treesData: [],
  error: '',
  totalCount: 0,
  mintInfo: 0 / 0,
  lastMintedAt: 'N/A',
  currentPage: 1,
  searchTerm: '',
  isSearchActive: false,
  lastSearched: null, // Track the last search term for better UX
  treesSummary: {}
};

const treeReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TREES_REQUEST:
      return {
        ...state,
        loading: true,
        error: ''
      };
    case FETCH_TREES_SUCCESS:
      return {
        ...state,
        loading: false,
        treesData: action.append
          ? [...state.treesData, ...action.payload]
          : action.payload || [],
        totalCount: action.count,
        mintInfo: action?.mint_info,
        lastMintedAt: action?.last_minted_at,
        dashboardSummary: action?.dashboard_summary,
        error: ''
      };
    case FETCH_TREES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        treesData: []
      };
    case SET_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.payload,
        isSearchActive: true,
        lastSearched: action.payload // Track the search term
      };
    case CLEAR_SEARCH:
      return {
        ...state,
        searchTerm: '',
        isSearchActive: false
      };
    default:
      return state;
  }
};

export default treeReducer;
