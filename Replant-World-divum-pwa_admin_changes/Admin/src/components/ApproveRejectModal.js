import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, ModalHeader, ModalBody, Row, Col, Button } from 'reactstrap';
import closeIcon from '../images/icons/close.svg';
import approve from '../images/icons/approve.svg';
import reject from '../images/icons/reject.svg';
import '../assets/scss/custom.scss';
import {
  approveTree,
  rejectTree,
  resetTreeReviewState
} from '../redux/actions/reviewTreeAction';
import { refreshThePage } from '../utils/helperFunction';
import i18n from '../locales/en.json';

const ApproveRejectModal = ({
  isOpen,
  toggle,
  header,
  plantingData,
  approveAction
}) => {
  const dispatch = useDispatch();
  const { loading, success, error, lastAction } = useSelector(
    (state) => state.treeReview
  );

  // Form state
  const [comment, setComment] = useState('');
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [commentError, setCommentError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add this useEffect to prefill comment when modal opens and plantingData has a comment
  useEffect(() => {
    if (isOpen && plantingData?.comments) {
      setComment(plantingData?.comments);
    }
  }, [isOpen, plantingData]);

  // Reset commentError when user starts typing
  useEffect(() => {
    if (comment.trim() !== '') {
      setCommentError(false);
    }
  }, [comment]);

  useEffect(() => {
    if (success) {
      resetForm();
      if (toggle) toggle();
      dispatch(resetTreeReviewState());
      // Get current activeIndex from URL
      refreshThePage();
    }

    if (error) {
      dispatch(resetTreeReviewState());
    }
  }, [success, error, lastAction, toggle, dispatch]);

  // Reset local submission state when Redux state changes
  useEffect(() => {
    if (!loading && isSubmitting) {
      setIsSubmitting(false);
    }
  }, [loading, isSubmitting]);

  const resetForm = () => {
    setComment('');
    setCommentError(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Handle approve action
  const handleApprove = () => {
    if (loading) return;

    setIsSubmitting(true);
    dispatch(approveTree(plantingData?.tree_id, comment));
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
    dispatch(rejectTree(plantingData.tree_id, comment));
  };

  const onFormCancel = () => {
    resetForm();
    if (toggle) toggle();
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
          {header || 'Review Tree Details'}
        </span>
      </ModalHeader>
      <ModalBody
        style={{
          padding: '0 1rem'
        }}
      >
        <Row className='g-3 py-1 px-2'>
          {/* Comment Section */}
          <Col sm='8'>
            <label
              className='form-label fw-medium mt-1'
              htmlFor='tree-comment'
              style={{ color: '#8494AC' }}
            >
              {approveAction === 'edit-approval' ? 'Reason for Rejection' : i18n.comments}
            </label>
            <div className='form-control-wrap'>
              <textarea
                className='form-control'
                id='tree-comment'
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
                  Comment is required for rejection.
                </div>
              )}
            </div>
          </Col>
        </Row>
        {/* Action Buttons */}
        <div
          className='d-flex justify-content-end gap-2'
          style={{
            margin: '1rem 10px 3rem 0px'
          }}
        >
          {approveAction !== 'edit-approval' && (
            <Button
              style={approveButtonStyle}
              onClick={handleApprove}
              disabled={loading}
              className='p-3'
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
          )}
          <Button
            style={rejectButtonStyle}
            onClick={handleReject}
            disabled={loading}
            className='p-3'
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
      </ModalBody>
    </Modal>
  );
};

export default ApproveRejectModal;
