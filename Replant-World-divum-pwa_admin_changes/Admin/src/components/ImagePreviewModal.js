import React, { useState } from 'react';
import { Modal, Spinner } from 'reactstrap';
import closeIcon from '../images/icons/close.svg';

const ImagePreviewModal = ({ isOpen, toggle, imageUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1); // Add zoom state

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Zoom functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3)); // Max zoom 3x
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5)); // Min zoom 0.5x
  };

  // Reset zoom when modal opens/closes
  const handleToggle = () => {
    setZoomLevel(1); // Reset zoom when closing
    toggle();
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleToggle}
      className='image-preview-modal'
      contentClassName='bg-transparent border-0'
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        margin: 0,
        padding: 0,
        width: '100vw',
        height: '100vh',
        maxWidth: 'none'
      }}
      onClick={handleToggle}
    >
      <button
        className='close-button'
        onClick={handleToggle}
        style={{
          position: 'fixed',
          right: '32px',
          top: '32px',
          background: 'transparent',
          border: 'none',
          zIndex: 1000,
          cursor: 'pointer',
          padding: '8px'
        }}
      >
        <img
          src={closeIcon}
          alt='Close'
          style={{
            filter: 'brightness(0) invert(1)',
            width: '24px',
            height: '24px',
            opacity: '60%'
          }}
        />
      </button>

      {/* Zoom Controls */}
      <div
        style={{
          position: 'fixed',
          right: '32px',
          top: '80px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomIn();
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
          disabled={zoomLevel >= 3}
        >
          +
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomOut();
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
          disabled={zoomLevel <= 0.5}
        >
          -
        </button>
      </div>

      <div
        className='d-flex justify-content-center align-items-center'
        style={{
          width: '100vw',
          height: '100vh'
        }}
      >
        {isLoading && (
          <div className='loading-spinner'>
            <Spinner
              color='light'
              style={{
                width: '3rem',
                height: '3rem'
              }}
            />
          </div>
        )}

        {hasError ? (
          <div
            className='error-message text-center p-4'
            style={{
              color: 'white',
              backgroundColor: 'rgba(220, 53, 69, 0.7)',
              borderRadius: '8px',
              padding: '20px'
            }}
          >
            <h4>Failed to load image</h4>
            <p>The image could not be displayed. Please try again later.</p>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt='Preview'
            style={{
              maxWidth: '90%',
              maxHeight: '90vh',
              objectFit: 'contain',
              display: isLoading ? 'none' : 'block',
              transform: `scale(${zoomLevel})`,
              transition: 'transform 0.2s ease-in-out'
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking image
          />
        )}
      </div>
    </Modal>
  );
};

export default ImagePreviewModal;
