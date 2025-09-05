import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Col,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Row
} from 'reactstrap';
import closeIcon from '../images/icons/close.svg';
import '../assets/scss/custom.scss';
import {
  fetchSponsorData,
  handleSponsorSelection,
  resetSponsor
} from '../redux/actions/sponsorAction';
import {
  fetchOrganizationData,
  handleOrgSelection,
  resetOrg
} from '../redux/actions/organisationAction';
import { assignNft } from '../redux/actions/assignNftAction';
import { refreshThePage } from '../utils/helperFunction';

const AssignNftModal = ({
  isOpen,
  header,
  toggle,
  sponsorData = null,
  sponsorName = ''
}) => {
  const dispatch = useDispatch();

  // Get data from Redux store
  const {
    sponsorList,
    loading: sponsorLoading,
    selectedSponsor: reduxSelectedSponsor
  } = useSelector((state) => state.sponsorReducer);

  const {
    orgList,
    loading: orgLoading,
    selectedOrg
  } = useSelector((state) => state.organisation);

  // Local state for dropdown UI
  const [sponsorDropdownOpen, setSponsorDropdownOpen] = useState(false);
  const [organizationDropdownOpen, setOrganizationDropdownOpen] =
    useState(false);

  // Local component state
  const [noOfTrees, setNoOfTrees] = useState('1');
  const [minCost, setMinCost] = useState('');
  const [maxCost, setMaxCost] = useState('');

  // Fetch data when component mounts
  useEffect(() => {
    dispatch(fetchSponsorData());
    dispatch(fetchOrganizationData());

    return () => {
      // Reset selections when component unmounts
      dispatch(resetSponsor());
      dispatch(resetOrg());
    };
  }, [dispatch]);

  // If sponsorData is provided as prop, set it as selected
  useEffect(() => {
    if (sponsorData && sponsorList.length > 0) {
      const sponsor = sponsorList.find((s) => s.id === sponsorData?.id);
      if (sponsor) {
        dispatch(handleSponsorSelection(sponsor));
      }
    }
  }, [sponsorData, sponsorList, dispatch]);

  // Toggle functions for dropdowns
  const toggleSponsorDropdown = () => setSponsorDropdownOpen((prev) => !prev);
  const toggleOrganizationDropdown = () =>
    setOrganizationDropdownOpen((prev) => !prev);

  // Handle sponsor selection
  const handleSponsorSelect = (sponsor) => {
    dispatch(handleSponsorSelection(sponsor));
  };

  // Handle organization selection (single select)
  const handleOrgSelect = (org) => {
    dispatch(handleOrgSelection(org));
  };

  // Clear organization selection
  const clearOrganizationSelection = () => {
    dispatch(handleOrgSelection(null));
  };

  const handleNoOfTreesChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and empty string
    if (value === '' || /^[1-9]\d*$/.test(value)) {
      setNoOfTrees(value);
    }
  };

  const handleMinCostChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    const numericValue = value.replace(/[^0-9.]/g, '');
    setMinCost(numericValue);
  };

  const handleMaxCostChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    const numericValue = value.replace(/[^0-9.]/g, '');
    setMaxCost(numericValue);
  };

  const onFormCancel = () => {
    resetForm();
    if (toggle) toggle();
  };

  const resetForm = useCallback(() => {
    setNoOfTrees('1');
    setMinCost('');
    setMaxCost('');
    dispatch(handleOrgSelection(null));
    dispatch(handleSponsorSelection(null));
  }, [dispatch]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleAssignNft = () => {
    const payload = {
      organization_id: selectedOrg?.id,
      sponsor_id: reduxSelectedSponsor?.id || sponsorData?.id,
      no_of_trees: noOfTrees
    };

    // Add min_cost and max_cost only if they have values
    if (minCost) payload.min_cost = minCost;
    if (maxCost) payload.max_cost = maxCost;

    dispatch(assignNft(payload))
      .then(() => {
        onFormCancel();
        dispatch(resetSponsor());
        dispatch(resetOrg());
        refreshThePage();
      })
      .catch((error) => {
        console.error('Failed to assign nft:', error);
      });
  };

  // Common dropdown toggle style
  const dropdownToggleStyle = {
    borderColor: '#E7E7E7',
    backgroundColor: '#FAFAFA',
    borderRadius: '10px',
    color: '#B9C6E1',
    cursor: 'pointer',
    textAlign: 'left',
    padding: '0.5rem 1rem',
    height: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  };

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
    padding: '0.5rem 1rem',
    color: '#3F4D60',
    fontSize: '0.9rem',
    borderBottom: '1px solid #F0F0F0'
  };

  // Validation function
  const isFormValid = () => {
    const hasValidTrees =
      noOfTrees !== '' &&
      !isNaN(parseInt(noOfTrees)) &&
      parseInt(noOfTrees) > 0;

    return (
      selectedOrg && // Organization is mandatory
      (reduxSelectedSponsor || sponsorData) && // Sponsor is mandatory
      hasValidTrees
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      className='fixed inset-0 z-50 flex items-center justify-center'
      contentClassName='relative max-w-lg bg-white shadow-xl p-0 m-4 border-radius'
      style={{ width: '100%', maxWidth: '37.5rem' }}
    >
      <div>
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
      </div>
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

      <ModalBody className='px-4 pt-3 pb-4'>
        {/* Sponsor info - only shown when sponsor data is provided */}
        {sponsorData || sponsorName ? (
          <div className='sponsor-name-display mb-3'>
            <div className='d-flex'>
              <div
                style={{ width: '120px', color: '#000000', fontSize: '14px' }}
              >
                Sponsor name
              </div>
              <div style={{ fontWeight: '700', color: 'black' }}>
                {' '}
                {sponsorData?.name || sponsorName}
              </div>
            </div>
          </div>
        ) : (
          <Col
            xs={7}
            className='mb-3'
          >
            <label
              className=''
              style={{ color: '#000000', fontSize: '14px', fontWeight: '400' }}
            >
              Choose Sponsor
            </label>
            <Dropdown
              isOpen={sponsorDropdownOpen}
              toggle={toggleSponsorDropdown}
              style={{ width: '100%' }}
            >
              <DropdownToggle
                tag='div'
                className='form-control'
                style={{
                  ...dropdownToggleStyle,
                  color: reduxSelectedSponsor ? '#374356' : '#B9C6E1'
                }}
              >
                <span>{reduxSelectedSponsor?.name || 'Select Sponsor'}</span>
                <i
                  className={`ni ni-chevron-down ${
                    sponsorDropdownOpen ? 'ni-chevron-up' : ''
                  }`}
                  style={{ color: '#2C3E50', fontSize: '1rem' }}
                ></i>
              </DropdownToggle>
              <DropdownMenu style={dropdownMenuStyle}>
                {sponsorLoading ? (
                  <DropdownItem disabled>Loading sponsors...</DropdownItem>
                ) : (
                  sponsorList.map((sponsor) => (
                    <DropdownItem
                      key={sponsor.id}
                      onClick={() => handleSponsorSelect(sponsor)}
                      style={dropdownItemStyle}
                    >
                      {sponsor.name}
                    </DropdownItem>
                  ))
                )}
              </DropdownMenu>
            </Dropdown>
          </Col>
        )}

        <Col
          xs={7}
          className='d-flex align-items-center mb-3'
        >
          <div style={{ flex: '1' }}>
            <label
              className=''
              style={{
                color: '#000000',
                fontSize: '14px',
                fontWeight: '400'
              }}
            >
              No. Of. Trees
            </label>
            <Input
              type='text'
              placeholder={'1'}
              value={noOfTrees}
              onChange={handleNoOfTreesChange}
              style={{
                borderColor: '#E7E7E7',
                backgroundColor: '#FAFAFA',
                borderRadius: '10px',
                color: '#374356',
                padding: '8px 12px',
                height: '40px'
              }}
            />
          </div>
        </Col>

        {/* Choose Organization section (single select) */}
        <Col
          xs={7}
          className='mb-3'
        >
          <label
            className='fw-normal'
            style={{ color: '#000000', fontSize: '0.875rem' }}
          >
            Choose Organization
          </label>
          <Dropdown
            isOpen={organizationDropdownOpen}
            toggle={toggleOrganizationDropdown}
            style={{ width: '100%' }}
          >
            <DropdownToggle
              tag='div'
              className='form-control'
              style={{
                ...dropdownToggleStyle,
                color: selectedOrg ? '#374356' : '#B9C6E1'
              }}
            >
              <span>{selectedOrg?.name || 'Select Organization'}</span>
              <i
                className={`ni ni-chevron-down ${
                  organizationDropdownOpen ? 'ni-chevron-up' : ''
                }`}
                style={{ color: '#2C3E50', fontSize: '1rem' }}
              ></i>
            </DropdownToggle>
            <DropdownMenu style={dropdownMenuStyle}>
              {orgLoading ? (
                <DropdownItem disabled>Loading organizations...</DropdownItem>
              ) : (
                <>
                  {orgList.map((org) => (
                    <DropdownItem
                      key={org.id}
                      onClick={() => handleOrgSelect(org)}
                      style={dropdownItemStyle}
                    >
                      {org.name}
                    </DropdownItem>
                  ))}
                </>
              )}
            </DropdownMenu>
          </Dropdown>
        </Col>

        {/* Selected organization display (single select) */}
        {selectedOrg && (
          <Col
            xs={10}
            className='selected-org-item py-1 px-2 mb-4 d-flex justify-content-between align-items-center'
            style={{
              backgroundColor: '#f9f9f9',
              border: '1px solid #E7E7E7',
              borderRadius: '10px'
            }}
          >
            <div style={{ fontWeight: '600', color: '#000000' }}>
              {selectedOrg.name}
            </div>
            <div className='d-flex align-items-center'>
              <span
                className='me-2 fw-normal'
                style={{ fontSize: '0.875rem', color: '#000000' }}
              >
                No. of Trees
              </span>
              <Input
                type='text'
                value={noOfTrees}
                disabled
                style={{
                  width: '100px',
                  borderColor: '#E7E7E7',
                  backgroundColor: '#FAFAFA',
                  borderRadius: '10px',
                  textAlign: 'center',
                  cursor: 'default'
                }}
              />
              <button
                onClick={clearOrganizationSelection}
                className='btn ms-2'
                style={{ background: 'none', border: 'none', padding: '0' }}
              >
                <i
                  className='ni ni-cross'
                  style={{ fontSize: '1.25rem', color: '#000000' }}
                ></i>
              </button>
            </div>
          </Col>
        )}

        <Col
          xs={7}
          className='mb-4'
        >
          <label
            className=''
            style={{
              color: '#000000',
              fontSize: '14px',
              fontWeight: '400',
              marginBottom: '2px',
              display: 'block'
            }}
          >
            Tree Cost Filters:
          </label>
          <Row>
            <Col xs={6}>
              <div>
                <label
                  style={{
                    color: '#556482',
                    fontSize: '14px',
                    fontWeight: '400',
                    marginBottom: '4px',
                    display: 'block'
                  }}
                >
                  $ Min cost
                </label>
                <Input
                  type='text'
                  placeholder={'1'}
                  value={minCost}
                  onChange={handleMinCostChange}
                  style={{
                    borderColor: '#E7E7E7',
                    backgroundColor: '#FAFAFA',
                    borderRadius: '10px',
                    color: '#374356',
                    padding: '8px 12px',
                    height: '40px'
                  }}
                />
              </div>
            </Col>
            <Col xs={6}>
              <div>
                <label
                  style={{
                    color: '#556482',
                    fontSize: '14px',
                    fontWeight: '400',
                    marginBottom: '4px',
                    display: 'block'
                  }}
                >
                  $ Max cost
                </label>
                <Input
                  type='text'
                  placeholder={'100'}
                  value={maxCost}
                  onChange={handleMaxCostChange}
                  style={{
                    borderColor: '#E7E7E7',
                    backgroundColor: '#FAFAFA',
                    borderRadius: '10px',
                    color: '#374356',
                    padding: '8px 12px',
                    height: '40px'
                  }}
                />
              </div>
            </Col>
          </Row>
        </Col>

        {/* Submit button */}
        <div className='d-flex justify-content-end'>
          <Button
            color='primary'
            className='px-4 py-2'
            style={{
              backgroundColor: '#0D5A42',
              borderColor: '#0D5A42',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
            onClick={handleAssignNft}
            disabled={!isFormValid() || orgLoading || sponsorLoading}
          >
            Submit
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default AssignNftModal;
