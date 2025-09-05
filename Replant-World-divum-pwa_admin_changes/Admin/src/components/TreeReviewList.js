import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Row,
  Col,
  Card,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import { approveTree, rejectTree } from '../redux/actions/reviewTreeAction';
import { fetchSpeciesListingByUserId } from '../redux/actions/speciesListingUserAction';
import approve from '../images/icons/approve.svg';
import reject from '../images/icons/reject.svg';
import i18n from '../locales/en.json';
import ImagePreviewModal from '../components/ImagePreviewModal';

// Label and value text components for consistent styling
const LabelText = ({ children }) => (
  <div
    className='fw-bold'
    style={{
      color: '#484848',
      display: 'flex',
      justifyContent: 'space-between'
    }}
  >
    {children}
  </div>
);

const ValueText = ({ children }) => (
  <div
    className='fw-medium'
    style={{ color: '#556482' }}
  >
    {children}
  </div>
);

const TreeReviewCard = ({ plantingData }) => {
  const dispatch = useDispatch();
  const { loading, lastAction } = useSelector((state) => state.treeReview);

  // Get species data from Redux store
  const {
    speciesListingDetails = [],
    loadingDetails,
    errorDetails
  } = useSelector((state) => state.speciesListingByUserId);

  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [comment, setComment] = useState(plantingData.comment || '');
  const [commentError, setCommentError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Species dropdown state
  const [speciesDropdownOpen, setSpeciesDropdownOpen] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [displaySpecies, setDisplaySpecies] = useState('');

  // Image preview modal state
  const [imagePreviewModal, setImagePreviewModal] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  // Initialize species display value when component mounts
  useEffect(() => {
    if (plantingData?.species) {
      setDisplaySpecies(plantingData?.species);

      // If we have species data, try to find the matching species
      if (speciesListingDetails) {
        const foundSpecies = speciesListingDetails?.find(
          (item) =>
            `${item?.species?.common_name} (${item?.species?.botanical_name})` ===
            plantingData?.species
        );
        if (foundSpecies) {
          setSelectedSpecies(foundSpecies);
        }
      }
    }
  }, [plantingData?.species, speciesListingDetails]);

  // Reset commentError when user starts typing
  useEffect(() => {
    if (comment.trim() !== '') {
      setCommentError(false);
    }
  }, [comment]);

  // Reset local submission state when Redux state changes
  useEffect(() => {
    if (!loading && isSubmitting) {
      setIsSubmitting(false);
    }
  }, [loading, isSubmitting]);

  const cardStyle = {
    border: '1px solid #E5E5E5',
    backgroundColor: '#FFFFFF',
    borderRadius: '14px'
  };

  const verticalLineStyle = {
    borderLeft: '1px solid #E5E5E5',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0
  };

  // Button styles
  const buttonBaseStyle = {
    borderRadius: '8px',
    padding: '8px 16px',
    gap: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const approveButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: '#E2F9F0',
    border: '0.5px solid #15B376',
    color: '#15B376',
    opacity: loading ? 0.7 : 1,
    cursor: loading ? 'not-allowed' : 'pointer'
  };

  const rejectButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: '#FFF2F2',
    border: '0.5px solid #FB5A5C',
    color: '#FB5A5C',
    opacity: loading ? 0.7 : 1,
    cursor: loading ? 'not-allowed' : 'pointer'
  };

  // Species dropdown styles
  const dropdownToggleStyle = {
    width: '100%',
    textAlign: 'left',
    backgroundColor: '#fff',
    border: '1px solid #e6e9ec',
    borderRadius: '4px',
    padding: '8px 12px',
    color: '#556482',
    fontWeight: '500',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    minHeight: '38px'
  };

  const dropdownMenuStyle = {
    width: '100%',
    padding: '0',
    border: '1px solid #e6e9ec',
    borderRadius: '4px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    maxHeight: '200px',
    overflowY: 'auto',
    scrollbarWidth: 'none'
  };

  const dropdownItemStyle = {
    padding: '8px 12px',
    fontSize: '14px',
    color: '#556482',
    cursor: 'pointer',
    borderBottom: '1px solid #E6E6E6'
  };

  const chevronStyle = {
    width: '10px',
    height: '10px'
  };

  // Handle image click to open preview modal
  const handleImageClick = (imageUrl) => {
    setPreviewImageUrl(imageUrl);
    setImagePreviewModal(true);
  };

  // Toggle image preview modal
  const toggleImagePreview = () => {
    setImagePreviewModal(!imagePreviewModal);
    if (!imagePreviewModal) {
      setPreviewImageUrl('');
    }
  };

  // Handle dropdown toggle and fetch species data when opening
  const toggleSpeciesDropdown = () => {
    if (!speciesDropdownOpen && !speciesListingDetails) {
      // Fetch species data only when opening dropdown and data isn't loaded
      dispatch(fetchSpeciesListingByUserId(plantingData?.userId));
    }
    setSpeciesDropdownOpen(!speciesDropdownOpen);
  };

  // Handle species selection
  const handleSpeciesSelect = (speciesItem) => {
    setSelectedSpecies(speciesItem);
    setDisplaySpecies(
      `${speciesItem?.species?.common_name} (${speciesItem?.species?.botanical_name})`
    );
    setSpeciesDropdownOpen(false);
  };

  // Handle approve action
  const handleApprove = () => {
    if (loading) return;

    setIsSubmitting(true);
    dispatch(approveTree(plantingData?.id, '', selectedSpecies?.id));
  };

  // Handle reject action
  const handleReject = () => {
    if (loading) return;

    // Validate comment field
    if (!comment.trim()) {
      setCommentError(true);
      return;
    }

    setIsSubmitting(true);
    dispatch(rejectTree(plantingData?.id, comment, selectedSpecies?.id));
  };

  return (
    <>
      <Card
        className='mb-4 p-3'
        style={cardStyle}
      >
        <Row className='g-3 flex flex-row align-items-center'>
          {/* Image Section */}
          <Col
            xs='12'
            sm='3'
            md='2'
            lg='2'
          >
            <div
              style={{
                width: '100%',
                maxWidth: '159px',
                aspectRatio: '159/224',
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
              onClick={() => handleImageClick(plantingData?.imageUrl)}
            >
              <img
                src={plantingData?.imageUrl}
                alt={`${plantingData.species || 'Tree'} planted by ${
                  plantingData.planter || 'Unknown'
                }`}
                className='img-fluid rounded'
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'start',
                  marginLeft: '0'
                }}
              />
            </div>
          </Col>

          {/* Details Section */}
          <Col
            xs='12'
            sm='9'
            md='10'
            lg='10'
          >
            <Row className='g-0'>
              {/* First Column of Details */}
              <Col
                xs='12'
                md='4'
                className='mb-3 mb-md-0'
              >
                <div className='p-2'>
                  <Row className='mb-2 g-0'>
                    <Col
                      xs='4'
                      className='pe-2'
                    >
                      <LabelText>
                        Planter <span>:</span>
                      </LabelText>
                    </Col>
                    <Col xs='8'>
                      <ValueText>{plantingData?.planter || 'N/A'}</ValueText>
                    </Col>
                  </Row>
                  <Row className='mb-2 g-0 d-flex flex-row align-items-center'>
                    <Col
                      xs='4'
                      className='pe-2'
                    >
                      <LabelText>
                        Species <span>:</span>
                      </LabelText>
                    </Col>
                    <Col xs='8'>
                      <Dropdown
                        isOpen={speciesDropdownOpen}
                        toggle={toggleSpeciesDropdown}
                        style={{ width: '100%' }}
                      >
                        <DropdownToggle
                          tag='div'
                          style={dropdownToggleStyle}
                          data-toggle='dropdown'
                          aria-expanded={speciesDropdownOpen}
                        >
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1
                            }}
                          >
                            {displaySpecies ||
                              plantingData?.species ||
                              'Select Species'}
                          </span>
                          <i
                            className='icon ni ni-chevron-down'
                            style={chevronStyle}
                          ></i>
                        </DropdownToggle>
                        <DropdownMenu style={dropdownMenuStyle}>
                          {loadingDetails ? (
                            <div
                              style={{
                                padding: '8px 12px',
                                color: '#556482'
                              }}
                            >
                              Loading species...
                            </div>
                          ) : errorDetails ? (
                            <div
                              style={{
                                padding: '8px 12px',
                                color: '#556482'
                              }}
                            >
                              Error loading species
                            </div>
                          ) : speciesListingDetails?.length > 0 ? (
                            speciesListingDetails?.map((speciesItem) => (
                              <DropdownItem
                                key={speciesItem?.id}
                                onClick={() => handleSpeciesSelect(speciesItem)}
                                style={dropdownItemStyle}
                              >
                                {`${speciesItem?.species?.common_name} (${speciesItem?.species?.botanical_name})`}
                              </DropdownItem>
                            ))
                          ) : (
                            <div
                              style={{
                                padding: '8px 12px',
                                color: '#556482'
                              }}
                            >
                              No species available.
                            </div>
                          )}
                        </DropdownMenu>
                      </Dropdown>
                    </Col>
                  </Row>
                  <Row className='mb-2 g-0'>
                    <Col
                      xs='4'
                      className='pe-2'
                    >
                      <LabelText>
                        Organization <span>:</span>
                      </LabelText>
                    </Col>
                    <Col xs='8'>
                      <ValueText>
                        {plantingData.organization || 'N/A'}
                      </ValueText>
                    </Col>
                  </Row>
                </div>
              </Col>

              {/* Second Column of Details with border */}
              <Col
                xs='12'
                md='4'
                className='mb-3 mb-md-0 position-relative'
              >
                <div
                  className='d-none d-md-block'
                  style={verticalLineStyle}
                ></div>
                <div className='ps-md-3 p-2'>
                  <Row className='mb-2 g-0'>
                    <Col
                      xs='4'
                      className='pe-2'
                    >
                      <LabelText>
                        Location <span>:</span>
                      </LabelText>
                    </Col>
                    <Col xs='8'>
                      <ValueText>{plantingData.location || 'N/A'}</ValueText>
                    </Col>
                  </Row>
                  <Row className='mb-2 g-0'>
                    <Col
                      xs='4'
                      className='pe-2'
                    >
                      <LabelText>
                        UID <span>:</span>
                      </LabelText>
                    </Col>
                    <Col xs='8'>
                      <ValueText>{plantingData.uid || 'N/A'}</ValueText>
                    </Col>
                  </Row>
                  <Row className='mb-2 g-0'>
                    <Col
                      xs='4'
                      className='pe-2'
                    >
                      <LabelText>
                        Date & Time <span>:</span>
                      </LabelText>
                    </Col>
                    <Col xs='8'>
                      <ValueText>{plantingData.dateTime || 'N/A'}</ValueText>
                    </Col>
                  </Row>
                </div>
              </Col>

              {/* Comment Section */}
              <Col
                xs='12'
                md='4'
                className='position-relative'
              >
                <div
                  className='d-none d-md-block'
                  style={verticalLineStyle}
                ></div>
                <div className='ps-md-3 p-2'>
                  <div
                    className='mb-1 fw-medium'
                    style={{ color: '#8494AC' }}
                  >
                    {i18n.comments}
                  </div>
                  <div className='form-control-wrap'>
                    <textarea
                      className='form-control'
                      id={`comment-${plantingData.id || 'default'}`}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      style={{
                        borderRadius: '8px',
                        border: `solid 1px ${
                          commentError
                            ? '#FB5A5C'
                            : isTextareaFocused
                            ? '#1D5942'
                            : '#ECEEF2'
                        }`,
                        backgroundColor: '#F7F7F7',
                        boxShadow: 'none',
                        width: '100%',
                        minHeight: '60px',
                        maxWidth: '16.5rem',
                        fontSize: '14px',
                        resize: 'none'
                      }}
                      onFocus={() => setIsTextareaFocused(true)}
                      onBlur={() => setIsTextareaFocused(false)}
                      disabled={loading}
                    />
                    {commentError && (
                      <div
                        style={{
                          color: '#FB5A5C',
                          fontSize: '12px',
                          marginTop: '4px'
                        }}
                      >
                        This field is required
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            </Row>

            {/* Divider */}
            <hr
              className='my-3'
              style={{
                borderWidth: '1px',
                borderColor: '#8b909a'
              }}
            />

            {/* Action Buttons */}
            <Row className='g-0'>
              <Col>
                <div className='d-flex justify-content-start'>
                  <Button
                    className='me-2'
                    style={approveButtonStyle}
                    onClick={handleApprove}
                    disabled={loading}
                  >
                    <img
                      src={approve}
                      alt='Approve'
                      className='me-1'
                    />
                    <span
                      className='fw-medium'
                      style={{ fontSize: '14px' }}
                    >
                      {loading && lastAction?.includes('approve')
                        ? 'Processing...'
                        : i18n.approve}
                    </span>
                  </Button>
                  <Button
                    style={rejectButtonStyle}
                    onClick={handleReject}
                    disabled={loading}
                  >
                    <img
                      src={reject}
                      alt='Reject'
                      className='me-1'
                    />
                    <span
                      className='fw-medium'
                      style={{ fontSize: '14px' }}
                    >
                      {loading && lastAction?.includes('reject')
                        ? 'Processing...'
                        : i18n.reject}
                    </span>
                  </Button>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={imagePreviewModal}
        toggle={toggleImagePreview}
        imageUrl={previewImageUrl}
      />
    </>
  );
};

export default TreeReviewCard;
