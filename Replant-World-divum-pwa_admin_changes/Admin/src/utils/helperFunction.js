import moment from 'moment';
import { startCase, toLower } from 'lodash';

export const formatDate = (dateString) => {
  return moment(dateString).format('MMM D, YYYY'); // "Feb 22, 2025"
};

export const formatDateWithoutComma = (dateString) => {
  return moment(dateString).format('MMM D YYYY'); // "Feb 22 2025"
};

export const capitalizeFirstLetter = (str) => {
  if (!str || typeof str !== 'string') return ''; // Handle null/undefined/non-string
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(); // Force lowercase for rest
};

export const formattedDate = (inputDate) => {
  return moment(inputDate).format('DD-MM-YYYY'); // Converts to "22-04-2025"
};

export const formattedYearMonthDate = (inputDate) => {
  return moment(inputDate).format('YYYY-MM-DD'); // Converts to "2025-05-01 "
};

export const formatDateTime = (dateString) => {
  return moment(dateString).format('MMM D, YYYY | h:mm A'); // "Jan 30, 2025 | 12:30 PM"
};

export const formatCountries = (countries) => {
  if (!countries || countries?.length === 0) return '';

  if (countries?.length <= 3) {
    return countries?.join(', ');
  } else {
    const firstTwo = countries?.slice(0, 2)?.join(', ');
    const remainingCount = countries?.length - 2;
    return `${firstTwo} ..+${remainingCount}`;
  }
};

export const formatMintStatus = (str) => {
  const statusMappings = {
    to_be_minted: 'To be Minted',
    pending: 'Pending',
    failed: 'Failed',
    minted: 'Minted'
  };
  return statusMappings[str] || startCase(toLower(str?.replace(/_/g, ' ')));
};

export const formatList = (items, emptyValue = '-') => {
  if (!items || items?.length === 0) return emptyValue;

  if (items?.length <= 3) {
    return items?.join(', ');
  } else {
    const firstTwo = items?.slice(0, 2)?.join(', ');
    const remainingCount = items?.length - 2;
    return `${firstTwo} ..+${remainingCount}`;
  }
};

export const refreshThePage = (customStat = 0) => {
  const urlParams = new URLSearchParams(window.location.search);
  const currentActiveIndex = urlParams.get('stat');
  setTimeout(() => {
    window.location.href = `${window.location.origin}${
      window.location.pathname
    }?stat=${currentActiveIndex || customStat}`;
  }, 3000); // 5 seconds delay to match your review action timeout
};

// Function to check if any filters are applied
export const hasActiveFilters = (filterData) => {
  if (!filterData || typeof filterData !== 'object') return false;
  
  // Check if any filter values exist (excluding null, undefined, empty strings, and empty objects)
  return Object.values(filterData).some(value => {
    if (value === null || value === undefined || value === '') return false;
    if (typeof value === 'object' && Object.keys(value).length === 0) return false;
    return true;
  });
};
