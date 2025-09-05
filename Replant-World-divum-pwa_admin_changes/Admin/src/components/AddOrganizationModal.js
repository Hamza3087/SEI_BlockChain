import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Row,
  Col,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle
} from 'reactstrap';
import { showToast } from '../components/ToastNotification';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCountriesData,
  handleCountrySelection,
  resetCountry
} from '../redux/actions/countryAction';
import closeIcon from '../images/icons/close.svg';
import '../assets/scss/custom.scss';
import {
  addOrganisation,
  updateOrganisation,
  resetOrgState,
  resetUpdateOrgState
} from '../redux/actions/addOrganizationAction';
import { refreshThePage } from '../utils/helperFunction';

const AddOrganizationModal = ({ isOpen, toggle, header, organizationData }) => {
  // Extract organizationData from isOpen if it's an object
  const modalData = typeof isOpen === 'object' ? isOpen : null;
  const actualIsOpen = typeof isOpen === 'object' ? !!isOpen : isOpen;
  const actualOrganizationData = organizationData || (modalData?.organizationData || null);
  const dispatch = useDispatch();
  const { countryList, selectedCountry, loading } = useSelector(
    (state) => state.country
  );

  const {
    loading: addOrgLoading,
    error: addOrgError,
    success: addOrgSuccess,
    message,
    updateLoading,
    updateError,
    updateSuccess,
    updateMessage
  } = useSelector((state) => state.organisationReducer);

  // Determine if this is edit mode
  const isEditMode = actualOrganizationData && actualOrganizationData?.id;

  // Form state
  const [organizationName, setOrganizationName] = useState('');
  const [contactPersonName, setContactPersonName] = useState('');
  const [contactPersonEmail, setContactPersonEmail] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState([]);

  const isFormValid = () => {
    return (
      organizationName.trim() !== '' &&
      contactPersonName.trim() !== '' &&
      contactPersonEmail.trim() !== '' &&
      selectedCountries.length > 0
    );
  };

  // Reset form fields
  const resetForm = useCallback(() => {
    setOrganizationName('');
    setContactPersonName('');
    setContactPersonEmail('');
    setSelectedCountries([]);
    dispatch(resetCountry());
  }, [dispatch]);

  // Prefill form when in edit mode
  useEffect(() => {
    if (actualIsOpen && isEditMode && actualOrganizationData) {
      // Try different possible field names for organization name
      const orgName = actualOrganizationData?.organization_name || 
                     actualOrganizationData?.organisation_name || 
                     actualOrganizationData?.name || '';
      
      setOrganizationName(orgName);
      setContactPersonName(actualOrganizationData?.contact_person_full_name || '');
      setContactPersonEmail(actualOrganizationData?.contact_person_email || '');
    } else if (actualIsOpen && !isEditMode) {
      // Reset form for add mode
      resetForm();
    }
  }, [actualIsOpen, isEditMode, actualOrganizationData, resetForm]);

  useEffect(() => {
    if (addOrgSuccess) {
      showToast.success(message || 'Organisation added successfully!');
      resetForm();
      if (toggle) toggle();
      dispatch(resetOrgState());
      refreshThePage();
    }
    if (addOrgError) {
      showToast.error(
        addOrgError.message || 'Failed to add organisation. Please try again.'
      );
      dispatch(resetOrgState());
    }
  }, [addOrgSuccess, addOrgError, message, toggle, dispatch, resetForm]);

  // Handle update success/error
  useEffect(() => {
    if (updateSuccess) {
      showToast.success(updateMessage || 'Organisation updated successfully!');
      resetForm();
      if (toggle) toggle();
      dispatch(resetUpdateOrgState());
      refreshThePage();
    }
    if (updateError) {
      showToast.error(
        updateError.message || 'Failed to update organisation. Please try again.'
      );
      dispatch(resetUpdateOrgState());
    }
  }, [updateSuccess, updateError, updateMessage, toggle, dispatch, resetForm]);

  // Fetch countries when modal opens
  useEffect(() => {
    if (actualIsOpen) {
      dispatch(fetchCountriesData());
    }
  }, [actualIsOpen, dispatch]);

  // Reset form when modal closes
  useEffect(() => {
    if (!actualIsOpen) {
      resetForm();
    }
  }, [actualIsOpen, resetForm]);

  useEffect(() => {
    // Initialize selected countries if there's a value from Redux
    if (actualIsOpen && selectedCountry && !isEditMode) {
      setSelectedCountries(
        Array.isArray(selectedCountry) ? selectedCountry : [selectedCountry]
      );
    }
  }, [actualIsOpen, selectedCountry, isEditMode]);

  // Handle countries data when countryList is loaded in edit mode
  useEffect(() => {
    if (actualIsOpen && isEditMode && actualOrganizationData && countryList?.length > 0) {
      
      // Check for countries in different possible locations
      const countriesData = actualOrganizationData?.original_countries || 
                           actualOrganizationData?.countries || 
                           actualOrganizationData?.content?.countries ||
                           actualOrganizationData?.country_names ||
                           actualOrganizationData?.country_ids;
      
      let countryNames = [];
      let countryIds = [];
      
      if (countriesData) {
        if (Array.isArray(countriesData)) {
          // Check if it's an array of objects with id/name or just strings
          if (typeof countriesData[0] === 'object' && countriesData[0]?.id) {
            // Array of country objects
            countryIds = countriesData?.map(country => country?.id);
            countryNames = countriesData?.map(country => country?.name || country?.displayName);
          } else {
            // Array of country names/strings
            countryNames = countriesData; 
          }
        } else if (typeof countriesData === 'string') {
          // Handle both full country names and truncated display strings
          if (countriesData.includes('..+')) {
            // This is a truncated display string, we need to get the full data
            // Try to get the full country list from the original data
            const fullCountriesData = actualOrganizationData?.full_countries || 
                                     actualOrganizationData?.all_countries ||
                                     actualOrganizationData?.countries_list ||
                                     actualOrganizationData?.original_countries;
            if (fullCountriesData && Array.isArray(fullCountriesData)) {
              countryNames = fullCountriesData;
            } else {
              // Fallback: try to extract from the truncated string
              const match = countriesData.match(/^(.+?) \.\.\+(\d+)$/);
              if (match) {
                const firstTwo = match[1].split(', ');
                // We can't reconstruct the full list from truncated data
                // This is a limitation - we need the full data from the API
                countryNames = firstTwo;
              } else {
                countryNames = countriesData?.split(',').map(country => country?.trim());
              }
            }
          } else {
            // Regular comma-separated string
            countryNames = countriesData?.split(',').map(country => country?.trim());
          }
        }
      }
      
      if (countryNames?.length > 0 || countryIds?.length > 0) {
        let countryObjects = [];
        
        if (countryIds?.length > 0) {
          // Match by ID first (more reliable)
          countryObjects = countryList?.filter(country => 
            countryIds?.includes(country?.id)
          );
        }
        
        if (countryObjects?.length === 0 && countryNames?.length > 0) {
          // Fallback to name matching
          countryObjects = countryList?.filter(country => 
            countryNames?.includes(country?.name) || 
            countryNames?.includes(country?.displayName)
          );
        }
        
        if (countryObjects?.length > 0) {
          setSelectedCountries(countryObjects);
        }
      }
    }
  }, [actualIsOpen, isEditMode, actualOrganizationData, countryList]);



  const onFormCancel = () => {
    resetForm();
    if (toggle) toggle();
  };

  const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

  // Handle checkbox toggle for multiple selection
  const handleCountryToggle = (country) => {
    const isSelected = selectedCountries.some((item) => item.id === country.id);
    let updatedSelection;

    if (isSelected) {
      updatedSelection = selectedCountries.filter(
        (item) => item.id !== country.id
      );
    } else {
      updatedSelection = [...selectedCountries, country];
    }

    setSelectedCountries(updatedSelection);
    dispatch(handleCountrySelection(updatedSelection));
  };

  // Handle form submission
  const handleSubmit = () => {
    const payload = {
      organization_name: organizationName, // Use British spelling for API
      contact_person_full_name: contactPersonName,
      contact_person_email: contactPersonEmail,
      country_ids: selectedCountries?.map((country) => country?.id)
    };

    if (isEditMode) {
      // Update organization
      dispatch(updateOrganisation(actualOrganizationData?.id, payload));
    } else {
      // Add organization
      dispatch(addOrganisation(payload));
    }
  };

  // Get display text for dropdown toggle
  const getCountryDisplayText = () => {
    if (selectedCountries.length === 0) {
      return 'Select';
    }
    if (selectedCountries.length === 1) {
      return selectedCountries[0].name || selectedCountries[0].displayName;
    }
    return `${selectedCountries.length} countries selected`;
  };

  // Form style definitions
  const formControlStyle = {
    borderColor: '#E7E7E7',
    backgroundColor: '#FAFAFA',
    borderRadius: '10px',
    color: '#B9C6E1'
  };

  // Specific dropdown styles to match the image
  const dropdownToggleStyle = {
    ...formControlStyle,
    color: selectedCountries.length > 0 ? '#374356' : '#B9C6E1',
    cursor: 'pointer',
    textAlign: 'left',
    padding: '0.75rem 1rem',
    height: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#F8F9FC' // Lighter background from the image
  };

  // Dropdown menu styling to match image
  const dropdownMenuStyle = {
    borderColor: '#E7E7E7',
    borderRadius: '10px',
    marginTop: '0.25rem',
    boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
    width: '100%',
    padding: '0',
    overflow: 'hidden',
    maxHeight: '250px',
    overflowY: 'auto',
    scrollbarWidth: 'none'
  };

  // Individual dropdown item styling
  const dropdownItemStyle = {
    padding: '0.75rem 1rem',
    color: '#3F4D60',
    fontSize: '0.9rem',
    borderBottom: '1px solid #F0F0F0',
    display: 'flex',
    alignItems: 'center'
  };

  // Checkbox style
  const checkboxStyle = {
    marginRight: '10px',
    cursor: 'pointer'
  };

  const isLoading = addOrgLoading || updateLoading;

  return (
    <Modal
      isOpen={actualIsOpen}
      toggle={toggle}
      className='fixed inset-0 z-50 flex items-center justify-center'
      contentClassName='relative w-full max-w-lg bg-white shadow-xl p-0 m-4 border-radius'
      style={{ width: '100%', maxWidth: '41.625rem' }}
    >
      <button
        className='close-button-style'
        onClick={onFormCancel}
        aria-label='Close'
      >
        <img
          src={closeIcon}
          alt='Close'
        />{' '}
      </button>
      <ModalHeader
        className='mt-1 mx-4 px-0 py-2'
        toggle={null}
      >
        <span
          style={{ color: '#090C1F', fontSize: '1.375rem' }}
          className='fw-medium'
        >
          {header}
        </span>
      </ModalHeader>
      <ModalBody>
        <Row className='gy-3 py-1'>
          <Col sm='6'>
            <label
              className='form-label fw-normal'
              htmlFor='org-name'
              style={{ color: '#374356' }}
            >
              Organization Name
            </label>
            <div className='form-control-wrap'>
              <input
                type='text'
                className='form-control custom-input'
                id='org-name'
                placeholder='Enter organization name'
                style={{ formControlStyle, boxShadow: 'none' }}
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
            </div>{' '}
          </Col>
          <Col sm='6'>
            <label
              className='form-label fw-normal'
              htmlFor='name'
              style={{ color: '#374356' }}
            >
              Contact Person Full name
            </label>
            <div className='form-control-wrap'>
              <input
                type='text'
                className='form-control custom-input'
                id='name'
                placeholder='Enter full name'
                style={{ formControlStyle, boxShadow: 'none' }}
                value={contactPersonName}
                onChange={(e) => setContactPersonName(e.target.value)}
              />
            </div>{' '}
          </Col>
          <Col sm='6'>
            <label
              className='form-label fw-normal'
              htmlFor='email'
              style={{ color: '#374356' }}
            >
              Contact Person Email
            </label>
            <div className='form-control-wrap'>
              <input
                type='text'
                className='form-control custom-input'
                id='email'
                placeholder='Enter email address'
                style={{ formControlStyle, boxShadow: 'none' }}
                value={contactPersonEmail}
                onChange={(e) => setContactPersonEmail(e.target.value)}
              />
            </div>{' '}
          </Col>
          <Col sm='6'>
            <label
              className='form-label fw-normal'
              htmlFor='countries'
              style={{ color: '#374356', cursor: 'default' }}
            >
              Countries
            </label>
            <div className='form-control-wrap'>
              <Dropdown
                isOpen={dropdownOpen}
                toggle={toggleDropdown}
                style={{ width: '100%' }}
              >
                <DropdownToggle
                  tag='div'
                  className='form-control custom-input'
                  style={dropdownToggleStyle}
                  data-toggle='dropdown'
                  aria-expanded={dropdownOpen}
                >
                  <span
                    style={{
                      color:
                        selectedCountries.length > 0 ? '#374356' : '#B9C6E1'
                    }}
                  >
                    {getCountryDisplayText()}
                  </span>
                  <i
                    className={`ni ni-chevron-down ${
                      dropdownOpen ? 'ni-chevron-up' : ''
                    }`}
                    style={{
                      color: '#2C3E50',
                      fontSize: '1.125rem'
                    }}
                  ></i>
                </DropdownToggle>
                <DropdownMenu style={dropdownMenuStyle}>
                  {loading ? (
                    <DropdownItem
                      disabled
                      style={dropdownItemStyle}
                    >
                      Loading countries...
                    </DropdownItem>
                  ) : countryList && countryList.length > 0 ? (
                    countryList.map((country) => (
                      <DropdownItem
                        key={country.id}
                        onClick={() => handleCountryToggle(country)}
                        style={dropdownItemStyle}
                        toggle={false}
                      >
                        <input
                          type='checkbox'
                          id={`country-${country.id}`}
                          checked={selectedCountries.some(
                            (item) => item.id === country.id
                          )}
                          onChange={() => {}} // Handle through parent click
                          style={checkboxStyle}
                        />
                        <label
                          htmlFor={`country-${country.id}`}
                          style={{
                            cursor: 'pointer',
                            margin: 0,
                            width: '100%'
                          }}
                        >
                          {country.displayName}
                        </label>
                      </DropdownItem>
                    ))
                  ) : (
                    <DropdownItem
                      disabled
                      style={dropdownItemStyle}
                    >
                      No countries available
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
            </div>
          </Col>
        </Row>
        <ul className='d-flex justify-content-end gx-4 mt-3'>
          <li>
            <Button
              className='btn-primary btn-lg'
              style={{ backgroundColor: '#0D5A42' }}
              onClick={handleSubmit}
              disabled={!isFormValid() || loading || isLoading}
            >
              {isLoading ? 'Saving...' : (isEditMode ? 'Update' : 'Save')}
            </Button>
          </li>
        </ul>
      </ModalBody>
    </Modal>
  );
};

export default AddOrganizationModal;
