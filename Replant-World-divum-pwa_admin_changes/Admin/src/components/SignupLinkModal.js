import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, Row, Col } from 'reactstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import closeIcon from '../images/icons/close.svg';
import '../assets/scss/custom.scss';

const SignupLinkModal = ({ isOpen, toggle, header, linkData }) => {
  const [copyState, setCopyState] = useState(false); // new state for copy status

  useEffect(() => {
    if (!isOpen) {
    }
  }, [isOpen]);

  const linkUrl = header?.toLowerCase()?.includes('signup')
    ? linkData?.content?.signup_link
    : linkData?.content?.reset_link;

  const onFormCancel = () => {
    if (toggle) toggle();
  };

  const handleCopy = () => {
    setCopyState(true);
    setTimeout(() => setCopyState(false), 2000);
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
      <ModalBody
        style={{
          padding: '0 1rem'
        }}
      >
        <Row className='g-3 py-1 px-2'>
          {/* Signup Link Section */}
          <Col
            sm='12'
            className='d-flex flex-row align-items-center justify-content-between'
            style={{
              gap: '2rem'
            }}
          >
            <div
              style={{
                color: '#556482',
                fontSize: '15px',
                padding: '1rem 0 1rem 0'
              }}
            >
              {linkUrl}
            </div>
            {/* Copy functionality */}
            <CopyToClipboard
              text={linkUrl}
              onCopy={handleCopy}
            >
              <button className='btn btn-primary'>
                {copyState ? 'Copied!' : 'Copy'}
              </button>
            </CopyToClipboard>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
};

export default SignupLinkModal;
