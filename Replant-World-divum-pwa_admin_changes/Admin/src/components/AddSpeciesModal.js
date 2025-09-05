import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Row,
  Col,
  Button,
  DropdownMenu,
  DropdownToggle,
  Dropdown,
  DropdownItem,
  Spinner
} from 'reactstrap';
import { showToast } from '../components/ToastNotification';
import closeIcon from '../images/icons/close.svg';
import '../assets/scss/custom.scss';
import {
  fetchIucnStatusData,
  handleIucnStatusSelection
} from '../redux/actions/iucnAction';
import {
  addSpecies,
  resetSpeciesState
} from '../redux/actions/addSpeciesAction';
import { refreshThePage } from '../utils/helperFunction';

const AddSpeciesModal = ({ isOpen, toggle, header }) => {
  const dispatch = useDispatch();
  const { iucnStatusList, loading, error, selectedStatus } = useSelector(
    (state) => state.iucnStatus
  );
  const {
    loading: addSpeciesLoading,
    error: addSpeciesError,
    success: addSpeciesSuccess,
    message
  } = useSelector((state) => state.species);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [commonName, setCommonName] = useState('');
  const [botanicalName, setBotanicalName] = useState('');

  // Check if all required fields are filled
  const isFormValid = () => {
    return (
      commonName.trim() !== '' &&
      botanicalName.trim() !== '' &&
      selectedStatus !== null
    );
  };

  // Updated resetForm wrapped with useCallback
  const resetForm = useCallback(() => {
    setCommonName('');
    setBotanicalName('');
    dispatch(handleIucnStatusSelection(null));
  }, [dispatch]);

  // Fetch IUCN status options when component mounts
  useEffect(() => {
    dispatch(fetchIucnStatusData());
  }, [dispatch]);

  // Monitor addSpecies state changes to show toast
  useEffect(() => {
    if (addSpeciesSuccess) {
      // Show success toast using toast service
      showToast.success(message || 'Species added successfully!');

      // Reset form and close modal on success
      resetForm();
      if (toggle) toggle();

      // Reset species state to avoid showing toast again on component remount
      dispatch(resetSpeciesState());

      refreshThePage();
    }

    if (addSpeciesError) {
      // Show error toast using toast service
      showToast.error(
        addSpeciesError.message || 'Failed to add species. Please try again.'
      );

      // Reset species state to avoid showing toast again on component remount
      dispatch(resetSpeciesState());
    }
  }, [
    addSpeciesSuccess,
    addSpeciesError,
    message,
    toggle,
    dispatch,
    resetForm
  ]);

  const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const onFormCancel = () => {
    resetForm();

    if (toggle) toggle();
  };

  // Handle selection of IUCN status
  const handleSelectIucnStatus = (status) => {
    dispatch(handleIucnStatusSelection(status));
  };

  // Form submission handler
  const handleSave = () => {
    const payload = {
      common_name: commonName,
      botanical_name: botanicalName,
      iucn_status: selectedStatus?.id
    };
    dispatch(addSpecies(payload));
  };

  // Base form control style for inputs
  const formControlStyle = {
    borderColor: '#E7E7E7',
    backgroundColor: '#FAFAFA',
    borderRadius: '10px',
    color: '#B9C6E1'
  };

  // Specific dropdown styles to match the image
  const dropdownToggleStyle = {
    ...formControlStyle,
    color: selectedStatus ? '#374356' : '#B9C6E1',
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
    borderBottom: '1px solid #F0F0F0'
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      className='fixed inset-0 z-50 flex items-center justify-center'
      contentClassName='relative max-w-lg bg-white p-0 m-4 rounded-sm border-radius'
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
              htmlFor='common-name'
              style={{ color: '#374356', cursor: 'default' }}
            >
              Common name
            </label>
            <div className='form-control-wrap'>
              <input
                type='text'
                className='form-control custom-input'
                id='common-name'
                placeholder='Select common name'
                style={{ formControlStyle, boxShadow: 'none' }}
                value={commonName}
                onChange={(e) => setCommonName(e.target.value)}
              />
            </div>
          </Col>
          <Col sm='6'>
            <label
              className='form-label fw-normal'
              htmlFor='botanical-name'
              style={{ color: '#374356', cursor: 'default' }}
            >
              Botanical name
            </label>
            <div className='form-control-wrap'>
              <input
                type='text'
                className='form-control custom-input'
                id='botanical-name'
                placeholder='Select botanical name'
                style={{ formControlStyle, boxShadow: 'none' }}
                value={botanicalName}
                onChange={(e) => setBotanicalName(e.target.value)}
              />
            </div>
          </Col>
          <Col sm='6'>
            <label
              className='form-label fw-normal'
              htmlFor='iucn-status'
              style={{ color: '#374356', cursor: 'default' }}
            >
              IUCN Status
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
                  {loading ? (
                    <Spinner
                      size='sm'
                      color='#374356'
                    />
                  ) : (
                    <span
                      style={{ color: selectedStatus ? '#374356' : '#B9C6E1' }}
                    >
                      {selectedStatus
                        ? selectedStatus.displayName
                        : 'Select IUCN status'}
                    </span>
                  )}
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
                  {error ? (
                    <DropdownItem
                      disabled
                      style={dropdownItemStyle}
                    >
                      Error loading IUCN statuses
                    </DropdownItem>
                  ) : loading ? (
                    <DropdownItem
                      disabled
                      style={dropdownItemStyle}
                    >
                      Loading...
                    </DropdownItem>
                  ) : (
                    iucnStatusList.map((item) => (
                      <DropdownItem
                        key={item.id}
                        onClick={() => handleSelectIucnStatus(item)}
                        style={dropdownItemStyle}
                      >
                        {item.displayName}
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
              onClick={handleSave}
              disabled={!isFormValid() || loading || addSpeciesLoading}
            >
              {addSpeciesLoading ? 'Saving...' : 'Save'}
            </Button>
          </li>
        </ul>
      </ModalBody>
    </Modal>
  );
};

export default AddSpeciesModal;
