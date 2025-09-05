import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import closeIcon from '../images/icons/close.svg';
import '../assets/scss/custom.scss';
import { refreshThePage } from '../utils/helperFunction';

import {
  fetchOrganizationData,
  handleOrgSelection,
  resetOrg
} from '../redux/actions/organisationAction';
import { fetchCountryListing } from '../redux/actions/countryListingOrgAction';
import {
  fetchSpeciesData,
  handleSpeciesSelection,
  resetSpecies
} from '../redux/actions/speciesAction';
import { assignSpecies } from '../redux/actions/assignSpeciesAction';

const AssignSpeciesModal = ({
  isOpen,
  toggle,
  header,
  showOrganizationField = true,
  organizationId = null
}) => {
  const dispatch = useDispatch();

  // Get the data from Redux store
  const {
    orgList,
    selectedOrg,
    loading: orgLoading
  } = useSelector((state) => state.organisation);
  const { countryListingDetails, loadingDetails: countryLoading } = useSelector(
    (state) => state.countryListingByOrgId
  );
  const {
    speciesList,
    selectedSpecies,
    loading: speciesLoading
  } = useSelector((state) => state.speciesListingReducer);

  // Local state for dropdown open/close
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [speciesDropdownOpen, setSpeciesDropdownOpen] = useState(false);

  // Local state for selections
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [planting_cost, setPlantingCost] = useState('');
  const [is_native, setIsNative] = useState(false);

  // Wrap resetForm in useCallback for a stable reference
  const resetForm = useCallback(() => {
    setSelectedCountry(null);
    setPlantingCost('');
    setIsNative(false);
    dispatch(resetOrg());
    dispatch(resetSpecies());
  }, [dispatch]);

  useEffect(() => {
    if (organizationId) {
      // If organizationId is passed as prop (from sidebar/action dropdown)
      dispatch(fetchCountryListing(organizationId));
      // Also set the selectedOrg in redux if needed
      const org = orgList.find((o) => o.id === organizationId);
      if (org) {
        dispatch(handleOrgSelection(org));
      }
    } else if (selectedOrg?.id) {
      // If organization is selected from dropdown (header case)
      dispatch(fetchCountryListing(selectedOrg.id));
    }
  }, [dispatch, selectedOrg, organizationId, orgList]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    } else {
      // Fetch fresh data when modal opens
      dispatch(fetchOrganizationData());
      dispatch(fetchSpeciesData());
    }
  }, [isOpen, dispatch, resetForm]);

  // Common style for form controls
  const formControlStyle = {
    borderColor: '#E7E7E7',
    backgroundColor: '#FAFAFA',
    borderRadius: '10px',
    color: '#B9C6E1'
  };

  // Dropdown toggle style
  const getDropdownToggleStyle = (selected) => ({
    ...formControlStyle,
    color: selected ? '#374356' : '#B9C6E1',
    cursor: 'pointer',
    textAlign: 'left',
    padding: '0.75rem 1rem',
    height: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#F8F9FC'
  });

  // Dropdown menu styling
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
    borderBottom: '1px solid #F0F0F0'
  };

  // Toggle functions for dropdowns
  const toggleOrgDropdown = () => setOrgDropdownOpen((prevState) => !prevState);
  const toggleCountryDropdown = () =>
    setCountryDropdownOpen((prevState) => !prevState);
  const toggleSpeciesDropdown = () =>
    setSpeciesDropdownOpen((prevState) => !prevState);

  // Fetch countries when organization is selected
  useEffect(() => {
    if (selectedOrg?.id) {
      dispatch(fetchCountryListing(selectedOrg.id));
    }
  }, [dispatch, selectedOrg]);

  const handleOrganizationSelect = (org) => {
    dispatch(handleOrgSelection(org));
    setSelectedCountry(null); // Reset country when org changes
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
  };

  const handleSpeciesSelect = (species) => {
    dispatch(handleSpeciesSelection(species));
  };

  const handleAssignSpecies = () => {
    // Here you can handle form submission with all selected values
    const assignmentPayload = {
      organization_id: selectedOrg?.id,
      species_id: selectedSpecies?.id,
      country_id: selectedCountry?.id,
      planting_cost: parseFloat(planting_cost),
      is_native: is_native
    };
    dispatch(assignSpecies(assignmentPayload))
      .then(() => {
        // Reset form fields on success
        resetForm();
        // Close the modal
        if (toggle) toggle();
        refreshThePage();
      })
      .catch((error) => {
        // Handle error
        console.error('Failed to assign species:', error);
      });
  };

  const onFormCancel = () => {
    resetForm();
    if (toggle) toggle();
  };

  const isFormValid = () => {
    return (
      (showOrganizationField ? selectedOrg : true) && // Organization is mandatory only if shown
      selectedCountry &&
      selectedSpecies &&
      planting_cost.trim() !== '' &&
      !isNaN(parseFloat(planting_cost))
    ); // Ensure planting_cost is a valid number
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      className='fixed inset-0 z-50 flex items-center justify-center'
      contentClassName='relative max-w-lg bg-white shadow-xl rounded-lg p-0 m-4 border-radius'
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
        />
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
          {showOrganizationField && (
            <Col sm='6'>
              <label
                className='form-label fw-normal'
                htmlFor='organization'
                style={{ color: '#374356', cursor: 'default' }}
              >
                Organization/Community
              </label>
              <div className='form-control-wrap'>
                <Dropdown
                  isOpen={orgDropdownOpen}
                  toggle={toggleOrgDropdown}
                  style={{ width: '100%' }}
                >
                  <DropdownToggle
                    tag='div'
                    className='form-control custom-input'
                    style={getDropdownToggleStyle(selectedOrg)}
                    data-toggle='dropdown'
                    aria-expanded={orgDropdownOpen}
                  >
                    <span
                      style={{ color: selectedOrg ? '#374356' : '#B9C6E1' }}
                    >
                      {selectedOrg?.displayName ||
                        'Select planting organization'}
                    </span>
                    <i
                      className={`ni ni-chevron-down ${
                        orgDropdownOpen ? 'ni-chevron-up' : ''
                      }`}
                      style={{
                        color: '#2C3E50',
                        fontSize: '1.125rem'
                      }}
                    ></i>
                  </DropdownToggle>
                  <DropdownMenu style={dropdownMenuStyle}>
                    {orgLoading ? (
                      <DropdownItem disabled>Loading...</DropdownItem>
                    ) : orgList && orgList.length > 0 ? (
                      orgList.map((org) => (
                        <DropdownItem
                          key={org.id}
                          onClick={() => handleOrganizationSelect(org)}
                          style={dropdownItemStyle}
                        >
                          {org.displayName}
                        </DropdownItem>
                      ))
                    ) : (
                      <DropdownItem disabled>
                        No organizations available
                      </DropdownItem>
                    )}
                  </DropdownMenu>
                </Dropdown>
              </div>
            </Col>
          )}
          {/* Countries Dropdown */}
          <Col sm='6'>
            <label
              className='form-label fw-normal'
              htmlFor='country'
              style={{ color: '#374356', cursor: 'default' }}
            >
              Countries
            </label>
            <div className='form-control-wrap'>
              <Dropdown
                isOpen={countryDropdownOpen}
                toggle={toggleCountryDropdown}
                style={{ width: '100%' }}
              >
                <DropdownToggle
                  tag='div'
                  className='form-control custom-input'
                  style={getDropdownToggleStyle(selectedCountry)}
                  data-toggle='dropdown'
                  aria-expanded={countryDropdownOpen}
                >
                  <span
                    style={{ color: selectedCountry ? '#374356' : '#B9C6E1' }}
                  >
                    {selectedCountry?.name || 'Select country'}
                  </span>
                  <i
                    className={`ni ni-chevron-down ${
                      countryDropdownOpen ? 'ni-chevron-up' : ''
                    }`}
                    style={{
                      color: '#2C3E50',
                      fontSize: '1.125rem'
                    }}
                  ></i>
                </DropdownToggle>
                <DropdownMenu style={dropdownMenuStyle}>
                  {!selectedOrg ? (
                    <DropdownItem disabled>
                      Select an organization first
                    </DropdownItem>
                  ) : countryLoading ? (
                    <DropdownItem disabled>Loading...</DropdownItem>
                  ) : countryListingDetails &&
                    countryListingDetails.length > 0 ? (
                    countryListingDetails.map((country) => (
                      <DropdownItem
                        key={country.id}
                        onClick={() => handleCountrySelect(country)}
                        style={dropdownItemStyle}
                      >
                        {country.name}
                      </DropdownItem>
                    ))
                  ) : (
                    <DropdownItem disabled>No countries available</DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
            </div>
          </Col>

          {/* Species Dropdown */}
          <Col sm='6'>
            <label
              className='form-label fw-normal'
              htmlFor='species'
              style={{ color: '#374356', cursor: 'default' }}
            >
              Species
            </label>
            <div className='form-control-wrap'>
              <Dropdown
                isOpen={speciesDropdownOpen}
                toggle={toggleSpeciesDropdown}
                style={{ width: '100%' }}
              >
                <DropdownToggle
                  tag='div'
                  className='form-control custom-input'
                  style={getDropdownToggleStyle(selectedSpecies)}
                  data-toggle='dropdown'
                  aria-expanded={speciesDropdownOpen}
                >
                  <span
                    style={{ color: selectedSpecies ? '#374356' : '#B9C6E1' }}
                  >
                    {selectedSpecies?.displayName || 'Select species'}
                  </span>
                  <i
                    className={`ni ni-chevron-down ${
                      speciesDropdownOpen ? 'ni-chevron-up' : ''
                    }`}
                    style={{
                      color: '#2C3E50',
                      fontSize: '1.125rem'
                    }}
                  ></i>
                </DropdownToggle>
                <DropdownMenu style={dropdownMenuStyle}>
                  {speciesLoading ? (
                    <DropdownItem disabled>Loading...</DropdownItem>
                  ) : speciesList && speciesList.length > 0 ? (
                    speciesList.map((species) => (
                      <DropdownItem
                        key={species.id}
                        onClick={() => handleSpeciesSelect(species)}
                        style={dropdownItemStyle}
                      >
                        {species.displayName}
                      </DropdownItem>
                    ))
                  ) : (
                    <DropdownItem disabled>No species available</DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
            </div>
          </Col>

          {/* Planting Cost Input */}
          <Col sm='6'>
            <label
              className='form-label fw-normal'
              htmlFor='planting-cost'
              style={{ color: '#374356' }}
            >
              Planting Cost
            </label>
            <div className='form-control-wrap'>
              <input
                type='text'
                className='form-control custom-input'
                id='planting-cost'
                placeholder='$'
                value={planting_cost}
                onChange={(e) => setPlantingCost(e.target.value)}
                style={{ formControlStyle, boxShadow: 'none' }}
              />
            </div>
          </Col>

          {/* Is Native Checkbox */}
          <Col sm='12'>
            <div className='custom-control custom-control-sm custom-checkbox'>
              <input
                type='checkbox'
                className='custom-control-input'
                checked={is_native}
                onChange={(e) => setIsNative(e.target.checked)}
                id='check-is-native'
              />
              <label
                className='custom-control-label'
                htmlFor='check-is-native'
                style={{
                  color: '#374356',
                  fontSize: '15px',
                  marginLeft: '8px'
                }}
              >
                Is native
              </label>
            </div>
          </Col>
        </Row>

        {/* Submit Button */}
        <ul className='d-flex justify-content-end gx-4 mt-3'>
          <li>
            <Button
              className='btn-primary btn-lg'
              style={{ backgroundColor: '#0D5A42' }}
              onClick={handleAssignSpecies}
              disabled={
                !isFormValid() || speciesLoading || orgLoading || countryLoading
              }
            >
              Done
            </Button>
          </li>
        </ul>
      </ModalBody>
    </Modal>
  );
};

export default AssignSpeciesModal;
