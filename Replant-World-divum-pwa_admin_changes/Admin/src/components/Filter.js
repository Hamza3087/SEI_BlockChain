import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle
} from 'reactstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import closeIcon from '../images/icons/close.svg';
import '../assets/scss/custom.scss';
import { formattedYearMonthDate } from '../utils/helperFunction';

// Import all the necessary actions
import {
  fetchIucnStatusData,
  handleIucnStatusSelection,
  setSelectedIucnStatus
} from '../redux/actions/iucnAction';

import {
  fetchOrganizationData,
  handleOrgSelection,
  setSelectedOrg
} from '../redux/actions/organisationAction';

import {
  fetchCountriesData,
  handleCountrySelection,
  setSelectedCountry
} from '../redux/actions/countryAction';

import {
  fetchSpeciesData,
  handleSpeciesSelection,
  setSelectedSpecies
} from '../redux/actions/speciesAction';

import { fetchUserData, setSelectedUser } from '../redux/actions/userAction';

import {
  fetchSponsorData,
  setSelectedSponsor
} from '../redux/actions/sponsorAction';

const FilterModal = ({
  isOpen,
  toggle,
  header,
  activeTab,
  onApplyFilter,
  onClearFilter,
  currentFilterData = {}
}) => {
  const dispatch = useDispatch();

  // Get data from Redux store with loading states
  const {
    countryList,
    countryLoading,
    selectedCountry,
    speciesList,
    speciesLoading,
    selectedSpecies,
    iucnStatusList,
    iucnStatusLoading,
    selectedIucnStatus,
    orgList,
    orgLoading,
    selectedOrg,
    userList,
    sponsorList,
    selectedSponsor
  } = useSelector((state) => ({
    // Country state
    countryList: state?.country?.countryList || [],
    countryLoading: state?.country?.loading || false,
    selectedCountry: state?.country?.selectedCountry || null,

    // Species state
    speciesList: state?.speciesListingReducer?.speciesList || [],
    speciesLoading: state?.speciesListingReducer?.loading || false,
    selectedSpecies: state?.speciesListingReducer?.selectedSpecies || null,

    // IUCN status state
    iucnStatusList: state?.iucnStatus?.iucnStatusList || [],
    iucnStatusLoading: state?.iucnStatus?.loading || false,
    selectedIucnStatus: state?.iucnStatus?.selectedStatus || null,

    // Organization state
    orgList: state?.organisation?.orgList || [],
    orgLoading: state?.organisation?.loading || false,
    selectedOrg: state?.organisation?.selectedOrg || null,

    // User state
    userList: state?.userListReducer?.userList || [],
    userLoading: state?.userListReducer?.loading || false,
    selectedUser: state?.userListReducer?.selectedUser || null,

    // Sponsor state
    sponsorList: state?.sponsorReducer?.sponsorList || [],
    sponsorLoading: state?.sponsorReducer?.loading || false,
    selectedSponsor: state?.sponsorReducer?.selectedSponsor || null
  }));

  // Local dropdown open states
  const [dropdownOpen, setDropdownOpen] = useState({
    species: false,
    organization: false,
    planter: false,
    mintStatus: false,
    sponsorType: false,
    sponsor: false,
    treeAssignment: false,
    iucn: false,
    country: false
  });

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Updated to store objects instead of strings
  const [selectedPlanter, setSelectedPlanter] = useState(null);
  const [selectedMintStatus, setSelectedMintStatus] = useState('');
  const [selectedSponsorType, setSelectedSponsorType] = useState('');
  const [selectedTreeAssignment, setSelectedTreeAssignment] = useState('');

  // Local display values for redux-connected filters
  const [displayCountry, setDisplayCountry] = useState('');
  const [displaySpecies, setDisplaySpecies] = useState('');
  const [displayOrg, setDisplayOrg] = useState('');
  const [displayIucn, setDisplayIucn] = useState('');
  const [displayPlanter, setDisplayPlanter] = useState('');
  const [displaySponsor, setDisplaySponsor] = useState('');

  // Options for dropdowns that don't come from API - updated to use objects with id
  const treeAssignmentOptions = ['Yes', 'No'];
  const mintStatusOptions = ['Minted', 'To be Minted', 'Failed', 'Pending'];
  const sponsorTypeOptions = ['Individual', 'Company', 'NGO'];

  // Update display values when selected items change in Redux
  useEffect(() => {
    if (selectedCountry) {
      setDisplayCountry(
        selectedCountry.displayName || selectedCountry.name || ''
      );
    }
    if (selectedSpecies) {
      setDisplaySpecies(
        selectedSpecies.displayName || selectedSpecies.common_name || ''
      );
    }
    if (selectedOrg) {
      setDisplayOrg(selectedOrg.displayName || selectedOrg.name || '');
    }
    if (selectedIucnStatus) {
      setDisplayIucn(
        selectedIucnStatus.displayName || selectedIucnStatus.name || ''
      );
    }
    if (selectedPlanter) {
      setDisplayPlanter(selectedPlanter.name || '');
    }
    if (selectedSponsor) {
      setDisplaySponsor(selectedSponsor?.name || '');
    }
  }, [
    selectedCountry,
    selectedSpecies,
    selectedOrg,
    selectedIucnStatus,
    selectedPlanter,
    selectedSponsor
  ]);

  // Fetch data when modal opens based on active tab
  useEffect(() => {
    if (isOpen) {
      // Check if we're on homepage (unified filter) or specific tab
      const isHomepageFilter = window.location.pathname === '/' && ['Trees', 'Pending', 'Approved', 'Rejected', 'To Mint', 'Species'].includes(activeTab);
      
      if (isHomepageFilter) {
        // For homepage unified filter, fetch all data
        dispatch(fetchCountriesData());
        dispatch(fetchSpeciesData());
        dispatch(fetchIucnStatusData());
        dispatch(fetchOrganizationData());
        dispatch(fetchUserData());
        dispatch(fetchSponsorData());
      } else {
        // Original logic for specific tabs
        if (['NFT', 'Organisations', 'Users'].includes(activeTab)) {
          dispatch(fetchCountriesData());
        }
        if (
          ['Trees', 'Pending', 'Approved', 'Rejected', 'Organisations'].includes(
            activeTab
          )
        ) {
          dispatch(fetchSpeciesData());
        }
        if (['Species'].includes(activeTab)) {
          dispatch(fetchIucnStatusData());
        }
        if (
          [
            'Trees',
            'Pending',
            'Approved',
            'Rejected',
            'Species',
            'To Mint',
            'Users',
            'NFT',
            'NFT History'
          ].includes(activeTab)
        ) {
          dispatch(fetchOrganizationData());
        }
        if (['Trees', 'Pending', 'Approved', 'Rejected'].includes(activeTab)) {
          dispatch(fetchUserData());
        }
        if (activeTab === 'Trees') {
          dispatch(fetchSponsorData());
        }
      }
    }
  }, [isOpen, activeTab, dispatch]);

  // Debug effect to monitor the data from Redux
  useEffect(() => {}, [speciesList, countryList, orgList, iucnStatusList]);

  // Initialize filter state with current filter data when modal opens
  useEffect(() => {
    if (isOpen && currentFilterData) {
      // Initialize local state with current filter data
      // This allows filters to persist when switching between card sections
      if (currentFilterData.planted_from) {
        setStartDate(new Date(currentFilterData.planted_from));
      }
      if (currentFilterData.planted_to) {
        setEndDate(new Date(currentFilterData.planted_to));
      }
      if (currentFilterData.minted_status) {
        setSelectedMintStatus(currentFilterData.minted_status.replace(/_/g, ' ').toLowerCase());
      }
      if (currentFilterData.sponsor_type) {
        setSelectedSponsorType(currentFilterData.sponsor_type.toLowerCase());
      }
      if (currentFilterData.need_tree_assign) {
        setSelectedTreeAssignment(currentFilterData.need_tree_assign);
      }
      
      // Sync Redux state with current filter data for dropdown displays
      // This ensures the dropdowns show the correct selected values
      if (currentFilterData.species_id && speciesList.length > 0) {
        const species = speciesList.find(s => s.id === currentFilterData.species_id);
        if (species) {
          dispatch(setSelectedSpecies(species));
          setDisplaySpecies(species.displayName || species.common_name);
        }
      }
      if (currentFilterData.organization_id && orgList.length > 0) {
        const org = orgList.find(o => o.id === currentFilterData.organization_id);
        if (org) {
          dispatch(setSelectedOrg(org));
          setDisplayOrg(org.displayName || org.name);
        }
      }
      if (currentFilterData.planted_by && userList.length > 0) {
        const user = userList.find(u => u.id === currentFilterData.planted_by);
        if (user) {
          setSelectedPlanter(user);
          setDisplayPlanter(user.name);
        }
      }
      if (currentFilterData.sponsor_id && sponsorList.length > 0) {
        const sponsor = sponsorList.find(s => s.id === currentFilterData.sponsor_id);
        if (sponsor) {
          dispatch(setSelectedSponsor(sponsor));
          setDisplaySponsor(sponsor.name);
        }
      }
      if (currentFilterData.iucn_id && iucnStatusList.length > 0) {
        const iucn = iucnStatusList.find(i => i.id === currentFilterData.iucn_id);
        if (iucn) {
          dispatch(setSelectedIucnStatus(iucn));
          setDisplayIucn(iucn.displayName || iucn.name);
        }
      }
      if (currentFilterData.country_id && countryList.length > 0) {
        const country = countryList.find(c => c.id === currentFilterData.country_id);
        if (country) {
          dispatch(setSelectedCountry(country));
          setDisplayCountry(country.displayName || country.name);
        }
      }
    }
  }, [isOpen, currentFilterData, speciesList, orgList, userList, sponsorList, iucnStatusList, countryList, dispatch]);

  // Updated toggleDropdown without event handling to avoid duplicate state toggles
  const toggleDropdown = useCallback((dropdown) => {
    setDropdownOpen((prev) => {
      const newState = !prev[dropdown];
      return { ...prev, [dropdown]: newState };
    });
  }, []);

  // Handle modal close
  const onFormCancel = () => {
    if (toggle) toggle();
  };

  // Clear all filters
  const clearFilters = () => {
    onClearFilter({});
    // Reset local filter state
    setStartDate(null);
    setEndDate(null);
    setSelectedPlanter(null);
    setSelectedMintStatus('');
    setSelectedSponsorType('');
    setSelectedTreeAssignment('');

    // Reset display values
    setDisplayCountry('');
    setDisplaySpecies('');
    setDisplayOrg('');
    setDisplayIucn('');
    setDisplayPlanter('');
    setDisplaySponsor('');

    // Set null values in Redux store using set actions
    dispatch(setSelectedCountry(null));
    dispatch(setSelectedSpecies(null));
    dispatch(setSelectedIucnStatus(null));
    dispatch(setSelectedOrg(null));
    dispatch(setSelectedUser(null));
    dispatch(setSelectedSponsor(null));
  };

  // Reset local filter state when activeTab changes - but only if not on homepage
  useEffect(() => {
    // Only clear filters when changing tabs if not on homepage
    // This allows filters to persist across card sections on homepage
    if (window.location.pathname !== '/' || !['Trees', 'Pending', 'Approved', 'Rejected', 'To Mint', 'Species'].includes(activeTab)) {
      clearFilters();
      onClearFilter();
    }
  }, [activeTab]);

  // Apply selected filters
  const applyFilters = () => {
    let filterData = {};

    // Check if we're on homepage (unified filter) or specific tab
    const isHomepageFilter = window.location.pathname === '/' && ['Trees', 'Pending', 'Approved', 'Rejected', 'To Mint', 'Species'].includes(activeTab);

    if (isHomepageFilter) {
      // Unified filter for homepage - include all possible filter options
      if (startDate) filterData.planted_from = formattedYearMonthDate(startDate);
      if (endDate) filterData.planted_to = formattedYearMonthDate(endDate);
      if (selectedSpecies) filterData.species_id = selectedSpecies;
      if (selectedOrg) filterData.organization_id = selectedOrg;
      if (selectedPlanter) filterData.planted_by = selectedPlanter;
      if (selectedSponsor) filterData.sponsor_id = selectedSponsor;
      if (selectedMintStatus) filterData.minted_status = selectedMintStatus?.toUpperCase().replaceAll(' ', '_');
      if (selectedSponsorType) filterData.sponsor_type = selectedSponsorType?.toUpperCase();
      if (selectedIucnStatus) filterData.iucn_id = selectedIucnStatus;
    } else if (activeTab === 'To Mint') {
      filterData = {
        minted_status: selectedMintStatus?.toUpperCase().replaceAll(' ', '_'),
        sponsor_type: selectedSponsorType?.toUpperCase(),
        organization_id: selectedOrg
      };
    } else if (activeTab === 'Species') {
      filterData = {
        // organization_id: selectedOrg,
        iucn_id: selectedIucnStatus
      };
    } else if (activeTab === 'Sponsors') {
      filterData = {
        need_tree_assign: selectedTreeAssignment,
        type: selectedSponsorType?.toUpperCase()
      };
    } else if (activeTab === 'Organisations') {
      filterData = {
        species_id: selectedSpecies,
        country_id: selectedCountry
      };
    } else if (activeTab === 'Users') {
      filterData = {
        organization_id: selectedOrg,
        country_id: selectedCountry
      };
    } else if (activeTab === 'NFT') {
      // This tabName represents the NFT Listing in Sponsor details page
      filterData = {
        organization_id: selectedOrg,
        country_id: selectedCountry
      };
    } else if (activeTab === 'NFT History') {
      filterData = {
        from_date: startDate ? formattedYearMonthDate(startDate) : undefined,
        to_date: endDate ? formattedYearMonthDate(endDate) : undefined,
        minting_state: selectedMintStatus?.toUpperCase().replaceAll(' ', '_'),
        sponsor_type: selectedSponsorType?.toUpperCase(),
        organization_id: selectedOrg
      };
    } else {
      // Default filtering for Trees and others – only add a key if a value is provided.
      if (startDate)
        filterData.planted_from = formattedYearMonthDate(startDate);
      if (endDate) filterData.planted_to = formattedYearMonthDate(endDate);
      if (selectedSpecies) filterData.species_id = selectedSpecies;
      if (selectedOrg) filterData.organization_id = selectedOrg;
      if (selectedPlanter) filterData.planted_by = selectedPlanter;
      if (selectedSponsor) filterData.sponsor_id = selectedSponsor;
    }

    if (typeof onApplyFilter === 'function') {
      onApplyFilter(filterData);
    }
    if (toggle) toggle();
  };

  // Handle selection of country
  const handleCountrySelect = (country) => {
    dispatch(handleCountrySelection(country));
    setDisplayCountry(country.displayName || country.name);
  };

  // Handle selection of species
  const handleSpeciesSelect = (species) => {
    dispatch(handleSpeciesSelection(species));
    setDisplaySpecies(species.displayName || species.common_name);
  };

  // Handle selection of organization
  const handleOrgSelect = (org) => {
    dispatch(handleOrgSelection(org));
    setDisplayOrg(org.displayName || org.name);
  };

  // Handle selection of IUCN status
  const handleIucnSelect = (status) => {
    dispatch(handleIucnStatusSelection(status));
    setDisplayIucn(status.displayName || status.name);
  };

  // Handle selection of planter
  const handlePlanterSelect = (planter) => {
    setSelectedPlanter(planter);
    setDisplayPlanter(planter.name || '');
  };

  // Handle selection of sponsor
  const handleSponsorSelect = (sponsor) => {
    dispatch(setSelectedSponsor(sponsor));
    setDisplaySponsor(sponsor?.name || '');
  };

  // Styles based on Figma design
  const modalStyle = {
    width: '100%',
    maxWidth: '340px',
    borderRadius: '4px'
  };

  const modalBodyStyle = {
    padding: '20px',
    maxHeight: '70vh',
    overflowY: 'auto'
  };

  const formGroupStyle = {
    marginBottom: '16px'
  };

  const labelStyle = {
    fontSize: '14px',
    color: '#000000',
    marginBottom: '6px',
    display: 'block',
    fontWeight: '500'
  };

  const datepickerContainerStyle = {
    display: 'flex',
    border: '1px solid #e6e9ec',
    borderRadius: '4px',
    overflow: 'hidden'
  };

  const dateInputStyle = {
    border: 'none',
    padding: '8px 12px',
    fontSize: '14px',
    flex: 1,
    backgroundColor: '#fff'
  };

  const dateConnectorStyle = {
    padding: '8px 12px',
    backgroundColor: '#fff',
    color: '#999',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const dropdownStyle = {
    width: '100%'
  };

  const dropdownToggleStyle = {
    width: '100%',
    textAlign: 'left',
    backgroundColor: '#fff',
    border: '1px solid #e6e9ec',
    borderRadius: '4px',
    padding: '8px 12px',
    color: '#333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px'
  };

  const dropdownMenuStyle = {
    width: '100%',
    padding: '0',
    border: '1px solid #e6e9ec',
    borderRadius: '4px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    maxHeight: '250px',
    overflowY: 'auto',
    scrollbarWidth: 'none'
  };

  const dropdownItemStyle = {
    padding: '8px 12px',
    fontSize: '14px',
    color: '#333'
  };

  const buttonsContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '24px'
  };

  const clearButtonStyle = {
    backgroundColor: '#fff',
    color: '#0D5A42',
    border: 'none',
    padding: '3px',
    fontSize: '14px',
    fontWeight: '500'
  };

  const applyButtonStyle = {
    backgroundColor: '#0D5A42',
    borderColor: '#0D5A42',
    color: '#fff',
    // padding: '8px 20px',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '8px'
  };

  const chevronStyle = {
    width: '10px',
    height: '6px'
  };

  const loadingStyle = {
    color: '#999',
    fontStyle: 'italic',
    padding: '8px 12px'
  };

  // Updated to handle planter objects rather than strings
  const renderPlanterDropdown = (label) => (
    <div style={formGroupStyle}>
      <label style={labelStyle}>{label}</label>
      <Dropdown
        isOpen={dropdownOpen.planter}
        toggle={() => toggleDropdown('planter')}
        style={dropdownStyle}
      >
        <DropdownToggle
          tag='div'
          style={dropdownToggleStyle}
          data-toggle='dropdown'
          aria-expanded={dropdownOpen.planter}
        >
          <span>{displayPlanter || 'All'}</span>
          <i
            className='icon ni ni-chevron-down'
            style={chevronStyle}
          ></i>
        </DropdownToggle>
        <DropdownMenu style={dropdownMenuStyle}>
          <DropdownItem
            onClick={() => {
              setSelectedPlanter(null);
              setDisplayPlanter('');
            }}
            style={dropdownItemStyle}
          >
            All
          </DropdownItem>
          {userList.map((planter) => (
            <DropdownItem
              key={planter.id}
              onClick={() => handlePlanterSelect(planter)}
              style={dropdownItemStyle}
            >
              {planter.name}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );

  // Updated to handle sponsor objects rather than strings
  const renderSponsorDropdown = (label) => (
    <div style={formGroupStyle}>
      <label style={labelStyle}>{label}</label>
      <Dropdown
        isOpen={dropdownOpen?.sponsor}
        toggle={() => toggleDropdown('sponsor')}
        style={dropdownStyle}
      >
        <DropdownToggle
          tag='div'
          style={dropdownToggleStyle}
          data-toggle='dropdown'
          aria-expanded={dropdownOpen?.sponsor}
        >
          <span>{displaySponsor || 'All'}</span>
          <i
            className='icon ni ni-chevron-down'
            style={chevronStyle}
          ></i>
        </DropdownToggle>
        <DropdownMenu style={dropdownMenuStyle}>
          <DropdownItem
            onClick={() => {
              setSelectedSponsor(null);
              setDisplaySponsor('');
            }}
            style={dropdownItemStyle}
          >
            All
          </DropdownItem>
          {sponsorList?.map((sponsor) => (
            <DropdownItem
              key={sponsor?.id}
              onClick={() => handleSponsorSelect(sponsor)}
              style={dropdownItemStyle}
            >
              {sponsor?.name}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );

  // Function to render a dropdown for basic options (not from API)
  const renderBasicDropdown = (
    label,
    isOpen,
    toggleAction,
    selectedValue,
    setSelectedValue,
    options
  ) => (
    <div style={formGroupStyle}>
      <label style={labelStyle}>{label}</label>
      <Dropdown
        isOpen={isOpen}
        toggle={toggleAction}
        style={dropdownStyle}
      >
        <DropdownToggle
          tag='div'
          style={dropdownToggleStyle}
          data-toggle='dropdown'
          aria-expanded={isOpen}
        >
          <span>{selectedValue || 'All'}</span>
          <i
            className='icon ni ni-chevron-down'
            style={chevronStyle}
          ></i>
        </DropdownToggle>
        <DropdownMenu style={dropdownMenuStyle}>
          <DropdownItem
            onClick={() => {
              setSelectedValue('');
            }}
            style={dropdownItemStyle}
          >
            All
          </DropdownItem>
          {options?.map((item, index) => (
            <DropdownItem
              key={index}
              onClick={() => {
                setSelectedValue(
                  typeof item === 'string' ? item : item.name || item.id
                );
              }}
              style={dropdownItemStyle}
            >
              {typeof item === 'string' ? item : item.name || item.id}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );

  // Function to render country dropdown (from API with Redux)
  const renderCountryDropdown = (label) => (
    <div style={formGroupStyle}>
      <label style={labelStyle}>{label}</label>
      <Dropdown
        isOpen={dropdownOpen.country}
        toggle={() => toggleDropdown('country')}
        style={dropdownStyle}
      >
        <DropdownToggle
          tag='div'
          style={dropdownToggleStyle}
          data-toggle='dropdown'
          aria-expanded={dropdownOpen.country}
        >
          <span>{displayCountry || 'All'}</span>
          <i
            className='icon ni ni-chevron-down'
            style={chevronStyle}
          ></i>
        </DropdownToggle>
        <DropdownMenu style={dropdownMenuStyle}>
          <DropdownItem
            onClick={() => {
              setDisplayCountry('');
              dispatch(setSelectedCountry(null));
            }}
            style={dropdownItemStyle}
          >
            All
          </DropdownItem>
          {countryLoading ? (
            <div style={loadingStyle}>Loading countries...</div>
          ) : (
            countryList?.map((country) => (
              <DropdownItem
                key={country.id}
                onClick={() => handleCountrySelect(country)}
                style={dropdownItemStyle}
              >
                {country.displayName || country.name}
              </DropdownItem>
            ))
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  );

  // Function to render species dropdown (from API with Redux)
  const renderSpeciesDropdown = (label) => (
    <div style={formGroupStyle}>
      <label style={labelStyle}>{label}</label>
      <Dropdown
        isOpen={dropdownOpen.species}
        toggle={() => toggleDropdown('species')}
        style={dropdownStyle}
      >
        <DropdownToggle
          tag='div'
          style={dropdownToggleStyle}
          data-toggle='dropdown'
          aria-expanded={dropdownOpen.species}
        >
          <span>{displaySpecies || 'All'}</span>
          <i
            className='icon ni ni-chevron-down'
            style={chevronStyle}
          ></i>
        </DropdownToggle>
        <DropdownMenu style={dropdownMenuStyle}>
          <DropdownItem
            onClick={() => {
              dispatch(setSelectedSpecies(null));
              setDisplaySpecies('');
            }}
            style={dropdownItemStyle}
          >
            All
          </DropdownItem>
          {speciesLoading ? (
            <div style={loadingStyle}>Loading species...</div>
          ) : (
            speciesList?.map((species) => (
              <DropdownItem
                key={species.id}
                onClick={() => handleSpeciesSelect(species)}
                style={dropdownItemStyle}
              >
                {species.displayName ||
                  `${species.common_name} (${species.botanical_name})`}
              </DropdownItem>
            ))
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  );

  // Function to render organization dropdown (from API with Redux)
  const renderOrgDropdown = (label) => (
    <div style={formGroupStyle}>
      <label style={labelStyle}>{label}</label>
      <Dropdown
        isOpen={dropdownOpen.organization}
        toggle={() => toggleDropdown('organization')}
        style={dropdownStyle}
      >
        <DropdownToggle
          tag='div'
          style={dropdownToggleStyle}
          data-toggle='dropdown'
          aria-expanded={dropdownOpen.organization}
        >
          <span>{displayOrg || 'All'}</span>
          <i
            className='icon ni ni-chevron-down'
            style={chevronStyle}
          ></i>
        </DropdownToggle>
        <DropdownMenu style={dropdownMenuStyle}>
          <DropdownItem
            onClick={() => {
              dispatch(setSelectedOrg(null));
              setDisplayOrg('');
            }}
            style={dropdownItemStyle}
          >
            All
          </DropdownItem>
          {orgLoading ? (
            <div style={loadingStyle}>Loading organizations...</div>
          ) : (
            orgList?.map((org) => (
              <DropdownItem
                key={org.id}
                onClick={() => handleOrgSelect(org)}
                style={dropdownItemStyle}
              >
                {org.displayName || org.name}
              </DropdownItem>
            ))
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  );

  // Function to render IUCN status dropdown (from API with Redux)
  const renderIucnDropdown = (label) => (
    <div style={formGroupStyle}>
      <label style={labelStyle}>{label}</label>
      <Dropdown
        isOpen={dropdownOpen.iucn}
        toggle={() => toggleDropdown('iucn')}
        style={dropdownStyle}
      >
        <DropdownToggle
          tag='div'
          style={dropdownToggleStyle}
          data-toggle='dropdown'
          aria-expanded={dropdownOpen.iucn}
        >
          <span>{displayIucn || 'All'}</span>
          <i
            className='icon ni ni-chevron-down'
            style={chevronStyle}
          ></i>
        </DropdownToggle>
        <DropdownMenu style={dropdownMenuStyle}>
          <DropdownItem
            onClick={() => {
              dispatch(setSelectedIucnStatus(null));
              setDisplayIucn('');
            }}
            style={dropdownItemStyle}
          >
            All
          </DropdownItem>
          {iucnStatusLoading ? (
            <div style={loadingStyle}>Loading IUCN statuses...</div>
          ) : (
            iucnStatusList?.map((status) => (
              <DropdownItem
                key={status.id}
                onClick={() => handleIucnSelect(status)}
                style={dropdownItemStyle}
              >
                {status.displayName || status.name}
              </DropdownItem>
            ))
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      style={modalStyle}
      contentClassName='border-0'
    >
      <ModalHeader className='mt-1 mx-4 px-0'>
        <span
          style={{ color: '#090C1F', fontSize: '16px' }}
          className='fw-medium'
        >
          {header || 'Filter By:'}
        </span>
        <button
          className='close-button-style'
          onClick={onFormCancel}
          aria-label='Close'
          style={{
            background: 'none',
            border: 'none',
            position: 'absolute',
            right: '20px',
            top: '20px'
          }}
        >
          <img
            src={closeIcon}
            alt='Close'
          />
        </button>
      </ModalHeader>
      <ModalBody style={modalBodyStyle} className="custom-scrollbar">
        {/* Check if we're on homepage (unified filter) or specific tab */}
        {(() => {
          const isHomepageFilter = window.location.pathname === '/' && ['Trees', 'Pending', 'Approved', 'Rejected', 'To Mint', 'Species'].includes(activeTab);
          
          if (isHomepageFilter) {
            // Unified filter for homepage - show all filter options
            return (
              <>
                {/* Date Range Filter */}
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Planted From & To Date</label>
                  <div style={datepickerContainerStyle}>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      placeholderText='From'
                      className='form-control'
                      style={dateInputStyle}
                      customInput={
                        <input style={{ ...dateInputStyle, width: '100%' }} />
                      }
                      showYearDropdown={true}
                      scrollableYearDropdown={true}
                      yearDropdownItemNumber={25}
                      minDate={new Date('2000-01-01')}
                      maxDate={new Date()}
                    />
                    <div style={dateConnectorStyle}>TO</div>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      maxDate={new Date()}
                      minDate={startDate || new Date('2000-01-01')}
                      placeholderText='To'
                      className='form-control'
                      style={dateInputStyle}
                      customInput={
                        <input style={{ ...dateInputStyle, width: '100%' }} />
                      }
                      showYearDropdown={true}
                      scrollableYearDropdown={true}
                      yearDropdownItemNumber={25}
                    />
                  </div>
                </div>

                {/* All filter options for unified filter */}
                {renderSpeciesDropdown('Species')}
                {renderOrgDropdown('Organisation / Community')}
                {renderPlanterDropdown('Planter')}
                {renderSponsorDropdown('Sponsor')}
                {renderBasicDropdown(
                  'Mint Status',
                  dropdownOpen.mintStatus,
                  () => toggleDropdown('mintStatus'),
                  selectedMintStatus,
                  setSelectedMintStatus,
                  mintStatusOptions
                )}
                {renderBasicDropdown(
                  'Sponsor Type',
                  dropdownOpen.sponsorType,
                  () => toggleDropdown('sponsorType'),
                  selectedSponsorType,
                  setSelectedSponsorType,
                  sponsorTypeOptions
                )}
                {renderIucnDropdown('IUCN Status')}
              </>
            );
          } else {
            // Original logic for specific tabs
            return (
              <>
                {/* Species Tab */}
                {activeTab === 'Species' && (
                  <>
                    {renderIucnDropdown('IUCN Status')}
                  </>
                )}

                {/* Organizations Tab */}
                {activeTab === 'Organisations' && (
                  <>
                    {renderSpeciesDropdown('Species')}
                    {renderCountryDropdown('Countries')}
                  </>
                )}

                {/* To Mint Tab */}
                {activeTab === 'To Mint' && (
                  <>
                    {renderBasicDropdown(
                      'Mint Status',
                      dropdownOpen.mintStatus,
                      () => toggleDropdown('mintStatus'),
                      selectedMintStatus,
                      setSelectedMintStatus,
                      mintStatusOptions
                    )}
                    {renderBasicDropdown(
                      'Sponsor Type',
                      dropdownOpen.sponsorType,
                      () => toggleDropdown('sponsorType'),
                      selectedSponsorType,
                      setSelectedSponsorType,
                      sponsorTypeOptions
                    )}
                    {renderOrgDropdown('Community / Organisation')}
                  </>
                )}

                {/* Sponsor Tab */}
                {activeTab === 'Sponsors' && (
                  <>
                    {renderBasicDropdown(
                      'By Need Tree Assignment',
                      dropdownOpen.treeAssignment,
                      () => toggleDropdown('treeAssignment'),
                      selectedTreeAssignment,
                      setSelectedTreeAssignment,
                      treeAssignmentOptions
                    )}
                    {renderBasicDropdown(
                      'Sponsor Type',
                      dropdownOpen.sponsorType,
                      () => toggleDropdown('sponsorType'),
                      selectedSponsorType,
                      setSelectedSponsorType,
                      sponsorTypeOptions
                    )}
                  </>
                )}

                {/* Users Tab */}
                {activeTab === 'Users' && (
                  <>
                    {renderCountryDropdown('Countries')}
                    {renderOrgDropdown('Organisation / Community')}
                  </>
                )}

                {activeTab === 'NFT History' && (
                  <>
                    {/* Date Range Filter */}
                    <div style={formGroupStyle}>
                      <label style={labelStyle}>Planted From & To Date</label>
                      <div style={datepickerContainerStyle}>
                        <DatePicker
                          selected={startDate}
                          onChange={(date) => setStartDate(date)}
                          selectsStart
                          startDate={startDate}
                          endDate={endDate}
                          placeholderText='From'
                          className='form-control'
                          style={dateInputStyle}
                          customInput={
                            <input style={{ ...dateInputStyle, width: '100%' }} />
                          }
                          showYearDropdown={true}
                          scrollableYearDropdown={true}
                          yearDropdownItemNumber={25}
                          minDate={new Date('2000-01-01')}
                          maxDate={new Date()}
                        />
                        <div style={dateConnectorStyle}>TO</div>
                        <DatePicker
                          selected={endDate}
                          onChange={(date) => setEndDate(date)}
                          selectsEnd
                          startDate={startDate}
                          endDate={endDate}
                          maxDate={new Date()}
                          minDate={startDate || new Date('2000-01-01')}
                          placeholderText='To'
                          className='form-control'
                          style={dateInputStyle}
                          customInput={
                            <input style={{ ...dateInputStyle, width: '100%' }} />
                          }
                          showYearDropdown={true}
                          scrollableYearDropdown={true}
                          yearDropdownItemNumber={25}
                        />
                      </div>
                    </div>
                    {renderBasicDropdown(
                      'Sponsor Type',
                      dropdownOpen.sponsorType,
                      () => toggleDropdown('sponsorType'),
                      selectedSponsorType,
                      setSelectedSponsorType,
                      sponsorTypeOptions
                    )}
                    {renderBasicDropdown(
                      'Minting State',
                      dropdownOpen.mintStatus,
                      () => toggleDropdown('mintStatus'),
                      selectedMintStatus,
                      setSelectedMintStatus,
                      mintStatusOptions
                    )}
                    {renderOrgDropdown('Organisation / Community')}
                  </>
                )}

                {activeTab === 'NFT' && (
                  <>
                    {renderOrgDropdown('Organisation / Community')}
                    {renderCountryDropdown('Countries')}
                  </>
                )}

                {/* Default Tab (Trees and others) */}
                {![
                  'To Mint',
                  'Species',
                  'Sponsors',
                  'Organisations',
                  'Users',
                  'NFT History',
                  'NFT'
                ].includes(activeTab) && (
                  <>
                    {/* Date Range Filter */}
                    <div style={formGroupStyle}>
                      <label style={labelStyle}>Planted From & To Date</label>
                      <div style={datepickerContainerStyle}>
                        <DatePicker
                          selected={startDate}
                          onChange={(date) => setStartDate(date)}
                          selectsStart
                          startDate={startDate}
                          endDate={endDate}
                          placeholderText='From'
                          className='form-control'
                          style={dateInputStyle}
                          customInput={
                            <input style={{ ...dateInputStyle, width: '100%' }} />
                          }
                          showYearDropdown={true}
                          scrollableYearDropdown={true}
                          yearDropdownItemNumber={25}
                          minDate={new Date('2000-01-01')}
                          maxDate={new Date()}
                        />
                        <div style={dateConnectorStyle}>TO</div>
                        <DatePicker
                          selected={endDate}
                          onChange={(date) => setEndDate(date)}
                          selectsEnd
                          startDate={startDate}
                          endDate={endDate}
                          maxDate={new Date()}
                          minDate={startDate || new Date('2000-01-01')}
                          placeholderText='To'
                          className='form-control'
                          style={dateInputStyle}
                          customInput={
                            <input style={{ ...dateInputStyle, width: '100%' }} />
                          }
                          showYearDropdown={true}
                          scrollableYearDropdown={true}
                          yearDropdownItemNumber={25}
                        />
                      </div>
                    </div>

                    {/* Species, Organization, and Planter Filters */}
                    {renderSpeciesDropdown('Species')}
                    {renderOrgDropdown('Organisation / Community')}
                    {renderPlanterDropdown('Planter')}

                    {/* Sponsor Filter - Only show for Trees tab */}
                    {activeTab === 'Trees' && renderSponsorDropdown('Sponsor')}
                  </>
                )}
              </>
            );
          }
        })()}

        <div style={buttonsContainerStyle}>
          <Button
            onClick={clearFilters}
            style={clearButtonStyle}
          >
            Clear Filter
          </Button>
          <Button
            onClick={applyFilters}
            style={applyButtonStyle}
          >
            Apply Filter
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default FilterModal;
