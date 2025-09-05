import React, { useState, useEffect } from 'react';
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
  addSponsor,
  resetSponsorState
} from '../redux/actions/addSponsorAction';
import { capitalizeFirstLetter, refreshThePage } from '../utils/helperFunction';
import { updateSponsor } from '../redux/actions/editSponsorAction';
import i18n from '../locales/en.json';

const AddSponsorModal = ({ isOpen, toggle, header }) => {
  const dispatch = useDispatch();
  const {
    loading: addSponsorLoading,
    error: addSponsorError,
    success: addSponsorSuccess,
    message
  } = useSelector((state) => state.addSponsor);

  // Determine if we're in edit mode
  const isEditMode = isOpen?.edit;
  const sponsorData = isOpen?.sponsorData;

  useEffect(() => {
    if (sponsorData && isEditMode) {
      // Pre-fill form with sponsor data when in edit mode
      setName(sponsorData.name || '');
      setWalletAddress(sponsorData.wallet_address || '');
      setContactEmail(sponsorData.contact_person_email || '');
      setSelectedType(
        sponsorData.type
          ? capitalizeFirstLetter(sponsorData.type.toLowerCase())
          : ''
      );
      // Handle nft_ordered values
      const initialNftOrder = sponsorData?.nft_ordered;
      const computedDisplayNftOrder =
        initialNftOrder != null &&
        typeof initialNftOrder === 'string' &&
        initialNftOrder.includes('/')
          ? initialNftOrder.split('/').pop().trim()
          : initialNftOrder != null &&
            !['- /', '- / -'].includes(initialNftOrder)
          ? initialNftOrder.toString()
          : '';
      const displayNftOrder =
        computedDisplayNftOrder === '-' ? '' : computedDisplayNftOrder;
      setNftOrder(displayNftOrder);
      // Handle nft_ordered_usd values
      const initialNftOrderUsd = sponsorData?.nft_ordered_usd;
      const computedDisplayNftOrderUsd =
        initialNftOrderUsd != null &&
        typeof initialNftOrderUsd === 'string' &&
        initialNftOrderUsd.includes('/')
          ? initialNftOrderUsd.split('/').pop().trim()
          : initialNftOrderUsd != null &&
            !['- /', '- / -'].includes(initialNftOrderUsd)
          ? initialNftOrderUsd.toString()
          : '';
      const displayNftOrderUsd =
        computedDisplayNftOrderUsd === '-' ? '' : computedDisplayNftOrderUsd;
      setNftOrderUsd(displayNftOrderUsd);
    }
  }, [sponsorData, isEditMode]);

  useEffect(() => {
    if (addSponsorSuccess) {
      showToast.success(
        message ||
          (isEditMode
            ? 'Sponsor updated successfully!'
            : 'Sponsor added successfully!')
      );
      resetForm();
      if (toggle) toggle();
      dispatch(resetSponsorState());
      refreshThePage();
    }
    if (addSponsorError) {
      showToast.error(
        addSponsorError.message ||
          (isEditMode
            ? 'Failed to update sponsor. Please try again.'
            : 'Failed to add sponsor. Please try again.')
      );
      dispatch(resetSponsorState());
    }
  }, [
    addSponsorSuccess,
    addSponsorError,
    message,
    toggle,
    dispatch,
    isEditMode
  ]);

  // Form state
  const [name, setName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [nftOrder, setNftOrder] = useState('');
  const [nftOrderUsd, setNftOrderUsd] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('');

  const isFormValid = () => {
    return (
      name.trim() !== '' &&
      walletAddress.trim() !== '' &&
      contactEmail.trim() !== '' &&
      selectedType !== ''
    );
  };

  const sponsorType = ['Individual', 'Company', 'NGO'];

  const formControlStyle = {
    borderColor: '#E7E7E7',
    backgroundColor: '#FAFAFA',
    borderRadius: '10px',
    color: '#B9C6E1'
  };

  const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

  // Specific dropdown styles to match the image
  const dropdownToggleStyle = {
    ...formControlStyle,
    color: selectedType ? '#374356' : '#B9C6E1',
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
    overflow: 'hidden'
  };

  // Individual dropdown item styling
  const dropdownItemStyle = {
    padding: '0.75rem 1rem',
    color: '#3F4D60',
    fontSize: '0.9rem',
    borderBottom: '1px solid #F0F0F0'
  };

  const resetForm = () => {
    setName('');
    setWalletAddress('');
    setContactEmail('');
    setSelectedType('');
    setNftOrder('');
    setNftOrderUsd('');
  };

  const onFormCancel = () => {
    resetForm();
    if (toggle) toggle();
  };

  const parseNftValue = (value) => {
    if (!value || value === '-' || value === '- /') {
      return null; // or 0 if your backend prefers that
    }
    // Extract numbers from strings like "- / 886"
    const numberMatch = value.match(/\d+/);
    return numberMatch ? parseInt(numberMatch[0], 10) : null;
  };
  const parseNftUsdValue = (value) => {
    if (!value || value === '-') {
      return null; // or 0 if your backend prefers that
    }
    // For USD, we might want to handle decimals too
    const numberMatch = value.match(/\d+\.?\d*/);
    return numberMatch ? parseFloat(numberMatch[0]) : null;
  };

  const handleSubmit = () => {
    // Create payload based on form values
    const sponsorPayload = {
      name: name,
      type: selectedType?.toUpperCase(),
      wallet_address: walletAddress,
      contact_person_email: contactEmail,
      nft_ordered: parseNftValue(nftOrder),
      nft_ordered_usd: parseNftUsdValue(nftOrderUsd)
    };

    if (isEditMode && sponsorData?.id) {
      // Dispatch the action to update sponsor
      dispatch(updateSponsor(sponsorData?.id, sponsorPayload));
    } else {
      // Dispatch the action to add sponsor
      dispatch(addSponsor(sponsorPayload));
    }
  };

  return (
    <Modal
      isOpen={!!isOpen}
      toggle={onFormCancel}
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
          {isEditMode ? i18n.updateSponsor : header}
        </span>
      </ModalHeader>
      <ModalBody>
        <Row className='gy-3 py-1'>
          <Col sm='6'>
            <label
              className='form-label fw-normal'
              htmlFor='sponsor-name'
              style={{ color: '#374356' }}
            >
              Name
            </label>
            <div className='form-control-wrap'>
              <input
                type='text'
                className='form-control custom-input'
                id='sponsor-name'
                placeholder='Enter Name'
                style={{ formControlStyle, boxShadow: 'none' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </Col>
          <Col sm='6'>
            <label
              className='form-label fw-normal'
              htmlFor='sponsor-type'
              style={{ color: '#374356', cursor: 'default' }}
            >
              Type
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
                  <span style={{ color: selectedType ? '#374356' : '#B9C6E1' }}>
                    {selectedType || 'Select type'}
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
                  {sponsorType.map((option, index) => (
                    <DropdownItem
                      key={index}
                      onClick={() => {
                        setSelectedType(option);
                      }}
                      style={dropdownItemStyle}
                    >
                      {option}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
          </Col>
          <Col sm='6'>
            <label
              className='form-label fw-normal'
              htmlFor='wallet-address'
              style={{ color: '#374356' }}
            >
              Wallet Address
            </label>
            <div className='form-control-wrap'>
              <input
                type='text'
                className='form-control custom-input'
                id='wallet-address'
                placeholder='Enter Wallet Address'
                style={{ formControlStyle, boxShadow: 'none' }}
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            </div>
          </Col>
          <Col sm='6'>
            <label
              className='form-label fw-normal'
              htmlFor='contact-email'
              style={{ color: '#374356' }}
            >
              Contact Person Email
            </label>
            <div className='form-control-wrap'>
              <input
                type='email'
                className='form-control custom-input'
                id='contact-email'
                placeholder='Enter Email'
                style={{ formControlStyle, boxShadow: 'none' }}
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
          </Col>
          <Col sm='6'>
            <label
              className='form-label fw-normal'
              htmlFor='nft-order'
              style={{ color: '#374356' }}
            >
              NFT Order
            </label>
            <div className='form-control-wrap'>
              <input
                type='text'
                className='form-control custom-input'
                id='nft-order'
                placeholder='Enter NFT Order'
                style={{ formControlStyle, boxShadow: 'none' }}
                value={nftOrder}
                onChange={(e) => setNftOrder(e.target.value)}
              />
            </div>
          </Col>
          <Col sm='6'>
            <label
              className='form-label fw-normal'
              htmlFor='nft-usd'
              style={{ color: '#374356' }}
            >
              NFT Order Value USD
            </label>
            <div className='form-control-wrap'>
              <input
                type='text'
                className='form-control custom-input'
                id='nft-usd'
                placeholder='Enter NFT Order Value USD'
                style={{ formControlStyle, boxShadow: 'none' }}
                value={nftOrderUsd}
                onChange={(e) => setNftOrderUsd(e.target.value)}
              />
            </div>
          </Col>
        </Row>
        <ul className='d-flex justify-content-end gx-4 mt-3'>
          <li>
            <Button
              className='btn-primary btn-lg'
              style={{ backgroundColor: '#0D5A42' }}
              onClick={handleSubmit}
              disabled={!isFormValid() || addSponsorLoading}
            >
              {addSponsorLoading
                ? isEditMode
                  ? 'Updating...'
                  : 'Saving...'
                : 'Done'}
            </Button>
          </li>
        </ul>
      </ModalBody>
    </Modal>
  );
};

export default AddSponsorModal;
