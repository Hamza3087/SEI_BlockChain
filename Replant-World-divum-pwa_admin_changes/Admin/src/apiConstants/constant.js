// Example API endpoints
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001/api/';
export const ADMIN_API = '';
export const API_VERSION = '/v1';
export const ADMIN_URL = '/admin';

// Helper function to properly join URL parts
const joinUrl = (...parts) => {
  return parts
    .map((part, i) => {
      if (i === 0) return part.replace(/\/$/, ''); // Remove trailing slash from base URL
      return part.replace(/^\//, ''); // Remove leading slash from path parts
    })
    .filter(Boolean)
    .join('/');
};

export const AUTH = {
  LOGIN: `${joinUrl(API_BASE_URL, ADMIN_API, 'auth/login-email')}`,
  LOGOUT: `${joinUrl(API_BASE_URL, ADMIN_API, 'auth/logout')}`,
  RESET_PASSWORD_LINK: `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'reset-password')}`,
  ADMIN_DETAILS: `${joinUrl(API_BASE_URL, ADMIN_API, 'user')}`,
  CHANGE_PASSWORD: `${joinUrl(API_BASE_URL, ADMIN_API, 'auth/reset-password')}`,
  SIGNUP_LINK: `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'generate-signup-link')}`
};

export const DASHBOARD = {
  DASHBOARD: `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'dashboard')}`,
  STATISTICS: `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'statistics')}`,
  NFT_HISTORY: `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'nft/history')}`,
  GENERATE_REPORT: `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'report')}`,
  MINT_NFT: `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'mint/nft')}`
};
export const LISTING = {
  TREES_LISTING: `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'trees')}`,
  SPECIES_LISTING: `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'species')}`,
  USERS_LISTING: `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'users')}`,
  SPONSOR_LISTING: `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'sponsors')}`,
  ORGANIZATION_LISTING: `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'organisation')}`,
  EDIT_ORGANIZATION: `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'edit_organisation')}`
};

export const DROPDOWN_LISTING = {
  IUCN_STATUS: `${LISTING.SPECIES_LISTING}/iucn`,
  COUNTRIES: `${joinUrl(API_BASE_URL, ADMIN_API, 'countries')}`,
  ORGANIZATION: `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'organization/common-names')}`,
  SPECIES: `${LISTING.SPECIES_LISTING}/common-names`,
  COUNTRY_LIST_ORG_ID: `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'countries')}`,
  SPONSOR: `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'sponsor/common-names')}`,
  USERS: `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'users/common-names')}`,
  SPECIES_LISTING_USER_ID: `${joinUrl(API_BASE_URL, ADMIN_API, 'assigned-species')}`
};

export const TREE_REVIEW = `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'tree_review')}`;
export const ASSIGN_SPECIES = `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'assign_species')}`;
export const ASSIGN_NFT = `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'assign-nft')}`;
export const DELETE_SPECIES = `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'species/delete/')}`;
export const ADD_SPONSORS = `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'add/sponsors')}`;
export const SPONSOR_DETAILS = `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'particular/sponsor')}`;
export const DELETE_ORG_SPECIES = `${joinUrl(API_BASE_URL, API_VERSION, ADMIN_URL, 'organization/species/delete')}`;
