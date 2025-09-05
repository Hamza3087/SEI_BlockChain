import {
  COUNTRY_ERROR,
  COUNTRY_REQUEST,
  COUNTRY_SUCCESS,
  SET_SELECTED_COUNTRY,
  COUNTRY_RESET
} from '../constants/actionTypes';

const initialState = {
  loading: false,
  error: null,
  countryList: [],
  selectedCountry: null
};

const countryReducer = (state = initialState, action) => {
  switch (action.type) {
    case COUNTRY_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case COUNTRY_SUCCESS:
      return {
        ...state,
        loading: false,
        countryList: action.payload,
        error: null
      };

    case COUNTRY_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case SET_SELECTED_COUNTRY:
      return {
        ...state,
        selectedCountry: action.payload
      };

    case COUNTRY_RESET:
      return initialState;

    default:
      return state;
  }
};

export default countryReducer;
