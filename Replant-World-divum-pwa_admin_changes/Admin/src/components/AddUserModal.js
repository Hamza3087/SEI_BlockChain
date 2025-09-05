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
import { showToast } from '../components/ToastNotification';
import closeIcon from '../images/icons/close.svg';
import '../assets/scss/custom.scss';
import {
  fetchCountriesData,
  handleCountrySelection
} from '../redux/actions/countryAction';
import {
  fetchOrganizationData,
  handleOrgSelection
} from '../redux/actions/organisationAction';
import { addUsers, resetUserState } from '../redux/actions/addUserAction';
import { refreshThePage } from '../utils/helperFunction';

const AddUserModal = ({ isOpen, toggle, header }) => {
  const dispatch = useDispatch();

  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('PLANTER');
  const [phone, setPhone] = useState('');

  // Get data from Redux store
  const {
    countryList,
    loading: countryLoading,
    selectedCountry
  } = useSelector((state) => state.country);

  const {
    orgList,
    loading: orgLoading,
    selectedOrg
  } = useSelector((state) => state.organisation);

  const {
    loading: addUserLoading,
    error: addUserError,
    success: addUserSuccess,
    message
  } = useSelector((state) => state.user);

  const isFormValid = () => {
    return (
      username.trim() !== '' &&
      email.trim() !== '' &&
      role.trim() !== '' &&
      selectedOrg &&
      selectedCountry
    );
  };

  const resetForm = useCallback(() => {
    setUsername('');
    setEmail('');
    setRole('PLANTER');
    setPhone('');
    dispatch(handleOrgSelection(null));
    dispatch(handleCountrySelection(null));
  }, [dispatch]);

  useEffect(() => {
    if (addUserSuccess) {
      showToast.success(message || 'User added successfully!');

      resetForm();
      if (toggle) toggle();
      dispatch(resetUserState());
      refreshThePage();
    }

    if (addUserError) {
      showToast.error(
        addUserError.message || 'Failed to add user. Please try again.'
      );

      dispatch(resetUserState());
    }
  }, [addUserSuccess, addUserError, message, toggle, dispatch, resetForm]);

  // Local state for dropdown UI
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);

  // Fetch data when component mounts
  useEffect(() => {
    dispatch(fetchCountriesData());
    dispatch(fetchOrganizationData());
  }, [dispatch]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  // Toggle dropdown states
  const toggleCountryDropdown = () =>
    setCountryDropdownOpen((prevState) => !prevState);
  const toggleOrgDropdown = () => setOrgDropdownOpen((prevState) => !prevState);

  // Handle selections
  const handleCountrySelect = (country) => {
    dispatch(handleCountrySelection(country));
  };

  const handleOrgSelect = (org) => {
    dispatch(handleOrgSelection(org));
  };

  // Form submission handler
  const handleAddUser = () => {
    // Create payload
    const userPayload = {
      username: username,
      email: email,
      role: 'PLANTER',
      phone_number: phone,
      planting_organization: selectedOrg?.id,
      country: selectedCountry?.id
    };

    // Dispatch the action to add user
    dispatch(addUsers(userPayload));
  };

  const formControlStyle = {
    borderColor: '#E7E7E7',
    backgroundColor: '#FAFAFA',
    borderRadius: '10px',
    color: '#B9C6E1'
  };

  // Dropdown styles
  const dropdownToggleStyle = {
    ...formControlStyle,
    cursor: 'pointer',
    textAlign: 'left',
    padding: '0.75rem 1rem',
    height: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#F8F9FC'
  };

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

  const dropdownItemStyle = {
    padding: '0.75rem 1rem',
    color: '#3F4D60',
    fontSize: '0.9rem',
    borderBottom: '1px solid #F0F0F0'
  };

  const onFormCancel = () => {
    resetForm();
    if (toggle) toggle();
  };

  return (
    <Modal
      isOpen={isOpen}
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
              htmlFor='username'
              style={{ color: '#374356' }}
            >
              Username
            </label>
            <div className='form-control-wrap'>
              <input
                type='text'
                className='form-control custom-input'
                id='username'
                placeholder='Enter username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ formControlStyle, boxShadow: 'none' }}
              />
            </div>{' '}
          </Col>
          <Col sm='6'>
            <label
              className='form-label fw-normal'
              htmlFor='email'
              style={{ color: '#374356' }}
            >
              Email
            </label>
            <div className='form-control-wrap'>
              <input
                type='email'
                className='form-control custom-input'
                id='email'
                placeholder='Enter email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ formControlStyle, boxShadow: 'none' }}
              />
            </div>{' '}
          </Col>
          <Col sm='6'>
            <label
              className='form-label fw-normal'
              htmlFor='role'
              style={{ color: '#374356' }}
            >
              Role
            </label>
            <div className='form-control-wrap'>
              <input
                type='text'
                className='form-control custom-input'
                id='role'
                placeholder='Enter role'
                value='PLANTER'
                disabled
                style={{ formControlStyle, boxShadow: 'none' }}
              />
            </div>{' '}
          </Col>
          <Col sm='6'>
            <label
              className='form-label fw-normal'
              htmlFor='phone'
              style={{ color: '#374356' }}
            >
              Phone number{' '}
              <span
                style={{
                  color: '#B0B0B0',
                  fontWeight: 400
                }}
              >
                (optional)
              </span>
            </label>
            <div className='form-control-wrap'>
              <input
                type='text'
                className='form-control custom-input'
                id='phone'
                placeholder='Enter phone number'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ formControlStyle, boxShadow: 'none' }}
              />
            </div>{' '}
          </Col>
          <Col sm='6'>
            <label
              className='form-label fw-normal'
              htmlFor='organization'
              style={{ color: '#374356', cursor: 'default' }}
            >
              Planting Organization
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
                  style={dropdownToggleStyle}
                  data-toggle='dropdown'
                  aria-expanded={orgDropdownOpen}
                >
                  <span style={{ color: selectedOrg ? '#374356' : '#B9C6E1' }}>
                    {selectedOrg
                      ? selectedOrg.displayName
                      : 'Select planting organization'}
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
                  ) : (
                    orgList.map((org) => (
                      <DropdownItem
                        key={org.id}
                        onClick={() => handleOrgSelect(org)}
                        style={dropdownItemStyle}
                      >
                        {org.displayName}
                      </DropdownItem>
                    ))
                  )}
                </DropdownMenu>
              </Dropdown>
            </div>
          </Col>
          <Col sm='6'>
            <label
              className='form-label fw-normal'
              htmlFor='country'
              style={{ color: '#374356', cursor: 'default' }}
            >
              Country
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
                  style={dropdownToggleStyle}
                  data-toggle='dropdown'
                  aria-expanded={countryDropdownOpen}
                >
                  <span
                    style={{ color: selectedCountry ? '#374356' : '#B9C6E1' }}
                  >
                    {selectedCountry
                      ? selectedCountry.displayName
                      : 'Select country'}
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
                  {countryLoading ? (
                    <DropdownItem disabled>Loading...</DropdownItem>
                  ) : (
                    countryList.map((country) => (
                      <DropdownItem
                        key={country.id}
                        onClick={() => handleCountrySelect(country)}
                        style={dropdownItemStyle}
                      >
                        {country.displayName}
                      </DropdownItem>
                    ))
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
              onClick={handleAddUser}
              disabled={
                !isFormValid() || countryLoading || addUserLoading || orgLoading
              }
            >
              {addUserLoading ? 'Saving...' : 'Done'}
            </Button>
          </li>
        </ul>
      </ModalBody>
    </Modal>
  );
};

export default AddUserModal;
