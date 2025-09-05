import { combineReducers } from 'redux';
import {
  dashboardReducer,
  statisticsReducer
} from './reducers/dashboardReducer';
import treeReducer from './reducers/treeReducer';
import authReducer from './reducers/authReducer';
import iucnReducer from './reducers/iucnReducer';
import countryReducer from './reducers/countryReducer';
import organisationReducer from './reducers/organisationReducer';
import speciesReducer from './reducers/addSpeciesReducer';
import userReducer from './reducers/addUsersReducer';
import orgReducer from './reducers/addOrganizationReducer';
import orgDetailsReducer from './reducers/fetchOrgReducer';
import treeReviewReducer from './reducers/reviewTreeReducer';
import speciesListing from './reducers/speciesReducer';
import countryListing from './reducers/countryListingOrgReducer';
import speciesListingReducerByUserId from './reducers/speciesListingUserReducer';
import assignSpecies from './reducers/assignSpeciesReducer';
import deleteSpeciesReducer from './reducers/deleteSpeciesReducer';
import addSponsor from './reducers/addSponsorReducer';
import sponsorDetails from './reducers/fetchSponsorReducer';
import sponsorReducer from './reducers/sponsorReducer';
import deleteOrgSpeciesReducer from './reducers/deleteOrgSpeciesReducer';
import mintNftReducer from './reducers/mintNftReducer';
import editSponsorReducer from './reducers/editSponsorReducer';
import userListReducer from './reducers/userReducer';
import passwordResetReducer from './reducers/passwordResetLinkReducer';
import changePasswordReducer from './reducers/changePasswordReducer';
import logoutReducer from './reducers/logoutReducer';
import signupLinkReducer from './reducers/signupLinkReducer';
import userResetLinkReducer from './reducers/userResetLinkReducer';

const rootReducer = combineReducers({
  dashboard: dashboardReducer,
  tree: treeReducer,
  auth: authReducer,
  iucnStatus: iucnReducer,
  species: speciesReducer,
  country: countryReducer,
  organisation: organisationReducer,
  user: userReducer,
  statistics: statisticsReducer,
  organisationReducer: orgReducer,
  orgDetailsReducer: orgDetailsReducer,
  treeReview: treeReviewReducer,
  speciesListingReducer: speciesListing,
  countryListingByOrgId: countryListing,
  speciesListingByUserId: speciesListingReducerByUserId,
  assignSpeciesReducer: assignSpecies,
  deleteSpecies: deleteSpeciesReducer,
  addSponsor: addSponsor,
  sponsorDetails: sponsorDetails,
  sponsorReducer: sponsorReducer,
  deleteOrgSpecies: deleteOrgSpeciesReducer,
  mintNft: mintNftReducer,
  editSponsor: editSponsorReducer,
  userListReducer: userListReducer,
  resetPassword: passwordResetReducer,
  changePassword: changePasswordReducer,
  logout: logoutReducer,
  signupLink: signupLinkReducer,
  userResetLink: userResetLinkReducer
});

export default rootReducer;
